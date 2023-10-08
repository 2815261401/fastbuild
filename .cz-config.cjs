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

let scopes = [];

const fs = require('fs');
const path = require('path');
if (fs.existsSync(path.resolve(__dirname, 'src'))) {
  scopes = fs.readdirSync(path.resolve(__dirname, 'src'), {
    withFileTypes: true,
  });
}
if (fs.existsSync(path.resolve(__dirname, 'src/modules'))) {
  scopes = scopes.concat(
    fs.readdirSync(path.resolve(__dirname, 'src/modules'), {
      withFileTypes: true,
    })
  );
}
scopes = scopes.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name.replace(/s$/, ''));

module.exports = {
  type,
  typeEnum,
  types,
  scopes,
  // allowTicketNumber: false,
  // isTicketNumberRequired: false,
  // ticketNumberPrefix: 'TICKET-',
  // ticketNumberRegExp: '\\d{1,5}',

  // it needs to match the value for field type. Eg.: 'fix'
  /*
  scopeOverrides: {
    fix: [

      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: '选择你要提交的类型 :',
    scope: '选择一个提交范围（可选）:',
    // used if allowCustomScopes is true
    customScope: '请输入自定义的提交范围 :',
    subject: '填写简短精炼的变更描述 :\n',
    body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
    breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
    footerPrefixsSelect: '选择关联issue前缀（可选）:',
    customFooterPrefixs: '输入自定义issue前缀 :',
    footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
    confirmCommit: '是否提交或修改commit ?',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  // skip any questions you want
  skipQuestions: ['body'],

  // limit subject length
  subjectLimit: 100,
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};
