import { resolve } from 'path';
import { commands, ExtensionContext, Uri, window, workspace } from 'vscode';
import find from 'xe-utils/find';
import { catchError, configuration, readTemplate, TemplateConfig, writeTemplate } from './utils';

export function activate(context: ExtensionContext) {
  // commands.executeCommand('setContext', 'myExtension.showMyCommand', true);
  /** 创建构建工具模板文件 */
  const createConfigFile = commands.registerCommand('fast-build.createConfigFile', (resource: Uri) => {
    catchError(async () => {
      /** 更新配置信息 */
      await configuration.updateConfig(resource);
      /** 通过是否存在配置文件判断是否创建 */
      let create = !configuration.hasConfigFile;
      /** 如果配置文件存在,询问是否覆盖 */
      if (!create) {
        const value = await window.showWarningMessage('配置文件已存在,是否覆盖!', '是', '否');
        create = value === '是';
      }
      /** 如果允许创建 */
      if (create && configuration.configFilePath) {
        /** 读取默认的配置文件 */
        const data = await workspace.fs.readFile(Uri.file(resolve(__dirname, '../public/template.config.js')));
        /** 在用户指定文字生成 */
        workspace.fs.writeFile(Uri.file(configuration.configFilePath), data);
      }
    });
  });

  /** (通过模板) 新建文件 */
  const create = commands.registerCommand('fast-build.create', (resource: Uri) => {
    catchError(async () => {
      /** 更新配置信息 */
      await configuration.updateConfig(resource);
      /** 选择的配置信息 */
      let selectConfig: TemplateConfig;
      /**  */
      if (!configuration.configs.length) {
        throw '未读取到相应的配置';
      } else if (configuration.configs.length === 1) {
        /** 如果只有一个配置,直接选择 */
        selectConfig = configuration.configs[0];
      } else {
        /** 如果不只一个配置,则让用户选择 */
        const select = await window.showQuickPick(
          configuration.configs.map((value) => ({
            label: value.name,
            value,
          })),
          { placeHolder: '请选择要使用的模板' }
        );
        /** 如果用户取消选择,停止执行接下来的代码 */
        if (!select) {
          return;
        }
        /** 绑定用户选择的配置 */
        selectConfig = select.value;
      }
      /** 查询下是否有模板文件夹不存在 */
      const noFind = find(selectConfig.templates, ({ exist }) => !exist);
      /** 如果有,抛出错误信息 */
      if (noFind) {
        throw `找不到模板文件夹:${noFind.alias}`;
      }
      /** 如果存在模板数据继续,否则抛出信息 */
      if (selectConfig.templates.length) {
        /** 让用户选择模板 */
        const template = await readTemplate([selectConfig.templates], selectConfig);
        /** 如果用户选择了 */
        if (template) {
          /** 写入模板到指定位置 */
          writeTemplate(resource, template, selectConfig);
        }
      } else {
        throw '未找到符合的模板文件夹';
      }
    });
  });
  context.subscriptions.push(create, createConfigFile);
}
