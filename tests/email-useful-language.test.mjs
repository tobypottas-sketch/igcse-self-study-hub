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
test('model openings and closings use natural informal contractions', () => {
  const stiff = /\b(?:I am|I have|I would|It is|did not|could not|do not|we have just|you would|I had been)\b/;
  for (const t of tasks) for (const line of [...t.openings, ...t.closings]) assert.doesNotMatch(line, stiff, `${t.id}: ${line}`);
});
test('corrected model sentences are in place', () => {
  assert.match(html, /I'm sorry, but we need to change our plans for Saturday/);
  assert.match(html, /It was hard work, but I learnt a lot\./);
  assert.match(html, /adjust the camera settings and the lighting/);
  assert.match(html, /handed it in at the bus station office/);
  assert.doesNotMatch(html, /near to my school/);
  assert.doesNotMatch(html, /Before anything else, let me say/i);
});
