import { TextDecoder } from 'util';
import placeHolders = require('./placeFolder');
import * as vscode from 'vscode';
import * as lodash from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { getAll, TemplateType } from './Api';

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
	constructor(context: vscode.ExtensionContext) {
		let disposable = vscode.commands.registerCommand(
			'fast-build.create',
			async (args) => {
				try {
					// 判断是否是右击触发的命令
					if (this.isPath(args)) {
						const fsPath = args.fsPath;
						// 设置工作区变量
						this.resolveWorkspaceWithSelection(fsPath);
						// 读取配置文件
						this.resolveConfig();
						const templates: TemplateType[] = [];
						await (() => {
							const max = this.config.templates.length - 1;
							return new Promise((resolve) => {
								this.config.templates.forEach(async (template,i) => {
									const templateType = new TemplateType(1, template.path);
									templateType.setName(template.name);
									templates.push(templateType);
									const data = await getAll(template.path, ' > ', true);
									console.log('data', data);
									templates.push(...data);
									if (i === max) {
										resolve(true);
									}
								});
							});
						})();
						console.log('templates', templates);
						const templateType = await this.selectTemplateType();
						if (templateType) {
							const select = await this.selectTemplate(templates, templateType);
							console.log(select);
						}
					} else {
						this.error("请右击文件夹使用'(通过模板) 新建文件'来创建文件");
					}
				} catch (err: any) {
					this.error(err.stack);
				}
			}
		);
		context.subscriptions.push(disposable);
	}
	// 选择模板
	async selectTemplate(
		templates: TemplateType[],
		selectType: string,
		parName?: string
	): Promise<TemplateType> {
		let nextTemplates = null;
		// 对模板进行过滤
		if (selectType === '全部文件') {
			nextTemplates = templates
				.filter((template) => template.type === 2)
				.map(({ allName }) => allName);
		} else {
			nextTemplates = templates
				.filter((template) => template.parName === parName)
				.map(({ name }) => name);
		}
		// 判断是否是文件夹,及文件夹内是否有其他模板
		if (nextTemplates.length > 0) {
			const select = await vscode.window.showQuickPick(nextTemplates, {
				placeHolder: '请选择模板'
			});
			if (!select) {
				return new TemplateType(2);
			}
			return this.selectTemplate(templates, selectType, select);
		} else {
			const select =
				templates.find((template) => template.name === parName) ||
				new TemplateType(2);
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
			this.error('无法确定Workspace');
		}
	}
	// 设置工作区路径
	resolveWorkspace(uri: vscode.Uri) {
		if (uri) {
			this.workspaceFolderUri = uri;
		} else {
			this.error('无法确定Workspace');
		}
	}
	// 解析配置文件
	resolveConfig() {
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
				// 对配置列表循环判断
				templates.forEach((template) => {
					// 获取template的文件信息
					const stat = path.parse(template.path);
					// 判断是否是文件夹
					if (stat.ext === '') {
						// 获取template完整路径
						template.path = this.getPath(
							template.path,
							this.workspaceFolderUri.fsPath
						);
						// 判断template是否已经创建
						if (fs.existsSync(template.path)) {
							template.uri = vscode.Uri.file(template.path);
						} else {
							throw new Error(`模板路径不存在,请检查配置文件!`);
						}
					} else {
						throw new Error(`模板配置路径 ${template.path} 必须是目录`);
					}
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
			} else {
				throw new Error(`未找到配置路径,请检查配置文件!`);
			}
		} catch (error: any) {
			this.error(`配置文件异常: ${error.message}`);
			vscode.window.showTextDocument(vscode.Uri.file(ftemplatePath));
		}
	}
	// 弹出报错信息
	error(message: string) {
		vscode.window.showErrorMessage(message);
	}
}
