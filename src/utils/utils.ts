import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { parse } from 'jsonc-parser'

/**
 * 导入js文件
 * @param filePath 文件路径
 * @returns 导入的数据
 */
export function requireFile<T = any>(filePath: string): T {
  const require = createRequire(import.meta.url)
  const key = require.resolve(filePath)
  delete require.cache[key]
  const result = require(filePath)
  return result.default ? result.default : result
}

/** 读取json */
export function readJson<T = any>(jsonPath: string): T | null {
  if (existsSync(jsonPath)) {
    try {
      const result = parse(readFileSync(jsonPath, 'utf8'))
      if (result) {
        return result
      }
    }
    catch (e) {
      console.error(e)
      return null
    }
  }
  return null
}

/** 判断路径是否存在 */
export function existsPath(cwd: string, paths?: string): boolean
export function existsPath(cwd: string, paths: string[]): boolean[]
export function existsPath(cwd: string, paths: string | string[] = 'package.json'): boolean | boolean[] {
  if (Array.isArray(paths)) {
    return paths.map(p => existsSync(path.join(cwd, p)))
  }
  const packagePath = path.join(cwd, paths ?? '')
  return existsSync(packagePath)
}

/** 判断是否是子路径 */
export function isSubPath(parentPath: string, childPath: string) {
  const relative = path.relative(parentPath, childPath)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
