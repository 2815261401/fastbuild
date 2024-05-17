import keys from 'xe-utils/keys';
import objectEach from 'xe-utils/objectEach';
import { configuration, logs } from './config';

/**
 * 捕获错误
 * @param error 错误信息
 */
export const catchError = (error: unknown) => {
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else {
    message = (error as Error).message;
  }
  logs.appendLine(message);
  if (['onError', 'always'].includes(configuration.getShowOutputChannel())) {
    logs.show();
  }
  throw message;
};

/**
 * 格式化字符串
 * @param content 字符串
 * @param option 设置
 * @returns 格式化后的字符串
 */
export const formatStr = <
  T extends Record<string, string> = {
    targetPath: string;
    targetName: string;
    filePath: string;
    fileName: string;
    fileBase: string;
    fileExt: string;
    folderName: string;
    folderPath: string;
  },
>(
  content: string,
  option?: {
    /** 占位符函数 */
    placeholder: Record<string, (context: T) => string>;
    /** 占位符参数回调函数 */
    contextCb: () => T;
    /** 字符串模板 */
    stringTemplates?: Record<string, string>;
    /** 格式转换函数 */
    conversion?: Record<string, (content: string) => string>;
  }
) => {
  try {
    /** 设置默认值 */
    let value = content;
    if (option) {
      if (option.stringTemplates) {
        /** 将对应的字符串模板替换到内容 */
        objectEach(option.stringTemplates, (to, from) => {
          value = value.replace(RegExp(from, 'g'), to);
        });
      }

      /** 通过特定方法格式化字符串 */
      value = value.replace(/(?<!\\)\$\{((?<!\}).)*(\/[gims]*)*\}/g, (v) => {
        /** 特定字符 匹配规则 替换模板 修饰符 */
        const [key, regex, format, options] = v
          .slice(2, -1)
          .split(/(?<!:)\//)
          .concat(['', '', '']);
        let replaceText = () => format;
        if (option.conversion && /^(?<!\\)\$((\{.*\})|([1-9][0-9]*))$/.test(format)) {
          const [num, fnKey] = format.slice(2, -1).split(/:(?=\/)/);
          if (fnKey) {
            if (keys(option.conversion).includes(fnKey)) {
              const cb = option.conversion[fnKey];
              replaceText = (...arr) => cb(arr[Number(num)]);
            }
          } else {
            replaceText = (...arr) => arr[Number(num)];
          }
        }
        return option.placeholder[key](option.contextCb()).replace(RegExp(regex, options), replaceText);
      });
    }
    return value.replace('\\$', '$');
  } catch (error) {
    return catchError(error);
  }
};

declare let __webpack_require__: never;
declare let __non_webpack_require__: NodeRequire;
/**
 * 导入js文件
 * @param path 文件路径
 * @returns 导入的数据
 */
export const requireFile = <T>(path: string): T => {
  const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
  delete requireFunc.cache[path];
  return requireFunc(path);
};
