// Job 9 (Parts 7 and 17): Paraphrasing is NOT live for Unit 1, for exact, recorded reasons; its open-ended Mastery is never faked.
import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { PATHWAY_ACTIVITY_MAP } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit1) });
const para = readiness.pathways.paraphrasing;
const linked = type => new Set(unit1.activities.filter(a => a.contentType === type).flatMap(a => a.activityData.linkedVocabularyIds ?? []));

test('Paraphrasing stays unavailable and serves nobody (no Set, no student-facing tile)', () => {
  assert.equal(para.live, false);
  assert.equal(para.reason, 'stage_below_minimum');
  assert.equal(para.servedCount, 0);
  assert.deepEqual(para.servedOccurrenceIds, []);
  assert.equal(para.playableSetCount, 0);
});

test('stage matrix: buildable targets per stage against the stage minimums', () => {
  assert.deepEqual(para.stageCounts, { recognise: 12, match: 12, apply: 24, recall: 12, mastery: 24 });
  assert.deepEqual(para.stageMinimums, { recognise: 20, match: 10, apply: 20, recall: 10, mastery: 20 });
  const failing = Object.entries(para.stageCounts).filter(([stage, count]) => count < para.stageMinimums[stage]).map(([stage]) => stage);
  assert.deepEqual(failing, ['recognise'], 'only Recognise is below its own minimum; the pathway is locked mainly because no word runs every rung');
});

test('exact root cause: the idea records and the phrase records belong to DIFFERENT words, so no word runs every rung', () => {
  const idea = linked('idea_set'), phrase = linked('phrase_set');
  assert.equal(idea.size, 12); assert.equal(phrase.size, 12);
  assert.equal([...idea].filter(id => phrase.has(id)).length, 0, 'no word has both an idea record and a phrase record');
  assert.deepEqual(PATHWAY_ACTIVITY_MAP.paraphrasing.recognise, ['same_idea'], 'Recognise is idea-set only under the locked ladder');
  assert.ok(PATHWAY_ACTIVITY_MAP.paraphrasing.match.includes('phrase_match'), 'Match is phrase-set only');
  const missing = para.missing.map(row => [row.kind, row.id ?? row.stage, row.have, row.need]);
  assert.deepEqual(missing, [['stage', 'recognise', 12, 20], ['full_path', undefined, 0, 10], ['diversity', 'phrase_records', 0, 10], ['diversity', 'idea_records', 0, 10]]);
});

test('Mastery is open-ended rewriting and its accepted answers are a short fixed list: it must not be graded as if exhaustive', () => {
  const phrase = unit1.activities.filter(a => a.contentType === 'phrase_set');
  const idea = unit1.activities.filter(a => a.contentType === 'idea_set');
  assert.ok(phrase.every(a => (a.activityData.acceptedVariants ?? []).length <= 3), 'phrase records carry at most three accepted variants');
  assert.ok(idea.every(a => (a.activityData.accurateParaphrases ?? []).length <= 4), 'idea records carry at most four accurate paraphrases');
  // exact-match marking of a free rewrite against 2-4 accepted strings would mark most correct rewrites wrong, so Mastery stays unavailable until
  // either robust accepted-answer coverage or a provisional-evidence mechanism exists (the frozen class C expected failure).
  assert.equal(para.live, false);
});
