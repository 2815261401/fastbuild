import vscode = require('vscode');
import fs = require('fs');
import path = require('path');

export class createTemplateConfigFile {
	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'fastbuild.createConfigFile',
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
								this.needCopy(workspace_folder);

								vscode.window
									.showInformationMessage(
										'配置文件已存在,是否要导入默认的模板文件？',
										'是',
										'否'
									)
									.then((result) => {
										if (result === '是') {
											// this.copyFile();
											vscode.window.showInformationMessage(
												'默认的模板文件完成导入!'
											);
										} else {
											vscode.window.showTextDocument(
												workspace_configFileNameUrl
											);
										}
									});
							} else {
								// this.copyFile();
								let content_filename = __dirname + '/config.js';
								let content_filenameUrl = vscode.Uri.file(content_filename);
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
	needCopy(
		workspace_folder: vscode.WorkspaceFolder
	): { to: string; from: string }[] {
		const config_temp = require(path.normalize(
			path.resolve(workspace_folder.uri.fsPath, '.ftemplate.js')
		));
		const workspace_template = this.getAllFile(
			path.normalize(
				path.resolve(workspace_folder.uri.fsPath, config_temp.templates.path)
			)
		);
		const default_template = this.getAllFile(
			path.normalize(
				path.resolve(__dirname, '../../public/TemplateFileConfig/template')
			)
		);
		const arr: Array<{ to: string; from: string }> = [];
		default_template.forEach((url) => {
			if (!workspace_template.includes(url)) {
				arr.push({
					to: `${__dirname}/../../public/TemplateFileConfig/template${url}`,
					from: `${workspace_folder.uri.fsPath}/${config_temp.templates.path}${url}`
				});
			}
		});
		return arr;
	}
	getAllFile(folderPath: string): string[] {
		const fileList: string[] = [];
		const fileDisplay = (filePath: string, folderPath: string = '') => {
			if (!folderPath) {
				folderPath = filePath;
			}
			//根据文件路径读取文件，返回文件列表
			fs.readdir(filePath, (err, files) => {
				if (err) {
					this.error(err.message);
					return;
				}
				files.forEach((filename) => {
					//获取当前文件的绝对路径
					const filedir = path.join(filePath, filename);
					// fs.stat(path)执行后，会将stats类的实例返回给其回调函数。
					fs.stat(filedir, (eror, stats) => {
						if (eror) {
							this.error(eror.message);
							return;
						}
						// 是否是文件
						const isFile = stats.isFile();
						// 是否是文件夹
						const isDir = stats.isDirectory();
						if (isFile) {
							fileList.push(
								filedir.replace(folderPath, '').replace(/\\/g, '/')
							);
						}
						// 如果是文件夹
						if (isDir) {
							fileDisplay(filedir, folderPath);
						}
					});
				});
			});
			return fileList;
		};
		return fileDisplay(folderPath);
	}
	copyFile(to: string, from: string) {
		vscode.workspace.fs.copy(vscode.Uri.file(to), vscode.Uri.file(from));
	}
	error(message: string) {
		vscode.window.showErrorMessage(message);
	}
}
