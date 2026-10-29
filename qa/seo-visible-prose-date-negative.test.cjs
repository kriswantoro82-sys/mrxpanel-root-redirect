'use strict';
/** Negative regression cases for date labels, fully in-memory. No file writes/network. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const qaFile = path.join(__dirname, 'seo-release-date-review.cjs');
const qaScript = fs.readFileSync(qaFile, 'utf8');
const targetSuffix = path.join('apa-itu-panel-smm', 'index.html');
const originalDate = 'Diterbitkan 22 Oktober 2026; diperbarui 24 Oktober 2026';

function executeWithHtmlTransform(transform) {
  let replaced = false;
  const output = [];
  const fakeFs = {
    ...fs,
    readFileSync(file, encoding) {
      const data = fs.readFileSync(file, encoding);
      if (String(file).endsWith(targetSuffix)) {
        const updated = transform(data);
        if (updated !== data) replaced = true;
        return updated;
      }
      return data;
    },
  };
  const proc = {argv: ['node', qaFile, '--mode=review'], exitCode: 0};
  const context = {
    require: (name) => name === 'node:fs' ? fakeFs : require(name),
    __dirname: __dirname,
    console: {
      log: (...args) => output.push(args.join(' ')),
      error: (...args) => output.push(args.join(' ')),
    },
    process: proc,
  };
  vm.runInNewContext(qaScript, context, {filename:qaFile});
  return {exitCode: proc.exitCode || 0, output: output.join('\n'), replaced};
}
const baseline = executeWithHtmlTransform(x => x);
assert.equal(baseline.exitCode, 0, 'Current Draft must pass static review');
assert.match(baseline.output, /PROSE_DATES=1/);
console.log('PASS baseline draft dates consistent, including prose');

const stale = executeWithHtmlTransform(x => {
  assert.equal(x.split(originalDate).length - 1, 1, 'Exact source prose fixture');
  return x.replace(originalDate,
    'Diterbitkan 22 Oktober 2026; diperbarui 23 Oktober 2026');
});
assert.ok(stale.replaced, 'Stale date fixture must actually change in memory');
assert.equal(stale.exitCode, 2, 'Stale user-visible prose must fail closed');
assert.match(stale.output, /visible Indonesian prose date disagrees with Article schema/);
console.log('PASS stale visible Indonesian prose fails closed');

const missing = executeWithHtmlTransform(x => {
  assert.ok(x.includes(originalDate), 'Current source must have visible date');
  return x.replace(originalDate, '');
});
assert.ok(missing.replaced);
assert.equal(missing.exitCode, 2, 'Missing visible prose must fail closed');
assert.match(missing.output, /visible Indonesian prose date disagrees with Article schema/);
console.log('PASS missing visible prose fails closed');

console.log('SEO_VISIBLE_PROSE_DATE_NEGATIVE_QA_PASS=3/3');
console.log('FILES_WRITTEN=0 NETWORK_REQUESTS=0 DEPLOYMENTS=0');
