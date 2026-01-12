import base from '@dev/eslint/base.js';
import ts from '@dev/eslint/ts.js';

export default [
  ...base,
  ...ts,
  {
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
];
