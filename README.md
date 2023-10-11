# 通过模板配置快速创建文件

这是一个 VSCode 插件,用来快速构建文件

## 使用方法

创建模板目录内容,在没有配置文件(`template.config.js`)的情况下,默认使用 `fileTemplate` 目录作为模板目录.

- 创建模板目录(`fileTemplate`)

  `fileTemplate` 目录应当位于根目录下.

- 创建构建工具模板文件

  (文件名,文件夹,文件内容)可以设定占位符,占位符的内容在创建的时候会被替代.

- 新建文件

  右键文件夹 - (通过模板) 新建文件

## 系统提供的占位符

名称

- `${target}`: 右击文件夹名(`src`)
- `${targetPath}`: 右击文件夹绝对路径(`C:\\workspace\\test\\src`)
- `${name}`: 文件名(`index`)
- `${path}`: 文件绝对路径(`C:\\workspace\\test\\src\\index.js`)
- `${base}`: 完整文件名(包含后缀,`index.js`)
- `${ext}`: 文件后缀(`.js`)

内置方法(这里按照vscode的代码块的方法使用,例如:`${target/(.*)/${1:/upcase}/g}`)

- `/upcase`: 全大写
- `/downcase`: 全小写
- `/capitalize`: 首字母大写
- `/camelcase`: 驼峰命名
- `/pascalcase`: 帕斯卡命名

## 配置文件`template.config.js`(可在设置中修改)

可以通过命令( `创建构建工具模板文件` )快速创建配置文件.

支持以下高级功能

- 支持多模板
- 支持自定义占位符
- 支持忽略配置
- 是否强制覆盖

详细的配置详情如下

```javascript
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
      /** 全大写 */ '/upcase': (content) => content.toLocaleUpperCase(),
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

```

## 注意事项

- 模板文件解析的时候使用的是 utf-8 编码，所以请保证编码一致。
- 占位符函数,转换函数可被自定义函数替换,
- 空文件夹不会生成
- 打印信息可用快捷键(```Ctrl + Shift + U```),vscode默认的快捷键,打开输出界面,接着在右上角下拉框选择```fast-build```

## 最后

老版本的插件已经不能满足我个人使用,所以有了新版本,如果遇到问题,可在<a href="https://marketplace.visualstudio.com/items?itemName=lichenghao.fast-build&amp;ssr=false#review-details">此处</a>留言
