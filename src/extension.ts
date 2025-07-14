import type { ExtensionContext } from 'vscode'

import { commands } from 'vscode'

import { commit } from './commit'
import { extendedName } from './utils'

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${extendedName}.commit`, commit),
  )
}

export function deactivate() {}
