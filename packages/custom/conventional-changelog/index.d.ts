import type { GetCommitsParams, GetSemverTagsParams, Params } from '@conventional-changelog/git-client'
import type { Config } from 'conventional-changelog-config-spec'
import type conventionalChangelogCore from 'conventional-changelog-core'
import type { Commit } from 'conventional-commits-parser'
import type { Bumper } from 'conventional-recommended-bump'

export interface PluginOptions extends conventionalChangelogCore.Options {
  preset?: {
    name: 'angular' | 'atom' | 'codemirror' | 'ember' | 'eslint' | 'express' | 'jquery' | 'jscs'
  } | {
    name: 'conventionalcommits'
    types: Config.Type.WithSection[]
  }
  tagOpts?: GetSemverTagsParams & Params | string
  commitsOpts?: GetCommitsParams & Params
  whatBump?: false | Parameters<Bumper['bump']>[0]
  /**
   * @description 设置换行符
   * @default os.EOL
   */
  EOL?: '\n' | '\r\n'
  /**
   * @description git工作目录
   * @default process.cwd
   */
  cwd?: string
  /**
   * @description 使用 true 可以忽略推荐的版本更新
   * @default false
   */
  ignoreRecommendedBump?: boolean
  /**
   * @description 使用 true 可以强制严格的 semver
   * @default false
   */
  strictSemVer?: boolean
  /**
   * @description 设置 changelog 写入的文件名。如果文件不存在则创建并写入完整历史。
   * @description 未设置时，changelog 仅用于如 GitHub Releases 的发布说明。
   * @description 设置为 false 可禁用 changelog 写入（仅推荐下个版本号）。
   * @default undefined
   */
  infile?: string | false
  /**
   * @description 设置 changelog 的标题
   * @default '# Changelog'
   */
  header?: string
  /**
   * @default undefined
   */
  context?: conventionalChangelogCore.Context
  /**
   * @default undefined
   */
  gitRawCommitsOpts?: conventionalChangelogCore.GitRawCommitsOptions
  /**
   * @default undefined
   */
  parserOpts?: conventionalChangelogCore.ParserOptions
  /**
   * @default undefined
   */
  writerOpts?: conventionalChangelogCore.WriterOptions<Commit>
}
