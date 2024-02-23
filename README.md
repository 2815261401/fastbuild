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

## cz-config

插件默认配置

```javascript
const type = {
  format: {
    description: '改进代码的结构/格式。',
    title: '改进结构',
    emoji: '🎨',
    code: ':art:',
  },
  perf: {
    description: '提高性能。',
    title: '提高性能',
    emoji: '⚡️',
    code: ':zap:',
  },
  remove: {
    description: '移除代码或文件。',
    title: '移除代码',
    emoji: '🔥',
    code: ':fire:',
  },
  fix: {
    description: '修复错误。',
    title: '修复错误',
    emoji: '🐛',
    code: ':bug:',
  },
  hotfix: {
    description: '关键的热修复补丁。',
    title: '热修补丁',
    emoji: '🚑️',
    code: ':ambulance:',
  },
  feat: {
    description: '引入新功能。',
    title: '新增功能',
    emoji: '✨',
    code: ':sparkles:',
  },
  docs: {
    description: '添加或更新文档。',
    title: '更新文档',
    emoji: '📝',
    code: ':memo:',
  },
  deploy: {
    description: '部署的东西。',
    title: '部署代码',
    emoji: '🚀',
    code: ':rocket:',
  },
  style: {
    description: '添加或更新UI和样式文件。',
    title: '更新样式',
    emoji: '💄',
    code: ':lipstick:',
  },
  begin: {
    description: '新开始一个项目。',
    title: '新建项目',
    emoji: '🎉',
    code: ':tada:',
  },
  test: {
    description: '添加、更新或通过测试。',
    title: '仅改测试',
    emoji: '✅',
    code: ':white',
  },
  issues: {
    description: '修复安全问题(issues)。',
    title: '修复问题',
    emoji: '🔒️',
    code: ':lock:',
  },
  secrets: {
    description: '添加或更新保密数据。',
    title: '保密数据',
    emoji: '🔐',
    code: ':closed',
  },
  version: {
    description: '发布/版本标签。',
    title: '版本标签',
    emoji: '🔖',
    code: ':bookmark:',
  },
  warning: {
    description: '修复编译器/过滤器警告。',
    title: '修复警告',
    emoji: '🚨',
    code: ':rotating',
  },
  inwork: {
    description: '未完成的任务或项目，仍在进行中。',
    title: '未完成的',
    emoji: '🚧',
    code: ':construction:',
  },
  fixci: {
    description: '修复CI构建。',
    title: '修复CI',
    emoji: '💚',
    code: ':green',
  },
  downdepend: {
    description: '降级依赖项。',
    title: '降级依赖',
    emoji: '⬇️',
    code: ':arrow',
  },
  updepend: {
    description: '升级依赖项。',
    title: '升级依赖',
    emoji: '⬆️',
    code: ':arrow',
  },
  fixeddepend: {
    description: '将依赖项固定到特定的版本。',
    title: '固定依赖',
    emoji: '📌',
    code: ':pushpin:',
  },
  ci: {
    description: '添加或更新CI构建系统。',
    title: 'CI构建',
    emoji: '👷',
    code: ':construction',
  },
  trackcode: {
    description: '添加或更新分析或跟踪代码。',
    title: '跟踪代码',
    emoji: '📈',
    code: ':chart',
  },
  refactor: {
    description: '重构代码。',
    title: '重构代码',
    emoji: '♻️',
    code: ':recycle:',
  },
  adddepend: {
    description: '添加依赖项。',
    title: '添加依赖',
    emoji: '➕',
    code: ':heavy',
  },
  removedepend: {
    description: '移除依赖项。',
    title: '移除依赖',
    emoji: '➖',
    code: ':heavy',
  },
  configuration: {
    description: '添加或更新配置文件。',
    title: '更新配置',
    emoji: '🔧',
    code: ':wrench:',
  },
  scripts: {
    description: '添加或更新开发脚本。',
    title: '开发脚本',
    emoji: '🔨',
    code: ':hammer:',
  },
  internationalization: {
    description: '国际化与本地化。',
    title: '国际语言',
    emoji: '🌐',
    code: ':globe',
  },
  typos: {
    description: '修复拼写错误。',
    title: '修复拼写',
    emoji: '✏️',
    code: ':pencil2:',
  },
  badcode: {
    description: '编写需要改进的糟糕代码。',
    title: '糟糕代码',
    emoji: '💩',
    code: ':poop:',
  },
  revert: {
    description: '恢复之前的提交。',
    title: '回退代码',
    emoji: '⏪️',
    code: ':rewind:',
  },
  merge: {
    description: '合并分支。',
    title: '合并分支',
    emoji: '🔀',
    code: ':twisted',
  },
  compiled: {
    description: '添加或更新已编译的文件或包。',
    title: '已编译的',
    emoji: '📦️',
    code: ':package:',
  },
  external: {
    description: '由于外部API更改而更新代码。',
    title: '外部API',
    emoji: '👽️',
    code: ':alien:',
  },
  renamepath: {
    description: '移动或重命名资源(例如:文件、路径、路由)。',
    title: '路径变更',
    emoji: '🚚',
    code: ':truck:',
  },
  license: {
    description: '添加或更新许可证。',
    title: '许可证',
    emoji: '📄',
    code: ':page',
  },
  breaking: {
    description: '引入突破性的变化。',
    title: '突破进展',
    emoji: '💥',
    code: ':boom:',
  },
  assets: {
    description: '添加或更新资源。',
    title: '更新资源',
    emoji: '🍱',
    code: ':bento:',
  },
  access: {
    description: '提高可访问性。',
    title: '提高访问',
    emoji: '♿️',
    code: ':wheelchair:',
  },
  comments: {
    description: '在源代码中添加或更新注释。',
    title: '更新注释',
    emoji: '💡',
    code: ':bulb:',
  },
  drunkenly: {
    description: '晕乎乎地写代码。',
    title: '迷之代码',
    emoji: '🍻',
    code: ':beers:',
  },
  text: {
    description: '添加或更新文本和文字。',
    title: '更新文本',
    emoji: '💬',
    code: ':speech',
  },
  database: {
    description: '执行与数据库相关的更改。',
    title: '数据库',
    emoji: '🗃️',
    code: ':card',
  },
  logs: {
    description: '添加或更新日志。',
    title: '更新日志',
    emoji: '🔊',
    code: ':loud',
  },
  removelogs: {
    description: '移除日志。',
    title: '移除日志',
    emoji: '🔇',
    code: ':mute:',
  },
  contributor: {
    description: '添加或更新贡献者。',
    title: '贡献者',
    emoji: '👥',
    code: ':busts',
  },
  usability: {
    description: '改善用户体验/可用性。',
    title: '用户体验',
    emoji: '🚸',
    code: ':children',
  },
  architectural: {
    description: '进行架构更改。',
    title: '架构更改',
    emoji: '🏗️',
    code: ':building',
  },
  responsive: {
    description: '致力于响应式设计。',
    title: '响应式',
    emoji: '📱',
    code: ':iphone:',
  },
  mock: {
    description: '模拟事物。',
    title: '模拟事物',
    emoji: '🤡',
    code: ':clown',
  },
  egg: {
    description: '添加或更新彩蛋。',
    title: '更新彩蛋',
    emoji: '🥚',
    code: ':egg:',
  },
  gitignore: {
    description: '添加或更新.gitignore文件。',
    title: 'gitignore',
    emoji: '🙈',
    code: ':see',
  },
  snapshots: {
    description: '添加或更新快照。',
    title: '更新快照',
    emoji: '📸',
    code: ':camera',
  },
  experiments: {
    description: '进行实验性开发。',
    title: '实验性',
    emoji: '⚗️',
    code: ':alembic:',
  },
  SEO: {
    description: '改善搜索引擎优化。',
    title: '搜索引擎',
    emoji: '🔍️',
    code: ':mag:',
  },
  types: {
    description: '添加或更新类型。',
    title: '更新类型',
    emoji: '🏷️',
    code: ':label:',
  },
  seed: {
    description: '添加或更新种子文件。',
    title: '更新种子',
    emoji: '🌱',
    code: ':seedling:',
  },
  feature: {
    description: '添加、更新或删除功能标志。',
    title: '功能标志',
    emoji: '🚩',
    code: ':triangular',
  },
  catcherrors: {
    description: '捕捉错误。',
    title: '捕捉错误',
    emoji: '🥅',
    code: ':goal',
  },
  animations: {
    description: '添加或更新动画和过渡。',
    title: '动画过渡',
    emoji: '💫',
    code: ':dizzy:',
  },
  deprecate: {
    description: '弃用需要清理的代码。',
    title: '弃用代码',
    emoji: '🗑️',
    code: ':wastebasket:',
  },
  permissions: {
    description: '编写与授权、角色和权限相关的代码。',
    title: '权限相关',
    emoji: '🛂',
    code: ':passport',
  },
  simplefix: {
    description: '对一个非关键问题(issue)的简单修复。',
    title: '简单修复',
    emoji: '🩹',
    code: ':adhesive',
  },
  inspection: {
    description: '数据探索/检查。',
    title: '数据检查',
    emoji: '🧐',
    code: ':monocle',
  },
  deadcode: {
    description: '删除死代码。',
    title: '删除代码',
    emoji: '⚰️',
    code: ':coffin:',
  },
  failingtest: {
    description: '添加失败的测试。',
    title: '失败测试',
    emoji: '🧪',
    code: ':test',
  },
  business: {
    description: '添加或更新业务逻辑。',
    title: '业务逻辑',
    emoji: '👔',
    code: ':necktie:',
  },
  healthcheck: {
    description: '添加或更新健康检查。',
    title: '健康检查',
    emoji: '🩺',
    code: ':stethoscope:',
  },
  infrastructure: {
    description: '与基础设施相关的更改。',
    title: '底层更改',
    emoji: '🧱',
    code: ':bricks:',
  },
  developer: {
    description: '改善开发人员体验。',
    title: '改善体验',
    emoji: '🧑‍💻',
    code: ':technologist:',
  },
  sponsorships: {
    description: '添加赞助或与金钱相关的基础设施。',
    title: '赞助底层',
    emoji: '💸',
    code: ':money',
  },
  multithreading: {
    description: '添加或更新与多线程或并发性相关的代码。',
    title: '多线程',
    emoji: '🧵',
    code: ':thread:',
  },
  validation: {
    description: '添加或更新与验证相关的代码。',
    title: '更新验证',
    emoji: '🦺',
    code: ':safety',
  },
};

const types = Object.entries(type).map(([k, v]) => ({
  value: `${v.emoji} ${k}`,
  name: `[${v.emoji}] ${v.title}: ${v.description}`,
}));

const typeEnum = types.map(({ value }) => value);

/** @type {import('cz-customizable').Options} **/
module.exports = {
  /**
   * 类型合集
   * @type {typeof type}
   */
  type,
  /**
   * 类型
   * @type {typeof typeEnum}
   */
  typeEnum,
  /**
   * 类型
   *  @type {import('cz-customizable').TypeMap}
   */
  types,
  // override the messages, defaults are as follows
  messages: {
    type: '选择你要提交的类型 :',
    scope: '选择一个提交范围（可选）:',
    // used if allowCustomScopes is true
    customScope: '请输入自定义的提交范围 :',
    subject: '填写简短精炼的变更描述 :\n',
    body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
    breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
    footer: '列举关联issue (可选)，使用 "|" 换行。 例如: #31, #I3244 :\n',
    confirmCommit: '是否提交或修改commit ?',
  },
  /** 是否允许自定义作用域 */
  allowCustomScopes: true,
  /** 允许重大的变更 */
  allowBreakingChanges: ['✨ feat', '🐛 fix'],
  /** 允许跳过的问题 */
  skipQuestions: ['body'],
  /** 是否允许添加分支名到提交消息中 */
  appendBranchNameToCommitMessage: true,
  /** 重大的变更前缀 */
  breakingPrefix: '',
  /** issue前缀 */
  footerPrefix: '',
  /** 提交描述最多字符数 */
  subjectLimit: 100,
};
```

生成的模板
使用函数,有默认的配置,对象需要自己配置

```javascript
/**
 * @type {import('cz-customizable').Options|((config) => import('cz-customizable').Options)|(config) => Promise<import('cz-customizable').Options>}
 **/
module.exports = (config) => {
  const fs = require('fs');
  const path = require('path');
  let scopes = [];
  if (fs.existsSync(path.resolve(__dirname, 'src'))) {
    scopes = scopes.concat(
      fs
        .readdirSync(path.resolve(__dirname, 'src'), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
    );
  }
  return {
    ...config,
    scopes,
  };
};
```

## 注意事项

- 模板文件解析的时候使用的是 utf-8 编码，所以请保证编码一致。
- 占位符函数,转换函数可被自定义函数替换,
- 空文件夹不会生成
- 打印信息可用快捷键(`Ctrl + Shift + U`),vscode默认的快捷键,打开输出界面,接着在右上角下拉框选择`fast-build`

## 最后

老版本的插件已经不能满足我个人使用,所以有了新版本,如果遇到问题,可在<a href="https://marketplace.visualstudio.com/items?itemName=lichenghao.fast-build&amp;ssr=false#review-details">此处</a>留言
