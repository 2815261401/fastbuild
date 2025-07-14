import type { FileType } from 'vscode'

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { Uri, window, workspace } from 'vscode'

import { templateConfigInExtension, templateConfigPath, templateFolderPath, templateWorkspaceFolder } from './config'
import { readJson } from './utils'
import { showBox } from './vscode'

/** 数据转换 */
export const conversionMap = new Map(Object.entries({
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
}))

/** 模板数据格式 */
export type TemplateType = Pick<Template, 'name' | 'description'
  | 'path' | 'type' | 'value' | 'workspaceFolderIndex'>
/** 模板数据 */
export class Template {
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string

  /** 模板详情 */
  get detail() {
    const detailList: string[] = []
    const name = this.workspaceFolder?.name
    if (name) {
      detailList.push(`工作区: ${name}`)
    }
    detailList.push(`类型: ${this.type === 1 ? '文件' : '文件夹'}`)
    if (this.path) {
      detailList.push(`位置: ${this.path}`)
    }
    if (!this.exists) {
      detailList.push('(模板文件不存在)')
    }
    return detailList.join(' ')
  }

  /** 模板路径 */
  path: string
  /** 文件类型 */
  type: FileType
  /** 替换的规则 */
  value: {
    /** 键 */
    key: string
    /** 值 */
    value: string
    /** 更多 */
    more?: string[]
  }[]

  /** 所属工作区 */
  workspaceFolderIndex?: number

  /** 工作区 */
  get workspaceFolder() {
    /** 获取全部工作区 */
    const workspaceFolders = workspace.workspaceFolders ?? []
    if (this.workspaceFolderIndex === void 0) {
      return void 0
    }
    return workspaceFolders[this.workspaceFolderIndex]
  }

  /** 父级文件夹 */
  parent?: Template
  /** 根 */
  rootUri?: Uri

  constructor(data: Partial<TemplateType>, rootUri?: Uri) {
    this.name = data.name ?? ''
    this.description = data.description
    this.path = data.path ?? ''
    this.type = data.type ?? 1
    this.value = data.value ?? []
    this.workspaceFolderIndex = data.workspaceFolderIndex
    this.rootUri = rootUri
  }

  get Uri(): Uri {
    if (this.workspaceFolder) {
      return Uri.joinPath(this.workspaceFolder.uri, this.path)
    }
    return Uri.joinPath(this.rootUri!, this.path)
  }

  /** 是否存在 */
  get exists() {
    return existsSync(this.Uri.fsPath)
  }

  toJSON(): TemplateType {
    return {
      name: this.name,
      description: this.description,
      path: this.path,
      type: this.type,
      value: this.value,
      workspaceFolderIndex: this.workspaceFolderIndex,
    }
  }

  /** 替换方法 */
  replace(str: string) {
    let data = str
    for (const { key, value, more } of this.value) {
      let pattern: string
      let flags: string
      if (/^\/.+\/[gimsuy]*$/.test(key)) {
        const match = key.match(/^\/(.*)\/([gimuy]*)$/)!
        pattern = match[1]
        flags = match[2]
      }
      else {
        pattern = key
        flags = 'g'
      }
      data = data.replace(
        new RegExp(pattern, flags),
        () => value,
      )
      if (more) {
        for (const item of more) {
          const conversion = conversionMap.get(item)!
          data = data.replace(
            new RegExp(conversion(pattern), flags),
            () => conversion(value),
          )
        }
      }
    }
    return data
  }

  /** 目标路径 */
  get actualPath(): string {
    if (this.parent) {
      return `${this.parent.actualPath}/${this.name}`
    }
    else {
      return this.name
    }
  }

  /** 复制到指定位置 */
  async copy(targetUri: Uri) {
    const templateTargetUri = Uri.joinPath(targetUri, this.replace(this.actualPath))
    if (existsSync(templateTargetUri.fsPath)) {
      window.showWarningMessage(
        `${this.name}模板无法使用, 目标位置已存在文件(夹)`,
        { modal: true },
      )
      return
    }
    if (this.type === 1) {
      /** 获取文件内容 */
      const fileData = await workspace.fs.readFile(this.Uri)
      /** 解析内容 */
      const content = new TextDecoder('utf-8').decode(fileData)
      readFileSync(this.Uri.fsPath, { encoding: 'utf-8' })
      /** 替换文件内容 */
      const newContent = this.replace(content)
      /** 写入文件 */
      await workspace.fs.writeFile(templateTargetUri, new TextEncoder().encode(newContent))
    }
    else if (this.type === 2) {
      /** 读取文件夹 */
      const directoryList = await workspace.fs.readDirectory(this.Uri)
      await Promise.all(directoryList.map(async ([name, type]) => {
        const template = new Template({
          name,
          path: `${this.path}/${name}`,
          type,
          value: this.value,
          workspaceFolderIndex: this.workspaceFolderIndex,
        }, this.rootUri)
        template.parent = this
        return template.copy(targetUri)
      }))
    }
  }
}

/** 获取模板位置 */
export async function getTemplateUri(type: 'config' | 'folder' | 'root' = 'config'): Promise<Uri> {
  /** 获取全部工作区 */
  const workspaceFolders = workspace.workspaceFolders ?? []
  /** 模板配置是否保存在扩展中 */
  const inExtension = templateConfigInExtension()
  if (workspaceFolders.length > 1 && !inExtension && (templateWorkspaceFolder() < 0 || templateWorkspaceFolder() > workspaceFolders.length - 1)) {
    const value = await showBox('quickPick', {
      title: '选择模板配置所要保存的工作区',
      ignoreFocusOut: true,
      items: workspaceFolders.map((folder, index) =>
        ({
          label: folder.name,
          description: folder.uri.fsPath,
          value: index,
        })),
    })
    if (value) {
      templateWorkspaceFolder(value.value)
    }
  }
  /** 获取工作区 */
  let cwd = inExtension ? Uri.file(path.resolve(import.meta.dirname, '../..')) : workspaceFolders[templateWorkspaceFolder()].uri
  /** 如果没有工作区 */
  if (!cwd) {
    /** 重新设置工作区 */
    cwd = Uri.file(path.resolve(import.meta.dirname, '../..'))
  }
  if (type === 'config') {
  /** 获取配置位置 */
    return Uri.joinPath(cwd, templateConfigPath())
  }
  else if (type === 'folder') {
  /** 获取模板文件夹配置 */
    return Uri.joinPath(cwd, templateFolderPath())
  }
  /** 获取模板配置所在根目录 */
  return cwd
}

/** 读取(设置)模板配置 */
export async function templateConfig(value?: Template[]): Promise<Template[]> {
  /** 获取配置位置 */
  const configUri = await getTemplateUri()
  if (value === void 0) {
    let config: Template[] = []
    if (existsSync(configUri.fsPath)) {
      /** 获取配置 */
      config = readJson<Template[]>(configUri.fsPath) || []
      /** 获取根 */
      const rootUri = await getTemplateUri('root')
      /** 如果是数组 */
      if (Array.isArray(config)) {
        /** 进行实例化 */
        return config.map(item => new Template(item, rootUri))
      }
    }
    return []
  }
  else {
    const configText = value.reduce((total, item, index, { length }) => {
      const fileType = item.type === 1 ? '文件' : '文件夹'
      const textList = [
        `/** 模板: #${index + 1}(${fileType}) */`,
        ...JSON.stringify(item.toJSON(), null, 2).split('\n'),
      ].flatMap((item) => {
        const arr = [`  ${item}`]
        if (/^ {2}"name": /.test(item)) {
          arr.unshift(`${' '.repeat(4)}/** 模板名称 */`)
        }
        else if (/^ {2}"description": /.test(item)) {
          arr.unshift(`${' '.repeat(4)}/** 模板描述 */`)
        }
        else if (/^ {2}"path": /.test(item)) {
          arr.unshift(`${' '.repeat(4)}/** 模板路径 */`)
        }
        else if (/^ {2}"type": /.test(item)) {
          arr.unshift(`${' '.repeat(4)}/** ${fileType} */`)
        }
        else if (/^ {2}"value": /.test(item)) {
          arr.unshift(`${' '.repeat(4)}/** 替换规则 */`)
        }
        else if (/^ {8}"\/upcase"/.test(item)) {
          arr.unshift(`${' '.repeat(10)}/** 全大写 */`)
        }
        else if (/^ {8}"\/downcase"/.test(item)) {
          arr.unshift(`${' '.repeat(10)}/** 全小写 */`)
        }
        else if (/^ {8}"\/capitalize"/.test(item)) {
          arr.unshift(`${' '.repeat(10)}/** 首字母大写 */`)
        }
        else if (/^ {8}"\/camelcase"/.test(item)) {
          arr.unshift(`${' '.repeat(10)}/** 驼峰(首字母小写) */`)
        }
        else if (/^ {8}"\/pascalcase"/.test(item)) {
          arr.unshift(`${' '.repeat(10)}/** 帕斯卡(首字母大写) */`)
        }
        return arr
      })
      if (index !== length - 1) {
        textList.splice(-1, 1, `${textList.at(-1)!},`)
      }
      return [
        total.at(0)!,
        ...total.slice(1, -1),
        ...textList,
        total.at(-1)!,
      ] satisfies string[]
    }, ['[', ']'])
    await workspace.fs.writeFile(configUri, new TextEncoder().encode(configText.join('\n')))
    return value
  }
}
