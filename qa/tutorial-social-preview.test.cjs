'use strict';
// Static, offline review guard for the beginner tutorial's social preview.
// Does not fetch network data, use credentials, or modify the website.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.resolve(__dirname, '..', 'cara-menggunakan-panel-smm', 'index.html'),
  'utf8'
);
const expectedUrl = 'https://mrxpanel.com/cara-menggunakan-panel-smm/';
function unique(pattern, label) {
  const matches = [...source.matchAll(pattern)].map(x => x[1]);
  assert.equal(matches.length, 1, label + ' must occur exactly once');
  assert.ok(matches[0].trim(), label + ' must be nonempty');
  return matches[0];
}
const title = unique(/<title>([^<]*)<\/title>/gi, 'page title');
const description = unique(/<meta\s+name="description"\s+content="([^"]+)"/gi,'meta description');
const canonical = unique(/<link\s+rel="canonical"\s+href="([^"]+)"/gi, 'canonical URL');
const ogTitle = unique(/<meta\s+property="og:title"\s+content="([^"]+)"/gi, 'Open Graph title');
const ogDescription = unique(/<meta\s+property="og:description"\s+content="([^"]+)"/gi, 'Open Graph description');
const ogUrl = unique(/<meta\s+property="og:url"\s+content="([^"]+)"/gi, 'Open Graph URL');
const ogType = unique(/<meta\s+property="og:type"\s+content="([^"]+)"/gi, 'Open Graph type');
const robots = unique(/<meta\s+name="robots"\s+content="([^"]+)"/gi, 'robots');
assert.equal(title, ogTitle, 'social title differs from on-page title');
assert.equal(description, ogDescription, 'social description differs from search meta description');
assert.equal(canonical, expectedUrl, 'unexpected canonical');
assert.equal(ogUrl, expectedUrl, 'social URL differs from canonical');
assert.equal(ogType, 'article');
assert.equal(robots, 'index,follow');
assert.match(source, /<html\s+lang="id"/);
assert.match(source, /<h1\b[^>]*>Cara Menggunakan Panel SMM: Panduan Pemula<\/h1>/);
assert.ok(description.length >= 70 && description.length <= 165, 'description length outside review range');
// An OG image/Twitter summary card is not part of this proposed change.
console.log('TUTORIAL_SOCIAL_PREVIEW_QA_PASS|TITLE=1|DESCRIPTION=1|CANONICAL=1|OG_URL=1');
