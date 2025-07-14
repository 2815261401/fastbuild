import fs from 'node:fs'
import { EOL as SysEOL } from 'node:os'

import ConventionalChangelog from '@release-it/conventional-changelog'
import { ConventionalChangelog as ConventionalChangelogCore } from 'conventional-changelog'

class NewConventionalChangelog extends ConventionalChangelog {
  getChangelogStream(rawOptions = {}) {
    const { version } = this.getContext()
    const { isIncrement } = this.config
    const { latestTag, secondLatestTag, tagTemplate } = this.config.getContext()
    const currentTag = isIncrement ? (tagTemplate ? tagTemplate.replace(`\${version}`, version) : null) : latestTag
    const previousTag = isIncrement ? latestTag : secondLatestTag
    const releaseCount = rawOptions.releaseCount === 0 ? 0 : isIncrement ? 1 : 2
    const debug = this.config.isDebug ? this.debug : null
    const mergedOptions = Object.assign({}, { releaseCount }, this.options)

    const { context, gitRawCommitsOpts, parserOpts, writerOpts, ...options } = mergedOptions

    const mergedContext = Object.assign({ version, previousTag, currentTag }, context)
    const mergedGitRawCommitsOpts = Object.assign({ debug, from: previousTag }, gitRawCommitsOpts)

    this.debug('conventionalChangelog', {
      options,
      context: mergedContext,
      gitRawCommitsOpts: mergedGitRawCommitsOpts,
      parserOpts,
      writerOpts,
    })

    return new ConventionalChangelogCore(options.cwd)
      .readPackage()
      .loadPreset(options.preset)
      .options(options)
      .context(mergedContext)
      .commits(mergedGitRawCommitsOpts, parserOpts)
      .writer(writerOpts)
      .writeStream()
  }

  async writeChangelog() {
    const EOL = this.options.EOL ?? SysEOL
    const { infile, header: _header = '# Changelog' } = this.options
    let { changelog } = this.config.getContext()
    const header = _header.split(/\r\n|\r|\n/g).join(EOL)

    let hasInfile = false
    try {
      fs.accessSync(infile)
      hasInfile = true
    }
    catch (err) {
      this.debug(err)
    }

    let previousChangelog = ''
    try {
      previousChangelog = await this.getPreviousChangelog()
      previousChangelog = previousChangelog.replace(header, '')
    }
    catch (err) {
      this.debug(err)
    }

    if (!hasInfile) {
      changelog = await this.generateChangelog({ releaseCount: 0 })
      this.debug({ changelog })
    }

    fs.writeFileSync(
      infile,
      header
      + (changelog ? EOL + EOL + changelog.trim() : '')
      + (previousChangelog ? EOL + EOL + previousChangelog.trim() : '')
      + EOL,
    )

    if (!hasInfile) {
      await this.exec(`git add ${infile}`)
    }
  }
}
export default NewConventionalChangelog
