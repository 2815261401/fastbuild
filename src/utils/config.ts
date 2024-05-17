import { RuleField } from '@commitlint/types';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { Uri, WorkspaceFolder, extensions, window, workspace } from 'vscode';
import find from 'xe-utils/find';
import { GitExtension, Repository } from './git';

class Config {
  /** 工作区配置 */
  readonly store = workspace.getConfiguration();
  /** 工作区文件夹 */
  workspaceFolder!: WorkspaceFolder;
  git: Repository | null = null;
  targetUri!: Uri;
  /** 扩展项目位置 */
  extensionUri!: Uri;
  /** 配置文件位置 */
  get configFileUri() {
    if (this.workspaceFolder) {
      return Uri.joinPath(this.workspaceFolder.uri, this.templateConfigPath);
    }
    return Uri.joinPath(this.extensionUri, './public/template.config.js');
  }
  /** 工作区是否存在配置文件 */
  get hasConfigFile() {
    return existsSync(join(this.workspaceFolder.uri.fsPath, this.templateConfigPath));
  }
  /** 文件路径分割符 */
  get templateDelimiter() {
    return this.store.get<string>('fast-build.templateDelimiter') ?? ' > ';
  }
  /** 是否显示路径 */
  get templateShowPath() {
    return this.store.get<boolean>('fast-build.templateShowPath') ?? false;
  }
  /** 是否返回上级目录 */
  get templateESCBack() {
    return this.store.get<boolean>('fast-build.templateESCBack') ?? false;
  }
  /** 配置文件的路径 */
  get templateConfigPath() {
    return this.store.get<string>('fast-build.templateConfigPath') ?? 'template.config.js';
  }
  /** 是否显示输出面板 */
  get showOutputChannel() {
    return this.store.get<'off' | 'always' | 'onError'>('fast-build.showOutputChannel') ?? 'onError';
  }
  /** 是否自动推送 */
  get gitAutoPush() {
    return this.store.get<boolean>('fast-build.gitAutoPush') ?? true;
  }
  /** git 提交步骤 */
  get gitStep() {
    type GitStep = Record<string, (RuleField | 'gitmoji' | 'breaking' | 'issues')[]>;
    return (
      this.store.get<GitStep>('fast-build.gitStep') ?? {
        default: ['type', 'scope', 'gitmoji', 'subject'],
        Angluar: ['type', 'scope', 'gitmoji', 'subject', 'body', 'footer'],
        all: ['type', 'scope', 'gitmoji', 'subject', 'body', 'footer', 'breaking', 'issues'],
      }
    );
  }
  #gitRememberStep = '';
  /** 上次使用步骤 */
  get gitRememberStep() {
    return (this.#gitRememberStep || this.store.get<string>('fast-build.gitRememberStep')) ?? '';
  }
  set gitRememberStep(value) {
    this.#gitRememberStep = value;
    this.store.update('fast-build.gitRememberStep', value);
  }
  /** 可选的作用域 */
  get gitScopes() {
    return this.store.get<string[]>('fast-build.gitScopes') ?? [];
  }
  set gitScopes(value) {
    this.store.update('fast-build.gitScopes', value);
  }
  /** BREAKING CHANGE 前缀 */
  get gitBreakingPrefix() {
    return this.store.get<string>('fast-build.gitBreakingPrefix') ?? 'BREAKING CHANGE: ';
  }
  /** 是否自动添加分支名称 */
  get gitAppendBranchName() {
    return this.store.get<boolean>('fast-build.gitAppendBranchName') ?? false;
  }
  /** 命令配置 */
  get commandConfiguration() {
    return this.store.get<Record<string, string>>('fast-build.commandConfiguration') ?? {};
  }
  /** 更新工作区文件夹数据 */
  async updateWorkspaceFolder(resource?: Uri | { id: string; rootUri: Uri }) {
    const vscodeGit = extensions.getExtension<GitExtension>('vscode.git')!.exports.getAPI(1);
    if (resource instanceof Uri || !resource) {
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
              workspaceFolders.map((value) => ({ label: value.name, value, description: value.uri.fsPath })),
              {
                placeHolder: '请选择工作区',
                ignoreFocusOut: true,
                matchOnDescription: true,
                matchOnDetail: true,
              }
            );
            /** 如果选择了工作区 */
            if (workspaceFolder) {
              this.workspaceFolder = workspaceFolder.value;
            } else {
              logs.appendLine('已取消选择工作区!');
            }
          }
        }
      } else {
        logs.appendLine('未找到工作区!');
      }
    } else if (resource.id === 'git') {
      this.workspaceFolder = { uri: resource.rootUri, name: basename(resource.rootUri.fsPath), index: 0 };
    }
    this.git = vscodeGit.getRepository(this.workspaceFolder.uri);
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
