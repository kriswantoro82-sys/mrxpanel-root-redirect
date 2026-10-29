'use strict';
/** Negative fixtures for API and calculator Article dates. No writes, network or deployment. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const qaFile = path.join(__dirname, 'seo-release-date-review.cjs');
const program = fs.readFileSync(qaFile, 'utf8');
function testWith(fileSuffix, transform) {
  const outputs = [];
  let modified = false;
  const fakeFs = {
    ...fs,
    readFileSync(file, encoding) {
      const body = fs.readFileSync(file, encoding);
      if (fileSuffix && String(file).endsWith(fileSuffix)) {
        const changed = transform(body);
        modified ||= changed !== body;
        return changed;
      }
      return body;
    }
  };
  const proc = {argv: ['node', qaFile, '--mode=review'], exitCode: 0};
  vm.runInNewContext(program, {
    require: name => name === 'node:fs' ? fakeFs : require(name),
    __dirname,
    process: proc,
    console: {
      log: (...args) => outputs.push(args.join(' ')),
      error: (...args) => outputs.push(args.join(' '))
    }
  }, {filename: qaFile});
  return {exitCode: proc.exitCode || 0, output: outputs.join('\n'), modified};
}
function mutateField(html, original, changed) {
  assert.equal(html.split(original).length - 1, 1, 'Expected exactly one JSON-LD date field');
  return html.replace(original, changed);
}
const baseline = testWith(null, x => x);
assert.equal(baseline.exitCode, 0);
assert.match(baseline.output, /ARTICLE=6.*SCHEMA_ONLY=2/);
console.log('PASS baseline 6 Article JSON-LD pages verified');

const api = path.join('api-panel-smm-reseller', 'index.html');
const calculator = path.join('kalkulator-harga-jual-reseller-smm', 'index.html');
const staleApi = testWith(api, html => mutateField(html,
  '"dateModified":"2026-10-24"', '"dateModified":"2026-10-25"'));
assert.ok(staleApi.modified); assert.equal(staleApi.exitCode, 2);
assert.match(staleApi.output, /sitemap predates Article modification/);
console.log('PASS API modified date beyond sitemap lastmod fails closed');

const badCalculator = testWith(calculator, html => mutateField(html,
  '"dateModified":"2026-10-24"', '"dateModified":"2026-13-01"'));
assert.ok(badCalculator.modified); assert.equal(badCalculator.exitCode, 2);
assert.match(badCalculator.output, /invalid dateModified/);
console.log('PASS calculator invalid modified date fails closed');

const reverseApi = testWith(api, html => mutateField(html,
  '"datePublished":"2026-10-24"', '"datePublished":"2026-10-25"'));
assert.ok(reverseApi.modified); assert.equal(reverseApi.exitCode, 2);
assert.match(reverseApi.output, /reversed Article dates/);
console.log('PASS reversed API publication dates fail closed');

console.log('SEO_SCHEMA_ONLY_DATE_NEGATIVE_QA_PASS=4/4');
console.log('FILES_WRITTEN=0 NETWORK_REQUESTS=0 DEPLOYMENTS=0');
