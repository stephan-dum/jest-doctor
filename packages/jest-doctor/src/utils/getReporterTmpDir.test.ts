import getReporterTmpDir from './getReporterTmpDir';
import { REPORTER_TMP_DIR } from '../consts';

it('returns empty string if undefined', () => {
  const tmpDir = getReporterTmpDir();
  expect(tmpDir).toEqual('');
});
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
    ['jest-doctor/reporter', { tmpDir: '.fake' }],
  ]);
  expect(tmpDir).toEqual('.fake');
});

it('uses default temp dir with object', () => {
  const tmpDir = getReporterTmpDir(['unknown', ['jest-doctor/reporter', {}]]);
  expect(tmpDir).toEqual(REPORTER_TMP_DIR);
});

it('finds the tmpDir if resolve is used', () => {
  const tmpDir = getReporterTmpDir([
    'unknown',
    ['../../node_modules/jest-doctor/dist/reporter', { tmpDir: '.fake' }],
  ]);
  expect(tmpDir).toEqual('.fake');
});
