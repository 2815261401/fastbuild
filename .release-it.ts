import type changelogCore from 'conventional-changelog-core'
import type { Config } from 'release-it'

export default {
  git: { commitMessage: 'chore(release): 🔖${version}' },
  npm: { publish: false },
  plugins: {
    '@release-it/custom-conventional-changelog': {
      infile: 'CHANGELOG.md',
      preset: {
        name: 'conventionalcommits',
        types: [
          { type: 'feat', section: '✨ Features | 新功能' },
          { type: 'fix', section: '🐛 Bug Fixes | Bug 修复' },
          { type: 'perf', section: '⚡ Performance Improvements | 性能优化' },
          { type: 'revert', section: '⏪ Reverts | 回退' },
          { type: 'chore', section: '🎫 Chores | 其他更新' },
          { type: 'docs', section: '📝 Documentation |文档' },
          { type: 'style', section: '💄 Styles | 风格' },
          { type: 'refactor', section: '♻️ Code Refactoring | 代码重构' },
          { type: 'test', section: '✅ Tests | 测试' },
          { type: 'build', section: '👷‍ Build System | 构建' },
          { type: 'ci', section: '🔧 Continuous Integration | CI 配置' },
        ],
      },
      ignoreRecommendedBump: true,
      strictSemVer: true,
      header: '# 更新日志',
      context: { isPatch: true },
    } as changelogCore.Options.Config,
  },
} satisfies Config
