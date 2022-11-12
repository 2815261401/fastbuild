import {
	CompletionItem,
	CompletionItemKind,
	languages,
	Position,
	TextDocument
} from 'vscode';

export const configTemplate = () => {
	languages.registerCompletionItemProvider(
		'config.template',
		{
			provideCompletionItems(document: TextDocument, position: Position) {
				let linePrefix = document
					.lineAt(position)
					.text.slice(0, position.character);
				if (linePrefix.endsWith('context.')) {
					return [
						new CompletionItem('folder', CompletionItemKind.Text),
						new CompletionItem('folderPath', CompletionItemKind.Folder),
						new CompletionItem('workspaceFolder', CompletionItemKind.Text),
						new CompletionItem('templateFolder', CompletionItemKind.Text),
						new CompletionItem('module', CompletionItemKind.Text),
						new CompletionItem('template', CompletionItemKind.Class)
					];
				} else if (
					/^(\t|\s|:|;)(\s|\t)*context\.template(\.(parent|children\[[0-9]+\]))*\.$/.test(
						linePrefix
					)
				) {
					return [
						new CompletionItem('alias', CompletionItemKind.Variable),
						new CompletionItem('name', CompletionItemKind.Variable),
						new CompletionItem('allPath', CompletionItemKind.Variable),
						new CompletionItem('children', CompletionItemKind.Variable),
						new CompletionItem('fullName', CompletionItemKind.Variable),
						new CompletionItem('parent', CompletionItemKind.Variable)
						// new CompletionItem('folderPath', CompletionItemKind.Function)
					];
				} else {
					return void 0;
				}
			}
		},
		'.' // triggered whenever a '.' is being typed
	);
};
