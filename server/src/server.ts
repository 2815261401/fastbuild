import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	CompletionItem,
	CompletionItemKind,
	TextDocumentSyncKind,
	TextDocumentChangeEvent
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

// 创建连接
let connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
// 初始化事件
connection.onInitialize(() => {
	return {
		capabilities: {
			textDocumentSync: {
				openClose: true,
				change: TextDocumentSyncKind.Full
			},
			completionProvider: {
				resolveProvider: true
			}
		}
	};
});

// 初始化之后事件
connection.onInitialized(() => {
	connection.window.showInformationMessage('Hello World! form server side');
});

connection.onCompletion((): CompletionItem[] => {
	return ['name', 'path', 'context'].map((v, i) => ({
		label: v,
		kind: CompletionItemKind.Text,
		data: i
	}));
});

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
const initialValidation = (textDocument: TextDocument) => {
	console.log(textDocument.getText());
};
documents.onDidOpen((event: TextDocumentChangeEvent<TextDocument>) => {
	initialValidation(event.document);
});
documents.onDidChangeContent((event: TextDocumentChangeEvent<TextDocument>) => {
	initialValidation(event.document);
});

documents.listen(connection);
connection.listen();
