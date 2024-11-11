import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import eslintPluginReact from 'eslint-plugin-react'

const compat = new FlatCompat()

export default [
  {
    ignores: ['**/{node_modules,dist,out,.gitignore}/**']
  },
  js.configs.recommended,
  ...compat.extends(
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ),
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      ...eslintPluginReact.configs.flat.recommended,
      ...eslintPluginReact.configs.flat['jsx-runtime']
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ['src/renderer/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/prop-types': 'off'
    }
  }
  // extends: [
  //   'eslint:recommended',
  //   'plugin:react/recommended',
  //   'plugin:react/jsx-runtime',
  //   '@electron-toolkit/eslint-config-ts/recommended',
  //   '@electron-toolkit/eslint-config-prettier'
  // ],
  // overrides: [
  //   {
  //     files: ['src/renderer/src/components/**/*.ts'],
  //     rules: {
  //       'react/prop-types': 'off'
  //     }
  //   }
  // ]
]
