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

// Fixture only: give the 12 idea-set words phrase records too (copies of existing phrase-set shapes), so every Paraphrasing stage
// can run for them. This shows the Unit 1 lock is a content gap, not a rule that cannot be met.
function withPhraseRecordsForIdeaWords() {
  const linked = (vocabularyId, type) => unit1.activities.filter(row => row.contentType === type && row.activityData.linkedVocabularyIds.includes(vocabularyId));
  const phraseSets = unit1.activities.filter(row => row.contentType === 'phrase_set');
  const extra = unit1.items.filter(item => linked(item.vocabularyId, 'idea_set').length).map((item, index) => {
    const source = phraseSets[index % phraseSets.length];
    return { ...source, activityContentId:`fixture-phrase-${item.vocabularyId}`, activityData:{ ...source.activityData, linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } };
  });
  return { ...full, activities:[...full.activities, ...extra] };
}

test('Unit 1 under stage-level readiness: five pathways live, Paraphrasing locked for diversity', () => {
  const readiness = evaluateUnitReadiness({ content:full });
  assert.deepEqual(live(readiness), { meaning:true, context:true, word_families:true, paraphrasing:false, precision_use:true, spelling_recall:true });
  assert.deepEqual(readiness.pathways.meaning.stageCounts, { recognise:50, match:48, apply:50, recall:50, mastery:50 });
  assert.deepEqual(readiness.pathways.word_families.stageCounts, { recognise:37, match:37, apply:37, recall:37, mastery:37 });
  const paraphrasing = readiness.pathways.paraphrasing;
  assert.deepEqual(paraphrasing.stageCounts, { recognise:24, match:12, apply:24, recall:12, mastery:24 });
  assert.equal(paraphrasing.servedCount, 12, 'only the phrase words can run every rung');
  assert.equal(paraphrasing.reason, 'diversity_below_minimum');
  assert.deepEqual(paraphrasing.missing.map(row => [row.kind, row.id, row.have, row.need]), [['diversity', 'idea_records', 0, 10]]);
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
  assert.equal(readiness.pathways.word_families.live, true, '30 words still hold 20+ genuine families');
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
  assert.equal(report.live, 5);
  assert.equal(report.locked, 1);
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
  assert.match(root.innerHTML, /data-readiness-pathway="word_families" data-live="true"/);
  assert.match(root.innerHTML, /Authoring view, not student analytics/);
  assert.match(root.innerHTML, /No live words yet: Units 2, 3/);
});
