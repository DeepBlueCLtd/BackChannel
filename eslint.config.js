import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        MouseEvent: 'readonly',
        HTMLInputElement: 'readonly',
        URL: 'readonly',
        Blob: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'prettier': prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'react/react-in-jsx-scope': 'off',
      'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
      'semi': ['error', 'never']
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  prettierConfig
];
