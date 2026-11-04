import jestPlugin from 'eslint-plugin-jest';

export default [
  {
    files: ['**/*.test.{ts,js}'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/expect-expect': 'off',
    },
  },
];
