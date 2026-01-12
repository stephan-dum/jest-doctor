import path from 'node:path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const jestMatrix = require(path.join(process.env.INIT_CWD, 'package.json'));

const config = {
  cwd: path.dirname(require.resolve('jest-doctor/package.json')),
  'temp-dir': path.join(
    import.meta.dirname,
    '.nyc_output',
    jestMatrix.devDependencies.jest,
  ),
  instrument: true,
  cache: true,
  clean: false,
  silent: true,
  reporter: [],
  exclude: ['**/node_modules/**'],
};

export default config;
