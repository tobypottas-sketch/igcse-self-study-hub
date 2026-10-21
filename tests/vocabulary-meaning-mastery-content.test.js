import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { markCuratedAnswer, normalizeVocabularyAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

test('Unit 1 provides exactly 100 strict Meaning Mastery variants', () => {
  assert.equal(unit1.items.length, 50);
  const contextsById = new Map(unit1.contexts.map(row => [row.contextId,row]));
  let total = 0;
  for (const item of unit1.items) {
    const sense = item.senses[0];
    assert.equal(sense.masteryContexts?.length, 2, item.term);
    for (const mastery of sense.masteryContexts) {
      total += 1;
      assert.ok(contextsById.has(mastery.contextId), `${item.term} missing live context ${mastery.contextId}`);
      assert.ok(mastery.text.length >= 12, `${item.term} context too short`);
      assert.ok(mastery.meaning.length >= 8, `${item.term} meaning too short`);
      const ctx = contextsById.get(mastery.contextId);
      const mark = answer => markCuratedAnswer({ item, sense, context:{ ...ctx, acceptedAnswers:[item.term, ...(ctx.acceptedAnswers ?? [])] }, questionType:'meaning_in_context', rawAnswer:answer }).correct;
      assert.equal(mark(mastery.meaning), true, `${item.term} designated meaning rejected`);
      assert.equal(mark(item.term), false, `${item.term} headword leaked`);
      assert.equal(mark(`  ${item.term.toUpperCase()}  `), false, `${item.term} padded headword leaked`);
      for (const legacy of sense.acceptedParaphrases ?? []) assert.equal(mark(legacy), false, `${item.term} legacy paraphrase leaked: ${legacy}`);
      assert.notEqual(normalizeVocabularyAnswer(mastery.meaning), normalizeVocabularyAnswer(item.coreMeaning), `${item.term} Mastery answer duplicates core meaning`);
    }
  }
  assert.equal(total, 100);
});
