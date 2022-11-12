import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { error } from './TemplateFile';

export let client: LanguageClient;
export function activate(client: LanguageClient, context: ExtensionContext) {
	try {
		// 创建服务器位置
		const serverModule = context.asAbsolutePath(
			path.join('server', 'out', 'server.js')
		);
		// 调试设置
		const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
		// 服务器设置
		const serverOptions: ServerOptions = {
			run: { module: serverModule, transport: TransportKind.ipc },
			debug: {
				module: serverModule,
				transport: TransportKind.ipc,
				options: debugOptions
			}
		};
		// 客户端设置
		const clientOptions: LanguageClientOptions = {
			documentSelector: [{ scheme: 'file', language: 'configtemplate' }],
			synchronize: {
				fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
			}
		};
		// 创建客户端
		client = new LanguageClient(
			'languageServerExample',
			'Language Server Example',
			serverOptions,
			clientOptions
		);

		// 启动客户端
		client.start();
	} catch (err: any) {
		error(err.message);
	}
}

export function deactivate(client: LanguageClient): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
