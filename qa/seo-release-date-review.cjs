'use strict';
/**
 * MRXPANEL SEO date release review gate.
 * Read-only: no network, tokens, Git mutations, deploy, or production writes.
 *
 * node qa/seo-release-date-review.cjs --mode=review
 * node qa/seo-release-date-review.cjs --mode=release --date=YYYY-MM-DD
 *
 * A PASS here never authorizes a merge or production release.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mode = process.argv.find(x => x.startsWith('--mode='))?.split('=')[1] || 'review';
const releaseDate = process.argv.find(x => x.startsWith('--date='))?.split('=')[1] || '';
const routes = [
  { route: '/', file: 'index.html', significant: true },
  { route: '/panduan-reseller/', file: 'panduan-reseller/index.html', dated: true, significant: true },
  { route: '/cara-menggunakan-panel-smm/', file: 'cara-menggunakan-panel-smm/index.html', dated: true, significant: true },
  { route: '/memilih-provider-smm/', file: 'memilih-provider-smm/index.html', dated: true, significant: true },
  { route: '/apa-itu-panel-smm/', file: 'apa-itu-panel-smm/index.html', article: true, significant: true },
  { route: '/api-panel-smm-reseller/', file: 'api-panel-smm-reseller/index.html' },
  { route: '/kalkulator-harga-jual-reseller-smm/', file: 'kalkulator-harga-jual-reseller-smm/index.html' },
];
function isDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const value = new Date(s + 'T00:00:00.000Z');
  return !Number.isNaN(value.getTime()) && value.toISOString().slice(0, 10) === s;
}
function schemaArticle(html) {
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => JSON.parse(m[1])).filter(v => v && v['@type'] === 'Article');
  assert.equal(schemas.length, 1, 'Expected precisely one Article schema');
  return schemas[0];
}
function fail(code, details) {
  console.error(code + (details ? '|' + details : ''));
  process.exitCode = 2;
}
try {
  assert.ok(['review', 'release'].includes(mode), 'Invalid mode');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const entries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)];
  assert.equal(entries.length, routes.length, 'Unexpected sitemap URL count');
  const map = new Map(entries.map(m => [m[1], m[2]]));
  assert.equal(map.size, routes.length, 'Duplicate sitemap URLs');
  let visibleCount = 0;
  let articles = 0;
  const needsReleaseDate = [];
  for (const item of routes) {
    const url = 'https://mrxpanel.com' + item.route;
    const lastmod = map.get(url);
    assert.ok(isDate(lastmod), item.route + ' missing/invalid lastmod');
    const html = fs.readFileSync(path.join(root, item.file), 'utf8');
    assert.ok(html.includes('href="' + url + '"') || /<link rel="canonical"/.test(html), item.route + ' missing canonical tag');
    if (item.dated || item.article) {
      const article = schemaArticle(html);
      assert.ok(isDate(article.datePublished), item.route + ' invalid datePublished');
      assert.ok(isDate(article.dateModified), item.route + ' invalid dateModified');
      assert.ok(article.datePublished <= article.dateModified, item.route + ' reversed Article dates');
      assert.ok(lastmod >= article.dateModified, item.route + ' sitemap predates Article modification');
      articles++;
      if (item.dated) {
        const timeDates = [...html.matchAll(/<time datetime="(\d{4}-\d{2}-\d{2})">/g)].map(m => m[1]);
        assert.deepEqual(timeDates, [article.datePublished, article.dateModified],
          item.route + ' visible and structured dates disagree');
        visibleCount++;
      }
    }
    if (item.significant && mode === 'release') {
      const article = item.dated || item.article ? schemaArticle(html) : null;
      if (lastmod !== releaseDate || (article && article.dateModified !== releaseDate)) {
        needsReleaseDate.push(item.route);
      }
    }
  }
  assert.equal(articles, 4, 'Article schema count mismatch');
  assert.equal(visibleCount, 3, 'Visible Article dates count mismatch');
  console.log('SEO_DATE_INTEGRITY_PASS|PAGES=7|ARTICLE=4|VISIBLE_DATES=3');
  if (mode === 'review') {
    console.log('SEO_RELEASE_DATE_GATE=HOLD|ACTUAL_PUBLICATION_DATE_REQUIRED|DRAFT_ONLY');
    console.log('DATE_REVIEW_ROUTES=' + routes.filter(x => x.significant).map(x => x.route).join(','));
  } else if (!isDate(releaseDate)) {
    fail('RELEASE_DATE_REQUIRED', 'Pass a real YYYY-MM-DD date only at an authorized release review');
  } else if (needsReleaseDate.length) {
    fail('DATE_REFRESH_REQUIRED', needsReleaseDate.join(','));
  } else {
    console.log('SEO_RELEASE_DATE_CHECK_PASS|DATE=' + releaseDate + '|AUTHORIZATION_STILL_REQUIRED');
  }
} catch (e) {
  fail('SEO_DATE_REVIEW_FAIL', e.message);
}
