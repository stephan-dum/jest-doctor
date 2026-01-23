import spawn from 'cross-spawn';
import path from 'node:path';
import type { RawOptions } from '../src/types';
import getBin from './getBin';

export interface AssertionResults {
  status: 'failed' | 'passed';
  title: string;
  failureMessages: string;
}
export interface TestResult {
  assertionResults: AssertionResults[];
  message: string;
  status: 'failed' | 'passed';
}
export interface JestJsonResult {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  testResults: TestResult[];
}

const jestDoctorBase = path.dirname(
  require.resolve('jest-doctor/package.json'),
);

const internalEnvs = {
  node: require.resolve(path.join(jestDoctorBase, 'src/env/node.ts')),
  jsdom: require.resolve(path.join(jestDoctorBase, 'src/env/jsdom.ts')),
};

const runJest = (
  testMatch: string,
  options: RawOptions = {},
  testNamePattern: string = '.*',
  environment: string = 'node',
  additionalArgs: string[] = [],
) => {
  const root = path.dirname(__dirname);
  const jestBin = getBin('jest');
  const c8Bin = getBin('c8', root);

  const args: string[] = [
    c8Bin,
    jestBin,
    '--config',
    require.resolve('./jest.env.config.mjs'),
    '--testNamePattern',
    testNamePattern,
    '--testMatch',
    path.join(__dirname, 'fixtures', testMatch),
    ...additionalArgs,
  ];

  return new Promise<string>((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: ['inherit', 'pipe', 'inherit'],
      cwd: path.dirname(__dirname),
      env: {
        ...process.env,
        TEST_ENVIRONMENT:
          internalEnvs[environment as 'node' | 'jsdom'] || environment,
        TEST_ENVIRONMENT_OPTIONS: JSON.stringify(options),
      },
    });

    const stderrBuffer: string[] = [];

    child.stdout?.on('data', (chunk: string | Buffer) => {
      stderrBuffer.push(chunk.toString('utf8'));
    });

    child.on('error', reject);

    child.on('close', () => {
      resolve(stderrBuffer.join(''));
    });

    process.on('SIGINT', () => child.kill('SIGINT'));
  });
};

export const runReporter = (
  testMatch: string,
  options: RawOptions = {},
  testNamePattern: string = '.*',
  testEnvironment = 'node',
) => {
  return runJest(testMatch, options, testNamePattern, testEnvironment, [
    '--reporters="../dist/reporter.js"',
  ]);
};

export const runTest = async (
  testMatch: string,
  options: RawOptions = {},
  testNamePattern: string = '.*',
  environment: string = 'node',
) => {
  const rawJson = await runJest(
    testMatch,
    options,
    testNamePattern,
    environment,
    ['--json', '--silent'],
  );

  try {
    return JSON.parse(rawJson) as JestJsonResult;
  } catch (error) {
    throw new Error('Failed to parse Jest JSON output:\n' + rawJson, {
      cause: error,
    });
  }
};
