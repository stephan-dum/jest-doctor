import { REPORTER_TMP_DIR } from '../consts.cjs';

type Reporters = Array<string | [string, Record<string, unknown>]>;
const getReporterTmpDir = (reporters: Reporters) => {
  for (const reporter of reporters) {
    if (Array.isArray(reporter)) {
      if (reporter[0].includes('jest-doctor/reporter')) {
        return reporter[1].tmpDir as string;
      }
    }

    if (reporter.includes('jest-doctor/reporter')) {
      return REPORTER_TMP_DIR;
    }
  }

  return '';
};

export default getReporterTmpDir;
