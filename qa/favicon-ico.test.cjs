'use strict';
/* Offline validation of GitHub Pages favicon.ico packaged from the reviewed favicon-mrx.svg. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const ico = fs.readFileSync(path.join(__dirname, '..', 'favicon.ico'));
const svg = fs.readFileSync(path.join(__dirname, '..', 'favicon-mrx.svg'), 'utf8');
const sizes = [16,32,48,64];
assert.ok(ico.length > 200 && ico.length < 100000, 'favicon.ico should be compact');
assert.equal(ico.readUInt16LE(0), 0, 'ICO reserved bytes');
assert.equal(ico.readUInt16LE(2), 1, 'ICO icon type');
assert.equal(ico.readUInt16LE(4), sizes.length, 'ICO frame count');
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
let previousEnd = 6 + 16 * sizes.length;
for (let i = 0; i < sizes.length; i++) {
  const index = 6 + i * 16;
  const width = ico.readUInt8(index) || 256;
  const height = ico.readUInt8(index+1) || 256;
  const bytes = ico.readUInt32LE(index+8);
  const offset = ico.readUInt32LE(index+12);
  assert.equal(width, sizes[i], 'ICO frame width');
  assert.equal(height, sizes[i], 'ICO frame height');
  assert.ok(offset >= previousEnd && offset+bytes <= ico.length, 'ICO frame bounds');
  assert.deepEqual(ico.subarray(offset,offset+8), signature, 'PNG frame signature');
  assert.equal(ico.readUInt32BE(offset+16), sizes[i], 'PNG width');
  assert.equal(ico.readUInt32BE(offset+20), sizes[i], 'PNG height');
  previousEnd=offset+bytes;
}
assert.equal(previousEnd, ico.length, 'All ICO bytes belong to valid frames');
assert.match(svg, /viewBox="0 0 64 64"/, 'Preserve approved vector source');
assert.match(svg, />MRX<\/text>/, 'Preserve brand glyph');
console.log('MRXPANEL_FAVICON_ICO_QA_PASS|FRAMES='+sizes.join(',')+'|BYTES='+ico.length);
