import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules', '.yarn', 'dist', 'coverage'] },
  js.configs.recommended,
  prettier,
];
