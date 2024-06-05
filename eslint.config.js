module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-unused-expressions': 'error',
    'no-undef': 'error',
    'no-console': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'types'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  globals: {
    process: 'readonly',
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
