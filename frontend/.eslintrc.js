module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@angular-eslint/recommended',
    '@angular-eslint/template/process-inline-templates',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    '@angular-eslint',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // Angular rules
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        prefix: 'app',
        style: 'kebab-case',
      },
    ],
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        prefix: 'app',
        style: 'camelCase',
      },
    ],
    '@angular-eslint/no-empty-lifecycle-method': 'error',
    '@angular-eslint/no-output-native': 'error',
    '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
    '@angular-eslint/use-lifecycle-interface': 'error',
    
    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        '@angular-eslint/recommended',
        '@angular-eslint/template/process-inline-templates',
      ],
    },
    {
      files: ['*.html'],
      extends: [
        '@angular-eslint/template/recommended',
        '@angular-eslint/template/accessibility',
      ],
      rules: {
        '@angular-eslint/template/accessibility-alt-text': 'error',
        '@angular-eslint/template/accessibility-elements-content': 'error',
        '@angular-eslint/template/accessibility-label-for': 'error',
        '@angular-eslint/template/accessibility-label-has-associated-control': 'error',
        '@angular-eslint/template/accessibility-list': 'error',
        '@angular-eslint/template/accessibility-valid-aria': 'error',
      },
    },
  ],
};
