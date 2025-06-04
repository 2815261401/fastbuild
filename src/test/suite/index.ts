import path from 'node:path'
import glob from 'glob'
import Mocha from 'mocha'

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((c, e) => {
    const testFiles = new glob.Glob('**/**.test.js', { cwd: testsRoot })
    const testFileStream = testFiles.stream()

    testFileStream.on('data', (file) => {
      mocha.addFile(path.resolve(testsRoot, file))
    })
    testFileStream.on('error', (err) => {
      e(err)
    })
    testFileStream.on('end', () => {
      try {
        // Run the mocha test
        mocha.run((failures: number) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`))
          }
          else {
            c()
          }
        })
      }
      catch (err) {
        e(err)
      }
    })
  })
}
