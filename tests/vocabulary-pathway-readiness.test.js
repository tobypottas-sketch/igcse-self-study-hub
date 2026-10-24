import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import release1 from '../content/vocabulary/releases/unit-01.js';
import { releasePlannerContent, releaseReadinessReports } from '../content/vocabulary/readiness-report.js';
import { READINESS_RULES, MISSION_FLOOR, stageMinimum } from '../content/vocabulary/pathway-readiness-rules.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { buildPathwayCoverage } from '../src/vocabulary/pathway-coverage.js';
import { buildReadinessReport, renderReadinessReport } from '../src/vocabulary/teacher-readiness.js';
import { VOCABULARY_PATHWAYS } from '../src/vocabulary/pathway-model.js';

const full = releasePlannerContent(unit1);
const live = readiness => Object.fromEntries(Object.entries(readiness.pathways).map(([id, row]) => [id, row.live]));

// Fixture only: give the idea-set words phrase records AND the phrase-set words idea records (copies of existing shapes of the other kind), so every
// Paraphrasing stage can run for 24 words (Recognise is same_idea, an idea-set rung; Match and Recall are phrase-set rungs). This shows the Unit 1 lock
// is a content gap, not a rule that cannot be met.
function withPhraseRecordsForIdeaWords() {
  const linked = (vocabularyId, type) => unit1.activities.filter(row => row.contentType === type && row.activityData.linkedVocabularyIds.includes(vocabularyId));
  const clone = (type, kind) => {
    const sources = unit1.activities.filter(row => row.contentType === type);
    const wanted = kind === 'idea' ? 'idea_set' : 'phrase_set';
    return unit1.items.filter(item => linked(item.vocabularyId, wanted).length && !linked(item.vocabularyId, type).length).map((item, index) => {
      const source = sources[index % sources.length];
      return { ...source, activityContentId:`fixture-${type}-${item.vocabularyId}`, activityData:{ ...source.activityData, linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } };
    });
  };
  return { ...full, activities:[...full.activities, ...clone('phrase_set', 'idea'), ...clone('idea_set', 'phrase')] };
}

test('Unit 1 under stage-level readiness: four pathways live (Word Families awaits authored families, Paraphrasing locked: no word has both idea and phrase records)', () => {
  const readiness = evaluateUnitReadiness({ content:full });
  assert.deepEqual(live(readiness), { meaning:true, context:true, word_families:false, paraphrasing:false, precision_use:true, spelling_recall:true });
  assert.deepEqual(readiness.pathways.meaning.stageCounts, { recognise:50, match:48, apply:50, recall:50, mastery:47 });
  // Word Families Recognise-Recall run from the bare family strings; Mastery needs authored per-form records, and Unit 1 has none, so the pathway is not live (nothing is inferred).
  assert.deepEqual(readiness.pathways.word_families.stageCounts, { recognise:37, match:37, apply:37, recall:37, mastery:0 });
  assert.equal(readiness.pathways.word_families.reason, 'stage_below_minimum');
  const paraphrasing = readiness.pathways.paraphrasing;
  assert.deepEqual(paraphrasing.stageCounts, { recognise:12, match:12, apply:24, recall:12, mastery:24 });
  assert.equal(paraphrasing.servedCount, 0, 'under the locked ladder Recognise (same_idea) is idea-set only and Match/Recall are phrase-set only; no Unit 1 word has both, so none runs every rung');
  assert.equal(paraphrasing.reason, 'stage_below_minimum');
  assert.deepEqual(paraphrasing.missing.map(row => [row.kind, row.id ?? row.stage, row.have, row.need]), [['stage', 'recognise', 12, 20], ['full_path', undefined, 0, 10], ['diversity', 'phrase_records', 0, 10], ['diversity', 'idea_records', 0, 10]]);
  assert.deepEqual(paraphrasing.servedOccurrenceIds, [], 'a locked pathway serves nobody');
});

test('the stage thresholds are pathway-specific and follow the approved percentages', () => {
  assert.equal(stageMinimum('meaning', 'recall', 50), 45);
  assert.equal(stageMinimum('spelling_recall', 'mastery', 50), 45);
  assert.equal(stageMinimum('context', 'match', 50), 40);
  assert.equal(stageMinimum('precision_use', 'apply', 50), 40);
  assert.equal(stageMinimum('word_families', 'recognise', 50), 20);
  assert.deepEqual(READINESS_RULES.paraphrasing.stageMinimum, { recognise:20, match:10, apply:20, recall:10, mastery:20 });
  assert.equal(stageMinimum('word_families', 'recognise', 12), MISSION_FLOOR, 'never below one honest 10-question mission');
});

test('a half-built unit is locked by readiness, with the reason and the counts', () => {
  const partial = { ...full, occurrences:full.occurrences.slice(0, 30) };
  const readiness = evaluateUnitReadiness({ content:partial });
  assert.equal(readiness.expectedWords, 50);
  for (const id of ['meaning', 'spelling_recall', 'context', 'precision_use']) {
    assert.equal(readiness.pathways[id].live, false, id);
    assert.equal(readiness.pathways[id].reason, 'stage_below_minimum', id);
  }
  assert.equal(readiness.pathways.word_families.live, false, 'no family is authored for Mastery, so a partial unit cannot make Word Families live either');
  const report = buildReadinessReport({ readiness, publishedWords:30 });
  assert.equal(report.wordsComplete, false);
  assert.equal(report.ready, false);
  assert.match(report.rows.find(row => row.pathwayId === 'meaning').reason, /Below the word minimum in: Recognise, Match, Apply, Recall, Mastery/);
});

test('each stage must pass on its own, not only the words that appear in every stage', () => {
  const readiness = evaluateUnitReadiness({ content:withPhraseRecordsForIdeaWords() });
  const paraphrasing = readiness.pathways.paraphrasing;
  assert.equal(paraphrasing.live, true);
  assert.deepEqual(paraphrasing.stageCounts, { recognise:24, match:24, apply:24, recall:24, mastery:24 });
  assert.equal(paraphrasing.servedCount, 24);
  assert.deepEqual(paraphrasing.supportedStages, ['recognise', 'match', 'apply', 'recall', 'mastery']);
});

test('a stage below its minimum locks the pathway even when the other stages are large', () => {
  // Remove every phrase record: Match and Recall (phrase-only rungs) fall to 0 while Recognise/Apply/Mastery keep the idea words.
  const withoutPhrases = { ...full, activities:full.activities.filter(row => row.contentType !== 'phrase_set') };
  const paraphrasing = evaluateUnitReadiness({ content:withoutPhrases }).pathways.paraphrasing;
  assert.equal(paraphrasing.live, false);
  assert.equal(paraphrasing.reason, 'stage_below_minimum');
  assert.equal(paraphrasing.stageCounts.match, 0);
  assert.equal(paraphrasing.stageCounts.recall, 0);
  assert.ok(paraphrasing.missing.some(row => row.kind === 'stage' && row.stage === 'match' && row.need === 10));
});

test('a registry hold can only withhold a pathway, never make one live', () => {
  const hold = { available:false, reason:'content_bank_incomplete' };
  const held = evaluateUnitReadiness({ content:full, policy:(unit, id) => (id === 'meaning' ? hold : null) });
  assert.equal(held.pathways.meaning.live, false);
  assert.equal(held.pathways.meaning.reason, 'content_bank_incomplete');
  assert.equal(held.pathways.meaning.held, true);
  const forcedOn = evaluateUnitReadiness({ content:full, policy:(unit, id) => (id === 'paraphrasing' ? { available:true } : null) });
  assert.equal(forcedOn.pathways.paraphrasing.live, false, 'saying available:true does not publish an under-authored pathway');
});

test('the student coverage and the teacher report come from the same evaluator', () => {
  const readiness = evaluateUnitReadiness({ content:full });
  const coverage = buildPathwayCoverage({ content:full });
  for (const pathway of VOCABULARY_PATHWAYS) {
    assert.equal(coverage[pathway.id].available, readiness.pathways[pathway.id].live, pathway.id);
    assert.deepEqual(coverage[pathway.id].occurrenceIds, readiness.pathways[pathway.id].servedOccurrenceIds, pathway.id);
    assert.equal(buildReadinessReport({ readiness, publishedWords:50 }).rows.find(row => row.pathwayId === pathway.id).live, readiness.pathways[pathway.id].live);
  }
});

test('the release check reports every release file with the same answer', () => {
  const [report] = releaseReadinessReports([release1]);
  assert.equal(report.unitNumber, 1);
  assert.equal(report.publishedWords, 50);
  assert.equal(report.live, 4);
  assert.equal(report.locked, 2);
  assert.equal(report.ready, false);
});

test('the teacher readiness view makes a half-built unit obvious', () => {
  const partial = { ...full, occurrences:full.occurrences.slice(0, 30) };
  const report = buildReadinessReport({ readiness:evaluateUnitReadiness({ content:partial }), publishedWords:30 });
  const root = { innerHTML:'' };
  renderReadinessReport(root, { options:[{ unitNumber:1, unitTitle:'Sports and Free Time' }], selected:1, title:'Sports and Free Time', report });
  assert.match(root.innerHTML, /30 of 50 words published/);
  assert.match(root.innerHTML, /the unit is incomplete/);
  assert.match(root.innerHTML, /data-readiness-pathway="meaning" data-live="false"/);
  assert.match(root.innerHTML, /data-readiness-pathway="word_families" data-live="false"/);
  assert.match(root.innerHTML, /Authoring view, not student analytics/);
  assert.match(root.innerHTML, /No live words yet: Units 2, 3/);
});
