module.exports = (async () => {
  const config = await import('./public/.cz-config.cjs');
  return {
    parserPreset: {
      parserOpts: {
        headerPattern: /^(?<type>.*\s\w*)(?:\((?<scope>.*)\))?!?:\s(?<subject>(?:(?!#).)*(?:(?!\s).))$/,
        headerCorrespondence: ['type', 'scope', 'subject'],
      },
    },
    rules: {
      'body-leading-blank': [1, 'always'],
      'body-max-line-length': [2, 'always', 100],
      'footer-leading-blank': [1, 'always'],
      'footer-max-line-length': [2, 'always', 100],
      'header-max-length': [2, 'always', 100],
      'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
      'subject-empty': [2, 'never'],
      'subject-full-stop': [2, 'never', '.'],
      'type-case': [2, 'always', 'lower-case'],
      'type-empty': [2, 'never'],
      'type-enum': [2, 'always', config.typeEnum],
    },
    prompt: {
      questions: {
        type: {
          description: '选择您要提交的变更类型',
          enum: config.type,
        },
        scope: {
          description: '这个更改的范围是什么(例如组件或文件名)',
        },
        subject: {
          description: '写一个简短的，祈使时态的变化描述',
        },
        body: {
          description: '提供更长的变更描述',
        },
        isBreaking: {
          description: '有什么突破性的变化吗?',
        },
        breakingBody: {
          description: '一个破坏性变更提交需要一个主体。请输入更长的提交描述',
        },
        breaking: {
          description: '描述突破性的变化',
        },
        isIssueAffected: {
          description: '这一变化是否会影响任何悬而未决的问题?',
        },
        issuesBody: {
          description: '如果问题已关闭，则提交需要一个主体。请输入更长的提交描述',
        },
        issues: {
          description: '添加问题引用(例如:“fix #123”，“re #123”。)',
        },
      },
    },
  };
})();
