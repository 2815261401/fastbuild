import antfu from '@antfu/eslint-config'

/** antfu配置 */
export default antfu(
  {
    formatters: true,
    typescript: true,
    rules: {
      'style/linebreak-style': ['error', 'unix'],
    },
  },
  {
    files: ['.release-it.ts'],
    rules: { 'no-template-curly-in-string': 'off' },
  },
)
