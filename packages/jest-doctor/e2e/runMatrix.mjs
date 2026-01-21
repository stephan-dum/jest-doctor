import path from 'node:path';
import { rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import spawn from 'cross-spawn';
import getBin from './getBin.mjs';
import { existsSync } from 'node:fs';

const spawnJest = async (initCWD) => {
  const jestConfig = path.join(process.cwd(), 'jest.e2e.mjs');
  const jestBin = getBin('jest', initCWD);

  await new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      [jestBin, '--config', jestConfig, '--runInBand', process.argv[3]].filter(
        Boolean,
      ),
      {
        stdio: 'inherit',
        cwd: initCWD,
      },
    );

    child.on('error', reject);
    child.on('close', resolve);
  });
};

const startMatrixPackages = () => {
  const rawPackages = execSync('yarn workspaces list --json', {
    encoding: 'utf8',
  })
    .trim()
    .split('\n');

  const childProcesses = [];
  for (const rawPackage of rawPackages) {
    const pkg = JSON.parse(rawPackage);

    if (
      pkg.name?.startsWith('@matrix') &&
      pkg.name?.endsWith(process.argv[2] || '')
    ) {
      console.log(`spawning ${pkg.name}`);
      childProcesses.push(
        spawnJest(path.join(process.env['PROJECT_CWD'], pkg.location)),
      );
    }
  }

  return Promise.all(childProcesses);
};

const main = async () => {
  const tmpDir = path.join(process.cwd(), '.c8_output');
  await rm(tmpDir, { recursive: true, force: true });

  await startMatrixPackages();

  if (existsSync(tmpDir)) {
    execSync('yarn c8 report --reporter json', { stdio: 'inherit' });
  }
};

await main();
