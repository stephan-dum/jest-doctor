const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ReportBase } = require('istanbul-lib-report');

const OUTPUT_DIR = '.nyc_output';

class RawNycReporter extends ReportBase {
  constructor(options = {}) {
    super(options);

    this.outputDir = options.outputDir || OUTPUT_DIR;
    this.filename = options.filename || crypto.randomUUID() + '.json';
    this.remapper = options.remapper || ((coverage) => coverage);
  }
  onStart() {}

  execute(context) {
    const coverageMap = context._summarizerFactory._coverageMap;

    if (!coverageMap) {
      return;
    }

    const outDir = path.resolve(this.outputDir);
    fs.mkdirSync(outDir, { recursive: true });

    const file = path.join(outDir, `${this.filename}`);
    fs.writeFileSync(file, JSON.stringify(this.remapper(coverageMap.toJSON())));
  }
}

module.exports = RawNycReporter;
