module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'linebreak-style': ['error', 'unix'], // 换行符强制使用lf
    semi: ['error', 'always'], // 强制使用分号结尾
    quotes: ['error', 'single', 'avoid-escape'], // 要求统一使用单引号符号
    camelcase: ['error', { properties: 'never' }], // 要求使用骆驼拼写法命名约定
    'no-console': 'warn', // 禁止出现console
    'no-debugger': 'warn', // 禁止出现debugger
    'no-duplicate-case': 'error', // 禁止出现重复case
    'no-empty': 'error', // 禁止出现空语句块
    'no-extra-parens': ['error', 'all', { ignoreJSX: 'all', nestedBinaryExpressions: false }], // 禁止不必要的括号
    'no-func-assign': 'error', // 禁止对Function声明重新赋值
    'no-unreachable': 'error', // 禁止出现[return|throw]之后的代码块
    'no-else-return': 'error', // 禁止if语句中return语句之后有else块
    'no-empty-function': ['error', { allow: ['constructors'] }], // 禁止出现空的函数块
    'no-lone-blocks': 'error', // 禁用不必要的嵌套块
    'no-multi-spaces': 'error', // 禁止使用多个空格
    'no-redeclare': 'error', // 禁止多次声明同一变量
    'no-return-assign': 'error', // 禁止在return语句中使用赋值语句
    'no-return-await': 'error', // 禁用不必要的[return/await]
    'no-self-compare': 'error', // 禁止自身比较表达式
    'no-useless-catch': 'error', // 禁止不必要的catch子句
    'no-useless-return': 'error', // 禁止不必要的return语句
    'no-mixed-spaces-and-tabs': 'error', // 禁止空格和tab的混合缩进
    'no-multiple-empty-lines': 'error', // 禁止出现多行空行
    'no-trailing-spaces': 'error', // 禁止一行结束后面不要有空格
    'no-useless-call': 'error', // 禁止不必要的.call()和.apply()
    'no-var': 'error', // 禁止出现var用let和const代替
    'no-delete-var': 'off', // 允许出现delete变量的使用
    'no-shadow': 'off', // 允许变量声明与外层作用域的变量同名
    'space-unary-ops': 'error', // 要求在一元操作符前后使用一致的空格
    'space-before-blocks': 'error', // 要求在块之前使用一致的空格
    'space-in-parens': 'error', // 要求在圆括号内使用一致的空格
    'space-infix-ops': 'error', // 要求操作符周围有空格
    'switch-colon-spacing': 'error', // 要求在switch的冒号左右有空格
    'arrow-spacing': 'error', // 要求箭头函数的箭头前后使用一致的空格
    'array-bracket-spacing': 'error', // 要求数组方括号中使用一致的空格
    'brace-style': 'error', // 要求在代码块中使用一致的大括号风格
    curly: 'error', // 要求所有控制语句使用一致的括号风格
    'dot-notation': 'error', // 要求尽可能地使用点号
    'default-case': 'error', // 要求switch语句中有default分支
    eqeqeq: 'error', // 要求使用 === 和 !==
    'no-duplicate-imports': 'error', // 禁止分开 import
  },
  ignorePatterns: ['dist', 'out', '**/*.d.ts', 'node_modules', 'webpack.config.js', 'public'],
};
