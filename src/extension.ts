import { commands, ExtensionContext, Uri, window } from 'vscode';
import { TemplateFile } from './TemplateFile';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand('fast-build.createConfigFile', async () => {
			try {
				const templateFile = new TemplateFile();
				let selectFolder: string = '全部';
				if (templateFile.workspaceFolders.length > 1) {
					selectFolder =
						(await window.showQuickPick(
							['全部'].concat(
								templateFile.workspaceFolders.map(({ name }) => name)
							),
							{
								placeHolder: '请选择项目文件夹'
							}
						)) || '';
				}
				templateFile.workspaceFolders.forEach((Folder) => {
					if (selectFolder === '全部' || selectFolder === Folder.name) {
						templateFile.createTemplate(Folder.uri.fsPath);
					}
				});
			} catch (error: any) {
				window.showErrorMessage(error);
			}
		})
	);
	context.subscriptions.push(
		commands.registerCommand('fast-build.create', (args: Uri) => {
			try {
				const templateFile = new TemplateFile(args);
				const workspaceFolder = templateFile.workspaceFolders.find(
					(Folder) => args.path.indexOf(Folder.uri.path) === 0
				);
				if (workspaceFolder) {
					templateFile.createFileFromTemplates(workspaceFolder);
				}
			} catch (error) {
				console.log(error);
			}
		})
	);
	// commands.executeCommand('fast-build.createConfigFile');
}

export function deactivate() {}
