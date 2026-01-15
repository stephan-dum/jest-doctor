import { Reporter, Test, TestResult } from '@jest/reporters';
import { REPORTER_TMP_DIR } from './consts.cjs';
import path from 'node:path';
import { rmSync } from 'node:fs';

/*const fs = require('fs');
const path = require('path');


const jestDoctorPath = path.join(os.tmpdir(), 'jest-doctor');

try {
  fs.rmSync(jestDoctorPath, { recursive: true, force: true });
  console.log('jest-doctor folder deleted.');
} catch (e) {
  console.error('Delete failed:', e);
}*/

interface ReporterOptions {
  tmpDir?: string;
}

class JestDoctorReporter implements Reporter {
  private tmpDir: string;
  private seed: string;
  constructor(globalConfig: { seed: string }, options: ReporterOptions) {
    this.tmpDir = options.tmpDir || REPORTER_TMP_DIR;
    this.seed = globalConfig.seed;
  }

  onTestResult(test: Test, testResult: TestResult) {
    console.log(test, testResult);
  }

  onRunComplete() {
    const pathname = path.join(this.tmpDir, this.seed);
    rmSync(pathname, { recursive: true, force: true });
  }
}

export default JestDoctorReporter;
