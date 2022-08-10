import { TextDecoder } from 'util';
import placeHolders = require('./placeFolder');
import * as vscode from 'vscode';
import * as lodash from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { asyncConcatArray, getAll, TemplateType } from './Api';

export class createTemplate {
	workspaceFolderUri!: vscode.Uri;
	config: {
		templates: any[];
		placeholder: any[][];
		exclude: any[];
		overwrite: boolean;
		ignoreDefaultPlaceholder: boolean;
	} = {
		templates: [],
		placeholder: [],
		exclude: [],
		overwrite: false,
		ignoreDefaultPlaceholder: false
	};
	placeHolders: [string | RegExp, Function][] = placeHolders as [
		string | RegExp,
		Function
	][];
	selectFolder: { path: string; name: string } = {
		path: '',
		name: ''
	};
	delimiter!: string;
	constructor(context: vscode.ExtensionContext) {
		let disposable = vscode.commands.registerCommand(
			'fast-build.create',
			async (args) => {
				try {
					// 判断是否是右击触发的命令
					if (this.isPath(args)) {
						// 获取右击的文件夹路径
						this.selectFolder.path = args.fsPath;
						const selectFolderPathList = this.selectFolder.path.split('\\');
						// 获取右击的文件夹名称
						this.selectFolder.name =
							selectFolderPathList[selectFolderPathList.length - 1];
						this.delimiter =
							vscode.workspace.getConfiguration().get('fastBuild.delimiter') ||
							'';
						// 设置工作区变量
						this.resolveWorkspaceWithSelection(this.selectFolder.path);
						// 读取配置文件
						await this.resolveConfig();
						// 循环获取模板列表里面的所有文件
						const templates: TemplateType[] = await asyncConcatArray(
							this.config.templates,
							(template) => getAll(template.path, this.delimiter, true)
						);
						// 将配置列表加入模板中
						templates.push(
							...this.config.templates.map((template) => {
								const templateType = new TemplateType(1, template.path);
								templateType.setName(template.name);
								return templateType;
							})
						);
						// 获取模板类型
						const templateType = await this.selectTemplateType();
						if (templateType) {
							// 获取选择的模板
							const select = await this.selectTemplate(
								templates
									// 过滤被忽略的文件,文件夹
									.filter(({ allName }) =>
										this.config.exclude.every(
											(regex) => !new RegExp(regex).test(allName)
										)
									),
								templateType
							);
							// 未选中跳出命令
							if (select.name) {
								this.createTemplateFile(select, templateType);
							}
						}
					} else {
						throw new Error("请右击文件夹使用'(通过模板) 新建文件'来创建文件");
					}
				} catch (err: any) {
					if (err.message) {
						let ftemplatePath = path.normalize(
							path.resolve(this.workspaceFolderUri.fsPath, '.ftemplate.js')
						);
						this.error(err.message);
						vscode.window.showTextDocument(vscode.Uri.file(ftemplatePath));
					}
				}
			}
		);
		context.subscriptions.push(disposable);
	}
	// 格式化字符串内容
	async parse(
		content: string,
		file: TemplateType,
		placeHolder: string,
		cb?: (data: { content: string; custom: any; module: string }) => string
	) {
		// 初始化占位符列表
		let placeHolders: { name: string | RegExp; cb: Function }[] = [];
		// 判断是否忽略系统占位符
		if (!this.config.ignoreDefaultPlaceholder) {
			placeHolders = this.placeHolders.map((place) => ({
				name: place[0],
				cb: place[1]
			}));
		}
		// 将用户自定义占位符加入列表
		this.config.placeholder.forEach((place) => {
			// 判断占位符是否已存在
			const index = placeHolders.findIndex((item) => item.name === place[0]);
			// 如果存在
			if (index > -1) {
				// 将占位符函数替换为用户自定义的
				placeHolders[index].cb = place[1];
			} else {
				// 如果不存在则加入
				placeHolders.push({
					name: place[0],
					cb: place[1]
				});
			}
		});
		// 对所有的占位符执行替换操作
		placeHolders.forEach((item) => {
			// 加入全局替换
			const regexp = new RegExp(item.name, 'g');
			if (typeof item.cb === 'function') {
				const allNameList = file.allName.split(this.delimiter);
				const allName = allNameList[allNameList.length - 1];
				// 执行替换
				content = content.replace(
					regexp,
					item.cb({
						folder: this.selectFolder.name,
						folderPath: this.selectFolder.path,
						workspaceFolder: path.parse(this.workspaceFolderUri.path).name,
						templateFolder: file.rootName,
						module: path.parse(allName).name,
						name: path.parse(allName).base
					})
				);
			}
		});
		// 判断是否有自定义模板
		if (/\%custom\%/.test(content)) {
			// 获取自定义字段列表
			const customList = content.match(/\%custom\%/g) || [];
			// 强制等待,自定义字段一个一个替换
			await asyncConcatArray(customList, async (custom, i) => {
				// 获取自定义数据
				const module = await vscode.window.showInputBox({
					placeHolder: `${placeHolder}(${i})`
				})||'custom';
				if (module) {
					if (cb) {
						// 如果存在回调,执行回调
						content = cb({ content, custom, module });
					} else {
						// 否则执行替换
						content = content.replace(custom, module);
					}
				}
				return custom;
			});
		}
		return content;
	}
	// 创建模板
	async createTemplateFile(selectTemplate: TemplateType, templateType: string) {
		let fileList: TemplateType[] = [];
		const nameList = (selectTemplate.allName||selectTemplate.name).split(this.delimiter);
		selectTemplate.allName = nameList[nameList.length - 1];
		if (selectTemplate.type === 1) {
			// 如果是文件夹则获取所有文件,文件夹
			fileList = await getAll(selectTemplate.path, this.delimiter, true);
			fileList.push(selectTemplate);
		} else {
			// 如果是文件,则加入列表,方便管理
			fileList = [selectTemplate];
		}
		// 过滤被忽略的文件,文件夹
		fileList = fileList.filter((file) =>
			this.config.exclude.every((regex) => !new RegExp(regex).test(file.path))
		);
		// 强制等待,模板文件一个一个生成
		await asyncConcatArray(fileList, async (file) => {
			// 对文件名进行格式化
			file.allName = await this.parse(
				file.allName,
				file,
				`请输入名称,模板位置:${file.allName}`,
				({ content, custom, module }) => {
					fileList
						// 筛选当前文件夹内的所有文件,文件夹
						.filter((item) => item.allName.indexOf(file.allName) === 0)
						// 对文件夹内所有的文件,文件夹路径进行替换
						.forEach((data) => {
							data.allName = data.allName.replace(custom, module);
						});
					// 返回替换后的文件路径
					return content.replace(custom, module);
				}
			);
			// 获取模板生成的目标路径
			const target = this.getPath(
				file.allName.split(this.delimiter).join('/'),
				this.selectFolder.path
			);
			// 文件是否已经存在
			const exist = fs.existsSync(target);
			if (file.type === 2) {
				// 排除文件存在且不允许覆盖的情况
				if (!(exist && !this.config.overwrite)) {
					// 获取模板数据
					const data = await vscode.workspace.fs.readFile(
						vscode.Uri.file(file.path)
					);
					// 将模板内容转化成字符串
					let content = new TextDecoder('utf-8').decode(data);
					// 对模板内容进行格式化
					content = await this.parse(
						content,
						file,
						`请输入字段,位置: ${file.allName}`
					);
					// 将内容写入到指定位置的文件
					await vscode.workspace.fs.writeFile(
						vscode.Uri.file(target),
						Buffer.from(content)
					);
				}
			} else if (file.type === 1&&!exist) {
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(target));
			}
			return file;
		});
	}
	// 选择模板
	async selectTemplate(
		templates: TemplateType[],
		selectType: string,
		parName: string[] = []
	): Promise<TemplateType> {
		let nextTemplates = null;
		// 对模板进行过滤
		if (selectType === '全部文件') {
			nextTemplates = templates
				// 过滤文件夹
				.filter((template) => template.type === 2 && parName.length === 0)
				// 显示全部的名称
				.map(({ allName }) => allName);
		} else {
			nextTemplates = templates
				// 获取对应子级
				.filter(
					(template) =>
						template.parName === parName[parName.length - 1] &&
						(!template.allName ||
							template.allName.includes(parName.join(this.delimiter)))
				)
				// 显示文件,文件夹的名称
				.map(({ name }) => name);
			if (parName.length > 0) {
				nextTemplates.unshift('返回');
				// '混合', '文件夹'类型允许选择文件夹
				if (['混合', '文件夹'].includes(selectType)) {
					nextTemplates.unshift('选择当前文件夹');
				}
			}
		}
		// 判断是否是文件夹,及文件夹内是否有其他模板
		if (
			nextTemplates.filter((v) => !['返回', '选择当前文件夹'].includes(v))
				.length > 0
		) {
			// 获取被选中的选项
			let select = await vscode.window.showQuickPick(nextTemplates, {
				placeHolder: `请选择模板${
					parName.length > 0 ? `( ${parName[parName.length - 1]} )` : ''
				}`
			});
			// 如果取消选择返回空值
			if (!select) {
				return new TemplateType(2);
			}
			// 获取当前文件夹信息
			const template =
				templates.find((item) => item.name === parName[parName.length - 1]) ||
				new TemplateType(2);
			if (select === '返回') {
				// 设置路径为上一级
				parName.pop();
			} else if (select === '选择当前文件夹') {
				return template;
			} else {
				parName.push(select);
			}
			// 返回对应位置的文件夹
			return this.selectTemplate(templates, selectType, parName);
		} else {
			// 获取被选中的实例
			const select =
				templates.find((template) =>
					[template.name, template.allName].includes(
						parName[parName.length - 1] || ''
					)
				) || new TemplateType(2);
			return select;
		}
	}
	// 选择模板类型
	async selectTemplateType() {
		return await vscode.window.showQuickPick(
			['混合', '文件', '文件夹', '全部文件'],
			{
				placeHolder: '请选择模板类型'
			}
		);
	}
	// 获取路径
	getPath(filePath: string, rootPath: string) {
		if (filePath && filePath !== '') {
			// 判断filePath是否是完整路径
			const isAbsolute = path.isAbsolute(filePath);
			// 如果filePath不是完整路径则拼接上rootPath
			const fullPath = isAbsolute ? filePath : path.resolve(rootPath, filePath);
			return fullPath;
		}
		return '';
	}
	// 判断文件夹路径是否存在
	isPath(args: string) {
		const fspath = lodash.get(args, 'fsPath');
		return fspath && fspath !== '';
	}
	// 获取工作区路径
	resolveWorkspaceWithSelection(fsPath: string | string[]) {
		const workspace_folders = vscode.workspace.workspaceFolders || [];
		const workspace_folder = workspace_folders.find((workspace_folder) =>
			fsPath.includes(workspace_folder.uri.fsPath)
		);
		if (workspace_folders.length > 0 && workspace_folder) {
			this.resolveWorkspace(workspace_folder.uri);
		} else {
			throw new Error('无法确定Workspace');
		}
	}
	// 设置工作区路径
	resolveWorkspace(uri: vscode.Uri) {
		if (uri) {
			this.workspaceFolderUri = uri;
		} else {
			throw new Error('无法确定Workspace');
		}
	}
	// 解析配置文件
	resolveConfig() {
		return new Promise((resolve, reject) => {
			// 拼接配置文件路径
			let ftemplatePath = path.normalize(
				path.resolve(this.workspaceFolderUri.fsPath, '.ftemplate.js')
			);
			try {
				// 判断工作区是否存在配置文件
				if (!fs.existsSync(ftemplatePath)) {
					// 如果工作区不存在配置文件将读取默认配置文件
					ftemplatePath = path.normalize(
						path.resolve(
							__dirname,
							'../../public/TemplateFileConfig/.ftemplate.js'
						)
					);
				}
				// 避免读取配置时,受require缓存影响
				delete require.cache[ftemplatePath];
				// 读取配置文件
				const config_temp = require(ftemplatePath);
				// 读取配置文件的配置列表
				let config_templates = config_temp.templates;
				// 判断是否存在模板列表
				if (config_templates && typeof config_templates === 'object') {
					let templates;
					// 判断模板列表是否是数组
					if (!Array.isArray(config_templates)) {
						// 如果是对象,转换为数组
						templates = [config_templates];
					} else {
						templates = config_templates;
					}
					if (templates.length <= 0) {
						throw new Error(`未解析到有效模板列表,请检查配置文件!`);
					}
					const duplicateList: string[] = [];
					// 对配置列表循环判断
					templates = templates.map((template) => {
						if (typeof template === 'string') {
							template = { path: template, name: template };
						} else if (
							typeof template !== 'object' ||
							Array.isArray(template)
						) {
							throw new Error('templates仅支持对象和字符串');
						}
						// 获取template的文件信息
						const stat = path.parse(template.path);
						// 判断是否是文件夹
						if (stat.ext === '') {
							// 获取template完整路径
							template.path = this.getPath(
								template.path,
								this.workspaceFolderUri.fsPath
							);
							if (this.selectFolder.path.includes(template.path)) {
								reject(new Error(`请不要在模板文件夹里面创建模板文件!`));
							}
							if (!duplicateList.includes(template.path)) {
								duplicateList.push(template.path);
							} else {
								throw new Error(`模板路径${template.name}重复,请检查配置文件!`);
							}
							// 判断template是否已经创建
							if (fs.existsSync(template.path)) {
								template.uri = vscode.Uri.file(template.path);
							} else {
								throw new Error(`模板路径不存在,请检查配置文件!`);
							}
						} else {
							throw new Error(`模板配置路径 ${template.path} 必须是目录`);
						}
						return template;
					});
					// 将配置文件信息记录到内存
					this.config.templates = templates;
					const { placeholder, exclude, overwrite, ignoreDefaultPlaceholder } =
						config_temp;
					this.config.placeholder = placeholder || [];
					this.config.exclude = exclude || [];
					this.config.overwrite = overwrite || false;
					this.config.ignoreDefaultPlaceholder =
						ignoreDefaultPlaceholder || false;
					resolve(true);
				} else {
					throw new Error(`未找到配置路径,请检查配置文件!`);
				}
			} catch (error: any) {
				throw new Error(`配置文件异常: ${error.message}`);
			}
		});
	}
	// 弹出报错信息
	error(message: string) {
		vscode.window.showErrorMessage(message);
	}
}
