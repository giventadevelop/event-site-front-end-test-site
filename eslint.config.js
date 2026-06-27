import nextjs from '@next/eslint-plugin-next';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'build/**',
      'dist/**',
      '.task-master/**',
      'scripts/**',
      'TestSprite/**',
      'tasks/**',
      '.cursor/**',
      'code_html_template/**',
      'agent-transcripts/**',
      'src/lib/generated/**/*',
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@next/next': nextjs,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-var': 'warn',
      '@typescript-eslint/no-this-alias': 'off',
      // Add any other rules you want to configure
    }
  }
];