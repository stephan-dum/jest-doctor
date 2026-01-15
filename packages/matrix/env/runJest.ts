import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
const { resolve } = createRequire(import.meta.url);
import type { RawOptions } from 'jest-doctor';

interface AssertionResults {
  status: 'failed' | 'passed';
  title: string;
}
interface TestResults29 {
  assertionResults: AssertionResults[];
  message: string;
  status: 'failed' | 'passed';
}
interface JestJsonResult {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  testResults: TestResults29[];
}

const getBin = (bin: string, cwd: string = process.cwd()) => {
  return execSync(`yarn bin ${bin}`, {
    encoding: 'utf8',
    cwd,
  }).trim();
};

const runJest = (
  testMatch: string,
  options: RawOptions = {},
  testNamePattern: string = '.*',
  environment: string = 'jest-doctor/env/node',
) => {
  const jestBin = getBin('jest');
  const nycBin = getBin('nyc', import.meta.dirname);

  const args: string[] = [
    nycBin,
    '--nycrc-path=nyc.coverage.js',
    jestBin,
    '--config',
    resolve('./jest.env.config.js'),
    '--json',
    '--silent',
    '--testNamePattern',
    testNamePattern,
    '--testEnvironmentOptions',
    JSON.stringify(options),
    '--testMatch',
    path.join(import.meta.dirname, 'suits', testMatch),
  ];

  return new Promise<JestJsonResult>((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: ['inherit', 'pipe', 'inherit'],
      cwd: import.meta.dirname,
      env: {
        ...process.env,
        TEST_ENVIRONMENT: environment,
      },
    });

    const stderrBuffer: string[] = [];

    child.stdout.on('data', (chunk: string | Buffer) => {
      stderrBuffer.push(chunk.toString('utf8'));
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', () => {
      const rawJson = stderrBuffer.join('');
      try {
        const json = JSON.parse(rawJson) as JestJsonResult;
        resolve(json);
      } catch (error) {
        reject(
          new Error('Failed to parse Jest JSON output:\n' + rawJson, {
            cause: error,
          }),
        );
      }
    });

    process.on('SIGINT', () => child.kill('SIGINT'));
  });
};

export default runJest;
