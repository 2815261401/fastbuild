//@ts-check
'use strict';
/** @typedef {{name: string;folderTemplates: Record<string, string>;stringTemplates: Record<string, string>;placeholder: Record<string, (context: {targetPath: string;targetName: string;filePath: string;fileName: string;fileBase: string;fileExt: string;folderName: string;folderPath: string;}) => string>;conversion: Record<string, (content: string) => string>;exclude: (RegExp | string)[];overwrite: boolean;ignoreDefaultPlaceholder: boolean | string[];ignoreDefaultConversion: boolean | string[];}} TemplateConfig **/
/** @type TemplateConfig[] */
const configs = [
  {
    /** 标识,用于识别多个 */
    name: '默认模板',
    /** 模板位置,格式: 路径:别名  */
    folderTemplates: { fileTemplate: 'fileTemplate' },
    /** 模板字符串,列如: { index: '${name/(.*)/${1:/upcase}/g}' } */
    stringTemplates: {},
    /** 占位符方法 */
    placeholder: {
      /** 右击文件夹名称 */
      target(context) {
        return context.targetName;
      },
      /** 右击文件夹路径 */
      targetPath(context) {
        return context.targetPath;
      },
      /** 生成的模板文件名称 */
      name(context) {
        return context.fileName;
      },
      /** 生成的模板文件路径 */
      path(context) {
        return context.filePath;
      },
      /** 生成的模板文件完整名称 */
      base(context) {
        return context.fileBase;
      },
      /** 生成的模板文件后缀 */
      ext(context) {
        return context.fileExt;
      },
      /** 生成的模板文件所在文件夹名称 */
      folder(context) {
        return context.folderName;
      },
      /** 生成的模板文件所在文件夹路径 */
      folderPath(context) {
        return context.folderPath;
      },
    },
    conversion: {
      /** 全大写 */
      '/upcase': (content) => content.toLocaleUpperCase(),
      /** 全小写 */
      '/downcase': (content) => content.toLocaleLowerCase(),
      /** 首字母大写 */
      '/capitalize': (content) => content.replace(/^./, (v) => v.toLocaleUpperCase()),
      /** 驼峰命名 */
      '/camelcase': (content) => content.replace(/[^a-zA-Z0-9]+[a-zA-Z0-9]/g, (v) => v.slice(-1).toLocaleUpperCase()),
      /** 帕斯卡命名 */
      '/pascalcase': (content) =>
        content.replace(/^[a-zA-Z0-9]|[^a-zA-Z0-9]+[a-zA-Z0-9]/g, (v) => v.slice(-1).toLocaleUpperCase()),
    },
    /** 模板忽略配置,仅支持字符串,正则表达式,列如
     * * /test/ RegExp类型
     * * 'test' string类型
     */
    exclude: [],
    /** 如果文件存在,是否直接覆盖,默认询问 */
    overwrite: false,
    /** 是否忽略默认占位符 */
    ignoreDefaultPlaceholder: false,
    /** 是否忽略默认转换函数 */
    ignoreDefaultConversion: false,
  },
];
module.exports = configs;
