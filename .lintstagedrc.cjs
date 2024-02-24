module.exports = {
  '*.{js,ts}': ['eslint --fix', 'eslint'],
  '**/*.ts': () => 'npm run typecheck  --if-present',
  '*.{json,yaml,js,ts}': ['prettier --write'],
};
