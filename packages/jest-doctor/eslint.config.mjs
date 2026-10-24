import base from '@dev/eslint/base.js';
import ts from '@dev/eslint/ts.js';
import node from '@dev/eslint/node.js';
import jest from '@dev/eslint/jest.js';

export default [
  ...base,
  ...ts,
  ...node,
  ...jest,
  {
    rules: {
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
];
