/** @type {import('@commitlint/types').UserConfig} **/
module.exports = {
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    'header-max-length': [2, 'always', 100],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      header: {
        description: '请输入提交头(必填)(格式: <type>(<scope>): (:gitmoji:) <subject>)',
      },
      type: {
        description: '请选择提交类型(必填)',
        enum: {
          feat: {
            description: '引入新特性',
            title: '添加功能',
          },
          fix: {
            description: '修复 Bug',
            title: '错误修复',
          },
          docs: {
            description: '添加或者更新文档',
            title: '文档变更',
          },
          style: {
            description: '不会影响代码含义的更改（空格，格式，缺少分号等）',
            title: '格式调整',
          },
          refactor: {
            description: '既不是修复 Bug 也不是添加特性的代码更改',
            title: '代码重构',
          },
          perf: {
            description: '更改代码以提高性能',
            title: '性能优化',
          },
          test: {
            description: '添加或者更新测试',
            title: '更新测试',
          },
          build: {
            description: '影响构建系统或外部依赖项的更改（示例作用域: gulp, broccoli, npm）',
            title: '依赖调整',
          },
          ci: {
            description:
              '对 CI 配置文件和脚本的更改（示例作用域: Travis, Circle, BrowserStack, SauceLabs）',
            title: '脚本变更',
          },
          chore: {
            description: '其他不会修改源文件或者测试文件的更改',
            title: '杂务处理',
          },
          revert: {
            description: '恢复到上一个版本',
            title: '恢复版本',
          },
        },
      },
      scope: {
        description: '请输入文件修改范围(可选)(例如组件或文件名)',
      },
      subject: {
        description: '请简要描述提交(必填)',
      },
      body: {
        description: '请输入详细描述(可选)',
      },
      footer: {
        description: '请输入注脚(可选)',
      },
      breaking: {
        description: '列出任何BREAKING CHANGES(可选)',
      },
      issues: {
        description: '请输入受影响的issue(可选)(例如:“#123”，“#123,#456”。)',
      },
    },
  },
};
