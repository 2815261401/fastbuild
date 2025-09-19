import type { PluginOptions } from '@custom/conventional-changelog'
import type { Config } from 'release-it'

import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { assign } from 'radashi'

/** 包名 */
const packageName = process.env.npm_package_name
/** 当前工作目录 */
const current = path.join(process.cwd())
/** 根目录 */
const root = path.join(import.meta.dirname)
/** 根目录 package.json */
const packageJsonPath = path.join(root, 'package.json')
/** 主包的名称 */
const { name } = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
/** 标签名称 */
const tagName = packageName === name ? `\${version}` : `${packageName}@\${version}`
/** 相对路径 */
const relative = path.relative(root, current)

export default assign({
  git: {
    tagName,
    commitMessage: `chore(release): 🔖${tagName}`,
  },
  npm: { publish: false },
  plugins: {
    '@custom/conventional-changelog': {
      preset: {
        name: 'conventionalcommits',
        types: [
          { type: 'feat', section: '✨ Features | 新功能' },
          { type: 'fix', section: '🐛 Bug Fixes | Bug 修复' },
          { type: 'docs', section: '📝 Documentation |文档' },
          { type: 'style', section: '💄 Styles | 风格' },
          { type: 'refactor', section: '♻️ Code Refactoring | 代码重构' },
          { type: 'perf', section: '⚡ Performance Improvements | 性能优化' },
          { type: 'test', section: '✅ Tests | 测试' },
          { type: 'build', section: '👷‍ Build System | 构建' },
          { type: 'ci', section: '🔧 Continuous Integration | CI 配置' },
          { type: 'chore', section: '🎫 Chores | 其他更新' },
          { type: 'revert', section: '⏪ Reverts | 回退' },
        ],
      },
      EOL: '\n',
      cwd: root,
      ignoreRecommendedBump: true,
      strictSemVer: true,
      infile: 'CHANGELOG.md',
      header: '# 更新日志',
      context: { isPatch: true },
      gitRawCommitsOpts: relative
        ? {
            path: relative,
            /** 当前版本 */
            from: process.env.npm_package_version,
          }
        : void 0,
    } as PluginOptions,
  },
} satisfies Config, {})
