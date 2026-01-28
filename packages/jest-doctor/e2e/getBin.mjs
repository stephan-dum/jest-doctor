import { execSync } from 'node:child_process';

const getBin = (bin, cwd = process.cwd()) => {
  return execSync(`yarn bin ${bin}`, {
    encoding: 'utf8',
    cwd,
  }).trim();
};

export default getBin;
