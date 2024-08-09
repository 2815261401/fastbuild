module.exports = {
  '*.{ts,cts,mts}': ['eslint --fix'],
  '*.{md,cjs}': ['prettier --write'],
  '{!(package)*.json,*.code-snippets,.!({browserslist,nvm,npm})*rc}': [
    'prettier --write--parser json',
  ],
  'package.json': ['prettier --write'],
};
