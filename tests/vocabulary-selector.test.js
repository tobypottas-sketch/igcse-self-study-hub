import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPriorityTargets } from '../src/vocabulary/selector.js';

function occurrence(n, id = `v${n}`) {
  return { occurrenceId:`u1_${n}`, vocabularyId:id, positionInUnit:n, unitNumber:1 };
}

function mastery(status, overrides = {}) {
  return { status, strandEvidence:{ meaning:4, recognition:4, context:4, paraphrasing:4, production:4 }, recentErrorCount:0, reviewDueAt:null, ...overrides };
}

test('adaptive priority follows recent errors, production gaps, higher-strand gaps, new, review due, then secure', () => {
  const now = new Date('2026-10-17T00:00:00Z');
  const occurrences = [occurrence(1,'wrong'),occurrence(2,'prod'),occurrence(3,'para'),occurrence(4,'new'),occurrence(5,'review'),occurrence(6,'secure')];
  const global = {
    wrong: mastery('building',{ recentErrorCount:2 }),
    prod: mastery('secure',{ strandEvidence:{ meaning:5, recognition:5, context:4, paraphrasing:4, production:0 } }),
    para: mastery('building',{ strandEvidence:{ meaning:4, recognition:4, context:1, paraphrasing:1, production:0 } }),
    review: mastery('mastered',{ reviewDueAt:'2026-10-16T00:00:00Z' }),
    secure: mastery('secure')
  };
  const result = selectPriorityTargets({ occurrences, masteryByVocabularyId:global, unitMastery:{}, now, limit:6 });
  assert.deepEqual(result.map(row => row.vocabularyId), ['wrong','prod','para','new','review','secure']);
});

test('global mastery does not grant contextual mastery in a new unit occurrence', () => {
  const now = new Date('2026-10-17T00:00:00Z');
  const occurrences = [occurrence(1,'shared'), occurrence(2,'ordinary')];
  const global = { shared:mastery('mastered'), ordinary:mastery('secure') };
  const unitMastery = { u1_1:{ status:'new' }, u1_2:{ status:'secure' } };
  const result = selectPriorityTargets({ occurrences, masteryByVocabularyId:global, unitMastery, now, limit:2 });
  assert.equal(result[0].vocabularyId, 'shared');
});

test('default adaptive selection returns ten targets where available', () => {
  const occurrences = Array.from({ length:20 }, (_,index) => occurrence(index + 1));
  const result = selectPriorityTargets({ occurrences, masteryByVocabularyId:{}, unitMastery:{}, now:new Date() });
  assert.equal(result.length, 10);
});
