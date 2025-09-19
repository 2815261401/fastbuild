import type { Uri } from 'vscode'
import type { API, Commit, GitExtension, Repository } from '../types/git'

import { execSync } from 'node:child_process'
import path, { join, relative } from 'node:path'

import dayjs from 'dayjs'

import { extensions, window, workspace } from 'vscode'
import { getWorkspaceFolder, logs, quickCommandConfig, quickCommandMaxTerminalsNumber } from './utils'

/** 获取分支 */
async function getBranchOrCommit(vscodeGit: API, title: string, type: 'branch', defaultValue?: string): Promise<string | undefined>
/** 获取commit */
async function getBranchOrCommit(vscodeGit: API, title: string, type: 'commit'): Promise<string | undefined>
async function getBranchOrCommit(vscodeGit: API, title: string, type: 'branch' | 'commit' = 'branch', defaultValue?: string) {
  let repository: Repository | undefined = void 0
  if (vscodeGit.repositories.length === 1) {
    const gitRootUri = vscodeGit.repositories.at(0)!.rootUri
    repository = vscodeGit.getRepository(gitRootUri)!
  }
  else {
    /** 选择仓库 */
    const select = await window.showQuickPick(vscodeGit.repositories.map((v) => {
      return {
        label: path.basename(v.rootUri.fsPath),
        value: v,
        description: v.rootUri.fsPath,
      }
    }), {
      title,
      placeHolder: '请选择要使用的仓库',
      ignoreFocusOut: true,
      matchOnDescription: true,
    })
    if (select === void 0) {
      logs.appendLine('未选择仓库')
      return
    }
    const gitRootUri = select.value!.rootUri
    repository = vscodeGit.getRepository(gitRootUri)!
  }
  if (!repository) {
    logs.appendLine('未找到仓库')
    return
  }
  /** 获取分支 */
  const branches = await repository.getBranches({ remote: true })
  let branch = branches.at(0)?.name
  if (type === 'branch' && defaultValue && branches.some(v => v.name === defaultValue)) {
    return defaultValue
  }
  if (branches.length === 1) {
    if (type === 'branch') {
      return branches.at(0)!.name
    }
  }
  else {
    /** 选择分支 */
    const select = await window.showQuickPick(branches.map((v) => {
      return {
        label: v.name!,
        value: v.name,
        description: v.remote ?? '本地分支',
      }
    }), {
      title,
      placeHolder: '请选择要使用的分支',
      ignoreFocusOut: true,
      matchOnDescription: true,
    })
    if (select === void 0) {
      logs.appendLine('未选择分支')
      return
    }
    if (type === 'branch') {
      return select.value
    }
    branch = select.value
  }
  if (!branch) {
    logs.appendLine('未找到分支')
    return
  }
  /** 获取commit日志 */
  const stdout = execSync(
    `git log ${branch} --pretty=format:"%H|%s|%P|%ad|%an|%ae|%cd"`,
    { cwd: repository.rootUri.fsPath, encoding: 'utf-8' },
  ).toString()

  /** 获取提交 */
  const commits: Commit[] = stdout.split('\n').map((line) => {
    const [hash, message, parents, authorDate, authorName, authorEmail, commitDate] = line.split('|')
    return {
      hash,
      message,
      parents: parents ? parents.split(' ') : [],
      authorDate: authorDate ? new Date(authorDate) : undefined,
      authorName: authorName || undefined,
      authorEmail: authorEmail || undefined,
      commitDate: commitDate ? new Date(commitDate) : undefined,
    } as Commit
  })

  if (commits.length === 1) {
    return commits.at(0)!.hash
  }
  else {
    /** 选择提交 */
    const select = await window.showQuickPick(commits.map((v) => {
      return {
        label: v.message,
        value: v.hash,
        description: v.commitDate && dayjs(v.commitDate).format('YYYY-MM-DD HH:mm:ss'),
        detail: v.hash,
      }
    }), {
      title,
      placeHolder: '请选择要使用的提交',
      ignoreFocusOut: true,
      matchOnDescription: true,
    })
    if (select === void 0) {
      logs.appendLine('未选择提交')
      return
    }
    return select.value
  }
}

export async function quickCommand(resource: Uri) {
  /** 获取当前工作目录 */
  const workspaceFolder = await getWorkspaceFolder(resource)
  if (workspaceFolder) {
    /** 获取git */
    const vscodeGit = extensions.getExtension<GitExtension>('vscode.git')!.exports.getAPI(1)
    /** 获取路径状态 */
    const stat = await workspace.fs.stat(resource)
    /** 获取配置 */
    const config = Object.entries(quickCommandConfig())
      .filter(([, value]) => {
        /** 如果没有仓库，排除获取分支的命令 */
        if (!vscodeGit.repositories.length && value.includes(`$branch`)) {
          return false
        }
        /** 如果是文件|文件夹，排除获取文件夹|文件的命令 */
        return !value.includes(`$${stat.type === 1 ? 'dir' : 'file'}`)
      })
      .map(([label, value]) => ({
        label,
        value,
        description: value,
      }))

    /** 如果有命令 */
    if (config.length > 0) {
      /** 选择要执行的命令 */
      const select = await window.showQuickPick(config, {
        placeHolder: '请选择要执行的命令',
        ignoreFocusOut: true,
        matchOnDescription: true,
      })
      /** 如果选择了命令 */
      if (select) {
        /** 获取命令 */
        let command = select.value
        /** 要使用的shell */
        let shellPath: string | undefined = void 0
        /** 如果命令使用的是bash */
        if (command.startsWith('(bash)')) {
          shellPath = join(execSync('where git').toString(), '../../bin/bash.exe') || void 0
          command = command.replace(/^\(bash\)/, '')
        }

        /** 获取所有以快速命令开头的终端 */
        const list = window.terminals.filter(v => /^快速命令(?:-\d+)?$/.test(v.name))
        /** 获取当前下标 */
        const index = list.length
        /** 如果已经存在默认终端, 则附带下标 */
        let name = `快速命令${index ? `-${index}` : ''}`
        /** 如果超出限制 */
        if (index >= quickCommandMaxTerminalsNumber()) {
          name = '快速命令'
          /** 清空所有终端 */
          list.forEach((v) => {
            v.dispose()
          })
        }
        /** 拆分命令 */
        const commandList = command.split(/(?<!\\)\$(path|file|dir|(?:custom|branch)(?:<(?:(?!>).)*>)?|commit)/)
        /** 替换参数 */
        for (const [i, v] of Object.entries(commandList)) {
          let value: string | undefined = void 0
          /** 如果是路径 */
          if (v === 'path') {
            value = resource.fsPath
          }
          /** 如果是文件 */
          else if (v === 'file' && stat.type === 1) {
            value = resource.fsPath
          }
          /** 如果是文件夹 */
          else if (v === 'dir') {
            value = stat.type === 2 ? resource.fsPath : path.dirname(resource.fsPath)
          }
          /** 如果是自定义 */
          if (v.startsWith('custom')) {
            /** 获取自定义 */
            const custom = await window.showInputBox({
              title: '请输入自定义',
              placeHolder: '请输入自定义',
              prompt: commandList.toSpliced(Number(i), 1, `{${v}}`).join(''),
              value: v.slice(7, -1),
              ignoreFocusOut: true,
            })
            /** 如果未获取到值, 则取消 */
            if (custom === void 0) {
              logs.appendLine('取消执行命令')
              return
            }
            value = custom
          }
          /** 如果是分支 */
          else if (v.startsWith('branch')) {
            const branch = await getBranchOrCommit(vscodeGit, commandList.toSpliced(Number(i), 1, `{${v}}`).join(''), 'branch', v.slice(7, -1))
            if (branch === void 0) {
              logs.appendLine('取消执行命令')
              return
            }
            value = branch
          }
          /** 如果是提交 */
          else if (v === 'commit') {
            const commit = await getBranchOrCommit(vscodeGit, commandList.toSpliced(Number(i), 1, `{${v}}`).join(''), 'commit')
            if (commit === void 0) {
              logs.appendLine('取消执行命令')
              return
            }
            value = commit
          }
          /** 如果存在, 则转换为相对路径 */
          else if (value) {
            value = relative(workspaceFolder.uri.fsPath, value)
          }
          /** 否则直接使用 */
          else {
            value = v
          }
          if (value === void 0) {
            logs.appendLine(commandList.join('---'))
            logs.appendLine('命令执行失败, 取消执行命令')
            return
          }
          /** 替换 */
          commandList[Number(i)] = value
        }
        /** 创建终端 */
        const pw = window.createTerminal({ name, shellPath, isTransient: true, cwd: workspaceFolder.uri })
        /** 显示终端 */
        pw.show()
        /** 发送命令 */
        pw.sendText(commandList.join(''))
      }
    }
    else {
      logs.warn('未配置快速命令')
    }
  }
}
