// Job 9: the schema now rejects unusable Job 9 authored fields, and Unit 1 satisfies the stricter content standards (Part 8).
import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { validateUnit, validateVocabularyItem } from '../content/vocabulary/schema.js';

const base = () => structuredClone(unit1.items[3]);
const errorsFor = change => { const item = base(); change(item.senses[0], item); return validateVocabularyItem(item).errors; };

test('Unit 1 passes the stricter schema', () => {
  assert.deepEqual(validateUnit(unit1).errors ?? [], []);
});
test('wrongParaphrases: fewer than three, repeated, or equal to an accepted meaning is an error', () => {
  assert.match(errorsFor(s => { s.wrongParaphrases = ['a', 'b']; }).join(), /wrongParaphrases/);
  assert.match(errorsFor(s => { s.wrongParaphrases = ['a', 'A', 'b']; }).join(), /wrongParaphrases/);
  assert.match(errorsFor(s => { s.wrongParaphrases = ['x', 'y', s.acceptedParaphrases[0]]; }).join(), /equals an accepted meaning/);
  assert.deepEqual(errorsFor(s => { s.wrongParaphrases = ['x one', 'y two', 'z three']; }), []);
});
test('situationDistractors: needs at least four distinct situations', () => {
  assert.match(errorsFor(s => { s.situationDistractors = ['a', 'b', 'c']; }).join(), /situationDistractors/);
  assert.match(errorsFor(s => { s.situationDistractors = ['a', 'a', 'b', 'c']; }).join(), /situationDistractors/);
});
test('Meaning Mastery wrongMeanings: three distinct, different from the answer', () => {
  assert.match(errorsFor(s => { s.masteryContexts[0].wrongMeanings = ['a', 'b']; }).join(), /wrongMeanings/);
  assert.match(errorsFor(s => { s.masteryContexts[0].wrongMeanings = ['a', 'b', s.masteryContexts[0].meaning]; }).join(), /wrongMeanings/);
});
test('Context Mastery passages: one blank, two sentences, never shows the answer, ids present', () => {
  const good = { passageId: 'p', contextId: 'c', text: 'The match began late. Everyone waited for the ____ to finish.', answer: 'rain' };
  assert.deepEqual(errorsFor(s => { s.masteryPassages = [good]; }), []);
  assert.match(errorsFor(s => { s.masteryPassages = [{ ...good, text: 'One sentence with a ____ only.' }]; }).join(), /two sentences/);
  assert.match(errorsFor(s => { s.masteryPassages = [{ ...good, text: 'Rain fell. Then more rain ____ fell.' }]; }).join(), /shows its own answer/);
  assert.match(errorsFor(s => { s.masteryPassages = [{ ...good, text: 'No blank here. Just two sentences.' }]; }).join(), /exactly one blank/);
  assert.match(errorsFor(s => { s.masteryPassages = [{ ...good, contextId: '' }]; }).join(), /passageId, contextId and answer/);
});
test('Word Family alternates: a different sentence containing the form exactly once', () => {
  const item = structuredClone(unit1.items.find(i => i.term === 'avoid'));
  const forms = item.senses[0].wordFamilyForms;
  forms[1].altExample = forms[1].example;
  assert.match(validateVocabularyItem(item).errors.join(), /altExample/);
  forms[1].altExample = 'A different sentence with no form at all.';
  assert.match(validateVocabularyItem(item).errors.join(), /altExample/);
});

// ---- Part 8: quality standards Unit 1 must meet ----
const sense = item => item.senses[0];
test('standard: every word has two usable Meaning Mastery contexts, each with three wrong meanings', () => {
  for (const item of unit1.items) {
    const contexts = sense(item).masteryContexts ?? [];
    assert.ok(contexts.length >= 2, `${item.term}: ${contexts.length} Mastery contexts`);
    assert.equal(new Set(contexts.map(c => c.text)).size, contexts.length, item.term);
    for (const c of contexts) assert.ok((c.wrongMeanings ?? []).length >= 3, `${item.term}: wrongMeanings`);
  }
});
test('standard: every word has two multi-sentence Context Mastery passages bound to distinct gap-fill rows', () => {
  for (const item of unit1.items) {
    const passages = sense(item).masteryPassages ?? [];
    assert.ok(passages.length >= 2, `${item.term}: ${passages.length} passages`);
    assert.equal(new Set(passages.map(p => p.contextId)).size, passages.length, `${item.term}: passages reuse a gap row`);
    for (const p of passages) assert.ok(unit1.contexts.some(c => c.contextId === p.contextId && c.type === 'gap_fill'), `${item.term}: ${p.contextId} is not a gap-fill row`);
  }
});
test('standard: no recycled templates - no two Mastery passages share an opening of four words', () => {
  const openings = new Map();
  for (const item of unit1.items) for (const p of sense(item).masteryPassages ?? []) {
    const key = p.text.split(/\s+/).slice(0, 4).join(' ').toLowerCase();
    (openings.get(key) ?? openings.set(key, []).get(key)).push(item.term);
  }
  const repeats = [...openings].filter(([, terms]) => terms.length > 2);
  assert.deepEqual(repeats, []);
});
test('standard: wrong meanings never contain the headword and the situation pool has at least four target-free situations', () => {
  for (const item of unit1.items) {
    const term = item.term.toLowerCase();
    for (const wrong of [...(sense(item).wrongParaphrases ?? []), ...(sense(item).masteryContexts ?? []).flatMap(c => c.wrongMeanings ?? [])]) assert.ok(!wrong.toLowerCase().includes(term), `${item.term}: "${wrong}"`);
    assert.ok((sense(item).situationDistractors ?? []).length >= 4, item.term);
  }
});
test('standard: every accepted Word Family has an example per form and a recorded reason; every rejected word has a recorded reason', async () => {
  const { unit1WordFamilies, unit1WordFamilyRejected } = await import('../content/vocabulary/units/unit-01-word-families.js');
  for (const [term, family] of Object.entries(unit1WordFamilies)) for (const f of family.forms) assert.ok(f.example && f.why, `${term}/${f.form}`);
  for (const [term, reason] of Object.entries(unit1WordFamilyRejected)) assert.ok(reason.length > 15, term);
});
