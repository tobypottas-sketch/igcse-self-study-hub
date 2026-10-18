import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const edge = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('successful attempt responses expose safe authoritative aggregate mastery', () => {
  assert.match(edge, /globalMastery:/);
  assert.match(edge, /unitMastery:/);
  assert.match(edge, /strandEvidence/);
  assert.match(edge, /successfulProductions/);
  assert.match(edge, /productionContextIds/);
  assert.match(edge, /productionActivityTypes/);
  assert.match(edge, /unscaffoldedProductions/);
  assert.doesNotMatch(edge, /globalMastery:[\s\S]{0,1000}rawAnswer/);
});

test('student client replaces optimistic mastery with the authoritative aggregate response', () => {
  assert.match(app, /if \(result\.globalMastery\)/);
  assert.match(app, /state\.globalMastery\[current\.target\.vocabularyId\]\s*=\s*result\.globalMastery/);
  assert.match(app, /if \(result\.unitMastery\)/);
  assert.match(app, /state\.unitMastery\[current\.target\.occurrenceId\]\s*=\s*result\.unitMastery/);
});
