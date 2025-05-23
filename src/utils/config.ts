import type { RuleField } from '@commitlint/types'
import type { WorkspaceFolder } from 'vscode'
import type { GitExtension, Repository } from './git'
import { basename } from 'node:path'
import { extensions, Uri, window, workspace } from 'vscode'

export const logs = window.createOutputChannel('fast-build')

class Config {
  /** 工作区文件夹 */
  workspaceFolder!: WorkspaceFolder
  git: Repository | null = null
  targetUri!: Uri
  /** 扩展项目位置 */
  extensionUri!: Uri
  /** 模板配置所在工作区 */
  getTemplateWorkspaceFolder() {
    return (
      workspace.getConfiguration().get<number | null>('fast-build.templateWorkspaceFolder') ?? null
    )
  }

  /** 模板配置所在工作区 */
  setTemplateWorkspaceFolder(value: number) {
    workspace.getConfiguration().update('fast-build.templateWorkspaceFolder', value)
  }

  /** 模板配置保存位置 */
  getTemplateConfigPath() {
    return (
      workspace.getConfiguration().get<string>('fast-build.templateConfigPath')
      ?? '.vscode/template.config.json'
    )
  }

  /** 模板配置保存位置 */
  setTemplateConfigPath(value: string) {
    workspace.getConfiguration().update('fast-build.templateConfigPath', value)
  }

  /** 是否显示输出面板 */
  getShowOutputChannel() {
    return (
      workspace
        .getConfiguration()
        .get<'off' | 'always' | 'onError'>('fast-build.showOutputChannel') ?? 'onError'
    )
  }

  /** 是否自动推送 */
  getGitAutoPush() {
    return workspace.getConfiguration().get<boolean>('fast-build.gitAutoPush') ?? true
  }

  /** git 提交步骤 */
  getGitStep() {
    type GitStep = Record<string, (RuleField | 'gitmoji' | 'breaking' | 'issues')[]>
    return (
      workspace.getConfiguration().get<GitStep>('fast-build.gitStep') ?? {
        default: ['type', 'scope', 'gitmoji', 'subject'],
        Angluar: ['type', 'scope', 'gitmoji', 'subject', 'body', 'footer'],
        all: ['type', 'scope', 'gitmoji', 'subject', 'body', 'footer', 'breaking', 'issues'],
      }
    )
  }

  #gitRememberStep = ''
  /** 上次使用步骤 */
  getGitRememberStep() {
    return (
      (this.#gitRememberStep
        || workspace.getConfiguration().get<string>('fast-build.gitRememberStep'))
      ?? ''
    )
  }

  setGitRememberStep(value: string) {
    this.#gitRememberStep = value
    workspace.getConfiguration().update('fast-build.gitRememberStep', value)
  }

  /** 可选的作用域 */
  getGitScopes() {
    return workspace.getConfiguration().get<string[]>('fast-build.gitScopes') ?? []
  }

  setGitScopes(value: string[]) {
    workspace.getConfiguration().update('fast-build.gitScopes', value)
  }

  /** BREAKING CHANGE 前缀 */
  getGitBreakingPrefix() {
    return (
      workspace.getConfiguration().get<string>('fast-build.gitBreakingPrefix')
      ?? 'BREAKING CHANGE: '
    )
  }

  /** 是否自动添加分支名称 */
  getGitAppendBranchName() {
    return workspace.getConfiguration().get<boolean>('fast-build.gitAppendBranchName') ?? false
  }

  /** 命令配置 */
  getCommandConfiguration() {
    return (
      workspace.getConfiguration().get<Record<string, string>>('fast-build.commandConfiguration')
      ?? {}
    )
  }

  /** 命令终端数量 */
  getCommandTerminalsNumber() {
    const number = Number(
      workspace.getConfiguration().get<number>('fast-build.commandTerminalsNumber') ?? 1,
    )
    if (number >= 1) {
      return number - 1
    }
    return 0
  }

  /** 更新工作区文件夹数据 */
  async updateWorkspaceFolder(resource?: Uri | { id: string, rootUri: Uri }) {
    if (resource instanceof Uri || !resource) {
      /** 获取全部工作区 */
      const workspaceFolders = workspace.workspaceFolders
      /** 如果存在工作区,进行选择,否则提示 */
      if (workspaceFolders) {
        if (resource) {
          this.targetUri = resource
          /** 如果有文件路径,则根据路径匹配 */
          this.workspaceFolder = workspace.getWorkspaceFolder(resource) || workspaceFolders[0]
        }
        else {
          /** 如果只有一个文件夹,直接匹配 */
          if (workspaceFolders.length === 1) {
            this.workspaceFolder = workspaceFolders[0]
          }
          else {
            /** 让用户自己选择 */
            const workspaceFolder = await window.showQuickPick(
              workspaceFolders.map(value => ({
                label: value.name,
                value,
                description: value.uri.fsPath,
              })),
              {
                placeHolder: '请选择工作区',
                ignoreFocusOut: true,
                matchOnDescription: true,
                matchOnDetail: true,
              },
            )
            /** 如果选择了工作区 */
            if (workspaceFolder) {
              this.workspaceFolder = workspaceFolder.value
            }
            else {
              logs.appendLine('已取消选择工作区!')
            }
          }
        }
      }
      else {
        logs.appendLine('未找到工作区!')
      }
    }
    else if (resource.id === 'git') {
      this.workspaceFolder = {
        uri: resource.rootUri,
        name: basename(resource.rootUri.fsPath),
        index: 0,
      }
      const vscodeGit = extensions.getExtension<GitExtension>('vscode.git')!.exports.getAPI(1)
      this.git = vscodeGit.getRepository(this.workspaceFolder.uri)
    }
  }
}
export const configuration = new Config()

export type placeholderFn = (context: {
  targetPath: string
  targetName: string
  filePath: string
  fileName: string
  fileBase: string
  fileExt: string
  folderName: string
  folderPath: string
}) => string

/** 占位符方法 */
export const placeholder: Record<string, placeholderFn> = {
  /** 右击文件夹名称 */
  target(context) {
    return context.targetName
  },
  /** 右击文件夹路径 */
  targetPath(context) {
    return context.targetPath
  },
  /** 生成的模板文件名称 */
  name(context) {
    return context.fileName
  },
  /** 生成的模板文件路径 */
  path(context) {
    return context.filePath
  },
  /** 生成的模板文件完整名称 */
  base(context) {
    return context.fileBase
  },
  /** 生成的模板文件后缀 */
  ext(context) {
    return context.fileExt
  },
  /** 生成的模板文件所在文件夹名称 */
  folder(context) {
    return context.folderName
  },
  /** 生成的模板文件所在文件夹路径 */
  folderPath(context) {
    return context.folderPath
  },
}

/** 格式转换方法 */
export const conversion: Record<string, (content: string) => string> = {
  /** 全大写 */
  '/upcase': (content: string) => content.toLocaleUpperCase(),
  /** 全小写 */
  '/downcase': (content: string) => content.toLocaleLowerCase(),
  /** 首字母大写 */
  '/capitalize': (content: string) => content.replace(/^./, v => v.toLocaleUpperCase()),
  /** 驼峰命名 */
  '/camelcase': (content: string) =>
    content.replace(/[^a-z0-9]+[a-z0-9]/gi, v => v.slice(-1).toLocaleUpperCase()),
  /** 帕斯卡命名 */
  '/pascalcase': (content: string) =>
    content.replace(/^[a-z0-9]|[^a-z0-9]+[a-z0-9]/gi, v =>
      v.slice(-1).toLocaleUpperCase()),
}
