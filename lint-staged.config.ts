import type { Configuration } from 'lint-staged'

export default {
  '*': ['eslint --fix'],
  '*.{css,scss,less,styl,html,vue}': ['stylelint --fix'],
} satisfies Configuration
