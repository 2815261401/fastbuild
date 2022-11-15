import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
	TextDocumentSyncKind,
	TextDocumentChangeEvent,
	InitializeResult,
	CodeActionKind,
	DidChangeConfigurationNotification,
	Diagnostic,
	CodeActionParams,
	CodeAction,
	DiagnosticSeverity
} from 'vscode-languageserver/node';
import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import * as parser from '@babel/parser';
import traverse, { Node, NodePath } from '@babel/traverse';
import { normalize, join } from 'path';
import { existsSync } from 'fs';

// 创建连接
let connection = createConnection(ProposedFeatures.all);
// 创建文档服务器
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
// 默认不具有配置权限
let hasConfigurationCapability = false;
// 是否具有诊断相关信息功能
let hasDiagnosticRelatedInformationCapability = false;
// 默认不具备代码操作功能
let hasCodeActionLiteralsCapability = false;
// 初始化事件
connection.onInitialize((params) => {
	const capabilities = params.capabilities;
	// 配置权限
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	// 诊断功能
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);
	// 代码操作功能
	hasCodeActionLiteralsCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.codeAction &&
		capabilities.textDocument.codeAction.codeActionLiteralSupport
	);

	const result: InitializeResult = {
		// 功能
		capabilities: {
			// 文本文档在文本增量时同步
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				// 启用解决方案提供程序
				resolveProvider: true
			}
		}
	};
	// 判断是否支持快速修复
	if (hasCodeActionLiteralsCapability) {
		// 代码操作提供程序
		result.capabilities.codeActionProvider = {
			// 代码操作类型添加 快速修复
			codeActionKinds: [CodeActionKind.Empty]
		};
	}
	return result;
});

// 连接初始化完成后回调
connection.onInitialized(() => {
	// 如果拥有配置功能
	if (hasConfigurationCapability) {
		// 记录配置通知类型
		connection.client.register(
			DidChangeConfigurationNotification.type,
			undefined
		);
	}
});

// 连接完成时,返回代码补全
connection.onCompletion((): CompletionItem[] => {
	return ['name', 'path', 'context'].map((v, i) => ({
		label: v,
		kind: CompletionItemKind.Text,
		data: i
	}));
});

// 连接完成时的解决方案,返回补全提示
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	if (item.data === 0) {
		item.detail = 'name';
		item.documentation = '模板文件夹别名';
	} else if (item.data === 1) {
		item.detail = 'path';
		item.documentation = '模板文件夹相对路径';
	} else if (item.data === 2) {
		item.detail = 'context';
		item.documentation =
			'folder:右击文件夹名称,\nfolderPath:右击文件夹绝对路径,\nworkspaceFolder:当前工作区的文件夹名称,\ntemplateFolder:当前选中的模板文件夹名称,\nmodule:当前文件(文件夹)名称,\ntemplate:模板对应的实体';
	}
	return item;
});

// 连接的代码操作
connection.onCodeAction((params: CodeActionParams): CodeAction[] => {
	// 获取代码提示列表
	const diagnostics = params.context.diagnostics;
	// 如果不存在,说明也不需要快速修复
	if (!diagnostics || !diagnostics.length) {
		return [];
	}
	// 获取文件的uri
	const textDocument = documents
		.all()
		.find((item) => params.textDocument.uri === item.uri);
	// 如果不存在说明文件未打开
	if (!textDocument) {
		return [];
	}
	return (
		diagnostics
			// 如果代码提示列表中没有修复方法则排除
			.filter(({ data }) => !!data)
			// 将代码提示列表转化成代码修复列表
			.reduce(
				(arr: any, diag) =>
					arr.concat(
						(Array.isArray(diag.data) ? diag.data : [diag.data]).map((v) => ({
							title: v.title,
							kind: CodeActionKind.QuickFix,
							diagnostics: [diag],
							edit: {
								changes: {
									[params.textDocument.uri]: [
										{
											range: diag.range,
											newText: v.newText
										}
									]
								}
							}
						}))
					),
				[]
			)
	);
});

interface Settings {}
const documentSettings: Map<string, Thenable<Settings>> = new Map();
// 当配置更改时的回调
connection.onDidChangeConfiguration(() => {
	// 如果拥有配置的权限
	if (hasConfigurationCapability) {
		// 清空文档默认的配置数据
		documentSettings.clear();
	}
	documents.all().forEach(validateTextDocument);
});
interface DiagnosticData {
	title: string;
	newText: string;
}
const validateTextDocument = (textDocument: TextDocument) => {
	// 创建诊断类型
	function createDiagnostic(
		severity: DiagnosticSeverity,
		range: { start: number | Position; end: number | Position },
		message: string,
		data?: DiagnosticData | DiagnosticData[],
		relatedInformation?: string[]
	) {
		const { start, end } = range;
		const diagnostic: Diagnostic = {
			severity,
			range: {
				start:
					typeof start === 'number' ? textDocument.positionAt(start) : start,
				end: typeof end === 'number' ? textDocument.positionAt(end) : end
			},
			message,
			source: 'fast-build'
		};
		// 如果具备诊断功能,并且有诊断信息,诊断类型中添加诊断信息
		if (hasDiagnosticRelatedInformationCapability && relatedInformation) {
			diagnostic.relatedInformation = relatedInformation.map((message) => ({
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message
			}));
		}
		// 如果具备修复功能,并且拥有修复数据,诊断类型添加快速修复
		if (hasCodeActionLiteralsCapability && data) {
			diagnostic.data = data;
		}
		return diagnostic;
	}
	// 获取文本内容
	const text = textDocument.getText();
	// 声明Diagnostic数组,用来承载提示信息
	const diagnostics: Diagnostic[] = [];
	const { Error, Warning } = DiagnosticSeverity;
	try {
		const scriptAst = parser.parse(text, {
			sourceType: 'module',
			plugins: [
				'typescript',
				['decorators', { decoratorsBeforeExport: true }],
				'classProperties',
				'classPrivateProperties'
			]
		});
		const assignmentExpressionList: NodePath<Node>[] = [];
		const keyList: string[] = [];
		traverse(scriptAst, {
			enter(path) {
				const { node, container } = path;
				// 判断start,end为数字,方便补全
				if (typeof node.start === 'number' && typeof node.end === 'number') {
					// 如果是导出的代码,将实体加入数组
					if (
						node.type === 'ObjectExpression' &&
						path.parent.type === 'AssignmentExpression'
					) {
						assignmentExpressionList.push(path);
					}
					// 如果是对象的属性走下面
					else if (node.type === 'ObjectProperty') {
						// 将对应的key取出来
						const key: { name: string } = node.key as any;
						// 将value的实体也取出
						const value: {
							elements: Node[];
							value: any;
							type: string;
							loc: any;
						} = node.value as any;
						if (
							keyList.includes(key.name) &&
							Array.isArray(container) &&
							container.filter((item) => item.key.name === key.name).length > 1
						) {
							const { loc } = node as any;
							diagnostics.push(
								createDiagnostic(
									Error,
									{ start: loc.start.index, end: loc.end.index + 1 },
									`${key.name}已经存在`,
									{
										title: '移除已存在的属性',
										newText: ''
									}
								)
							);
						} else {
							keyList.push(key.name);
							// 对key进行判断
							switch (key.name) {
								// 如果key为templates走下方代码
								case 'templates':
									// 如果templates的值不是数组,则提示
									if (value.type !== 'ArrayExpression') {
										const { loc } = value;
										diagnostics.push(
											createDiagnostic(
												Error,
												{ start: loc.start.index, end: loc.end.index },
												'templates仅支持数组',
												{
													title: '使用数组',
													newText:
														"[\n\t\t{\n\t\t\tname: 'fileTemplate',\n\t\t\tpath: 'fileTemplate',\n\t\t},\n\t]"
												}
											)
										);
										break;
									}
									// name的存储,用来去重
									const nameList: string[] = [];
									// path的存储,用来去重
									const pathList: string[] = [];
									// 对templates的值进行循环
									value.elements.forEach((value: any) => {
										// 对值的属性进行循环
										value.properties.forEach((propertie: any) => {
											// 取出对应的属性
											const templatekey = propertie.key;
											// 取出对应的值
											const templatevalue = propertie.value;
											// 如果是不需要的属性,则红线提示移除
											if (
												!['name', 'path', 'filter'].includes(templatekey.name)
											) {
												const { loc } = propertie;
												diagnostics.push(
													createDiagnostic(
														Error,
														{ start: loc.start.index, end: loc.end.index },
														'templates的实体中没有该属性',
														{ title: '移除错误属性', newText: '' }
													)
												);
											}
											// 如果是name
											else if (templatekey.name === 'name') {
												// 如果name已经存在,则黄线提醒别名重复
												if (nameList.includes(templatevalue.value)) {
													const { loc } = templatevalue;
													diagnostics.push(
														createDiagnostic(
															Warning,
															{ start: loc.start.index, end: loc.end.index },
															'name已经存在'
														)
													);
												} else {
													nameList.push(templatevalue.value);
												}
											} else if (templatekey.name === 'path') {
												// 如果路径重复,则红线警告
												if (pathList.includes(templatevalue.value)) {
													const { loc } = templatevalue;
													diagnostics.push(
														createDiagnostic(
															Error,
															{ start: loc.start.index, end: loc.end.index },
															'path已经存在'
														)
													);
												}
												// 如果路径对应的文件夹不存在,则红线警告
												else if (
													!existsSync(
														decodeURIComponent(
															normalize(
																join(
																	textDocument.uri.replace(
																		/(file:\/\/\/)|(\.config\.template)/g,
																		''
																	),
																	templatevalue.value
																)
															)
														)
													)
												) {
													const { loc } = templatevalue;
													diagnostics.push(
														createDiagnostic(
															Error,
															{ start: loc.start.index, end: loc.end.index },
															'path不是个正确的路径'
														)
													);
												} else {
													pathList.push(templatevalue.value);
												}
											}
										});
									});
									break;
								// 如果key为placeholder走下方代码
								case 'placeholder':
									// 如果placeholder的值不是数组,则提示
									if (value.type !== 'ArrayExpression') {
										const { loc } = value;
										diagnostics.push(
											createDiagnostic(
												Error,
												{ start: loc.start.index, end: loc.end.index },
												'placeholder仅支持数组',
												{
													title: '使用数组',
													newText: "['',(context)=>context.module]"
												}
											)
										);
										break;
									}
									// 循环placeholder数组
									value.elements.forEach((value1: any) => {
										// 循环placeholder值的key
										value1.elements.forEach((value2: any, i: number) => {
											// 如果0不是字符串或正则表达式
											if (
												i === 0 &&
												!['RegExpLiteral', 'StringLiteral'].includes(
													value2.type
												)
											) {
												const { loc } = value2;
												diagnostics.push(
													createDiagnostic(
														Error,
														{ start: loc.start.index, end: loc.end.index },
														'类型错误,仅支持字符串、正则表达式',
														[
															{ title: '移除错误类型', newText: '' },
															{
																title: '转换为字符串',
																newText: `'${value2.value}'`
															},
															{
																title: '转换为正则表达式',
																newText: `${new RegExp(value2.value)}`
															}
														]
													)
												);
											}
											// 如果1不是函数
											else if (
												i === 1 &&
												!/FunctionExpression$/.test(value2.type)
											) {
												const { loc } = value2;
												diagnostics.push(
													createDiagnostic(
														Error,
														{ start: loc.start.index, end: loc.end.index },
														'应该是函数',
														{
															title: '使用示例',
															newText: '(context)=>context.module'
														}
													)
												);
											} else if (i > 1) {
												const { loc } = value2;
												diagnostics.push(
													createDiagnostic(
														Error,
														{ start: loc.start.index - 1, end: loc.end.index },
														'当前位置没有效果',
														{ title: '移除多余的数据', newText: '' }
													)
												);
											}
										});
									});
									break;
								// key为exclude走下方
								case 'exclude':
									// 如果exclude的值不是数组,则提示
									if (value.type !== 'ArrayExpression') {
										const { loc } = value;
										diagnostics.push(
											createDiagnostic(
												Error,
												{ start: loc.start.index, end: loc.end.index },
												'exclude仅支持数组',
												{
													title: '使用数组',
													newText: '[]'
												}
											)
										);
										break;
									}
									// 循环exclude数组
									value.elements.forEach((value: any) => {
										if (
											!['RegExpLiteral', 'StringLiteral'].includes(value.type)
										) {
											const { loc } = value;
											diagnostics.push(
												createDiagnostic(
													Error,
													{ start: loc.start.index, end: loc.end.index },
													'exclude数据类型错误,仅支持字符串、正则表达式',
													[
														{ title: '移除错误类型', newText: '' },
														{
															title: '转换为字符串',
															newText: `'${value.value}'`
														},
														{
															title: '转换为正则表达式',
															newText: `${new RegExp(value.value)}`
														}
													]
												)
											);
										}
									});
									break;
								case 'overwrite':
									// 如果overwrite的值不是布尔值,则提示
									if (value.type !== 'BooleanLiteral') {
										const { loc } = value;
										diagnostics.push(
											createDiagnostic(
												Error,
												{ start: loc.start.index, end: loc.end.index },
												'overwrite是布尔值',
												{
													title: '转化类型',
													newText: `${!!value.value}`
												}
											)
										);
										break;
									}
									break;
								case 'ignoreDefaultPlaceholder':
									// 如果ignoreDefaultPlaceholder的值不是布尔值,则提示
									if (value.type !== 'BooleanLiteral') {
										const { loc } = value;
										diagnostics.push(
											createDiagnostic(
												Error,
												{ start: loc.start.index, end: loc.end.index },
												'ignoreDefaultPlaceholder是布尔值',
												{
													title: '转化类型',
													newText: `${!!value.value}`
												}
											)
										);
										break;
									}
									break;
								default:
									break;
							}
						}
					}
				}
			}
		});
		// 如果出现多个module.exports
		if (assignmentExpressionList.length > 1) {
			assignmentExpressionList.forEach((path, i) => {
				const Called = i === assignmentExpressionList.length - 1;
				const loc: any = path.parent.loc;
				let diagnostic: Diagnostic;
				if (Called) {
					diagnostic = createDiagnostic(
						Warning,
						{ start: loc.start.index, end: loc.end.index },
						'module.exports仅支持一个,读取时会读取最后一个',
						{ title: '移除当前的module.exports', newText: '' }
					);
				} else {
					diagnostic = createDiagnostic(
						Error,
						{ start: loc.start.index, end: loc.end.index },
						'module.exports仅支持一个',
						{ title: '移除当前的module.exports', newText: '' }
					);
				}
				diagnostics.push(diagnostic);
			});
		} else {
			const [{ node }] = assignmentExpressionList;
			const position = {
				start: textDocument.positionAt(node.end || 0),
				end: textDocument.positionAt(text.length)
			};
			const content = textDocument.getText(position);
			if (content.length) {
				const diagnostic = createDiagnostic(
					Error,
					position,
					'当前代码将不会读取',
					{ title: '移除无效代码', newText: '' }
				);
				diagnostics.push(diagnostic);
			}
		}
	} catch (error: any) {
		// 如果触发了这里,说明配置文件无法读取
		if (!/(?<!\/\/.*)module.exports\s*=\s*/.test(text)) {
			const index = /(\/\/)*.*(?!\n)*{\n/.exec(text)?.index;
			const diagnostic = createDiagnostic(
				Error,
				{
					start: index || 0,
					end: index || 0
				},
				'缺少module.exports,',
				{
					title: '添加module.exports',
					newText: `module.exports = ${index !== void 0 ? ' ' : '{}\n'}`
				},
				[]
			);
			diagnostics.push(diagnostic);
		} else {
			// 将报错放到诊断里面
			const diagnostic = createDiagnostic(
				Error,
				{
					start: error.pos,
					end: error.pos
				},
				error.message
			);
			diagnostics.push(diagnostic);
		}
	}
	// 将计算的诊断发送到VSCode窗口。
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
};

// 文档内容改变时
documents.onDidChangeContent((event: TextDocumentChangeEvent<TextDocument>) => {
	validateTextDocument(event.document);
});

// 文档开始监听连接
documents.listen(connection);
// 连接启动监听
connection.listen();
