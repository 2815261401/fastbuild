import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { parse } from 'jsonc-parser'

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
