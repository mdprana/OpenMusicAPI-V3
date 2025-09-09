module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'max-len': ['error', { code: 120 }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'consistent-return': 'off',
    'linebreak-style': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
  },
};
