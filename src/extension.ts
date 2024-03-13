import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ExtensionContext, Uri, commands, window, workspace } from 'vscode';
import map from 'xe-utils/map';
import {
  TemplateConfig,
  catchError,
  commit,
  configuration,
  createFromTemplate,
  logs,
  readTemplateConfig,
  selectTemplate,
} from './utils';

export function activate(context: ExtensionContext) {
  configuration.extensionUri = context.extensionUri;
  context.subscriptions.push(
    ...map(['createConfigFile', 'create', 'commit', 'createCommitConfigFile'], (key) =>
      commands.registerCommand(`fast-build.${key}`, async (resource: Uri) => {
        try {
          /** 获取工作区 */
          await configuration.updateWorkspaceFolder(resource);
          /** 创建构建工具模板文件 */
          if (key === 'createConfigFile') {
            /** 如果配置文件已存在 */
            if (configuration.hasConfigFile) {
              const value = await window.showWarningMessage('配置文件已存在,是否覆盖!', '是', '否');
              if (value === '否') {
                return;
              }
            }
            /** 读取默认的配置文件,在用户指定文字生成 */
            workspace.fs.writeFile(
              configuration.configFileUri,
              await workspace.fs.readFile(Uri.joinPath(configuration.extensionUri, './public/template.config.js'))
            );
          } else if (key === 'create') {
            const templateConfigs = await readTemplateConfig();
            /** 选择的配置信息 */
            let selectConfig: TemplateConfig;
            if (templateConfigs.length === 1) {
              /** 如果只有一个配置,直接选择 */
              selectConfig = templateConfigs[0];
            } else if (templateConfigs.length) {
              /** 如果不只一个配置,则让用户选择 */
              const select = await window.showQuickPick(
                map(templateConfigs, (value) => ({
                  label: value.name,
                  value,
                })),
                { placeHolder: '请选择要使用的模板配置' }
              );
              /** 如果用户取消选择,停止执行接下来的代码 */
              if (!select) {
                logs.appendLine('取消选择模板配置');
                return;
              }
              /** 绑定用户选择的配置 */
              selectConfig = select.value;
            } else {
              throw '未读取到相应的配置';
            }
            /** 让用户选择 */
            const selectTemplateItem = await selectTemplate(selectConfig);
            if (selectTemplateItem) {
              await createFromTemplate(selectConfig, selectTemplateItem);
            } else {
              logs.appendLine('未选择模板');
            }
          } else if (key === 'commit') {
            if (configuration.workspaceFolder) {
              await commit();
            } else {
              logs.appendLine('未找到工作区!');
            }
          } else if (key === 'createCommitConfigFile') {
            logs.appendLine('开始创建配置文件');
            const configPath = join(configuration.workspaceFolder.uri.fsPath, '.cz-config.cjs');
            if (existsSync(configPath)) {
              const value = await window.showWarningMessage('配置文件已存在,是否覆盖!', '是', '否');
              if (value === '否') {
                return;
              }
            }
            /** 读取默认的配置文件,在用户指定文字生成 */
            workspace.fs.writeFile(
              Uri.file(configPath),
              await workspace.fs.readFile(Uri.joinPath(configuration.extensionUri, './public/.cz-config.cjs'))
            );
          }
        } catch (error) {
          catchError(error);
        }
      })
    )
  );
}
