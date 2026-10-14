import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('listening wrapper loads original app and tracking module', () => {
  const html = fs.readFileSync(new URL('../listening.html', import.meta.url), 'utf8');
  assert.match(html, /id="practiceFrame"/);
  assert.match(html, /https:\/\/tobypottas-sketch\.github\.io\/igcse-listening\//);
  assert.match(html, /id="wrapperStatus"/);
  assert.match(html, /src="src\/tracking\/listening-wrapper\.js"/);
});
