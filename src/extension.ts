import type { ExtensionContext } from 'vscode'

import { commands } from 'vscode'

import { commit } from './commit'
import { quickCommand } from './quickCommand'
import { extendedName } from './utils'

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${extendedName}.commit`, commit),
    commands.registerCommand(`${extendedName}.quickCommand`, quickCommand),
  )
}

export function deactivate() {}
