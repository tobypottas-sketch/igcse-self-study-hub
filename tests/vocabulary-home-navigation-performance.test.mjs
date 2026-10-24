import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

function functionSource(name) {
  const start = app.indexOf(`async function ${name}`);
  assert.notEqual(start, -1, `${name} must exist`);
  const next = app.indexOf('\nfunction ', start + 1);
  return app.slice(start, next === -1 ? app.length : next);
}

test('All units uses the cached-first Home path', () => {
  assert.match(app, /action === 'back-units'\) showHome\(\{ cachedFirst:true \}\)/);
});

test('cached-first Home paints before waiting for network refresh', () => {
  const src = functionSource('showHome');
  assert.match(src, /cachedFirst/);
  const render = src.indexOf('renderHomeFromState()');
  const wait = src.indexOf('await Promise.all');
  assert.ok(render !== -1, 'showHome should paint cached Home through renderHomeFromState');
  assert.ok(wait !== -1, 'showHome should still refresh Home data');
  assert.ok(render < wait, 'cached Home must paint before the network refresh starts blocking');
});

test('a stale Home refresh cannot overwrite navigation that happened after it started', () => {
  const src = functionSource('showHome');
  assert.match(src, /const request = state\.unitRequest \+= 1/);
  assert.match(src, /if \(request !== state\.unitRequest\) return/);
});
