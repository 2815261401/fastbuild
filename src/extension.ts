import type { ExtensionContext, Uri } from 'vscode'
import { commands } from 'vscode'
import { catchError, commit, configuration, createFile, createTemplate, logs, quickCommand } from './utils'

export async function activate(context: ExtensionContext) {
  configuration.extensionUri = context.extensionUri
  context.subscriptions.push(
    ...['createConfigFile', 'createTemplate', 'createFile', 'commit', 'quickCommand'].map(key =>
      commands.registerCommand(`fast-build.${key}`, async (resource: Uri) => {
        try {
          /** 获取工作区 */
          await configuration.updateWorkspaceFolder(resource)
          if (key === 'createTemplate') {
            if (configuration.workspaceFolder) {
              await createTemplate(resource)
            }
            else {
              logs.appendLine('未找到工作区!')
            }
          }
          else if (key === 'createFile') {
            if (configuration.workspaceFolder) {
              await createFile(resource)
            }
            else {
              logs.appendLine('未找到工作区!')
            }
          }
          else if (key === 'commit') {
            if (configuration.workspaceFolder) {
              await commit()
            }
            else {
              logs.appendLine('未找到工作区!')
            }
          }
          else if (key === 'quickCommand') {
            await quickCommand(resource)
          }
        }
        catch (error) {
          catchError(error)
        }
      })),
  )
}
