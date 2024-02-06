import execa from 'execa';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ExtensionContext, Uri, commands, window, workspace } from 'vscode';
import map from 'xe-utils/map';
import {
  CzConfig,
  CzCustomizable,
  TemplateConfig,
  catchError,
  configuration,
  createFromTemplate,
  logs,
  readTemplateConfig,
  selectTemplate,
} from './utils';

export function activate(context: ExtensionContext) {
  configuration.extensionUri = context.extensionUri;
  context.subscriptions.push(
    ...map(['createConfigFile', 'create', 'commit'], (key) =>
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
              const canCommit = !(
                await execa('git', ['status'], {
                  cwd: configuration.workspaceFolder.uri.fsPath,
                })
              ).stdout.includes('nothing to commit, working tree clean');
              if (!canCommit) {
                logs.appendLine('nothing to commit, working tree clean');
                window.showWarningMessage('未找到可提交的代码!');
                return;
              }
              /** 获取package.json文件路径 */
              const packagePath = join(configuration.workspaceFolder.uri.fsPath, 'package.json');
              /** 默认配置文件路径 */
              let configPath = join(__dirname, '../public/.cz-config.cjs');
              /** 如果存在package.json文件,则获取配置文件路径 */
              if (existsSync(packagePath)) {
                /** 获取package.json文件内容 */
                const packageJSON = JSON.parse((await workspace.fs.readFile(Uri.file(packagePath))).toString());
                /** 如果package.json文件存在cz-customizable配置 */
                if (packageJSON.config && packageJSON.config['cz-customizable']?.config) {
                  /** 重新获取配置文件路径 */
                  configPath = join(
                    configuration.workspaceFolder.uri.fsPath,
                    packageJSON.config['cz-customizable'].config
                  );
                }
              }
              /** 如果配置文件不存在,则使用默认配置文件 */
              if (!existsSync(configPath)) {
                configPath = join(__dirname, '../public/.cz-config.cjs');
              }
              /** 获取工作区路径 */
              const cwd = configuration.workspaceFolder.uri.fsPath;
              /** 读取配置文件内容 */
              const czConfigStr = (await workspace.fs.readFile(Uri.file(configPath))).toString();
              /** 创建CzConfig对象 */
              const czConfig: CzConfig = eval(czConfigStr);
              /** 创建CzCustomizable对象 */
              const czCustomizable = new CzCustomizable(czConfig);
              const message = await czCustomizable.getMessages();
              /** 是否启用智能提交 */
              const hasSmartCommitEnabled =
                workspace.getConfiguration('git').get<boolean>('enableSmartCommit') === true;
              /** 获取暂存的修改 */
              const stdout = (
                await execa('git', ['diff', '--name-only', '--cached'], {
                  cwd,
                })
              ).stdout;
              /** 如果启用智能提交,并且暂存的修改为空,则自动添加所有文件到暂存区 */
              if (hasSmartCommitEnabled && !stdout) {
                logs.appendLine('自动添加所有文件到暂存区');
                logs.appendLine('开始执行: git add .');
                await execa('git', ['add', '.'], {
                  cwd,
                });
              }
              logs.appendLine(`开始执行: git commit ${message?.join('  ') ?? ''}`);
              const result = await execa('git', ['commit'].concat(message ?? []), {
                cwd: czCustomizable.getGitCwd(cwd),
                shell: false,
              });
              if (configuration.autoSync) {
                logs.appendLine('开始同步远程仓库');
                await execa('git', ['sync'], { cwd });
              }
              if (result?.stdout) {
                result.stdout.split('\n').forEach((line) => logs.appendLine(line));
                if (
                  configuration.showOutputChannel === 'always' ||
                  (configuration.showOutputChannel === 'onError' && result.exitCode > 0)
                ) {
                  logs.show();
                }
              }
            } else {
              logs.appendLine('未找到工作区!');
            }
          }
        } catch (error) {
          catchError(error);
        }
      })
    )
  );
}
