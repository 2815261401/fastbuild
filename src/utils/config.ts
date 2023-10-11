import { existsSync } from 'node:fs';
import { join } from 'node:path/win32';
import { Uri, WorkspaceFolder, window, workspace } from 'vscode';
import find from 'xe-utils/find';

class Config {
  /** 工作区配置 */
  readonly store = workspace.getConfiguration();
  /** 工作区文件夹 */
  workspaceFolder!: WorkspaceFolder;
  targetUri!: Uri;
  /** 扩展项目位置 */
  extensionUri!: Uri;
  /** 配置文件位置 */
  get configFileUri() {
    if (this.workspaceFolder) {
      return Uri.joinPath(this.workspaceFolder.uri, this.configPath);
    }
    return Uri.joinPath(this.extensionUri, './public/template.config.js');
  }
  /** 工作区是否存在配置文件 */
  get hasConfigFile() {
    return existsSync(join(this.workspaceFolder.uri.fsPath, this.configPath));
  }
  /** 文件路径分割符 */
  get delimiter() {
    return this.store.get<string>('fast-build.delimiter') || ' > ';
  }
  set delimiter(value) {
    this.store.update('fast-build.delimiter', value);
  }
  /** 是否显示路径 */
  get showPath() {
    return this.store.get<boolean>('fast-build.showPath') || false;
  }
  set showPath(value) {
    this.store.update('fast-build.showPath', value);
  }
  /** 是否返回上级目录 */
  get ESCBack() {
    return this.store.get<boolean>('fast-build.ESCBack') || false;
  }
  set ESCBack(value) {
    this.store.update('fast-build.ESCBack', value);
  }
  /** 配置文件的路径 */
  get configPath() {
    return this.store.get<string>('fast-build.configPath') || 'template.config.js';
  }
  set configPath(value) {
    this.store.update('fast-build.configPath', value);
  }
  /** 是否显示警告信息 */
  get showMessage() {
    return this.store.get<boolean>('fast-build.showMessage') || true;
  }
  set showMessage(value) {
    this.store.update('fast-build.showMessage', value);
  }
  /** 更新工作区文件夹数据 */
  async updateWorkspaceFolder(resource?: Uri) {
    /** 获取全部工作区 */
    const workspaceFolders = workspace.workspaceFolders;
    /** 如果存在工作区,进行选择,否则提示 */
    if (workspaceFolders) {
      if (resource) {
        this.targetUri = resource;
        /** 如果有文件路径,则根据路径匹配 */
        this.workspaceFolder = find(workspaceFolders, (item: WorkspaceFolder) =>
          resource.fsPath.includes(item.uri.fsPath)
        );
      } else {
        /** 如果只有一个文件夹,直接匹配 */
        if (workspaceFolders.length === 1) {
          this.workspaceFolder = workspaceFolders[0];
        } else {
          /** 让用户自己选择 */
          const workspaceFolder = await window.showQuickPick(
            workspaceFolders.map((value) => ({ label: value.name, value })),
            { placeHolder: '请选择执行命令的工作区' }
          );
          /** 如果选择了工作区 */
          if (workspaceFolder) {
            this.workspaceFolder = workspaceFolder.value;
          } else {
            logs.appendLine('已取消命令!');
          }
        }
      }
    } else {
      logs.appendLine('未找到工作区!');
    }
  }
}
export const configuration = new Config();
export const logs = window.createOutputChannel('fast-build');

export type placeholderFn = (context: {
  targetPath: string;
  targetName: string;
  filePath: string;
  fileName: string;
  fileBase: string;
  fileExt: string;
  folderName: string;
  folderPath: string;
}) => string;

/** 占位符方法 */
export const placeholder: Record<string, placeholderFn> = {
  /** 右击文件夹名称 */
  target(context) {
    return context.targetName;
  },
  /** 右击文件夹路径 */
  targetPath(context) {
    return context.targetPath;
  },
  /** 生成的模板文件名称 */
  name(context) {
    return context.fileName;
  },
  /** 生成的模板文件路径 */
  path(context) {
    return context.filePath;
  },
  /** 生成的模板文件完整名称 */
  base(context) {
    return context.fileBase;
  },
  /** 生成的模板文件后缀 */
  ext(context) {
    return context.fileExt;
  },
  /** 生成的模板文件所在文件夹名称 */
  folder(context) {
    return context.folderName;
  },
  /** 生成的模板文件所在文件夹路径 */
  folderPath(context) {
    return context.folderPath;
  },
};

/** 格式转换方法 */
export const conversion: Record<string, (content: string) => string> = {
  /** 全大写 */
  '/upcase': (content: string) => content.toLocaleUpperCase(),
  /** 全小写 */
  '/downcase': (content: string) => content.toLocaleLowerCase(),
  /** 首字母大写 */
  '/capitalize': (content: string) => content.replace(/^./, (v) => v.toLocaleUpperCase()),
  /** 驼峰命名 */
  '/camelcase': (content: string) =>
    content.replace(/[^a-zA-Z0-9]+[a-zA-Z0-9]/g, (v) => v.slice(-1).toLocaleUpperCase()),
  /** 帕斯卡命名 */
  '/pascalcase': (content: string) =>
    content.replace(/^[a-zA-Z0-9]|[^a-zA-Z0-9]+[a-zA-Z0-9]/g, (v) => v.slice(-1).toLocaleUpperCase()),
};
