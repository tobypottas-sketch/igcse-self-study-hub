import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readinessReasonText } from '../src/vocabulary/teacher-readiness.js';

const view = await readFile(new URL('../src/vocabulary/teacher-readiness.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-readiness-polish.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('readiness shortage copy says exactly what the author needs to add', () => {
  assert.equal(readinessReasonText({
    live:false,
    reason:'stage_below_minimum',
    missing:[{ kind:'stage', stage:'recognise', have:12, need:20 }],
    stageCounts:{ recognise:12 },
    stageMinimums:{ recognise:20 }
  }), 'Recognise needs 8 more items');
});

test('unit readiness returns to the previous class overview when class context exists', () => {
  assert.match(view, /data-action=\\"teacher-back-overview\\">← Back<\\/button>/);
  assert.doesNotMatch(view, /data-action=\\"teacher-back-classes\\">← Classes<\\/button>/);
});

test('readiness is status first and keeps live stage counts behind a disclosure', () => {
  assert.match(view, /vocab-readiness__metrics/);
  assert.match(view, /vocab-readiness__metric/);
  assert.match(view, /Show stage details/);
  assert.match(view, /<details open>/);
  assert.match(view, /Units .* not yet published/);
});

test('readiness polish is isolated, responsive, and cache-versioned', () => {
  assert.match(css, /\.vocab-readiness__metrics/);
  assert.match(css, /\.vocab-readiness__row/);
  assert.match(css, /\.vocab-readiness__audit/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(html, /vocabulary-readiness-polish\.css\?v=readiness-v1/);
});
