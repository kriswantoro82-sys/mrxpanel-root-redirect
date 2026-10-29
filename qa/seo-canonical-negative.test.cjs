'use strict';
/** Negative canonical fixtures against the date-gate validator, without file writes or network. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = path.join(__dirname, 'seo-release-date-review.cjs');
const program = fs.readFileSync(source, 'utf8');
const filename = path.join('api-panel-smm-reseller', 'index.html');
const canonical = '<link rel="canonical" href="https://mrxpanel.com/api-panel-smm-reseller/">';

function execute(transform) {
  let changed = false;
  const outputs = [];
  const substitute = {
    ...fs,
    readFileSync(file, encoding) {
      const content = fs.readFileSync(file, encoding);
      if (transform && String(file).endsWith(filename)) {
        const updated = transform(content);
        changed ||= updated !== content;
        return updated;
      }
      return content;
    }
  };
  const processMock = {argv: ['node', source, '--mode=review'], exitCode: 0};
  vm.runInNewContext(program, {
    require: mod => mod === 'node:fs' ? substitute : require(mod),
    __dirname,
    process: processMock,
    console: {
      log: (...args) => outputs.push(args.join(' ')),
      error: (...args) => outputs.push(args.join(' '))
    }
  }, {filename: source});
  return {exit: processMock.exitCode || 0, output: outputs.join('\n'), changed};
}
const baseline = execute(null);
assert.equal(baseline.exit, 0, 'The reviewed seven-page baseline must pass');
assert.match(baseline.output, /SEO_DATE_INTEGRITY_PASS/);
console.log('PASS seven-page canonical baseline');
for (const [name, mutate, error] of [
  ['wrong canonical', x => x.replace(canonical, '<link rel="canonical" href="https://mrxpanel.com/wrong/">'), /canonical does not match sitemap URL/],
  ['duplicate canonical', x => x.replace(canonical, canonical + '\n' + canonical), /missing\/duplicate canonical/],
  ['missing canonical', x => x.replace(canonical, ''), /missing\/duplicate canonical/]
]) {
  const run = execute(x => {
    assert.equal(x.split(canonical).length - 1, 1, 'Expected one original canonical in source');
    return mutate(x);
  });
  assert.ok(run.changed, name + ' fixture must alter HTML in memory');
  assert.equal(run.exit, 2, name + ' must fail closed');
  assert.match(run.output, error, name + ' must fail for the expected reason');
  console.log('PASS ' + name + ' rejected');
}
console.log('SEO_CANONICAL_NEGATIVE_QA_PASS=4/4');
console.log('FILES_WRITTEN=0 NETWORK_REQUESTS=0 DEPLOYMENTS=0');
