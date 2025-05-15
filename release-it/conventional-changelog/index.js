import fs from 'node:fs'
import ConventionalChangelog from '@release-it/conventional-changelog'

class NewConventionalChangelog extends ConventionalChangelog {
  async writeChangelog() {
    const EOL = '\n'
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
