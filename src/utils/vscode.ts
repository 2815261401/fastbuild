import type { InputBox, InputBoxValidationMessage, QuickInputButton, QuickPick, QuickPickItem, Uri, WorkspaceFolder } from 'vscode'

import { assign, isNullish } from 'radashi'

import { QuickInputButtons, ThemeIcon, window, workspace } from 'vscode'

import { logs } from './config'

/** vscode按钮对象 */
export const vscodeButton: Record<'left' | 'right' | 'cancel' | 'confirm', QuickInputButton> = {
  left: QuickInputButtons.Back,
  right: {
    iconPath: new ThemeIcon('arrow-right'),
    tooltip: '下一步',
  },
  cancel: {
    iconPath: new ThemeIcon('close'),
    tooltip: '取消',
  },
  confirm: {
    iconPath: new ThemeIcon('check'),
    tooltip: '确认',
  },
}

interface Options {
  /**
   * 标题
   * @default '标题'
   */
  title?: string
  /** 步数 */
  step?: number
  /** 总步数 */
  totalSteps?: number
  /**
   * 是否启用输入框
   * @default true
   */
  enabled?: boolean
  /**
   * 是否显示进度指示器
   * @default false
   */
  busy?: boolean
  /**
   * 是否忽略失去焦点
   * @default true
   */
  ignoreFocusOut?: boolean
  /**
   * 输入框值
   * @default ''
   */
  value?: string
  /** 输入框占位符 */
  placeholder?: string
  /** 操作按钮 */
  buttons?: QuickInputButton[]
}

export interface InputOptions extends Options {
  /**
   * 是否启用密码样式
   * @default false
   */
  password?: boolean
  /** 提示文本 */
  prompt?: string
  /** 验证输入 */
  validateInput?: (value: string) => string | InputBoxValidationMessage | undefined
    | Thenable<string | InputBoxValidationMessage | undefined>
}

export interface PickItem<T> extends QuickPickItem {
  value: T
  disabled?: boolean
}

export interface PickOptions<T, M = boolean> extends Options {
  /** 选择项 */
  items: readonly T[]
  /**
   * 是否可以多选
   * @default false
   */
  canSelectMany?: M
  /**
   * 是否匹配描述
   * @default false
   */
  matchOnDescription?: boolean
  /**
   * 是否匹配详情
   * @default false
   */
  matchOnDetail?: boolean
  /**
   * 是否保持滚动位置
   * @default false
   */
  keepScrollPosition?: boolean
  /** 激活项 */
  activeItems?: readonly T[]
  /** 已选择项 */
  selectedItems?: readonly T[]
}

/** 展示弹窗(输入框) */
export function showBox(type: 'input', options: InputOptions): Promise<string | null | undefined>
/** 展示弹窗(选择框--单选) */
export function showBox<T extends PickItem<V>, V = any>(type: 'quickPick', options: PickOptions<T, false>): Promise<T | null | undefined>
/** 展示弹窗(选择框--多选) */
export function showBox<T extends PickItem<V>, V = any>(type: 'quickPick', options: PickOptions<T, true>): Promise<T[] | null | undefined>
export function showBox<T extends PickItem<V>, V = any>(type: 'input' | 'quickPick', options: InputOptions | PickOptions<T>): Promise<string | T | T[] | null | undefined> {
  return new Promise((resolve) => {
    /** 创建弹窗 */
    const box = type === 'input' ? window.createInputBox() : window.createQuickPick<T>()
    /** 设置标题 */
    box.title = options.title ?? '标题'
    /** 设置是否启用 */
    box.enabled = options.enabled ?? true
    /** 设置是否显示进度指示器 */
    box.busy = options.busy ?? false
    /** 设置步数 */
    box.step = options.step
    /** 设置总步数 */
    box.totalSteps = options.totalSteps
    /** 设置是否忽略失去焦点 */
    box.ignoreFocusOut = options.ignoreFocusOut ?? true
    /** 设置输入框值 */
    box.value = options.value ?? ''
    /** 设置占位符 */
    box.placeholder = options.placeholder
    /** 设置操作按钮 */
    if (options.buttons) {
      box.buttons = options.buttons
    }
    else if (box.step !== void 0 && box.totalSteps !== void 0) {
    /** 根据步数设置按钮 */
      box.buttons = ((box.step ?? 0) > 1 ? [vscodeButton.left] : []).concat([
        box.step === box.totalSteps ? vscodeButton.confirm : vscodeButton.right,
      ])
    }
    /** 返回值 */
    let retuenValue: () => Promise<boolean> = async () => true
    if (type === 'input') {
      const input = box as InputBox
      const inputOptions = options as InputOptions
      /** 设置是否启用密码样式 */
      input.password = inputOptions.password ?? false
      /** 设置提示 */
      input.prompt = inputOptions.prompt
      retuenValue = async () => {
        input.validationMessage = await inputOptions.validateInput?.(input.value)
        if (input.validationMessage === void 0) {
          resolve(input.value)
          return true
        }
        else {
          return false
        }
      }
      /** 输入框值变化 */
      input.onDidChangeValue(async () => {
        input.validationMessage = await inputOptions.validateInput?.(input.value)
      })
    }
    else {
      const picker = box as QuickPick<T>
      const pickerOptions = options as PickOptions<T>
      /** 设置选择项 */
      picker.items = pickerOptions.items
      /** 设置是否可以多选 */
      picker.canSelectMany = pickerOptions.canSelectMany ?? false
      /** 设置是否匹配描述 */
      picker.matchOnDescription = pickerOptions.matchOnDescription ?? false
      /** 设置是否匹配详情 */
      picker.matchOnDetail = pickerOptions.matchOnDetail ?? false
      /** 设置是否保持滚动位置 */
      picker.keepScrollPosition = pickerOptions.keepScrollPosition ?? false
      /** 设置激活项 */
      picker.activeItems = pickerOptions.activeItems ?? picker.items.slice(0, 1)
      /** 设置已选择项 */
      picker.selectedItems = pickerOptions.selectedItems ?? []
      /** 激活项变化 */
      picker.onDidChangeActive((select) => {
        picker.activeItems = select.filter(item => !item.disabled)
      })
      /** 选择项变化 */
      picker.onDidChangeSelection((select) => {
        picker.selectedItems = select.filter(item => !item.disabled)
      })
      retuenValue = async () => {
        if (picker.canSelectMany) {
          resolve(picker.selectedItems as T[])
        }
        else {
          const selectedItem = (picker.selectedItems[0] ?? picker.activeItems[0]) as T
          if (selectedItem) {
            resolve(selectedItem)
          }
          else {
            throw new Error('未选择项')
          }
        }
        return true
      }
    }
    /** 回车确认 */
    box.onDidAccept(async () => {
      if (await retuenValue()) {
        box.dispose()
      }
    })
    /** 点击按钮 */
    box.onDidTriggerButton(async (button) => {
      let canDispose = true
      if ([vscodeButton.right, vscodeButton.confirm].includes(button)) {
        canDispose = await retuenValue()
      }
      else if (button === vscodeButton.left) {
        resolve(null)
      }
      if (canDispose) {
        box.dispose()
      }
    })
    /** 弹窗关闭 */
    box.onDidHide(() => {
      resolve(void 0)
    })
    /** 显示输入框弹窗 */
    box.show()
  })
}

export interface InquiryItem<K> {
  key: K
  handling: (config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number }) => Promise<any>
}

/** 循环询问 */
export async function loopInquiry<K = string>(list: InquiryItem<K>[], defaultValue?: { index?: number, map?: Map<K, any> }): Promise<Map<K, any> | void>
export async function loopInquiry<K = string>(list: InquiryItem<K>[], defaultValue: { index?: number, map?: Map<K, any>, parentMap: Map<any, any> }): Promise<Map<K, any> | number | void>
export async function loopInquiry<K = string>(list: InquiryItem<K>[], defaultValue?: { index?: number, map?: Map<K, any>, parentMap?: Map<any, any> }): Promise<Map<K, any> | number | void> {
  /** 设置索引 */
  let index = defaultValue?.index ?? 0
  /** 创建map */
  const map = new Map<K, any>()
  /** 循环数组 */
  while (index < list.length) {
    /** 如果第一项选择了返回上一步 */
    if (index === -1) {
      /** 如果需要操作父map */
      if (defaultValue?.parentMap) {
        /** 将值设置到父map */
        map.forEach((value, key) => {
          defaultValue.parentMap!.set(key, value)
        })
        return index
      }
    }
    /** 获取当前项 */
    const { key, handling } = list[index]
    /** 设置默认值 */
    if (defaultValue?.map) {
      map.set(key, defaultValue.map.get(key) ?? map.get(key))
    }
    /** 执行 */
    const result = await handling({ key, map, list, index })
    /** 自定义步骤 */
    if (typeof result === 'number') {
      index += result
    }
    /** 取消操作 */
    else if (result === void 0 || result instanceof Error) {
      logs.info(result?.message ?? '取消操作')
      return
    }
    /** 如果为空, 返回上一步 */
    else if (!result) {
      index--
    }
    else {
      /** 下一步 */
      index++
    }
  }
  return map
}

/** 创建询问项(输入框) */
export function createInquiryItem<K>(
  type: 'input',
  userOptions: {
    key: K
  } & ({
    options?: InputOptions | ((
      options: InputOptions,
      config: {
        key: K
        map: Map<K, any>
        list: InquiryItem<K>[]
        index: number
      }
    ) => Promise<InputOptions>)
    defaultValue?: any
    customResult?: (
      config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number },
      options: InputOptions,
      select: string
    ) => Promise<any>
  } | {
    handling?: (config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number }) => Promise<any>
  }),
): InquiryItem<K>
/** 创建询问项(选择框--单选) */
export function createInquiryItem<K, V = any, T = PickItem<V>>(
  type: 'quickPick',
  userOptions: {
    key: K
  } & ({
    options: PickOptions<T, false> | ((
      options: PickOptions<T>,
      config: {
        key: K
        map: Map<K, any>
        list: InquiryItem<K>[]
        index: number
      }
    ) => Promise<PickOptions<T, false>>)
    defaultValue?: any
    valueFormat?: (options: PickOptions<T, false>, select: T) => any
    customResult?: (
      config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number },
      options: PickOptions<T, false>,
      select: T
    ) => Promise<any>
  } | {
    handling?: (config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number }) => Promise<any>
  }),
): InquiryItem<K>
/** 创建询问项(选择框--多选) */
export function createInquiryItem<K, V = any, T = PickItem<V>>(
  type: 'quickPick',
  userOptions: {
    key: K
  } & ({
    options: PickOptions<T, true> | ((
      options: PickOptions<T>,
      config: {
        key: K
        map: Map<K, any>
        list: InquiryItem<K>[]
        index: number
      }
    ) => Promise<PickOptions<T, true>>)
    defaultValue?: any
    valueFormat?: (options: PickOptions<T, true>, select: T[]) => any
    customResult?: (
      config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number },
      options: PickOptions<T, true>,
      select: T[]
    ) => Promise<any>
  } | {
    handling?: (config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number }) => Promise<any>
  }),
): InquiryItem<K>
export function createInquiryItem<K, V, T extends PickItem<V>>(
  type: 'input' | 'quickPick',
  userOptions: {
    key: K
    options?: InputOptions | PickOptions<T, boolean> | ((
      options: InputOptions & PickOptions<T, boolean>,
      config: {
        key: K
        map: Map<K, any>
        list: InquiryItem<K>[]
        index: number
      }
    ) => Promise<InputOptions | PickOptions<T, boolean>>)
    defaultValue?: any
    valueFormat?: any
    handling?: (config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number }) => Promise<any>
    customResult?: (
      config: { key: K, map: Map<K, any>, list: InquiryItem<K>[], index: number },
      options: any,
      select: any
    ) => Promise<any>
  },
): InquiryItem<K> {
  return {
    key: userOptions.key,
    handling: userOptions.handling ?? (async ({ key, map, list, index }) => {
      let options: InputOptions & PickOptions<T, boolean> = {
        title: `请输入 ${key}`,
        step: index + 1,
        totalSteps: list.length,
        items: [],
      }
      const customOptions = typeof userOptions.options === 'function' ? await userOptions.options?.(options, { key, map, list, index }) : userOptions.options
      options = assign({
        title: `请输入 ${key}`,
        step: index + 1,
        totalSteps: list.length,
      }, (customOptions ?? {}) as InputOptions & PickOptions<T, boolean>)
      if (type === 'input') {
        options.value = map.get(key) ?? userOptions.defaultValue
      }
      else {
        const pickerOptions = options as PickOptions<T, boolean>
        if (!pickerOptions.activeItems) {
          Object.defineProperty(pickerOptions, 'activeItems', {
            get() {
              return this.items.filter((item: any) => {
                const defaultValue = map.get(key) ?? userOptions.defaultValue
                if (Array.isArray(defaultValue)) {
                  return defaultValue.includes(item.value)
                }
                else {
                  return item.value === defaultValue
                }
              })
            },
          })
        }
      }
      const result = await showBox<T, V>(type as any, options as any)
      if (userOptions.customResult) {
        return await userOptions.customResult({ key, map, list, index }, options, result)
      }
      if (!isNullish(result)) {
        if (type === 'input') {
          map.set(key, result)
          return true
        }
        else {
          map.set(key, (await userOptions.valueFormat?.(options, result as any)) ?? (Array.isArray(result) ? result.map(item => item.value) : result.value))
          return true
        }
      }
      return result
    }),
  }
}

/** 获取当前工作目录 */
export async function getWorkspaceFolder(resource?: Uri): Promise<WorkspaceFolder | null> {
  /** 获取全部工作区 */
  const workspaceFolders = workspace.workspaceFolders
  /** 当前工作区 */
  let workspaceFolder: WorkspaceFolder | undefined = void 0
  /** 如果存在工作区,进行选择,否则提示 */
  if (workspaceFolders) {
    /** 如果只有一个文件夹,直接匹配 */
    if (workspaceFolders.length === 1) {
      workspaceFolder = workspaceFolders[0]
    }
    /** 如果有资源 */
    else if (resource) {
      /** 匹配资源 */
      workspaceFolder = workspace.getWorkspaceFolder(resource)
    }
    /** 如果没有工作区 */
    if (!workspaceFolder) {
      /** 让用户自己选择 */
      const select = await window.showQuickPick(
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
      if (select) {
        workspaceFolder = select.value
      }
    }
  }
  /** 如果存在工作区 */
  if (workspaceFolder) {
    return workspaceFolder
  }
  logs.error('未找到工作区!')
  return null
}
