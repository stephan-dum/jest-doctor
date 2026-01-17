import { REPORTER_TMP_DIR } from '../consts';

type Reporters = Array<string | [string, Record<string, unknown>]>;

const test = (reporter: string) =>
  /jest-doctor[\\/]dist[\\/]reporter/.test(reporter) ||
  reporter === 'jest-doctor/reporter';

const getReporterTmpDir = (reporters?: Reporters) => {
  if (!reporters) {
    return '';
  }

  for (const reporter of reporters) {
    if (Array.isArray(reporter)) {
      if (test(reporter[0])) {
        return (reporter[1].tmpDir as string) || REPORTER_TMP_DIR;
      }
    } else if (test(reporter)) {
      return REPORTER_TMP_DIR;
    }
  }

  return '';
};

export default getReporterTmpDir;
