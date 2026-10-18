import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const edge = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

function helperBody(name) {
  const match = edge.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `${name} helper should exist`);
  return match[1];
}

test('successful attempt responses expose safe authoritative aggregate mastery', () => {
  const globalSnapshot = helperBody('globalMasterySnapshot');
  const unitSnapshot = helperBody('unitMasterySnapshot');

  assert.match(edge, /globalMastery:/);
  assert.match(edge, /unitMastery:/);
  for (const field of ['strandEvidence','successfulProductions','productionContextIds','productionActivityTypes','unscaffoldedProductions']) {
    assert.match(globalSnapshot, new RegExp(field));
  }
  assert.match(unitSnapshot, /strandEvidence/);
  assert.doesNotMatch(globalSnapshot, /rawAnswer|studentAnswer|typedAnswer|answerText/);
  assert.doesNotMatch(unitSnapshot, /rawAnswer|studentAnswer|typedAnswer|answerText/);
});

test('student client replaces optimistic mastery with the authoritative aggregate response', () => {
  assert.match(app, /if \(result\.globalMastery\)/);
  assert.match(app, /state\.globalMastery\[current\.target\.vocabularyId\]\s*=\s*result\.globalMastery/);
  assert.match(app, /if \(result\.unitMastery\)/);
  assert.match(app, /state\.unitMastery\[current\.target\.occurrenceId\]\s*=\s*result\.unitMastery/);
});
