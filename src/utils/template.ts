import type { FileType } from 'vscode'
import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { basename, relative } from 'node:path'
import { Uri, window, workspace } from 'vscode'
import { configuration, logs } from './config'

const conversion = {
  /** 全大写 */
  '/upcase': (content: string) => content.toLocaleUpperCase(),
  /** 全小写 */
  '/downcase': (content: string) => content.toLocaleLowerCase(),
  /** 首字母大写 */
  '/capitalize': (content: string) => content.replace(/^./, v => v.toLocaleUpperCase()),
  /** 驼峰命名 */
  '/camelcase': (content: string) =>
    content.replace(/[^a-z0-9]+[a-z0-9]/gi, v => v.slice(-1).toLocaleUpperCase()),
  /** 帕斯卡命名 */
  '/pascalcase': (content: string) =>
    content.replace(/^[a-z0-9]|[^a-z0-9]+[a-z0-9]/gi, v =>
      v.slice(-1).toLocaleUpperCase()),
}

/** 模板数据 */
export class Template {
  /** 模板名称 */
  name: string
  /** 模板路径 */
  path: string
  /** 文件类型 */
  type: FileType
  /** 替换的规则 */
  value: Record<string, string>
  /** 父级文件夹 */
  parent?: Template
  /** 所属工作区 */
  workspaceFolderIndex: number
  constructor(data: Partial<Template>) {
    this.name = data.name ?? ''
    this.path = data.path ?? ''
    this.type = data.type ?? 1
    this.value = data.value ?? {}
    this.parent = data.parent
    this.workspaceFolderIndex = data.workspaceFolderIndex ?? 0
  }

  /** 替换方法 */
  replace(str: string) {
    let data = str
    for (const [key, value] of Object.entries(this.value)) {
      const [regExp, type] = key.split(/ :(?=\/)/)
      if (regExp.startsWith('(reg)')) {
        const [,reg, flags] = regExp.split('/')
        data = data.replace(
          new RegExp(reg, flags),
          v => conversion[type as keyof typeof conversion]?.(v) ?? value ?? v,
        )
      }
      else {
        data = data.replaceAll(
          regExp,
          v => conversion[type as keyof typeof conversion]?.(v) ?? value ?? v,
        )
      }
    }
    return data
  }

  /** 获取模板路径 */
  getPath(): Uri {
    if (this.parent) {
      return Uri.joinPath(this.parent.getPath(), this.path)
    }
    return Uri.joinPath(configuration.workspaceFolder.uri, this.path)
  }

  /** 获取生成目标位置 */
  getTargetPath(resource: Uri): Uri {
    const path = this.replace(this.path)
    if (this.parent) {
      return Uri.joinPath(this.parent.getTargetPath(resource), path)
    }
    return Uri.joinPath(resource, basename(path))
  }
}

/** 获取配置文件的uri */
export async function getConfigUri() {
  const workspaceFolderIndex = configuration.getTemplateWorkspaceFolder()
  const workspaceFolders = workspace.workspaceFolders
  if (!workspaceFolders) {
    throw new Error('未找到工作区')
  }
  if (workspaceFolderIndex === null && workspaceFolders.length > 1) {
    const select = await window.showQuickPick(
      workspaceFolders.map((item, i) => ({
        label: item.name,
        description: item.uri.fsPath,
        value: i,
      })),
      {
        title: '选择配置文件所在工作区',
        ignoreFocusOut: true,
      },
    )
    if (!select) {
      throw new Error('取消选择')
    }
    configuration.setTemplateWorkspaceFolder(select.value)
  }
  return Uri.joinPath(
    workspaceFolders[configuration.getTemplateWorkspaceFolder() ?? 0].uri,
    configuration.getTemplateConfigPath(),
  )
}
/** 读取配置 */
export async function readConfig(save = false): Promise<Template[]> {
  /** 指定文件路径 */
  const configPath = await getConfigUri()
  /** 文件是否存在 */
  if (existsSync(configPath.fsPath)) {
    /** 存在文件,对数据进行格式化 */
    const config: Partial<Template>[] = JSON.parse(
      (await workspace.fs.readFile(configPath)).toString() ?? '[]',
    )
    return config
      .filter(
        ({ workspaceFolderIndex }) =>
          save || workspaceFolderIndex === configuration.workspaceFolder.index,
      )
      .map(item => new Template(item))
  }
  return []
}
/** 保存配置 */
export async function saveConfig(config: Template[]) {
  /** 指定文件路径 */
  const configPath = await getConfigUri()
  await workspace.fs.writeFile(configPath, Buffer.from(JSON.stringify(config, null, 2)))
  logs.appendLine(`配置已储存,位置在: ${configPath.fsPath}`)
}

export async function readAndWriteFile(template: Template, resource: Uri) {
  if (template.type === 1) {
    /** 读取文件 */
    const file = (await workspace.fs.readFile(template.getPath())).toString()
    /** 替换文件内容 */
    const newFile = template.replace(file)
    /** 写入文件 */
    await workspace.fs.writeFile(template.getTargetPath(resource), Buffer.from(newFile))
  }
  else if (template.type === 2) {
    /** 读取文件夹 */
    const data = await workspace.fs.readDirectory(template.getPath())
    for (const [name, type] of data) {
      await readAndWriteFile(
        new Template({ name, path: name, type, value: template.value, parent: template }),
        resource,
      )
    }
  }
}
/** 通过模板创建文件(夹) */
export async function createFile(resource: Uri) {
  /** 读取配置 */
  const config = await readConfig()
  if (!config.length) {
    throw new Error('请先配置模板')
  }
  const seletTem = await window.showQuickPick(
    config.map(item => ({
      label: item.name,
      description: item.path,
      value: item,
    })),
    { title: '选择模板', ignoreFocusOut: true },
  )
  if (!seletTem) {
    throw new Error('取消导入模板')
  }
  const data = seletTem.value
  for (const key of Object.keys(data.value)) {
    const value = await window.showInputBox({
      title: `打算把${key}替换为什么`,
      ignoreFocusOut: true,
      value: data.value[key],
    })
    if (value === void 0) {
      throw new Error('取消导入模板')
    }
    data.value[key] = value
  }
  await readAndWriteFile(data, resource)
}
/** 创建模板 */
export async function createTemplate(resource: Uri) {
  /** 读取配置 */
  const config = await readConfig(true)
  /** 获取模板名称 */
  const name = await window.showInputBox({
    title: '请输入模板名称',
    value: basename(resource.fsPath),
    ignoreFocusOut: true,
  })
  /** 取消 */
  if (name === void 0) {
    throw new Error('取消创建模板')
  }
  /** 获取模板数据 */
  const template = new Template({
    name,
    path: relative(configuration.workspaceFolder.uri.fsPath, resource.fsPath),
    type: (await workspace.fs.stat(resource)).type,
    value: {},
    workspaceFolderIndex: configuration.workspaceFolder.index,
  })
  let index: number | undefined = 0
  while (index !== void 0) {
    const value = await window.showInputBox({
      title: `请输入需要替换的字符串或者正则表达式(#${++index})`,
      placeHolder: '示例: (reg)/^[a-z]+$/ :/upcase 或 test :/capitalize',
      prompt:
        '全大写/upcase, 全小写/downcase, 首字母大写/capitalize, 驼峰/camelcase, 帕斯卡/pascalcase(使用` :`进行分隔)',
      ignoreFocusOut: true,
    })
    if (value === void 0) {
      throw new Error('取消创建模板')
    }
    else if (value === '') {
      index = void 0
    }
    else {
      template.value[value] = ''
    }
  }
  /** 写入新配置 */
  config.push(template)
  /** 保存配置 */
  saveConfig(config)
}
