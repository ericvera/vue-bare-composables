// @ts-check
import eslint from '@eslint/js'
import eslintPluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default defineConfig(
  eslint.configs.recommended,

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  ...eslintPluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.eslint.json', './tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        window: 'readonly',
      },
    },
  },

  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '.cursor',
    '.github',
    '.husky',
    '.vscode',
    '.yarn',
  ]),

  // Other configs
  {
    name: 'local:rules',
    rules: {
      curly: 'error',
      'vue/multi-word-component-names': 0,
      'vue/max-attributes-per-line': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],

      // Prettier enforces self-closing elements while this rule shows it as a
      // warning.
      // Fix Ref: https://github.com/vuejs/eslint-plugin-vue/issues/2232#issuecomment-1625723163
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any',
          },
        },
      ],

      // Enforce comments above code, never inline
      'line-comment-position': ['error', { position: 'above' }],

      // Enforce max length for comments only
      'max-len': [
        'error',
        {
          // Effectively unlimited for code (prettier takes care of this)
          code: 999,
          // Max 80 characters for comments only
          comments: 80,
          ignoreUrls: true,
        },
      ],
    },
  },
  // Rule to block describe wrappers in test files
  {
    name: 'local:test-rules',
    files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
    rules: {
      // Block usage of describe wrappers in test files
      'no-restricted-globals': [
        'error',
        {
          name: 'describe',
          message:
            'Use flat test structure with it() methods only. Do not use describe wrappers.',
        },
      ],
      // Allow multiple components in test files
      'vue/one-component-per-file': 'off',
    },
  },
)
