module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 0,
    'no-multiple-empty-lines': 0,
    'func-names': 0,
    'prefer-arrow-callback': 0,
    'no-console': 0,
    'import/extensions': 0,
    'default-case': 0,
    'no-plusplus': 0,
    'space-before-function-paren': 0,
    'max-len': 0,
    'class-methods-use-this': 0,
    'no-bitwise': 0,
    'operator-linebreak': 0,
    'comma-dangle': 0,
    'object-curly-newline': 0
  },
};
