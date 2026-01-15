const replacer = (pathname) => {
  return pathname
    .replace(/jest-doctor([/\\])src/, `jest-doctor$1dist`)
    .replace(/\.cts$/, '.cjs');
};
const coverageRemapper = (coverage) => {
  for (const [key, report] of Object.entries(coverage)) {
    coverage[replacer(key)] = report;
    report.data.path = replacer(report.data.path);
    delete coverage[key];
  }

  return coverage;
};

module.exports = coverageRemapper;
