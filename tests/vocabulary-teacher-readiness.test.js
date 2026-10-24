import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { loadUnitReadinessContent } from '../src/vocabulary/teacher-data.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { coverageFromReadiness } from '../src/vocabulary/pathway-coverage.js';
import { clearPathwayCoverage, registerPathwayCoverage } from '../src/vocabulary/pathway-coverage-store.js';
import { buildPathwayAnalytics } from '../src/vocabulary/analytics.js';

after(() => clearPathwayCoverage());

// Database-shaped rows for Unit 1, served by a fake Data API that honours range() and never returns more than 1,000 rows.
const db = {
  vocabulary_unit_occurrences:unit1.occurrences.map(row => ({ occurrence_id:row.occurrenceId, vocabulary_id:row.vocabularyId, unit_number:row.unitNumber, unit_title:row.unitTitle, set_number:row.setNumber, position_in_unit:row.positionInUnit, sense_id:row.senseId, status:'live' })),
  vocabulary_items:unit1.items.map(row => ({ vocabulary_id:row.vocabularyId, term:row.term, part_of_speech:row.partOfSpeech, core_meaning:row.coreMeaning, senses:row.senses, word_family:row.wordFamily, collocations:row.collocations, status:'live' })),
  vocabulary_contexts:unit1.contexts.map(row => ({ context_id:row.contextId, vocabulary_id:row.vocabularyId, occurrence_id:row.occurrenceId, sense_id:row.senseId, context_type:row.type, prompt_text:row.text, target_rewrite:row.targetRewrite, accepted_answers:row.acceptedAnswers, misconception_category:row.misconceptionCategory, status:'live' })),
  vocabulary_unit_activities:unit1.activities.map(row => ({ activity_content_id:row.activityContentId, unit_number:row.unitNumber, content_type:row.contentType, activity_data:row.activityData, status:'live' }))
};
function fakeClient(requests = []) {
  return { from(table) {
    const builder = {
      select() { return builder; }, eq() { return builder; }, in() { return builder; }, order() { return builder; },
      range(from, to) { requests.push({ table, from, to }); const rows = db[table] ?? []; return Promise.resolve({ data:rows.slice(from, Math.min(to + 1, from + 1000)), count:rows.length, error:null }); }
    };
    return builder;
  } };
}

test('the teacher loader reads one unit completely and reaches the same live set as the student content', async () => {
  const requests = [];
  const content = await loadUnitReadinessContent(fakeClient(requests), 1);
  assert.equal(content.occurrences.length, 50);
  assert.equal(content.activities.length, unit1.activities.length);
  assert.equal(content.contexts.length, unit1.contexts.length);
  assert.ok(requests.every(request => request.from === 0), 'a unit this size fits one page per query');
  const viaTeacher = evaluateUnitReadiness({ content }).pathways;
  const direct = evaluateUnitReadiness({ content:releasePlannerContent(unit1) }).pathways;
  for (const id of Object.keys(direct)) {
    assert.equal(viaTeacher[id].live, direct[id].live, id);
    assert.deepEqual(viaTeacher[id].stageCounts, direct[id].stageCounts, id);
  }
  assert.equal(viaTeacher.paraphrasing.live, false);
});

test('the teacher pathway table counts only live pathways once the unit readiness is registered', async () => {
  const content = await loadUnitReadinessContent(fakeClient(), 1);
  const readiness = evaluateUnitReadiness({ content });
  const progress = { stages:Object.fromEntries(['recognise', 'match', 'apply', 'recall', 'mastery'].map(stage => [stage, { completed:true }])) };
  const occurrences = content.occurrences;
  const students = [{ id:'s1', displayName:'Ana' }];
  const unitMastery = occurrences.map(row => ({ studentId:'s1', occurrenceId:row.occurrenceId, status:'mastered', contextualEvidence:{ pathwayProgress:Object.fromEntries(['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'].map(id => [id, progress])) } }));
  const targets = content.items.map(item => ({ vocabularyId:item.vocabularyId, term:item.term }));
  const run = () => buildPathwayAnalytics({ students, targets, occurrences, globalMastery:[], unitMastery }).studentRows[0].pathways;
  clearPathwayCoverage();
  assert.notEqual(run().paraphrasing.available, false, 'before readiness is registered the table cannot know Paraphrasing is locked');
  registerPathwayCoverage(1, coverageFromReadiness(readiness.pathways));
  const table = run();
  assert.equal(table.paraphrasing.available, false);
  assert.equal(table.meaning.available, true);
  assert.equal(table.word_families.available, false, 'Word Families is not live until families are authored');
  assert.equal(table.word_families.evidenceCount, 0, 'a pathway that is not live counts no words');
  assert.equal(table.meaning.evidenceCount, readiness.pathways.meaning.servedCount, 'only the words a live pathway serves count');
});
