// Language-quality guards for the model phrases students may copy from the Informal Email app (Useful Language, starters, examples).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../email-writing-app.html', import.meta.url), 'utf8');
const block = (name) => { const i = html.indexOf(`const ${name} = [`); let d = 0, j = html.indexOf('[', i), k = j; for (; k < html.length; k++) { if (html[k] === '[') d++; if (html[k] === ']' && !--d) break; } return (0, eval)(html.slice(j, k + 1)); };
const tasks = block('EXAM_TASKS');
test('every model opening greets by a name placeholder, never "friend"', () => {
  assert.equal(tasks.length, 20);
  for (const t of tasks) for (const o of t.openings) assert.match(o, /^(Hi|Hey) \[name\][,!] /, `${t.id}: ${o}`);
  assert.doesNotMatch(html, /\b(?:Hi|Hey|Dear) friend\b/);
  assert.match(html, /c\.friend \|\| \(\/\^\\s\*hey\\b\/i\.test\(line\) \? 'Sam' : 'Alex'\)/);
  assert.doesNotMatch(html, /const fname = c\.friend \|\| 'friend';\s*\n\s*\n\s*const vocab/);
});
test('every practice task has a language challenge under its own id (none orphaned)', () => {
  const i = html.indexOf('const LANGUAGE_CHALLENGES = {'); let d = 0, j = html.indexOf('{', i), k = j; for (; k < html.length; k++) { if (html[k] === '{') d++; if (html[k] === '}' && !--d) break; }
  const challenges = (0, eval)('(' + html.slice(j, k + 1) + ')');
  const ids = tasks.map(t => t.id);
  assert.deepEqual(Object.keys(challenges).filter(id => !ids.includes(id)), []);
  assert.deepEqual(ids.filter(id => !challenges[id]), []);
  assert.equal(challenges['exchange-visitor'].choices.length, 2);
});
// Contractions are good informal style but optional: these are style improvements to model phrases, not rules or error labels.
test('corrected model sentences are in place', () => {
  assert.match(html, /I'm sorry, but we need to change our plans for Saturday/);
  assert.match(html, /It was hard work, but I learnt a lot\./);
  assert.match(html, /adjust the camera settings and the lighting/);
  assert.match(html, /handed it in at the bus station office/);
  assert.doesNotMatch(html, /near to my school/);
  assert.doesNotMatch(html, /Before anything else, let me say/i);
});
