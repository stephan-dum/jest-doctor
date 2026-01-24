import { vol, fs as memfs } from 'memfs';
import JestDoctorReporter from './reporter';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { REPORTER_TMP_DIR } from './consts';
import { existsSync } from 'node:fs';
jest.mock('node:fs', () => memfs);
jest.mock('node:fs/promises', () => memfs.promises);

const consoleSpy = jest.spyOn(console, 'log');

beforeEach(() => {
  consoleSpy.mockClear();
  vol.reset();
});

const report = {
  testPath: 'test-file-name.ts',
  promises: 0,
  timers: 0,
  fakeTimers: 0,
  console: 0,
  totalDelay: 0,
  processOutputs: 0,
};

const seed = process.pid.toString();
const pidFile = path.join(REPORTER_TMP_DIR, 'pid', process.pid.toString());
const tmpDir = path.join(REPORTER_TMP_DIR, seed.toString());

describe('reporter', () => {
  it('creates tmp folder and removes it', async () => {
    const reporter = new JestDoctorReporter({ seed }, {});

    expect(await readFile(pidFile, 'utf8')).toEqual(seed.toString());
    expect(existsSync(tmpDir)).toEqual(true);

    vol.fromJSON({
      [`./.tmp/${seed}/some_test.json`]: JSON.stringify({
        ...report,
        promises: 1,
        timers: 1,
        fakeTimers: 1,
        console: 1,
        totalDelay: 10,
        processOutputs: 1,
      }),
    });

    await reporter.onRunComplete();

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(existsSync(pidFile)).toEqual(false);
    expect(existsSync(tmpDir)).toEqual(false);
  });

  it('doesnt create pid and doesnt delete folder if keep is set to true', async () => {
    const reporter = new JestDoctorReporter({ seed }, { keep: true });

    expect(existsSync(pidFile)).toEqual(false);

    vol.fromJSON({
      [`./.tmp/${seed}/some_test.json`]: JSON.stringify(report),
    });

    await reporter.onRunComplete();

    expect(consoleSpy).toHaveBeenCalledTimes(0);
    expect(existsSync(tmpDir)).toEqual(true);
  });

  it('throws if some file is corrupted', async () => {
    const reporter = new JestDoctorReporter({ seed }, {});

    vol.fromJSON({
      [`./.tmp/${seed}/some_test.json`]: 'CORRUPTED',
    });

    await expect(reporter.onRunComplete()).rejects.toThrow('Could not parse');
  });

  describe('deletion', () => {
    const testDeletion = async (
      expected: boolean,
      mockKill: jest.SpyInstance,
    ) => {
      const otherSeed = 555;
      const pid = 1;
      const othersPidFile = `./.tmp/pid/${pid}`;
      const othersTmpFile = `./.tmp/${otherSeed}/some_test.json`;

      vol.fromJSON({
        [othersPidFile]: otherSeed.toString(),
        [othersTmpFile]: JSON.stringify({}),
      });

      const reporter = new JestDoctorReporter({ seed }, {});
      await reporter.onRunComplete();

      console.log(vol.toJSON());

      expect(existsSync(othersPidFile)).toEqual(expected);
      expect(existsSync(othersTmpFile)).toEqual(expected);

      expect(mockKill).toHaveBeenCalledWith(pid, 0);
      mockKill.mockRestore();
    };

    it('clear left over directories from previous runs', async () => {
      const mockKill = jest.spyOn(process, 'kill').mockImplementation(() => {
        const error = new Error('ESRCH') as NodeJS.ErrnoException;
        error.code = 'ESRCH';
        throw error;
      });

      await testDeletion(false, mockKill);
    });

    it('doesnt clear if a process is still existing', async () => {
      const mockKill = jest
        .spyOn(process, 'kill')
        .mockImplementation(() => true);

      await testDeletion(true, mockKill);
    });
  });
});
