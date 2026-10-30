'use strict';
// Review-only cross-branch integration: combine PR #25 homepage with PR #22's UTM script
// in a disposable file, then run the existing isolated Chromium journey against it.
// Never mutates any branch, repository files, production URL or customer data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const pr22=fs.readFileSync(path.join(root,'index.html'),'utf8');
const canonicalSeoCommit='3923395cba9ea758947963d3a87b5f1414afb4da';
const seo=execFileSync('git',['show',canonicalSeoCommit+':index.html'],{cwd:root,encoding:'utf8'});
const scriptMatch=pr22.match(/  <script id="signup-utm-link-propagation">[\s\S]*?<\/script>\n/);
assert.ok(scriptMatch,'One UTM propagation script expected in PR22');
assert.equal((pr22.match(/id="signup-utm-link-propagation"/g)||[]).length,1);
assert.equal((seo.match(/id="signup-utm-link-propagation"/g)||[]).length,0,'PR25 unexpectedly has same script; re-review');
assert.equal((seo.match(/<a\b[^>]*\bhref="\/signup\/"[^>]*>/g)||[]).length,5,'PR25 signup CTA count changed');
assert.ok(seo.includes('Bagaimana jika email verifikasi pendaftaran tidak diterima?'),'PR25 email FAQ missing');
assert.ok(seo.includes('PT Mrxpanel Media Group'),'PR25 legal identity missing');
const tracker='  <script src="https://mrxpanel-tracker.mrxpanel01.workers.dev/tracker-v1.js" defer></script>';
assert.equal(seo.split(tracker).length,2,'PR25 must have exactly one tracker marker');
assert.equal(pr22.split(tracker).length,2,'PR22 must have exactly one tracker marker');
const merged=seo.replace(tracker,scriptMatch[0]+tracker);
assert.ok(merged.includes('Bagaimana jika email verifikasi pendaftaran tidak diterima?'));
assert.ok(merged.includes('PT Mrxpanel Media Group'));
assert.equal((merged.match(/<a\b[^>]*\bhref="\/signup\/"[^>]*>/g)||[]).length,5);
assert.equal((merged.match(/signup-utm-link-propagation/g)||[]).length,1);
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'mrx-cmo-pr25-pr22-'));
try {
  const file=path.join(folder,'index.html');
  fs.writeFileSync(file,merged,'utf8');
  const run=spawnSync(process.execPath,[path.join(__dirname,'homepage-signup-utm-journey.test.cjs')],{
    cwd:root,encoding:'utf8',timeout:90000,
    env:{...process.env,MRXPANEL_HOME_HTML_PATH:file}
  });
  process.stdout.write(run.stdout||'');
  process.stderr.write(run.stderr||'');
  assert.equal(run.status,0,'Combined PR25+PR22 journey browser test must pass');
  console.log('CMO_SEO_PLUS_UTM_INTEGRATION_PASS=1/1|PR25='+canonicalSeoCommit+'|PRODUCTION_MUTATIONS=0');
} finally { fs.rmSync(folder,{recursive:true,force:true}); }
