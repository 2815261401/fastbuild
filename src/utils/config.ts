import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { FileType, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import entries from 'xe-utils/entries';
import filter from 'xe-utils/filter';
import find from 'xe-utils/find';
import isRegExp from 'xe-utils/isRegExp';
import map from 'xe-utils/map';
import merge from 'xe-utils/merge';
import some from 'xe-utils/some';
import { Template, catchError } from './tool';

type placeholderFn = (context: {
  targetPath: string;
  targetName: string;
  filePath: string;
  fileName: string;
  fileBase: string;
  fileExt: string;
  folderName: string;
  folderPath: string;
}) => string;
interface templateConfig {
  name: string;
  folderTemplates: Record<string, string>;
  stringTemplates: Record<string, string>;
  placeholder: Record<string, placeholderFn>;
  exclude: (RegExp | string)[];
  overwrite: boolean;
  ignoreDefaultPlaceholder: boolean | string[];
}

export class TemplateConfig {
  name: string = '默认模板';
  /** 工作区文件夹 */
  workspaceFolder!: WorkspaceFolder;
  /** 模板文件夹 */
  folderTemplates: { name: string; alias: string }[] = [];
  /** 转化字符串模板 */
  stringTemplates: { from: string; to: string }[] = [];
  /** 占位符 */
  placeholder: Record<string, placeholderFn> = {
    target(context) {
      return context.targetName;
    },
    targetPath(context) {
      return context.targetPath;
    },
    name(context) {
      return context.fileName;
    },
    path(context) {
      return context.filePath;
    },
    base(context) {
      return context.fileBase;
    },
    ext(context) {
      return context.fileExt;
    },
  };
  /** 忽略配置 */
  exclude: (RegExp | string)[] = [];
  /** 强制覆盖 */
  overwrite = false;
  /** 忽略默认占位符 */
  ignoreDefaultPlaceholder: string[] = [];
  constructor(workspaceFolder: WorkspaceFolder, config?: templateConfig) {
    this.workspaceFolder = workspaceFolder;
    if (config) {
      this.name = config.name;
      this.folderTemplates = map(entries(config.folderTemplates), ([name, alias]) => {
        if (name && alias) {
          return { name, alias };
        }
        throw '请不要将路径或别名设置为空';
      });
      this.stringTemplates = map(entries(config.stringTemplates), ([from, to]) => ({ from, to }));
      this.placeholder = merge(this.placeholder, config.placeholder);
      this.exclude = config.exclude;
      this.overwrite = config.overwrite;
      if (config.ignoreDefaultPlaceholder === true) {
        this.ignoreDefaultPlaceholder = ['folder', 'module'];
      } else if (config.ignoreDefaultPlaceholder === false) {
        this.ignoreDefaultPlaceholder = [];
      } else {
        this.ignoreDefaultPlaceholder = config.ignoreDefaultPlaceholder;
      }
    }
  }
  get templates() {
    return catchError(() =>
      map(
        filter(this.folderTemplates, ({ name }) => {
          if (this.exclude.length) {
            return some(this.exclude, (v) => {
              if (isRegExp(v)) {
                return !v.test(name);
              }
              return v !== name;
            });
          }
          return true;
        }),
        ({ alias, name }) => {
          const templatePath = join(this.workspaceFolder.uri.fsPath, name);
          if (!existsSync(templatePath)) {
            throw `找不到模板文件夹:${alias}`;
          }
          const templateRoot = Uri.file(templatePath);
          const stats = statSync(templateRoot.fsPath);
          return new Template(
            alias,
            name,
            false,
            stats.isFile() ? FileType.File : stats.isDirectory() ? FileType.Directory : FileType.Unknown,
            name,
            this.workspaceFolder.uri
          );
        }
      )
    );
  }
}

class Config {
  /** 工作区配置 */
  readonly store = workspace.getConfiguration();
  configs: TemplateConfig[] = [];
  configFilePath = '';
  hasConfigFile = false;
  workspaceFolder!: WorkspaceFolder;

  /** 文件路径分割符 */
  get delimiter() {
    return this.store.get<string>('fastBuild.delimiter') || ' > ';
  }
  set delimiter(value) {
    this.store.update('fastBuild.delimiter', value);
  }
  /** 是否显示路径 */
  get showPath() {
    return this.store.get<boolean>('fastBuild.showPath') || false;
  }
  set showPath(value) {
    this.store.update('fastBuild.showPath', value);
  }
  /** 是否返回上级目录 */
  get ESCBack() {
    return this.store.get<boolean>('fastBuild.ESCBack') || false;
  }
  set ESCBack(value) {
    this.store.update('fastBuild.ESCBack', value);
  }
  /** 配置文件的路径 */
  get configPath() {
    return this.store.get<string>('fastBuild.configPath') || 'template.config.js';
  }
  set configPath(value) {
    this.store.update('fastBuild.configPath', value);
  }
  /** 更新配置信息 */
  updateConfig(resource?: Uri) {
    return catchError(async () => {
      const workspaceFolders = workspace.workspaceFolders;
      if (workspaceFolders) {
        if (resource) {
          this.workspaceFolder = find(workspaceFolders, (item: WorkspaceFolder) =>
            resource.fsPath.includes(item.uri.fsPath)
          );
        } else {
          if (workspaceFolders.length === 1) {
            this.workspaceFolder = workspaceFolders[0];
          } else {
            const name = await window.showQuickPick(
              workspaceFolders.map(({ name }) => name),
              { placeHolder: '请选择要生成配置文件的工作区' }
            );
            if (name) {
              this.workspaceFolder = find(workspaceFolders, (item: WorkspaceFolder) => name === item.name);
            } else {
              window.showWarningMessage('未找到工作区,已取消生成配置文件!');
            }
          }
        }
      }
      let filePath = join(this.workspaceFolder.uri.fsPath, this.configPath);
      this.configFilePath = filePath;
      if (!existsSync(filePath)) {
        filePath = join(__filename, '../../public/template.config.js');
      } else {
        this.hasConfigFile = true;
      }
      const conent = await workspace.fs.readFile(Uri.file(filePath));
      const config: templateConfig | templateConfig[] = eval(conent.toString());
      if (Array.isArray(config)) {
        this.configs = map(config, (v) => new TemplateConfig(this.workspaceFolder, v));
      } else {
        this.configs = [new TemplateConfig(this.workspaceFolder, config)];
      }
    });
  }
}
export const configuration = new Config();
