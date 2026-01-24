import type { Reporter } from '@jest/reporters';
import path from 'node:path';
import { mkdirSync, writeFileSync, rmdirSync } from 'node:fs';
import { rm, readdir, readFile } from 'node:fs/promises';
import chalk from 'chalk';
import { REPORTER_TMP_DIR } from './consts';
import type { AggregatedReport } from './types.js';
interface ReporterOptions {
  tmpDir?: string;
  keep?: boolean;
}

interface FinalReport extends AggregatedReport {
  score: number;
}

const isAlive = (pid: number) => {
  try {
    // nodes strange way to check if a process is still running
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
};

const SEVERITY = {
  promises: 200,
  timers: 120,
  fakeTimers: 80,
  console: 10,
  processOutputs: 10,
};

const getFinalReport = (report: AggregatedReport): FinalReport => {
  const promise = report.promises
    ? (1 + Math.log2(report.promises)) * SEVERITY.promises * 2
    : 0;

  const timers = report.timers
    ? (1 + Math.log2(report.timers)) * SEVERITY.timers * 1.5
    : 0;

  const fakeTimers = report.fakeTimers
    ? (1 + Math.log2(report.fakeTimers)) * SEVERITY.fakeTimers * 1.5
    : 0;

  const consoleLeaks = report.console
    ? (1 + Math.log2(report.console)) * SEVERITY.console
    : 0;

  const processOutputs = report.processOutputs
    ? (1 + Math.log2(report.processOutputs)) * SEVERITY.processOutputs
    : 0;

  return {
    ...report,
    score:
      promise +
      timers +
      fakeTimers +
      processOutputs +
      consoleLeaks +
      report.totalDelay,
  };
};

class JestDoctorReporter implements Reporter {
  private readonly tmpDir: string;
  private readonly reportDir: string;
  private readonly pidDir: string;
  private readonly keep: boolean;

  constructor(_: object, options: ReporterOptions) {
    const seed = process.pid.toString();

    this.tmpDir = options.tmpDir || REPORTER_TMP_DIR;
    this.keep = options.keep || false;
    this.reportDir = path.join(this.tmpDir, seed);
    this.pidDir = path.join(this.tmpDir, 'pid');

    rmdirSync(this.reportDir);
    mkdirSync(this.pidDir, { recursive: true });
    mkdirSync(this.reportDir, { recursive: true });

    if (!this.keep) {
      writeFileSync(
        path.join(this.pidDir, process.pid.toString()),
        seed,
        'utf8',
      );
    }
  }

  async onRunComplete() {
    const results: FinalReport[] = [];
    const total = {
      promises: 0,
      timers: 0,
      fakeTimers: 0,
      console: 0,
      processOutputs: 0,
      totalDelay: 0,
    };

    const dir = await readdir(this.reportDir);

    await Promise.all(
      dir.map(async (file) => {
        const content = await readFile(path.join(this.reportDir, file), {
          encoding: 'utf-8',
        });

        try {
          const json = JSON.parse(content) as AggregatedReport;
          total.promises += json.promises;
          total.timers += json.timers;
          total.fakeTimers += json.fakeTimers;
          total.console += json.console;
          total.processOutputs += json.processOutputs;
          total.totalDelay += json.totalDelay;

          results.push(getFinalReport(json));
        } catch (error) {
          throw new Error(`Could not parse ${file} json content:\n${content}`, {
            cause: error,
          });
        }
      }),
    );

    results.sort((a, b) => a.score - b.score);

    for (const report of results) {
      const message = [
        report.promises && `  ${report.promises} open promise(s) found`,
        report.timers && `  ${report.timers} open timer(s) found`,
        report.fakeTimers && `  ${report.fakeTimers} open fake timer(s) found`,
        report.processOutputs &&
          `  ${report.processOutputs} process outputs found`,
        report.console && `  ${report.console} console outputs found`,
        report.totalDelay && `  ${report.totalDelay}ms total delay from timers`,
      ]
        .filter(Boolean)
        .join('\n');

      if (message) {
        console.log(['', chalk.red.bold(report.testPath), message].join('\n'));
      }
    }

    if (results.length) {
      const message = [
        total.promises &&
          `${chalk.bold('Total open promises:')} ${chalk.red(total.promises)}`,
        total.timers &&
          `${chalk.bold('Total open timers:')} ${chalk.red(total.timers)}`,
        total.fakeTimers &&
          `${chalk.bold('Total open fake timers:')} ${chalk.red(total.fakeTimers)}`,
        total.console &&
          `${chalk.bold('Total console outputs:')} ${chalk.red(total.console)}`,
        total.processOutputs &&
          `${chalk.bold('Total process outputs:')} ${chalk.red(total.processOutputs)}`,
        total.totalDelay &&
          `${chalk.bold('Total delay:')} ${chalk.red(total.totalDelay + 'ms')}`,
      ]
        .filter(Boolean)
        .join('\n');

      if (message) {
        console.log('\n' + message + '\n');
      }
    }

    if (!this.keep) {
      await rm(path.join(this.reportDir), {
        recursive: true,
        force: true,
      });

      await rm(path.join(this.pidDir, process.pid.toString()), {
        force: true,
      });
    }

    const pids = await readdir(this.pidDir);

    await Promise.all(
      pids.map(async (pid) => {
        if (!isAlive(Number.parseInt(pid))) {
          const pidFile = path.join(this.pidDir, pid);
          const seed = await readFile(pidFile, 'utf8');

          await rm(path.join(this.tmpDir, seed), {
            recursive: true,
            force: true,
          });

          await rm(pidFile, { force: true });
        }
      }),
    );
  }
}

export default JestDoctorReporter;
