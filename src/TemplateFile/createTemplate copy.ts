import { TextDecoder } from 'util';
import placeHolders = require('./placeFolder');
import * as vscode from 'vscode';
import * as lodash from 'lodash';
import * as fs from 'fs';
import * as path from 'path';

export class createTemplate {
	workspaceFolderUri!: vscode.Uri;
	configFile!: string;
	selection: any = {};
	config: any = {};
	placeHolders: any[] = [];
	constructor(context: vscode.ExtensionContext) {
		let disposable = vscode.commands.registerCommand(
			'fast-build.create',
			async (args) => {
				try {
					if (this.isUrl(args)) {
						const fsPath = args.fsPath;
						this.resolveWorkspaceWithSelection(fsPath);
						this.resolveConfig();
						this.setFolder(fsPath);

						const templateName = await this.selectTemplate();
						if (templateName) {
							this.setTemplate(templateName);
							const template = this.selection.template;
							if (!fsPath.includes(template.path)) {
								let option = {
									placeHolder: '请输入模块名称(默认为当前文件夹名称)'
								};
								const module = await vscode.window.showInputBox(option);
								if (module !== undefined) {
									this.setModuleName(
										module || this.selection.folder.parse.name
									);
									this.initPlaceHolder();
									await this.createFiles();
								}
							} else {
								this.error("'模板目录不能创建模板文件'");
							}
						}
					}
				} catch (err: any) {
					this.error(err.stack);
				}
			}
		);
		context.subscriptions.push(disposable);
	}
	isUrl(args: any) {
		const fspath = lodash.get(args, 'fsPath');
		return fspath && fspath !== '';
	}
	setFolder(folder: string) {
		this.selection.folder = undefined;
		if (folder) {
			this.selection.folder = {};
			this.selection.folder.parse = path.parse(folder);
			this.selection.folder.path = folder;
		}
	}
	resolveWorkspaceWithSelection(fsPath: string | string[]) {
		const workspace_folders = vscode.workspace.workspaceFolders || [];
		if (workspace_folders.length > 0) {
			for (let i = 0; i < workspace_folders.length; i++) {
				const workspace_folder = workspace_folders[i];
				if (fsPath.includes(workspace_folder.uri.fsPath)) {
					this.resolveWorkspace(workspace_folder.uri);
					return this;
				}
			}
		}
		this.error('无法确定Workspace');
	}
	resolveWorkspace(uri: vscode.Uri) {
		if (uri) {
			this.workspaceFolderUri = uri;
			return this;
		}
		this.error('无法确定Workspace');
	}
	resolveTemplateWithDir(config_templates: {
		path: any;
		filter: any;
		exclude: any;
	}) {
		const { path, filter, exclude } = config_templates;
		const templates = [];
		const fullpath = this.getPath(path, this.workspaceFolderUri.fsPath);
		if (fullpath && fs.existsSync(fullpath)) {
			const stat = fs.statSync(fullpath);
			if (stat.isDirectory()) {
				const files = fs.readdirSync(fullpath, { withFileTypes: true });
				if (files && files.length > 0) {
					for (let i = 0; i < files.length; i++) {
						const file = files[i];

						if (file.isDirectory()) {
							if (!filter || filter(file.name)) {
								templates.push({
									name: file.name,
									path: this.getPath(file.name, fullpath),
									exclude
								});
							}
						}
					}
				}
			} else {
				this.error('模板配置文件夹不能是个文件');
			}
		}
		return templates;
	}
	/**
	 * 解析FTemplate的配置文件
	 **/
	resolveConfig() {
		this.configFile = path.normalize(
			path.resolve(this.workspaceFolderUri.fsPath, '.ftemplate.js')
		);

		this.config.templateSelect = []; // 选择列表
		this.config.templates = []; //模板信息
		try {
			if (fs.existsSync(this.configFile)) {
				// 避免读取配置时,受require缓存影响
				delete require.cache[this.configFile];

				const config_temp = require(this.configFile);

				let config_templates = config_temp.templates;
				if (config_templates && typeof config_templates === 'object') {
					const isArray = Array.isArray(config_templates);
					let templates;
					if (isArray) {
						templates = config_templates;
					} else {
						templates = this.resolveTemplateWithDir(config_templates);
					}
					for (let i = 0; i < templates.length; i++) {
						// 添加全目录
						const template = templates[i];
						const stat = path.parse(template.path);
						if (stat.ext === '') {
							template.path = this.getPath(
								template.path,
								this.workspaceFolderUri.fsPath
							);
							if (fs.existsSync(template.path)) {
								template.uri = vscode.Uri.file(template.path);
								this.config.templates.push(template);
								// 生成模板选择项
								this.config.templateSelect.push(template.name);
							}
						} else {
							this.error(`模板配置路径 ${template.path} 必须是目录`);
						}
					}
					if (this.config.templates.length <= 0) {
						this.error(`未解析到有效模板列表`);
					}
				}
				this.config.placeholder = config_temp.placeholder || [];
				this.config.overwrite = config_temp.overwrite || false;
				this.config.ignoreDefaultPlaceholder =
					config_temp.ignoreDefaultPlaceholder || false;
			} else {
				let templateFolder = path.resolve(
					this.workspaceFolderUri.fsPath,
					'fileTemplate'
				);
				if (fs.existsSync(templateFolder)) {
					this.config.templates.push({
						name: 'default',
						path: templateFolder,
						uri: vscode.Uri.file(templateFolder)
					});

					this.config.templateSelect = ['default'];
					this.config.placeHolder = [];
					this.config.overwrite = false;
					this.config.ignoreDefaultPlaceholder = false;
				} else {
					this.error(
						'配置文件不存在，可以通过命令ftemplate.createConfigFile创建'
					);
				}
			}
		} catch (err) {
			this.error('配置文件异常\n ' + err);
		}
	}
	getPath(file: string, cwd: string) {
		if (file && file !== '') {
			const isAbsolute = path.isAbsolute(file);
			const filename = isAbsolute ? file : path.resolve(cwd, file);
			return filename;
		}
		return '';
	}
	async selectTemplate() {
		const config = this.config;
		const templateSelect = config.templateSelect;
		if (templateSelect.length > 1) {
			let option = {
				placeHolder: '请选择模板'
			};
			return await vscode.window.showQuickPick(templateSelect, option);
		} else {
			if (templateSelect.length > 0) {
				return templateSelect[0];
			}
		}
	}
	setTemplate(tmeplateName: any) {
		this.selection.template = undefined;

		const templates = this.config.templates;
		if (tmeplateName) {
			for (let i = 0; i < templates.length; i++) {
				const template = templates[i];
				if (template.name === tmeplateName) {
					this.selection.template = template;
				}
			}
		} else {
			const templates = this.config.templates;
			const template = templates[0];
			this.selection.template = template;
		}
	}
	setModuleName(moduleName: any) {
		this.selection.module = undefined;
		if (moduleName) {
			this.selection.module = moduleName;
		}
	}
	initPlaceHolder() {
		const config = this.config;
		this.placeHolders = [];
		if (!config.ignoreDefaultPlaceholder) {
			this.placeHolders = this.placeHolders.concat(placeHolders);
		}
		if (config.placeholder) {
			this.placeHolders = this.placeHolders.concat(config.placeholder);
		}
	}
	/** 格式化字符串内容 */
	parse(content: string) {
		const placeHolders = this.placeHolders;
		for (let i = 0; i < placeHolders.length; i++) {
			const ph = placeHolders[i];
			const regexpString = ph[0];
			const regexp = new RegExp(regexpString, 'g');
			const replace = ph[1];
			if (typeof replace === 'function') {
				content = content.replace(regexp, replace(this.getContext()));
			}
		}
		return content;
	}

	/** 创建模板文件入口*/
	createEntry(from: string, to: string, filename: string) {
		let entry: { from: any; to: any } = {
			from: undefined,
			to: undefined
		};
		const from_filename = path.resolve(from, filename);
		const to_filename = this.parse(path.resolve(to, filename));
		entry.from = vscode.Uri.file(from_filename);
		entry.to = vscode.Uri.file(to_filename);
		return entry;
	}

	/** 迭代读取文件夹下目录*/
	async readTemplateFiles(from: string, to: string, entrys: any[]) {
		const fromUrl = vscode.Uri.file(path.normalize(from));
		const fileinfos = await vscode.workspace.fs.readDirectory(fromUrl);
		for (let i = 0; i < fileinfos.length; i++) {
			const fileinfo = fileinfos[i];
			if (fileinfo[1] === vscode.FileType.File) {
				let entry = this.createEntry(from, to, fileinfo[0]);
				entrys.push(entry);
			} else if (fileinfo[1] === vscode.FileType.Directory) {
				const newFrom = path.resolve(from, fileinfo[0]);
				const newTo = this.parse(path.resolve(to, fileinfo[0]));
				await this.readTemplateFiles(newFrom, newTo, entrys);
			}
		}
	}

	processEntrys(entrys: string | any[]) {
		if (entrys && entrys.length > 0) {
			for (let i = 0; i < entrys.length; i++) {
				const entry = entrys[i];
				for (let index = 0; index < entrys.length; index++) {
					const newEntry = entrys[index];
					if (entry.to.fsPath === newEntry.to.fsPath && i !== index) {
						const name = path.parse(entry.from).name;
						entry.to = vscode.Uri.file(
							entry.to.fsPath + '( ' + name + '冲突 )' + `.` + index
						);
						break;
					}
				}
			}
		}
		return entrys;
	}
	isExclude(filename: string, exclude: string | any[]) {
		if (exclude && exclude.length > 0) {
			for (let i = 0; i < exclude.length; i++) {
				const exclude_temp = exclude[i];
				const regexp = new RegExp(exclude_temp);
				const ret = regexp.test(filename);
				if (ret) {
					return true;
				}
			}
		}
		return false;
	}
	/** 创建模板文件*/
	async createFile(from: vscode.Uri, to: vscode.Uri) {
		const data = await vscode.workspace.fs.readFile(from);
		let content = new TextDecoder('utf-8').decode(data);
		content = this.parse(content);
		await vscode.workspace.fs.writeFile(to, Buffer.from(content));
	}

	async createFiles() {
		let entrys: string | any[] = [];

		const config = this.config;
		const selection = this.selection;
		//递归遍历文件内容
		await this.readTemplateFiles(
			selection.template.path,
			selection.folder.path,
			entrys
		);

		// 避免文件匹配重复时
		entrys = this.processEntrys(entrys);

		const exclude = selection.template.exclude;
		for (let i = 0; i < entrys.length; i++) {
			const entry = entrys[i];
			if (exclude && this.isExclude(entry.from.fsPath, exclude)) {
				continue;
			}
			const exists = fs.existsSync(entry.to.fsPath);
			if (exists && !config.overwrite) {
				vscode.window.showInformationMessage(`文件已经存在${entry.to.fsPath}`);
			} else {
				await this.createFile(entry.from, entry.to);
			}
		}
		for (let i = 0; i < entrys.length; i++) {
			if (i === 0) {
				const entry = entrys[i];
				const exists = fs.existsSync(entry.to.fsPath);
				if (exists) {
					await vscode.window.showTextDocument(entry.to);
				}

				break;
			}
		}
	}
	getContext() {
		return {
			folder: this.selection.folder.path,
			workspaceFolder: this.workspaceFolderUri.fsPath,
			template: this.selection.template,
			module: this.selection.module
		};
	}
	error(message: string) {
		vscode.window.showErrorMessage(message);
	}
}
