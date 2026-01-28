import base from '@dev/eslint/base.js';
import ts from '@dev/eslint/ts.js';
import node from '@dev/eslint/node.js';

export default [
  ...base,
  ...ts,
  ...node,
  {
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
];
