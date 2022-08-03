import vscode = require('vscode');
import fs = require('fs');
import path = require('path');

export class createTemplateConfigFile {
	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'fast-build.createConfigFile',
				async () => {
					try {
						const workspace_folder = await this.selectWorkspace();
						if (workspace_folder) {
							let workspace_configFileName =
								workspace_folder.uri.fsPath + '/.ftemplate.js';
							let workspace_configFileNameUrl = vscode.Uri.file(
								workspace_configFileName
							);
							if (fs.existsSync(workspace_configFileName)) {
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
								const configFileList = await this.getAllFile(
									path.normalize(
										path.resolve(__dirname, '../../public/TemplateFileConfig')
									)
								);
								configFileList.forEach((url) => {
									this.copyFile(
										`${__dirname}/../../public/TemplateFileConfig${url}`,
										`${workspace_folder.uri.fsPath}${url}`
									);
								});
								let workspace_configFileName =
									workspace_folder.uri.fsPath + '/.gitignore';
								if (fs.existsSync(workspace_configFileName)) {
									const gitignoreUrl = path.normalize(
										path.resolve(workspace_folder.uri.fsPath, '.gitignore')
									);
									fs.readFile(gitignoreUrl, (err, data) => {
										if (err) {
											this.error(err.message);
										}
										data = Buffer.concat([
											data,
											Buffer.from('\n.ftemplate.js\nfileTemplate')
										]);
										fs.writeFile(gitignoreUrl, data, 'utf8', (err) => {
											if (err) {
												this.error(err.message);
											}
										});
									});
								}
							}
						}
					} catch (err: any) {
						this.error(err.message);
						return;
					}
				}
			)
		);
	}
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
					to: `${__dirname}/../../public/TemplateFileConfig/fileTemplate${url}`,
					from: `${workspace_folder.uri.fsPath}/${config_temp.templates.path}${url}`
				});
			}
		}); 'lryessczfrx5uhjfpjcfr46awonuyn7b5yhqjzdwdmwwc5xx3nsa';
		return arr;
	}
	async getAllFile(folderPath: string): Promise<string[]> {
		const fileDisplay = (
			filePath: string,
			folderPath: string = ''
		): Promise<string[]> => {
			if (!folderPath) {
				folderPath = filePath;
			}
			const Judgment = (filename: string): Promise<string[]> => {
				return new Promise((resolve) => {
					//获取当前文件的绝对路径
					const filedir = path.join(filePath, filename);
					// fs.stat(path)执行后，会将stats类的实例返回给其回调函数。
					fs.stat(filedir, async (eror, stats) => {
						if (eror) {
							this.error(eror.message);
							return;
						}
						// 是否是文件
						const isFile = stats.isFile();
						// 是否是文件夹
						const isDir = stats.isDirectory();
						if (isFile) {
							resolve([filedir.replace(folderPath, '').replace(/\\/g, '/')]);
						}
						// 如果是文件夹
						if (isDir) {
							const flies = await fileDisplay(filedir, folderPath);
							resolve(flies);
						}
					});
				});
			};
			return new Promise((resolve) => {
				if (!fs.existsSync(filePath)) {
					resolve([]);
				} else {
					fs.readdir(filePath, (err, files) => {
						if (err) {
							this.error(err.message);
							return;
						}
						const fileList: string[] = [];
						const max = files.length - 1;
						files.forEach(async (filename, i) => {
							const flie = await Judgment(filename);
							fileList.push(...flie);
							if (i === max) {
								resolve(fileList);
							}
						});
					});
				}
			});
		};
		const data = await fileDisplay(folderPath);
		return data;
	}
	copyFile(from: string, to: string) {
		vscode.workspace.fs.copy(vscode.Uri.file(from), vscode.Uri.file(to));
	}
	error(message: string) {
		vscode.window.showErrorMessage(message);
	}
}
