import { createRequire } from 'node:module';
import path from 'node:path';

const { resolve } = createRequire(import.meta.url);

const config = {
  cwd: path.dirname(resolve('jest-doctor/package.json')),
  'temp-directory': path.join(import.meta.dirname, '.nyc_output/all'),
  'report-dir': path.join(import.meta.dirname, 'coverage'),
  reporter: ['text', 'html'],
  clean: false,
  extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.cts'],
};

export default config;
