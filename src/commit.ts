import type { QualifiedConfig } from '@commitlint/types'
import type { SourceControl } from 'vscode'

import type { GitExtension } from '../types/git'
import type { CommitType, InputOptions, InquiryItem, PickItem, PickOptions } from './utils'

import { writeFileSync } from 'node:fs'
import path from 'node:path'

import rules from '@commitlint/rules'
import { RuleConfigSeverity } from '@commitlint/types'
import dayjs from 'dayjs'
import { isNullish, objectify, tryit } from 'radashi'
import { extensions, Uri, workspace } from 'vscode'

import defaultConfig from '../commitlint.config'
import { commitAppendBranchName, commitRememberStep, commitScopes, commitStep, commitUpdateGitmoji, createInquiryItem, existsPath, loadConfig, logs, loopInquiry, rootConfig, showBox, vscodeButton } from './utils'

interface Gitmoji {
  emoji: string
  entity: string
  code: string
  description: string
  name: string
  semver: string | null
}
async function getGitmojis(): Promise<{ gitmojis: Gitmoji[], lastTime: string }> {
  /** 获取中文 */
  const zh = !commitUpdateGitmoji() && extensions.getExtension('MS-CEINTL.vscode-language-pack-zh-hans')
  /** 获取配置 */
  const fileData = await workspace.fs.readFile(Uri.file(path.join(import.meta.dirname, '../public', zh ? 'gitmojis.zh.json' : 'gitmojis.json')))
  /** 解析内容 */
  const content = new TextDecoder('utf-8').decode(fileData)
  return JSON.parse(content)
}

/** 创建输入弹框 */
function createInputBox(
  type: 'header' | 'subject' | 'body' | 'footer' | 'breaking' | 'issues',
  commitlintConfig: QualifiedConfig,
): InquiryItem<CommitType> {
  return createInquiryItem('input', {
    key: type as CommitType,
    async options(options) {
      return {
        ...options,
        title: type,
        placeholder: commitlintConfig.prompt?.questions?.[type]?.description ?? `请输入 ${type}`,
        get buttons() {
          return [vscodeButton.left, this.step === this.totalSteps ? vscodeButton.confirm : vscodeButton.right]
        },
        validateInput(v) {
          const message = Object.keys(commitlintConfig.rules)
            .filter(key => key.startsWith(type))
            .map((key) => {
              /** 解构获取对应数据 */
              const [level, condition, value] = commitlintConfig.rules[key] ?? []
              /** 如果等级不是错误等级 */
              if (level !== RuleConfigSeverity.Error) {
                return void 0
              }
              /** 验证规则 */
              const [validate, message] = rules[key as keyof typeof rules](
                {
                  [type]: v,
                } as any,
                condition,
                value as undefined,
              )
              /** 如果验证通过 */
              if (validate || !message) {
                return void 0
              }
              return message
            })
            .filter(v => v)
            .join(',')
          return message || void 0
        },
      } satisfies InputOptions
    },
  })
}

/** 创建选择弹框 */
function createQuickPick(
  type: 'type' | 'scope' | 'gitmoji',
  commitlintConfig: QualifiedConfig,
  items: () => PickItem<string>[] | Promise<PickItem<string>[]>,
  valueFormat: (options: PickOptions<PickItem<string>, false>, select: PickItem<string>) => any = (_, select) => select.value,
  customResult?: (
    config: { key: CommitType, map: Map<CommitType, any>, list: InquiryItem<CommitType>[], index: number },
    options: PickOptions<PickItem<string>, false>,
    select: PickItem<string>
  ) => Promise<any>,
): InquiryItem<CommitType> {
  return createInquiryItem<CommitType, string>('quickPick', {
    key: type as CommitType,
    async options(options, { map, key }) {
      return {
        ...options,
        title: type,
        placeholder: type === 'gitmoji' ? '请输入gitmoji' : (commitlintConfig.prompt?.questions?.[type]?.description ?? `请选择 ${type}`),
        matchOnDescription: true,
        matchOnDetail: true,
        canSelectMany: false,
        get buttons() {
          return [vscodeButton.left, this.step === this.totalSteps ? vscodeButton.confirm : vscodeButton.right]
        },
        items: await items(),
        get activeItems() {
          const list = this.items.filter(item => item.value === map.get(key))
          return list.length ? list : this.items.slice(0, 1)
        },
      } as PickOptions<PickItem<string>, false>
    },
    valueFormat,
    customResult,
  })
}

export async function commit(v: SourceControl) {
  /** 获取工作区 */
  const workspaceFolderUri = v.rootUri!
  /** 设置工作区 */
  rootConfig.workspaceFolderUri = workspaceFolderUri
  /** 获取默认配置 */
  let commitlintConfig = await loadConfig(defaultConfig, { cwd: path.join(import.meta.dirname, '..'), file: 'commitlint.config.ts' })
  /** 获取文件是否存在 */
  const [existsPackage, existsNode] = existsPath(workspaceFolderUri.fsPath, ['package.json', 'node_modules'])
  /** 如果配置文件存在 */
  if (existsPackage && existsNode) {
    /** 获取用户配置 */
    commitlintConfig = await loadConfig({ prompt: commitlintConfig.prompt }, { cwd: workspaceFolderUri.fsPath })
  }
  else {
    logs.warn('未找到 package.json 或 node_modules，使用默认配置')
  }
  /** 获取步骤 */
  const stepConfig = commitStep()
  const gitmojis = await getGitmojis()
  /** 获取对应步骤 */
  const messageTypeList: InquiryItem<CommitType>[] = [
    createInputBox('header', commitlintConfig),
    createQuickPick('type', commitlintConfig, () => Object.entries(commitlintConfig.prompt?.questions?.type?.enum ?? {}).map(([enumName, enumItem]) => {
      return {
        label: enumName,
        value: enumName,
        description: enumItem.title,
        detail: enumItem.description,
      }
    })),
    createQuickPick('scope', commitlintConfig, async () => {
      const items = [
        {
          label: '无',
          value: '',
          detail: '无作用域。',
          description: void 0,
          alwaysShow: true,
        },
        ...commitScopes().map(label => ({
          label,
          value: label,
          detail: '从工作区配置文件中加载。',
          description: void 0,
        })),
      ]
      if (commitlintConfig.rules && commitlintConfig.rules['scope-enum']) {
        const [level, condition, value] = commitlintConfig.rules['scope-enum']
        if (level === RuleConfigSeverity.Error && condition === 'always' && Array.isArray(value)) {
          items.push(
            ...value.map(label => ({
              label,
              value: label,
              detail: '从 commitlint 配置文件中加载。',
              description: void 0,
            })),
          )
        }
      }
      return [
        ...items,
        {
          label: '新作用域',
          value: 'new',
          detail: '创建新作用域。（可以在工作区的 `settings.json` 中管理）',
          description: void 0,
          alwaysShow: true,
        },
        {
          label: '新作用域（仅用一次）',
          value: 'once',
          detail: '使用新作用域。（不会加入工作区的 `settings.json`）',
          description: void 0,
          alwaysShow: true,
        },
      ]
    }, void 0, async ({ map, key }, options, select) => {
      if (!isNullish(select)) {
        let value = select.value
        if (['once', 'new'].includes(value)) {
        /** 获取作用域 */
          const scope = await showBox(
            'input',
            {
              title: 'scope',
              placeholder: commitlintConfig.prompt?.questions?.scope?.description ?? '请输入作用域',
              step: options.step,
              totalSteps: options.totalSteps,
              validateInput(v) {
                return v?.trim() ? (commitScopes().includes(v) ? '作用域已存在' : void 0) : '作用域不能为空'
              },
            },
          )
          if (!scope) {
            return 0
          }
          else {
            if (value === 'new') {
              commitScopes(commitScopes().concat([scope]))
            }
            value = scope
          }
        }
        map.set(key, value)
        return true
      }
      return select
    }),
    createQuickPick('gitmoji', commitlintConfig, async () => {
      if (commitUpdateGitmoji()) {
        const [error] = await tryit(async () => {
          const lastTime = dayjs(gitmojis.lastTime).add(1, 'day').toDate()
          const nowTime = dayjs().toDate()
          /** 如果超过一天，则获取最新表情数据 */
          if (lastTime < nowTime) {
          /** 请求获取表情数据 */
            const data = (await (await fetch('https://gitmoji.dev/api/gitmojis', { method: 'GET' })).json()) as {
              gitmojis: {
                emoji: string
                entity: string
                code: string
                description: string
                name: string
                semver: null | string
              }[]
            }
            /** 缓存表情数据 */
            gitmojis.gitmojis = data.gitmojis
            /** 更新缓存时间 */
            gitmojis.lastTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
            /** 写入缓存 */
            writeFileSync(
              path.join(import.meta.dirname, '../public/gitmojis.json'),
              `${JSON.stringify(gitmojis, null, 2)}\n`,
            )
          }
        })()
        if (error) {
        /** 记录错误 */
          logs.error(error.message)
          logs.info('获取表情失败，使用本地缓存')
        }
      }
      return [
        {
          label: '无',
          value: '',
          detail: '无 gitmoji。',
          alwaysShow: true,
        },
        ...gitmojis.gitmojis.map((item) => {
          return {
            label: item.emoji,
            value: item.emoji,
            description: item.description,
            detail: item.code,
          }
        }),
      ]
    }),
    createInputBox('subject', commitlintConfig),
    createInputBox('body', commitlintConfig),
    createInputBox('footer', commitlintConfig),
    createInputBox('breaking', commitlintConfig),
    createInputBox('issues', commitlintConfig),
  ]
  /** 获取选择结果 */
  const result = await loopInquiry([
    {
      key: 'steps',
      async  handling({ key, map }) {
        const step = await showBox('quickPick', {
          title: '选择步骤',
          placeholder: '请选择步骤',
          items: Object.entries(stepConfig)
            .map(([label, value]) => ({
              label,
              value: label,
              detail: value.join(','),
              description: commitRememberStep() === label ? '上次提交使用' : void 0,
            }))
            .toSorted((a, b) => {
              if (a.label === commitRememberStep()) {
                return -1
              }
              else if (b.label === commitRememberStep()) {
                return 1
              }
              return 0
            }),
          get activeItems() {
            return this.items.filter((item: { value: string }) => item.value === commitRememberStep())
          },
        })
        if (step) {
          map.set(key, step.value)
          const steps = stepConfig[step.value]
          const result = await loopInquiry(messageTypeList.filter(({ key }) => steps.includes(key)), { map: map as any, parentMap: map })
          if (result) {
            if (typeof result === 'number') {
              return 0
            }
            else {
              result.forEach((value, key) => {
                map.set(key, value)
              })
            }
            return true
          }
          else {
            map.clear()
          }
          return 1
        }
        return step
      },
    },
  ])
  if (result && result.size > 1) {
    /** 对应类型的描述 */
    const messageObj: Partial<Record<CommitType, string>> = objectify([...result.entries()], ([k]) => k, ([,v]) => v)
    /** 提交信息 */
    let message = ''
    /** 如果有提交头 */
    if (messageObj.header) {
      message += messageObj.header
    }
    else {
      /** 按照格式组装提交头 */
      message += `${messageObj.type}${messageObj.scope ? `(${messageObj.scope})` : ''}: ${messageObj.gitmoji}${
        messageObj.subject
      }`
    }
    /** 如果有提交内容 */
    if (messageObj.body) {
      message += `\n\n${messageObj.body}`
    }
    /** 如果有提交注脚 */
    if (messageObj.footer || messageObj.breaking || messageObj.issues) {
      /** 如果没有提交内容,需要换行 */
      if (!messageObj.body) {
        message += '\n\n'
      }
      let footer = ''
      /** 如果有注脚 */
      if (messageObj.footer) {
        footer = messageObj.footer
      }
      else {
        /** 组装提交注脚 */
        footer = `${messageObj.breaking ? `${(commitlintConfig.parserPreset?.parserOpts as any)?.parser?.noteKeywords?.at(0) ?? 'BREAKING CHANGES'}: ${messageObj.breaking}` : ''}\n${
          messageObj.issues
            ? `${messageObj.issues.includes(',') ? 'Closes' : 'Close'} ${messageObj.issues}`
            : ''
        }`
      }
      message += `\n\n${footer}`
    }
    const vscodeGit = extensions.getExtension<GitExtension>('vscode.git')!.exports.getAPI(1)
    const git = vscodeGit.getRepository(workspaceFolderUri)
    if (!git) {
      logs.warn('未找到git仓库')
      return
    }
    if (commitAppendBranchName()) {
      message += `\n分支: ${git.state.HEAD?.name}`
    }
    git.inputBox.value = message
    commitRememberStep(result.get('steps') ?? '')
    logs.info(`设置提交信息:`)
    logs.info(message)
  }
}
