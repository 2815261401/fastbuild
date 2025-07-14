import type { ExtensionContext } from 'vscode'

import { commands } from 'vscode'

import { commit } from './commit'
import { quickCommand } from './quickCommand'
import { saveTemplate } from './saveTemplate'
import { useTemplate } from './useTemplate'
import { extendedName } from './utils'

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${extendedName}.commit`, commit),
    commands.registerCommand(`${extendedName}.quickCommand`, quickCommand),
    commands.registerCommand(`${extendedName}.saveTemplate`, saveTemplate),
    commands.registerCommand(`${extendedName}.useTemplate`, useTemplate),
  )
}

export function deactivate() {}
