import type { RuleField } from '@commitlint/types'

import { Buffer } from 'node:buffer'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { createLog } from '@vscode-use/utils'
import { tryit } from 'radashi'
import { workspace } from 'vscode'

import { readJson } from './utils'

const { name = 'fast-build', displayName = '快速构建工具' } = readJson<{ name: string, displayName: string }>(path.join(import.meta.dirname, '..', '..', 'package.json')) ?? {}

/** 扩展名称 */
export const extendedName = name

/** 日志 */
export const logs = createLog(displayName)

export type CommitType = RuleField | 'gitmoji' | 'breaking' | 'issues'
export type CommitStep = Record<string, CommitType[]>
/** 获取提交步骤 */
export function commitStep(): CommitStep {
  return (
    workspace.getConfiguration().get<CommitStep>(`${extendedName}.commitStep`, {
      default: ['type', 'scope', 'gitmoji', 'subject'],
      Angluar: ['type', 'scope', 'gitmoji', 'subject', 'body', 'footer'],
      all: ['type', 'scope', 'gitmoji', 'subject', 'body', 'footer', 'breaking', 'issues'],
    })
  )
}

/** 获取(设置)记忆步骤 */
export function commitRememberStep(value?: string): string {
  const filePath = path.join(import.meta.dirname, 'commitRememberStep')
  if (value === void 0) {
    const [result] = tryit(() => readFileSync(filePath))()
    return workspace.getConfiguration().get<string>(`${extendedName}.commitRememberStep`, result?.toString() ?? '')
  }
  writeFileSync(filePath, Buffer.from(value, 'utf8'))
  if (workspace.getConfiguration().get<boolean>(`${extendedName}.commitNeedRemember`, false)) {
    workspace.getConfiguration().update(`${extendedName}.commitRememberStep`, value)
  }
  return value
}

/** 获取(设置) `scope` */
export function commitScopes(value?: string[]): string[] {
  if (value === void 0) {
    return workspace.getConfiguration().get<string[]>(`${extendedName}.commitScopes`, [])
  }
  workspace.getConfiguration().update(`${extendedName}.commitScopes`, value)
  return value
}

/** 获取是否在提交信息中追加当前分支名称 */
export function commitAppendBranchName(): boolean {
  return workspace.getConfiguration().get<boolean>(`${extendedName}.commitAppendBranchName`, false)
}

/** 获取快速执行命令 */
export function quickCommandConfig(): Record<string, string> {
  return workspace.getConfiguration().get<Record<string, string>>(`${extendedName}.quickCommandConfig`, {})
}

/** 获取最大终端数量 */
export function quickCommandMaxTerminalsNumber(): number {
  return workspace.getConfiguration().get<number>(`${extendedName}.quickCommandMaxTerminalsNumber`, 3)
}
