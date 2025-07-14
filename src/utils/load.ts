import type { QualifiedConfig, UserConfig } from '@commitlint/types'

import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { cosmiconfig, defaultLoaders } from 'cosmiconfig'
import { assign, tryit } from 'radashi'
import { Uri, workspace } from 'vscode'

import { logs } from './config'
import { readJson } from './utils'

export const rootConfig: { workspaceFolderUri?: Uri } = {
  workspaceFolderUri: void 0,
}

async function tsLoader(filePath: string) {
  const requireFromWorkspace = createRequire(path.join(rootConfig.workspaceFolderUri!.fsPath, 'index.js'))
  const [, ts] = await tryit(() => requireFromWorkspace('typescript'))()
  if (ts) {
    /** 获取配置 */
    const tsConfig = readJson(path.join(import.meta.dirname, '../../tsconfig.json'))
    const fileData = await workspace.fs.readFile(Uri.file(filePath))
    /** 解析内容 */
    const content = new TextDecoder('utf-8').decode(fileData)
    /** 编译 */
    const fileContent = ts.transpileModule(content, tsConfig).outputText
    const newFilePath = path.join(import.meta.dirname, '../../node_modules/.tmp', `${path.parse(filePath).name}.js`)
    await workspace.fs.writeFile(Uri.file(newFilePath), new TextEncoder().encode(fileContent))
    return defaultLoaders['.js'](newFilePath, fileContent)
  }
  else {
    throw new Error('typescript not found')
  }
}

async function load(cwd: string, configPath?: string) {
  const moduleName = 'commitlint'
  const explorer = cosmiconfig(moduleName, {
    searchStrategy: 'global',
    searchPlaces: [
      // cosmiconfig overrides default searchPlaces if any new search place is added (For e.g. `*.ts` files),
      // we need to manually merge default searchPlaces from https://github.com/davidtheclark/cosmiconfig#searchplaces
      'package.json',
      'package.yaml',
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.yaml`,
      `.${moduleName}rc.yml`,
      `.${moduleName}rc.js`,
      `.${moduleName}rc.cjs`,
      `.${moduleName}rc.mjs`,
      `${moduleName}.config.js`,
      `${moduleName}.config.cjs`,
      `${moduleName}.config.mjs`,
      // files supported by TypescriptLoader
      `.${moduleName}rc.ts`,
      `.${moduleName}rc.cts`,
      `${moduleName}.config.ts`,
      `${moduleName}.config.cts`,
    ],
    loaders: {
      '.ts': tsLoader,
      '.cts': tsLoader,
      '.cjs': defaultLoaders['.cjs'],
      '.js': defaultLoaders['.js'],
    },
  })
  const explicitPath = configPath ? path.resolve(cwd, configPath) : undefined
  const explore = explicitPath ? explorer.load : explorer.search
  const searchPath = explicitPath || cwd
  const local = await explore(searchPath)
  if (local) {
    return local
  }
  return null
}

async function loadParserPreset(options: string | { cwd: string, name: string }) {
  let parserPreset = async () => ({})
  if (typeof options === 'string') {
    if (existsSync(options)) {
      parserPreset = await defaultLoaders['.js'](options, '')
    }
  }
  else {
    const modulePath = path.resolve(options.cwd, 'node_modules', options.name)
    if (existsSync(modulePath)) {
      const packageJson = readJson(path.join(modulePath, 'package.json'))
      if (packageJson) {
        parserPreset = await defaultLoaders['.js'](path.join(modulePath, packageJson.exports ?? './dist/index.js'), '')
      }
    }
  }
  return parserPreset
}

/** 加载配置 */
export async function loadConfig(seed: UserConfig, options: {
  cwd: string
  file?: string
}): Promise<QualifiedConfig> {
  /** 加载配置 */
  const [error, result] = await tryit(() => load(options.cwd, options.file))()
  let config = {} as QualifiedConfig
  if (result) {
    config = result.config
  }
  else {
    config = seed as any
    logs.error(error!.message)
  }

  /** 加载解析器 */
  if (config.parserPreset) {
    let parserPreset = async () => ({})
    if (typeof config.parserPreset === 'string') {
      parserPreset = await loadParserPreset({
        cwd: options.cwd,
        name: config.parserPreset,
      })
      config.parserPreset = {
        name: config.parserPreset,
      }
    }
    else if (typeof config.parserPreset === 'object') {
      if (config.parserPreset.path) {
        parserPreset = await loadParserPreset(config.parserPreset.path)
      }
      else if (config.parserPreset.name) {
        parserPreset = await loadParserPreset({
          cwd: options.cwd,
          name: config.parserPreset.name,
        })
      }
    }
    config.parserPreset.parserOpts = await parserPreset()
  }
  return assign(seed, config) as QualifiedConfig
}
