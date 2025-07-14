import antfu from '@antfu/eslint-config'

/** antfu配置 */
export default antfu(
  {
    formatters: true,
    vue: true,
    typescript: true,
    stylistic: true,
    rules: {
      'style/linebreak-style': ['error', 'unix'],
    },
  },
)
