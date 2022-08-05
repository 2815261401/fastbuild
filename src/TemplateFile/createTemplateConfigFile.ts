import vscode = require('vscode');
import fs = require('fs');
import path = require('path');
import { getAll } from './Api';

export class createTemplateConfigFile {
	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'fast-build.createConfigFile',
				async () => {
					try {
						// 获取工作区
						const workspace_folder = await this.selectWorkspace();
						if (workspace_folder) {
							let workspace_configFileName =
								workspace_folder.uri.fsPath + '/.ftemplate.js';
							let workspace_configFileNameUrl = vscode.Uri.file(
								workspace_configFileName
							);
							if (fs.existsSync(workspace_configFileName)) {
								// 获取未创建的模板文件
								const copyList = await this.needCopy(workspace_folder);
								if (copyList.length > 0) {
									vscode.window
										.showInformationMessage(
											'配置文件已存在,是否要导入默认的模板文件？',
											'是',
											'否'
										)
										.then((result) => {
											if (result === '是') {
												copyList.forEach(({ to, from }) => {
													this.copyFile(to, from);
												});
												vscode.window.showInformationMessage(
													'默认的模板文件完成导入!'
												);
											}
										});
								} else {
									vscode.window.showInformationMessage('配置文件已存在!');
								}
								vscode.window.showTextDocument(workspace_configFileNameUrl);
							} else {
								// 获取配置文件,模板文件路径
								const configFileList = await this.getAllFile(
									path.normalize(
										path.resolve(__dirname, '../../public/TemplateFileConfig')
									)
								);
								// 复制配置文件,模板文件到工作区
								configFileList.forEach((url) => {
									if (!fs.existsSync(`${workspace_folder.uri.fsPath}/${url}`)) {
										this.copyFile(
											`${__dirname}/../../public/TemplateFileConfig/${url}`,
											`${workspace_folder.uri.fsPath}/${url}`
										);
									}
								});
								const workspace_configFileName = workspace_folder.uri.fsPath + '/.gitignore';
								const workspace_configFileNameUrl=vscode.Uri.file(workspace_configFileName);
								// 判断.gitignore是否存在
								if (fs.existsSync(workspace_configFileName)) {
									// 读取.gitignore
									let data = await vscode.workspace.fs.readFile(workspace_configFileNameUrl);
										const gitignoreStr = data.toString();
										['.ftemplate.js', 'fileTemplate'].forEach((path) => {
											if (!gitignoreStr.includes(path)) {
												data = Buffer.concat([data, Buffer.from(`\n${path}`)]);
											}
										});
									await vscode.workspace.fs.writeFile(workspace_configFileNameUrl, data);
								}
							}
						} else {
							this.error('未发现工作区,无法进行创建!');
						}
					} catch (err: any) {
						this.error(err.message);
						return;
					}
				}
			)
		);
	}
	// 选择工作区
	async selectWorkspace() {
		const workspace_folders = vscode.workspace.workspaceFolders || [];
		if (workspace_folders.length === 1) {
			return workspace_folders[0];
		}
		const workspace_folder_select = workspace_folders.map((item) => {
			return item.name;
		});
		let option = {
			placeHolder: '请选择工作区'
		};
		const name = await vscode.window.showQuickPick(
			workspace_folder_select,
			option
		);
		if (name) {
			for (let i = 0; i < workspace_folders.length; i++) {
				const workspace_folder = workspace_folders[i];
				if (workspace_folder.name === name) {
					return workspace_folder;
				}
			}
		}
	}
	// 判断是否需要复制文件
	async needCopy(
		workspace_folder: vscode.WorkspaceFolder
	): Promise<{ to: string; from: string }[]> {
		const config_temp = require(path.normalize(
			path.resolve(workspace_folder.uri.fsPath, '.ftemplate.js')
		));
		if (Array.isArray(config_temp.templates)) {
			config_temp.templates = config_temp.templates[0];
		}
		const workspace_template = await this.getAllFile(
			path.normalize(
				path.resolve(workspace_folder.uri.fsPath, config_temp.templates.path)
			)
		);
		const default_template = await this.getAllFile(
			path.normalize(
				path.resolve(__dirname, '../../public/TemplateFileConfig/fileTemplate')
			)
		);
		const arr: Array<{ to: string; from: string }> = [];
		default_template.forEach((url) => {
			if (!workspace_template.includes(url)) {
				arr.push({
					to: `${__dirname}/../../public/TemplateFileConfig/fileTemplate/${url}`,
					from: `${workspace_folder.uri.fsPath}/${config_temp.templates.path}/${url}`
				});
			}
		});
		return arr;
	}
	// 获取路径下所有文件
	async getAllFile(folderPath: string): Promise<string[]> {
		return await getAll(folderPath);
	}
	// 复制文件
	copyFile(from: string, to: string) {
		vscode.workspace.fs.copy(vscode.Uri.file(from), vscode.Uri.file(to));
	}
	// 弹出错误信息
	error(message: string) {
		vscode.window.showErrorMessage(message);
	}
}
