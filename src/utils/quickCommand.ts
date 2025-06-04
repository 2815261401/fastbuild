import type { Uri } from 'vscode'
import { execSync } from 'node:child_process'
import path, { join, relative } from 'node:path'
import { window, workspace } from 'vscode'
import { configuration, logs } from './config'

export async function quickCommand(resource: Uri) {
  /** 获取路径状态 */
  const stat = await workspace.fs.stat(resource)
  /** 获取配置 */
  const config = Object.entries(configuration.getCommandConfiguration())
    .filter(([, value]) => !value.includes(`$${stat.type === 1 ? 'dir' : 'file'}`))
    .map(([label, value]) => ({
      label,
      value,
      description: value,
    }))
  /** 如果没有命令,什么也不做 */
  if (config.length === 0) {
    return
  }
  /** 选择要执行的命令 */
  const select = await window.showQuickPick(config, {
    placeHolder: '请选择要执行的命令',
    ignoreFocusOut: true,
    matchOnDescription: true,
  })
  /** 如果选择了命令 */
  if (select?.value) {
    /** 获取shell */
    const shellPath = select.value.startsWith('(bash)')
      ? join(execSync('where git').toString(), '../../bin/bash.exe') || void 0
      : void 0
    /** 获取所有以快速命令开头的终端 */
    const list = window.terminals.filter(v => /^快速命令(?:-\d+)?$/.test(v.name))
    /** 获取当前下标 */
    const index = list.length
    /** 如果已经存在默认终端, 则附带下标 */
    let name = `快速命令${index ? `-${index}` : ''}`
    /** 如果超出限制 */
    if (index > configuration.getCommandTerminalsNumber()) {
      name = '快速命令'
      /** 清空所有终端 */
      list.forEach((v) => {
        v.dispose()
      })
    }
    /** 设置参数 */
    const fixedParameter = {
      path: resource.fsPath,
      file: stat.type === 1 ? resource.fsPath : void 0,
      dir: stat.type === 2 ? resource.fsPath : path.dirname(resource.fsPath),
    }
    /** 拆分命令 */
    const commandList = (
      shellPath ? select.value.replace(/^\(bash\)/, '') : select.value
    ).split(/\$(path|file|dir|custom)/)
    /** 替换参数 */
    for (const [i, v] of Object.entries(commandList)) {
      /** 从默认参数中获取 */
      let path = fixedParameter[v as keyof typeof fixedParameter]
      /** 如果是自定义 */
      if (v === 'custom') {
        /** 获取自定义 */
        const custom = await window.showInputBox({
          placeHolder: '请输入自定义',
          prompt: commandList.toSpliced(Number(i), 1, '<custom>').join(''),
          ignoreFocusOut: true,
        })
        /** 如果未获取到值, 则取消 */
        if (custom === void 0) {
          logs.appendLine('取消执行命令')
          return
        }
        path = custom
      }
      /** 如果存在, 则转换为相对路径 */
      else if (path) {
        path = relative(configuration.workspaceFolder.uri.fsPath, path)
      }
      /** 否则直接使用 */
      else {
        path = v
      }
      /** 替换 */
      commandList[Number(i)] = path
    }
    /** 创建终端 */
    const pw = window.createTerminal({ name, shellPath, isTransient: true })
    /** 显示终端 */
    pw.show()
    /** 发送命令 */
    pw.sendText(commandList.join(''))
  }
}
