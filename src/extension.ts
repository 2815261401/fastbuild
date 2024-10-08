import { execSync } from 'child_process';
import { join, relative } from 'path';
import { ExtensionContext, Uri, commands, window, workspace } from 'vscode';
import map from 'xe-utils/map';
import { catchError, commit, configuration, createFile, createTemplate, logs } from './utils';

export async function activate(context: ExtensionContext) {
  configuration.extensionUri = context.extensionUri;
  context.subscriptions.push(
    ...map(['createConfigFile', 'createTemplate', 'createFile', 'commit', 'quickCommand'], (key) =>
      commands.registerCommand(`fast-build.${key}`, async (resource: Uri) => {
        try {
          /** 获取工作区 */
          await configuration.updateWorkspaceFolder(resource);
          if (key === 'createTemplate') {
            if (configuration.workspaceFolder) {
              await createTemplate(resource);
            } else {
              logs.appendLine('未找到工作区!');
            }
          } else if (key === 'createFile') {
            if (configuration.workspaceFolder) {
              await createFile(resource);
            } else {
              logs.appendLine('未找到工作区!');
            }
          } else if (key === 'commit') {
            if (configuration.workspaceFolder) {
              await commit();
            } else {
              logs.appendLine('未找到工作区!');
            }
          } else if (key === 'quickCommand') {
            const stat = await workspace.fs.stat(resource);
            const config = Object.entries(configuration.getCommandConfiguration())
              .filter(([, value]) => !value.includes(`$${stat.type === 1 ? 'dir' : 'file'}`))
              .map(([label, value]) => ({
                label,
                value,
                description: value,
              }));
            if (config.length === 0) {
              return;
            }
            const select = await window.showQuickPick(config, {
              placeHolder: '请选择要执行的命令',
              ignoreFocusOut: true,
              matchOnDescription: true,
            });
            if (select?.value) {
              const shellPath = select?.value.startsWith('(bash)')
                ? join(execSync('where git').toString(), '../../bin/bash.exe') || void 0
                : void 0;
              const list = window.terminals.filter((v) => /^快速命令(-[123])?$/.test(v.name));
              const index = list.length;
              let name = `快速命令${index ? `-${index}` : ''}`;
              if (index > configuration.getCommandTerminalsNumber()) {
                name = '快速命令';
                list.forEach((v) => {
                  v.dispose();
                });
              }
              const pw = window.createTerminal({ name, shellPath, isTransient: true });
              pw.show();
              const fixedParameter = {
                path: resource.fsPath,
                file: stat.type === 1 ? resource.fsPath : void 0,
                dir: stat.type === 2 ? resource.fsPath : void 0,
              };
              const commandList = (
                shellPath ? select.value.replace(/^\(bash\)/, '') : select.value
              ).split(/\$(path|file|dir|custom)/);
              for (const [i, v] of Object.entries(commandList)) {
                let path = fixedParameter[v as keyof typeof fixedParameter];
                if (path) {
                  path = relative(configuration.workspaceFolder.uri.fsPath, path);
                } else {
                  path = v;
                }
                if (v === 'custom') {
                  const custom = await window.showInputBox({
                    placeHolder: '请输入自定义',
                    prompt: commandList.toSpliced(Number(i), 1, '<custom>').join(''),
                    ignoreFocusOut: true,
                  });
                  if (custom === void 0) {
                    logs.appendLine('取消执行命令');
                    return;
                  }
                  path = custom;
                }
                commandList[Number(i)] = path;
              }
              pw.sendText(commandList.join(''));
            }
          }
        } catch (error) {
          catchError(error);
        }
      }),
    ),
  );
}
