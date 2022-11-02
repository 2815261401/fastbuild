import * as path from 'path';
import { commands, ExtensionContext, Uri, window } from 'vscode';
import { TemplateFile } from './TemplateFile';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { configTemplate } from './client/languageRegister';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// 服务端配置
	let serverModule = context.asAbsolutePath(
		path.join('out', 'server', 'index.js')
	);
	let serverOptions: ServerOptions = {
		module: serverModule,
		transport: TransportKind.ipc
	};
	// 客户端配置
	let clientOptions: LanguageClientOptions = {
		// js代码触发事情
		documentSelector: [{ scheme: 'file', language: 'config.template' }]
	};
	client = new LanguageClient(
		'DemoLanguageServer',
		'Demo Language Server',
		serverOptions,
		clientOptions
	);
	// 启动客户端，同时启动语言服务器
	client.start();

	// 补全功能
	configTemplate();

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
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
