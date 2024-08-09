/**
 * 在VSCode中安装prettier插件 打开插件配置填写`.prettierrc.js` 将本文件作为其代码格式化规范
 * 在本文件中修改格式化规则，不会同时触发改变ESLint代码检查，所以每次修改本文件需要重启VSCode，ESLint检查才能同步代码格式化
 * 需要相应的代码格式化规范请自行查阅配置，下面为默认项目配置
 */
/** @type {import('prettier').Config} **/
const config = {
  /** 用制表符而不是空格缩进行 */
  useTabs: false,
  /** 指定每个缩进级别的空格数 */
  tabWidth: 2,
  /** 句末使用分号 */
  semi: true,
  /** 使用单引号 */
  singleQuote: true,
  /** jsx 使用双引号 */
  jsxSingleQuote: false,
  /** 尽可能的打印末尾的逗号 */
  trailingComma: 'all',
  /** 打印对象字面量中括号之间的空格 */
  bracketSpacing: true,
  /** 将>放在末尾而不是另起一行 */
  bracketSameLine: false,
  /** 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码 */
  rangeStart: 0,
  rangeEnd: Infinity,
  /** 指定要使用的解析器，不需要写文件开头的 @prettier */
  requirePragma: false,
  /** 使用默认的折行标准 always\never\preserve */
  proseWrap: 'preserve',
  /** 在唯一的箭头函数参数周围包括括号 always：(x) => x \ avoid：x => x */
  arrowParens: 'always',
  /** 如何处理HTML中的空白 */
  htmlWhitespaceSensitivity: 'css',
  /** 使用lf作为换行符 */
  endOfLine: 'lf',
  /** 当对象中的属性被引用时更改 */
  quoteProps: 'as-needed',
  /** 是否缩进Vue文件中<script>和<style>标签内的代码 */
  vueIndentScriptAndStyle: false,
  /** 控制Prettier是否格式化文件中嵌入的引号代码 */
  embeddedLanguageFormatting: 'auto',
  /** 在HTML、Vue和JSX中每行执行一个属性 */
  singleAttributePerLine: true,
  /** 使用三元表达式，在条件后面加上问号，而不是和结果在同一行 */
  experimentalTernaries: false,
  /** jsx中将>放在末尾而不是另起一行 */
  jsxBracketSameLine: false,
};
module.exports = config;
