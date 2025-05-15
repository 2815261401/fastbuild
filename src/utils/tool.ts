import { configuration, logs } from './config'

/**
 * 捕获错误
 * @param error 错误信息
 */
export function catchError(error: unknown) {
  let message = ''
  if (typeof error === 'string') {
    message = error
  }
  else {
    message = (error as Error).message
  }
  logs.appendLine(message)
  if (['onError', 'always'].includes(configuration.getShowOutputChannel())) {
    logs.show()
  }
  throw message
}

declare let __webpack_require__: never
declare let __non_webpack_require__: NodeRequire
/**
 * 导入js文件
 * @param path 文件路径
 * @returns 导入的数据
 */
export async function requireFile<T>(path: string): Promise<Awaited<T>> {
  const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
  delete requireFunc.cache[path]
  return requireFunc(path)
}
