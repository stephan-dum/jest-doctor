import getReporterTmpDir from './getReporterTmpDir.cjs';
import { REPORTER_TMP_DIR } from '../consts.cjs';

it('returns empty string if not found', () => {
  const tmpDir = getReporterTmpDir(['unknown']);
  expect(tmpDir).toEqual('');
});

it('uses default dir if not specified', () => {
  const tmpDir = getReporterTmpDir(['unknown', 'jest-doctor/reporter']);
  expect(tmpDir).toEqual(REPORTER_TMP_DIR);
});

it('finds the tmpDir', () => {
  const tmpDir = getReporterTmpDir([
    'unknown',
    ['jest-doctor/reporter', { tmpDir: '.tmp' }],
  ]);
  expect(tmpDir).toEqual('.tmp');
});

it('finds the tmpDir if resolve is used', () => {
  const tmpDir = getReporterTmpDir([
    'unknown',
    ['../../node_modules/jest-doctor/reporter', { tmpDir: '.tmp' }],
  ]);
  expect(tmpDir).toEqual('.tmp');
});
