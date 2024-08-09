/**
 * @type {import('conventional-changelog-core').Options.Config}
 */
export default {
  writerOpts: {
    transform: (oldcommit, context) => {
      const commit = { ...oldcommit };
      let discard = true;
      for (const note of commit.notes) {
        note.title = 'BREAKING CHANGES';
        discard = false;
      }
      switch (commit.type) {
        case 'feat': {
          commit.type = '✨ Features | 新功能';
          break;
        }
        case 'fix': {
          commit.type = '🐛 Bug Fixes | Bug 修复';
          break;
        }
        case 'perf': {
          commit.type = '⚡ Performance Improvements | 性能优化';
          break;
        }
        default: {
          if (discard) {
            return;
          } else if (commit.type === 'revert' || commit.revert) {
            commit.type = '⏪ Reverts | 回退';
          } else {
            switch (commit.type) {
              case 'docs': {
                commit.type = '📝 Documentation | 文档';
                break;
              }
              case 'style': {
                commit.type = '💄 Styles | 风格';
                break;
              }
              case 'refactor': {
                commit.type = '♻ Code Refactoring | 代码重构';
                break;
              }
              case 'test': {
                commit.type = '✅ Tests | 测试';
                break;
              }
              case 'build': {
                commit.type = '👷‍ Build System | 构建';
                break;
              }
              case 'ci': {
                commit.type = '🔧 Continuous Integration | CI 配置';
                break;
              }
              case 'chore': {
                commit.type = '🎫 Chores | 其他更新';
                break;
              }
              // No default
            }
          }
        }
      }
      if (commit.scope === '*') {
        commit.scope = '';
      }
      if (typeof commit.hash === 'string') {
        commit.hash = commit.hash.slice(0, 7);
      }
      const issues = [];
      if (typeof commit.subject === 'string') {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replaceAll(/#(\d+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replaceAll(
            /\B@([\da-z](?:-?[\d/a-z]){0,38})/g,
            (_, username) => {
              if (username.includes('/')) {
                return `@${username}`;
              }
              return `[@${username}](${context.host}/${username})`;
            },
          );
        }
      }
      // remove references that already appear in the subject
      commit.references = commit.references.filter((reference) => {
        if (!issues.includes(reference.issue)) {
          return true;
        }
        return false;
      });
      return commit;
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
  },
};
