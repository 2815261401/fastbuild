import type { PromptConfig, RuleConfigCondition, RuleField, UserConfig } from '@commitlint/types'
import type { InputBox, QuickInputButton, QuickPick, QuickPickItem } from 'vscode'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import rules from '@commitlint/rules'
import { RuleConfigSeverity } from '@commitlint/types'
import dayjs from 'dayjs'
import FastGlob from 'fast-glob'
import fetch from 'node-fetch'
import { assign } from 'radashi'
import { commands, QuickInputButtons, ThemeIcon, Uri, window } from 'vscode'
import gitmojis from '../../public/gitmojis.json'
import { configuration, logs } from './config'
import { requireFile } from './tool'

type QuickPickOptions<T> = {
  [R in keyof T]?: T[R];
}

/** vscode按钮对象 */
const vscodeButton: Record<'left' | 'right' | 'confirm', QuickInputButton> = {
  left: QuickInputButtons.Back,
  right: {
    iconPath: new ThemeIcon('arrow-right'),
    tooltip: '下一步',
  },
  confirm: {
    iconPath: new ThemeIcon('check'),
    tooltip: '确认',
  },
}

/** 展示选择框 */
function showQuickPick(options: QuickPickOptions<QuickPick<QuickPickItem>>): Promise<QuickPickItem | false> {
  return new Promise((resolve) => {
    /** 创建选择框 */
    const picker = window.createQuickPick()
    /** 设置占位符 */
    if (options.placeholder) {
      picker.placeholder = options.placeholder
    }
    /** 匹配description */
    picker.matchOnDescription = true
    /** 匹配detail */
    picker.matchOnDetail = true
    /** 忽略失去焦点 */
    picker.ignoreFocusOut = true
    /** 设置选项 */
    if (options.items?.length) {
      picker.items = options.items
      /** 默认选中 */
      picker.activeItems = options.items.filter(item => item.label === options.value) ?? [options.items[0]]
    }
    /** 设置步数 */
    if (options.step) {
      picker.step = options.step
    }
    /** 设置总步数 */
    if (options.totalSteps) {
      picker.totalSteps = options.totalSteps
    }
    /** 设置按钮 */
    if (options.buttons) {
      picker.buttons = options.buttons
    }
    /** 显示选择框 */
    picker.show()
    /** 监听选择 */
    picker.onDidAccept(() => {
      resolve(picker.selectedItems[0] ?? picker.activeItems[0] ?? picker.items[0])
      picker.dispose()
    })
    picker.onDidTriggerButton((e) => {
      if ([vscodeButton.right, vscodeButton.confirm].includes(e)) {
        resolve(picker.selectedItems[0] ?? picker.activeItems[0] ?? picker.items[0])
        picker.dispose()
      }
      else if (e === vscodeButton.left) {
        resolve(false)
      }
    })
    picker.onDidHide(() => {
      resolve({
        label: void 0,
      } as unknown as QuickPickItem)
    })
  })
}

/** 展示输入框 */
function showInputBox(options: QuickPickOptions<InputBox>, validate: (value: string) => string | Promise<string>): Promise<string | false | undefined> {
  return new Promise((resolve) => {
    /** 创建输入框弹窗 */
    const input = window.createInputBox()
    /** 设置输入框值 */
    input.value = options.value ?? ''
    /** 设置占位符 */
    if (options.placeholder) {
      input.placeholder = options.placeholder
    }
    /** 设置步数 */
    if (options.step) {
      input.step = options.step
    }
    /** 设置总步数 */
    if (options.totalSteps) {
      input.totalSteps = options.totalSteps
    }
    /** 设置按钮 */
    if (options.buttons) {
      input.buttons = options.buttons
    }
    /** 设置是否忽略焦点离开输入框不关闭弹窗 */
    input.ignoreFocusOut = true
    /** 显示输入框弹窗 */
    input.show()
    /** 设置输入框值改变时的校验规则 */
    input.onDidChangeValue(async () => {
      input.validationMessage = await validate(input.value.replace(/\\n/g, '\n'))
    })
    /** 输入框确认时的回调 */
    input.onDidAccept(async () => {
      input.validationMessage = await validate(input.value.replace(/\\n/g, '\n'))
      if (!input.validationMessage) {
        resolve(input.value.replace(/\\n/g, '\n'))
        input.dispose()
      }
    })
    /** 点击按钮时的回调 */
    input.onDidTriggerButton(async (e) => {
      if ([vscodeButton.right, vscodeButton.confirm].includes(e)) {
        input.validationMessage = await validate(input.value.replace(/\\n/g, '\n'))
        if (!input.validationMessage) {
          resolve(input.value.replace(/\\n/g, '\n'))
          input.dispose()
        }
      }
      else if (e === vscodeButton.left) {
        resolve(false)
      }
    })
    input.onDidHide(() => {
      resolve(void 0)
    })
  })
}
/** 获取消息 */
async function getMessages(commitlintConfig: UserConfig, steps: (RuleField | 'gitmoji' | 'breaking' | 'issues')[]) {
  /** 获取配置描述 */
  const options: PromptConfig['questions'] = commitlintConfig.prompt?.questions ?? {}
  type InferArrayItem<T> = T extends (infer R)[] ? R : T
  /** 获取步骤数 */
  const totalSteps = steps.length
  /** 存储值 */
  const valueMap = new Map()
  /** 根据不同类型设置不同获取方法 */
  const config: Record<
    InferArrayItem<typeof steps>,
    (step: number) => Promise<string | false | undefined>
  > = {
    /** 标题 */
    async header(step) {
      const header = await showInputBox(
        {
          placeholder: options.header?.description ?? '按照格式输入',
          step,
          totalSteps,
          buttons: (step > 1 ? [vscodeButton.left] : []).concat([
            step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
          ]),
          value: valueMap.get('header'),
        },
        v =>
          Object.keys(commitlintConfig.rules ?? {})
            .filter(key => key.startsWith('header'))
            .reduce((total, key) => {
              /** 如果不存在规则 */
              if (!commitlintConfig.rules) {
                return total
              }
              /** 获取对应规则 */
              const data = (commitlintConfig.rules[key] ?? []) as [
                number,
                RuleConfigCondition,
                undefined,
              ]
              /** 解构获取对应数据 */
              const [level, condition, value] = data
              /** 如果等级不是错误等级 */
              if (level !== RuleConfigSeverity.Error) {
                return total
              }
              /** 验证规则 */
              const [validate, message] = rules[key as keyof typeof rules](
                {
                  header: v,
                } as any,
                condition,
                value,
              )
              /** 如果验证通过 */
              if (validate || !message) {
                return total
              }
              /** 返回错误信息 */
              return total.concat([message])
            }, [] as string[])
            .join(','),
      )
      return header
    },
    /** 类型 */
    async type(step) {
      /** 获取类型 */
      const type = await showQuickPick({
        placeholder: options.type?.description,
        step,
        totalSteps,
        items: Object.entries(options.type?.enum ?? {}).map(([enumName, enumItem]) => {
          return {
            label: enumName,
            description: enumItem.title,
            detail: enumItem.description,
          }
        }),
        buttons: (step > 1 ? [vscodeButton.left] : []).concat([
          step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
        ]),
        value: valueMap.get('type'),
      })
      /** 如果取消 */
      if (typeof type === 'boolean') {
        return type
      }
      return type.label
    },
    /** 作用域 */
    async scope(step) {
      const items: QuickPickItem[] = []
      if (commitlintConfig.rules && commitlintConfig.rules['scope-enum']) {
        const [level, condition, value] = commitlintConfig.rules['scope-enum'] as unknown as [
          number,
          RuleConfigCondition,
          string[],
        ]
        if (level === RuleConfigSeverity.Error && condition === 'always' && Array.isArray(value)) {
          items.push(
            ...value.map(label => ({
              label,
              description: '',
              detail: '从 commitlint 配置文件中加载。',
            })),
          )
        }
      }
      items.push(
        ...configuration.getGitScopes().map(label => ({
          label,
          description: '',
          detail: '从工作区配置文件中加载。',
        })),
      )
      /** 获取作用域 */
      const scope = await showQuickPick({
        placeholder: options.scope?.description,
        step,
        totalSteps,
        items: [
          {
            label: '无',
            description: '',
            detail: '无作用域。',
            alwaysShow: true,
          },
          ...items,
          {
            label: '新作用域',
            description: '',
            detail: '创建新作用域。（可以在工作区的 `settings.json` 中管理）',
            alwaysShow: true,
          },
          {
            label: '新作用域（仅用一次）',
            description: '',
            detail: '使用新作用域。（不会加入工作区的 `settings.json`）',
            alwaysShow: true,
          },
        ],
        buttons: (step > 1 ? [vscodeButton.left] : []).concat([
          step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
        ]),
        value: valueMap.get('scope'),
      })
      /** 如果取消 */
      if (typeof scope === 'boolean') {
        return scope
      }
      if (['新作用域（仅用一次）', '新作用域'].includes(scope.label)) {
        /** 获取作用域 */
        const value = await showInputBox(
          {
            placeholder: options.scope?.description,
            step,
            totalSteps,
            buttons: (step > 1 ? [vscodeButton.left] : []).concat([
              step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
            ]),
          },
          () => '',
        )
        if (scope.label === '新作用域' && typeof value === 'string') {
          configuration.setGitScopes(configuration.getGitScopes().concat([value]))
        }
        return value
      }
      else if (scope.label === '无') {
        return ''
      }
      return scope.label
    },
    /** gitmoji */
    async gitmoji(step) {
      try {
        const lastTime = dayjs(gitmojis.lastTime).add(1, 'day').toDate()
        const nowTime = dayjs().toDate()
        /** 如果超过一天，则获取最新表情数据 */
        if (lastTime < nowTime) {
          /** 请求获取表情数据 */
          const data = (await (
            await fetch('https://gitmoji.dev/api/gitmojis', {
              method: 'GET',
            })
          ).json()) as {
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
            join(__dirname, '../public/gitmojis.json'),
            `${JSON.stringify(gitmojis, null, 2)}\n`,
          )
        }
      }
      catch (error) {
        /** 记录错误 */
        logs.appendLine(error as string)
        logs.appendLine('获取表情失败，使用本地缓存')
      }
      /** 获取表情 */
      const gitmoji = await showQuickPick({
        placeholder: '请选择 gitmoji',
        step,
        totalSteps,
        items: [
          {
            label: '无',
            description: '',
            detail: '无 gitmoji。',
            alwaysShow: true,
          } as QuickPickItem,
        ].concat(
          gitmojis.gitmojis.map((item) => {
            return {
              label: item.emoji,
              description: item.description,
              detail: item.code,
            }
          }),
        ),
        buttons: (step > 1 ? [vscodeButton.left] : []).concat([
          step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
        ]),
        value: valueMap.get('gitmoji'),
      })
      /** 如果取消 */
      if (typeof gitmoji === 'boolean') {
        return gitmoji
      }
      else if (gitmoji.label === '无') {
        return ''
      }
      return gitmoji.label
    },
    /** 主题 */
    async subject(step) {
      /** 获取主题 */
      const subject = await showInputBox(
        {
          placeholder: options.subject?.description,
          step,
          totalSteps,
          buttons: (step > 1 ? [vscodeButton.left] : []).concat([
            step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
          ]),
          value: valueMap.get('subject'),
        },
        v =>
          Object.keys(commitlintConfig.rules ?? {})
            .filter(key => key.startsWith('subject'))
            .reduce((total, key) => {
              /** 如果不存在规则 */
              if (!commitlintConfig.rules) {
                return total
              }
              /** 获取对应规则 */
              const data = (commitlintConfig.rules[key] ?? []) as [
                number,
                RuleConfigCondition,
                undefined,
              ]
              /** 解构获取对应数据 */
              const [level, condition, value] = data
              /** 如果等级不是错误等级 */
              if (level !== RuleConfigSeverity.Error) {
                return total
              }
              /** 验证规则 */
              const [validate, message] = rules[key as keyof typeof rules](
                {
                  subject: v,
                } as any,
                condition,
                value,
              )
              /** 如果验证通过 */
              if (validate || !message) {
                return total
              }
              /** 返回错误信息 */
              return total.concat([message])
            }, [] as string[])
            .join(','),
      )
      return subject
    },
    /** 正文 */
    async body(step) {
      /** 获取正文 */
      const body = await showInputBox(
        {
          placeholder: options.body?.description,
          step,
          totalSteps,
          buttons: (step > 1 ? [vscodeButton.left] : []).concat([
            step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
          ]),
          value: valueMap.get('body'),
        },
        v =>
          Object.keys(commitlintConfig.rules ?? {})
            .filter(key => key.startsWith('body'))
            .reduce((total, key) => {
              /** 如果不存在规则 */
              if (!commitlintConfig.rules) {
                return total
              }
              /** 获取对应规则 */
              const data = (commitlintConfig.rules[key] ?? []) as [
                number,
                RuleConfigCondition,
                undefined,
              ]
              /** 解构获取对应数据 */
              const [level, condition, value] = data
              /** 如果等级不是错误等级 */
              if (level !== RuleConfigSeverity.Error) {
                return total
              }
              /** 验证规则 */
              const [validate, message] = rules[key as keyof typeof rules](
                {
                  body: v,
                } as any,
                condition,
                value,
              )
              /** 如果验证通过 */
              if (validate || !message) {
                return total
              }
              /** 返回错误信息 */
              return total.concat([message])
            }, [] as string[])
            .join(','),
      )
      return body
    },
    /** 底部 */
    async footer(step) {
      /** 获取底部 */
      const footer = await showInputBox(
        {
          placeholder: options.footer?.description,
          step,
          totalSteps,
          buttons: (step > 1 ? [vscodeButton.left] : []).concat([
            step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
          ]),
          value: valueMap.get('footer'),
        },
        v =>
          Object.keys(commitlintConfig.rules ?? {})
            .filter(key => key.startsWith('footer'))
            .reduce((total, key) => {
              /** 如果不存在规则 */
              if (!commitlintConfig.rules) {
                return total
              }
              /** 获取对应规则 */
              const data = (commitlintConfig.rules[key] ?? []) as [
                number,
                RuleConfigCondition,
                undefined,
              ]
              /** 解构获取对应数据 */
              const [level, condition, value] = data
              /** 如果等级不是错误等级 */
              if (level !== RuleConfigSeverity.Error) {
                return total
              }
              /** 验证规则 */
              const [validate, message] = rules[key as keyof typeof rules](
                {
                  footer: v,
                } as any,
                condition,
                value,
              )
              /** 如果验证通过 */
              if (validate || !message) {
                return total
              }
              /** 返回错误信息 */
              return total.concat([message])
            }, [] as string[])
            .join(','),
      )
      return footer
    },
    /** 是否为 breaking change */
    async breaking(step) {
      const breaking = await showInputBox(
        {
          placeholder: options.breaking?.description,
          step,
          totalSteps,
          buttons: (step > 1 ? [vscodeButton.left] : []).concat([
            step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
          ]),
          value: valueMap.get('breaking'),
        },
        () => '',
      )
      return breaking
    },
    /** 问题链接 */
    async issues(step) {
      const issues = await showInputBox(
        {
          placeholder: options.issues?.description,
          step,
          totalSteps,
          buttons: (step > 1 ? [vscodeButton.left] : []).concat([
            step === totalSteps ? vscodeButton.confirm : vscodeButton.right,
          ]),
          value: valueMap.get('issues'),
        },
        () => '',
      )
      return issues
    },
  }
  let i = 1
  /** 对应类型的描述 */
  const messageObj: QuickPickOptions<Record<keyof typeof config, string>> = {}
  /** 获取对应类型的内容 */
  while (i <= totalSteps) {
    /** 获取类型 */
    const key = steps[i - 1]
    /** 获取内容 */
    const content = await config[key](i)
    /** 如果取消提交 */
    if (content === void 0) {
      throw new Error('取消提交')
    }
    else if (content === false) {
      /** 返回上一步 */
      i--
    }
    else {
      /** 添加内容 */
      messageObj[key] = content
      /** 缓存值 */
      valueMap.set(key, content)
      /** 下一步 */
      i++
    }
  }
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
      footer = `${messageObj.breaking ? `${configuration.getGitBreakingPrefix()} ${messageObj.breaking}` : ''}\n${
        messageObj.issues
          ? `${messageObj.issues.includes(',') ? 'Closes' : 'Close'} ${messageObj.issues}`
          : ''
      }`
    }
    message += `\n\n${footer}`
  }
  if (configuration.getGitAppendBranchName()) {
    message += `\n分支: ${configuration.git?.state.HEAD?.name}`
  }
  /** 返回命令行列表 */
  return message
}
/** 提交 */
export async function commit() {
  /** 是否可提交 */
  const canCommit
    = (configuration.git?.state.workingTreeChanges.length ?? 0)
      + (configuration.git?.state.indexChanges.length ?? 0)
  /** 如果不能提交 */
  if (!canCommit) {
    logs.appendLine('未找到可提交的代码!')
    window.showWarningMessage('未找到可提交的代码!')
    return
  }
  /** 获取 commitlint 配置 */
  let commitlintConfig = (await requireFile<{ default: UserConfig }>(join(__dirname, '../commitlint.config.js'))).default
  const commitlintList = await FastGlob('commitlint.config.*', { cwd: configuration.workspaceFolder.uri.fsPath })
  await Promise.all(commitlintList.map(async (file) => {
    const config = (await requireFile<{ default: UserConfig }>(join(configuration.workspaceFolder.uri.fsPath, file))).default
    commitlintConfig = assign(commitlintConfig, config)
    return config
  }))
  /** 获取对应步骤 */
  const step = await window.showQuickPick(
    Object.entries(configuration.getGitStep())
      .map(([label, value]) => ({
        label,
        detail: value.join(','),
        description: configuration.getGitRememberStep() === label ? '上次提交使用' : void 0,
      }))
      .toSorted((a, b) => {
        if (a.label === configuration.getGitRememberStep()) {
          return -1
        }
        else if (b.label === configuration.getGitRememberStep()) {
          return 1
        }
        return 0
      }),
    {
      placeHolder: '请选择步骤',
    },
  )
  if (step) {
    /** 获取提交信息 */
    const message = await getMessages(commitlintConfig, configuration.getGitStep()[step.label])
    if (!configuration.git) {
      return
    }
    configuration.git.inputBox.value = message
    logs.appendLine(`设置提交信息: ${message}`)
    commands.executeCommand(
      'git.stageFile',
      Uri.joinPath(configuration.workspaceFolder.uri, './.vscode/settings.json'),
    )
    if (configuration.getGitAutoPush()) {
      logs.appendLine(`开始执行: git commit ${message ?? ''}`)
      commands.executeCommand('git.commit', configuration.git)
    }
    configuration.setGitRememberStep(step.label)
  }
  else {
    throw new Error('取消提交')
  }
}
