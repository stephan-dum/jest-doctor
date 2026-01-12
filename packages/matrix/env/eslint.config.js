import base from '@dev/eslint/base.js';
import ts from '@dev/eslint/ts.js';
import jest from '@dev/eslint/jest.js';
import node from '@dev/eslint/node.js';

export default [
  ...base,
  ...ts,
  ...jest,
  ...node,
];
