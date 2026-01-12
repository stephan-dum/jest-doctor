import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  {
    files: ['**/*.test.{ts,js}'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: jestPlugin.configs.recommended.rules,
  },
];
