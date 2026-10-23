import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';
import { buildCuratedUnit } from '../content/vocabulary/build-unit.js';
import {
  DISTRACTOR_SOURCE, UnreviewedContentError, checkWrongOptions, gapDistractorIndex, situationDistractorRecord, reviewedSpellingErrors
} from '../src/vocabulary/reviewed-content.js';
import { grammaticalBlankCandidates } from '../src/vocabulary/foundational-activity-builder.js';
import { bankContextProblems, languageBankContextsFor } from '../src/vocabulary/language-bank.js';
import { pickSpellingErrorsDetailed } from '../src/vocabulary/spelling-errors.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { evaluateTargetForPathwayStage, planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { buildReadinessReport } from '../src/vocabulary/teacher-readiness.js';

// ---- helpers ----------------------------------------------------------------------------------------------------------
const STRIPPED_SENSE_FIELDS = ['situationDistractors','gapDistractors','spellingErrors'];
function withoutReviewedFields(item) {
  return { ...item, senses:item.senses.map(sense => Object.fromEntries(Object.entries(sense).filter(([key]) => !STRIPPED_SENSE_FIELDS.includes(key)))) };
}
function contentFrom({ items = unit1.items, occurrences = unit1.occurrences, contexts = unit1.contexts, activities = unit1.activities } = {}) {
  const content = { occurrences, items, contexts, activities, itemsById:Object.fromEntries(items.map(item => [item.vocabularyId, item])), contextsByOccurrence:{} };
  for (const context of contexts) (content.contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return content;
}
const notBank = activity => activity.activityData?.taskType !== 'language_bank_context';
// The same words as Unit 1, but published as another unit with no reviewed data and no language-bank rows.
function unitTwoWithoutReviewedData() {
  return contentFrom({
    items:unit1.items.map(withoutReviewedFields),
    occurrences:unit1.occurrences.map(occurrence => ({ ...occurrence, unitNumber:2 })),
    activities:unit1.activities.filter(notBank)
  });
}
function stageCounts(readiness, pathwayId) { return readiness.pathways[pathwayId].stageCounts; }
function targetFor(content, term) {
  const item = content.items.find(row => row.term === term);
  const target = content.occurrences.find(row => row.vocabularyId === item.vocabularyId);
  return { item, target };
}
function replaceItem(content, term, change) {
  const items = content.items.map(item => item.term === term ? change(item) : item);
  return contentFrom({ items, occurrences:content.occurrences, contexts:content.contexts, activities:content.activities });
}
function patchSense(content, term, patch) {
  return replaceItem(content, term, item => ({ ...item, senses:item.senses.map((sense, index) => index === 0 ? { ...sense, ...patch } : sense) }));
}

const unitContent = contentFrom();

// ---- structural validation --------------------------------------------------------------------------------------------
test('checkWrongOptions rejects unusable reviewed values instead of trusting them', () => {
  assert.deepEqual(checkWrongOptions(['a','b','c'], { answer:'x' }).problems, []);
  assert.match(checkWrongOptions(['a','b'], { answer:'x' }).problems.join(), /only 2 usable/);
  assert.match(checkWrongOptions(['a','A','c','d']).problems.join(), /repeated/);
  assert.match(checkWrongOptions(['a','','c','d']).problems.join(), /empty/);
  assert.match(checkWrongOptions(['a',null,'c','d']).problems.join(), /not text/);
  assert.match(checkWrongOptions(['a','x','c','d'], { answer:'X' }).problems.join(), /correct answer/);
  assert.match(checkWrongOptions('a,b,c').problems.join(), /not a list/);
  assert.match(checkWrongOptions(['She will afford it.','b','c'], { term:'afford', forbidTerm:true }).problems.join(), /shows the target word/);
});

test('every published Unit 1 reviewed record is structurally valid', () => {
  for (const occurrence of unit1.occurrences) {
    const item = unitContent.itemsById[occurrence.vocabularyId];
    const contexts = unitContent.contextsByOccurrence[occurrence.occurrenceId] ?? [];
    const candidates = grammaticalBlankCandidates({ item, occurrence, contexts });
    const gap = gapDistractorIndex({ item, occurrence, contexts, candidates });
    assert.deepEqual(gap.problems, [], item.term);
    assert.equal(gap.byContextId.size, candidates.length, `${item.term}: every blankable sentence has a reviewed row`);
    assert.equal(gap.source, 'unit');
    const situation = situationDistractorRecord({ item, occurrence });
    assert.equal(situation.status, 'valid', `${item.term}: ${situation.problems.join()}`);
    assert.equal(situation.source, 'unit');
  }
});

// ---- 1. reviewed content is read from the new unit data first ------------------------------------------------------------
test('reviewed situations and gap options come from the unit data before the old tables', () => {
  const marker = ['A marker situation about a quiet library visit.','A marker situation about a long train journey.','A marker situation about a school concert.'];
  const { target } = targetFor(unitContent, 'permit');
  let content = patchSense(unitContent, 'permit', { situationDistractors:marker });
  const item = content.itemsById[target.vocabularyId];
  const contexts = content.contextsByOccurrence[target.occurrenceId];
  const record = situationDistractorRecord({ item, occurrence:target });
  assert.deepEqual(record.values, marker);
  assert.equal(record.source, 'unit');
  const question = buildActivity({
    activityType:'which_situation_fits', occurrence:target, item, contexts, unitActivities:content.activities, unitItems:content.items,
    unitContexts:content.contexts, unitOccurrences:content.occurrences, mastery:{ status:'building' }, readinessStage:'building', seed:'marker', requireReviewed:true
  });
  const wrongOptions = question.options.filter(option => option !== question.markingReference.acceptedAnswers[0]);
  assert.deepEqual([...wrongOptions].sort(), [...marker].sort());
  assert.equal(question.distractorSource, DISTRACTOR_SOURCE.REVIEWED);

  // gap-fill: change one sentence's reviewed row and the question follows the unit data
  const candidates = grammaticalBlankCandidates({ item, occurrence:target, contexts });
  const first = candidates[0];
  const row = item.senses[0].gapDistractors.find(entry => entry.contextId === first.context.contextId);
  const custom = ['marker one','marker two','marker three'];
  content = patchSense(content, 'permit', { gapDistractors:item.senses[0].gapDistractors.map(entry => entry === row ? { ...entry, wrong:custom } : entry) });
  const index = gapDistractorIndex({ item:content.itemsById[target.vocabularyId], occurrence:target, contexts, candidates });
  assert.deepEqual(index.byContextId.get(first.context.contextId), custom);
});

test('reviewed spellings are lexical: one list per word, attached by every unit that contains the word', () => {
  const item = unitContent.items.find(row => row.term === 'avoid');
  assert.deepEqual(reviewedSpellingErrors(item), LEXICAL_SPELLING_ERRORS[item.vocabularyId]);
  // a second unit containing the same word draws on the same single list when it is built
  const entry = { term:'avoid', partOfSpeech:'verb', meaning:'to stay away from', paraphrases:['stay away from'], distractors:['join','encourage','permit'],
    meaningSentence:'He avoids training outdoors.', paraphrase:{ source:'stays away from', sentence:'He stays away from training outdoors.' }, production:{ source:'stay away from', sentence:'Athletes stay away from unsafe areas.' } };
  const otherUnit = buildCuratedUnit({ unitNumber:2, unitTitle:'Other', entries:[entry], lexicalSpelling:LEXICAL_SPELLING_ERRORS });
  assert.deepEqual(reviewedSpellingErrors(otherUnit.items[0]), LEXICAL_SPELLING_ERRORS[item.vocabularyId]);
  // a word with no reviewed list has none (generated plausible misspellings top it up and are tagged as such)
  assert.deepEqual(reviewedSpellingErrors(withoutReviewedFields(item)), []);
  // unit data wins if a unit does carry its own list for the word
  const own = { ...item, senses:item.senses.map(sense => ({ ...sense, spellingErrors:['avoyd','avvoid','avoide'] })) };
  assert.deepEqual(reviewedSpellingErrors(own), ['avoyd','avvoid','avoide']);
  assert.equal(pickSpellingErrorsDetailed(item, 'avoid', 3, 's').source, DISTRACTOR_SOURCE.REVIEWED);
});

// ---- 2 & 3. no bundled fallback remains ----------------------------------------------------------------------------------------
test('the engine holds no reviewed content of its own: a word published without it has none, in any unit', () => {
  for (const unitNumber of [1, 2]) {
    const content = contentFrom({
      items:unit1.items.map(withoutReviewedFields),
      occurrences:unit1.occurrences.map(occurrence => ({ ...occurrence, unitNumber })),
      activities:unit1.activities.filter(notBank)
    });
    for (const occurrence of content.occurrences) {
      const item = content.itemsById[occurrence.vocabularyId];
      assert.equal(situationDistractorRecord({ item, occurrence }).status, 'absent', `${item.term} (unit ${unitNumber})`);
      const contexts = content.contextsByOccurrence[occurrence.occurrenceId] ?? [];
      const candidates = grammaticalBlankCandidates({ item, occurrence, contexts });
      const gap = gapDistractorIndex({ item, occurrence, contexts, candidates });
      assert.equal(gap.present, false);
      assert.equal(gap.byContextId.size, 0);
    }
  }
});

test('Unit 1 published with its reviewed data behaves exactly as before the migration', () => {
  const readiness = evaluateUnitReadiness({ content:unitContent });
  assert.equal(Object.values(readiness.pathways).filter(row => row.live).length, 5);
  const recognise = planPathwayQuestion({ pathwayId:'context', stageId:'recognise', content:unitContent, target:unit1.occurrences[5], seed:'pin' }).question;
  assert.equal(recognise.distractorSource, DISTRACTOR_SOURCE.REVIEWED);
  for (const row of Object.values(readiness.pathways)) assert.equal(Object.values(row.stageReview).reduce((total, stage) => total + stage.unreviewed, 0), 0);
});

// ---- 4 & 5. strict readiness vs lenient ----------------------------------------------------------------------------------------
test('generated semantic fallback does not count toward strict readiness; safe spelling still does', () => {
  const content = unitTwoWithoutReviewedData();
  const readiness = evaluateUnitReadiness({ content });
  const meaning = stageCounts(readiness, 'meaning');
  const context = stageCounts(readiness, 'context');
  assert.equal(meaning.apply, 0, 'Meaning Apply needs reviewed wrong situations');
  assert.equal(meaning.mastery, 50, 'Meaning Mastery rests on authored wrong meanings, which Unit 1 data carries on the sense');
  assert.equal(context.recognise, 0);
  assert.equal(context.match, 0);
  assert.equal(context.apply, 0);
  assert.ok(context.recall > 0 && context.mastery > 0, 'typed Context stages have no wrong options to review');
  assert.equal(readiness.pathways.meaning.live, false);
  assert.equal(readiness.pathways.context.live, false);
  assert.equal(readiness.pathways.meaning.reason, 'stage_below_minimum');
  // lenient content still counts: spelling uses generated plausible misspellings where the generator can make three, so every
  // spelling stage that needs no wrong spellings is fully ready, and the choice stages are ready for the words it can cover.
  assert.deepEqual(stageCounts(readiness, 'spelling_recall'), { recognise:42, match:42, apply:50, recall:50, mastery:50 });
  // the teacher can see why
  const report = buildReadinessReport({ readiness, publishedWords:50 });
  const contextRow = report.rows.find(row => row.pathwayId === 'context');
  assert.ok(contextRow.notes.some(note => /gap-fill sentences still use unreviewed distractors/.test(note)), contextRow.notes.join(' | '));
  assert.ok(report.rows.find(row => row.pathwayId === 'meaning').notes.some(note => /have no reviewed wrong situations/.test(note)));
});

test('a strict builder refuses generated options, and the shared planner reports why', () => {
  const content = unitTwoWithoutReviewedData();
  const { item, target } = targetFor(content, 'permit');
  const contexts = content.contextsByOccurrence[target.occurrenceId];
  const base = { occurrence:target, item, contexts, unitActivities:content.activities, unitItems:content.items, unitContexts:content.contexts, unitOccurrences:content.occurrences, mastery:{ status:'building' }, readinessStage:'building', seed:'s' };
  assert.throws(() => buildActivity({ ...base, activityType:'which_situation_fits', requireReviewed:true }), UnreviewedContentError);
  assert.throws(() => buildActivity({ ...base, activityType:'gap_fill_bank', requireReviewed:true }), UnreviewedContentError);
  // without the flag the same builders still produce a question, and say it was not reviewed
  assert.equal(buildActivity({ ...base, activityType:'which_situation_fits' }).distractorSource, DISTRACTOR_SOURCE.GENERATED_SEMANTIC);
  assert.equal(buildActivity({ ...base, activityType:'gap_fill_bank' }).distractorSource, DISTRACTOR_SOURCE.GENERATED_SEMANTIC);
  const outcome = evaluateTargetForPathwayStage({ pathwayId:'meaning', stageId:'apply', content, target, seed:'x' });
  assert.equal(outcome.buildable, true);
  assert.equal(outcome.eligible, false);
  assert.equal(outcome.strictFailures[0].type, 'which_situation_fits');
});

test('safe generated spelling options are tagged generated_safe (readiness for them is covered above)', () => {
  const item = { vocabularyId:'vocab_unlisted', term:'beautiful', partOfSpeech:'adjective', senses:[{ senseId:'beautiful_1' }] };
  const result = pickSpellingErrorsDetailed(item, 'beautiful', 3, 'seed');
  assert.equal(result.errors.length, 3);
  assert.equal(result.source, DISTRACTOR_SOURCE.GENERATED_SAFE);
});

// ---- 6. malformed reviewed data fails strict readiness ------------------------------------------------------------------------
test('malformed reviewed situations fail strict readiness instead of being trusted', () => {
  const cases = {
    'fewer than three':['One.','Two.'],
    'duplicates':['Same sentence here.','same sentence here.','Another one.','Third one.'],
    'empty value':['One.','','Two.','Three.'],
    'not text':['One.',42,'Two.','Three.'],
    'shows the target':['The club will permit entry.','Two.','Three.','Four.']
  };
  for (const [name, values] of Object.entries(cases)) {
    const content = patchSense(unitContent, 'permit', { situationDistractors:values });
    const { item, target } = targetFor(content, 'permit');
    assert.equal(situationDistractorRecord({ item, occurrence:target }).status, 'malformed', name);
    const outcome = evaluateTargetForPathwayStage({ pathwayId:'meaning', stageId:'apply', content, target, seed:'x' });
    assert.equal(outcome.eligible, false, name);
    assert.equal(outcome.strictFailures[0]?.kind, 'situation', name);
    assert.equal(stageCounts(evaluateUnitReadiness({ content }), 'meaning').apply, 49, name);
  }
});

test('malformed reviewed gap-fill rows fail strict readiness instead of being trusted', () => {
  const { item, target } = targetFor(unitContent, 'permit');
  const contexts = unitContent.contextsByOccurrence[target.occurrenceId];
  const candidates = grammaticalBlankCandidates({ item, occurrence:target, contexts });
  const rows = item.senses[0].gapDistractors;
  const first = rows[0];
  const cases = {
    'wrong answer recorded':{ ...first, answer:'zzz' },
    'answer among the wrong options':{ ...first, wrong:[first.answer, ...first.wrong.slice(1)] },
    'duplicate wrong options':{ ...first, wrong:[first.wrong[0], first.wrong[0], first.wrong[2]] },
    'only two wrong options':{ ...first, wrong:first.wrong.slice(0, 2) },
    'empty wrong option':{ ...first, wrong:['', first.wrong[1], first.wrong[2]] },
    'context id points at nothing':{ ...first, contextId:'u9_99_nothing_gap_1' },
    'context id missing':{ ...first, contextId:'' }
  };
  for (const [name, bad] of Object.entries(cases)) {
    const content = patchSense(unitContent, 'permit', { gapDistractors:[bad, ...rows.slice(1)] });
    const changed = content.itemsById[target.vocabularyId];
    const index = gapDistractorIndex({ item:changed, occurrence:target, contexts, candidates });
    assert.ok(index.problems.length >= 1, name);
    assert.ok(!index.byContextId.has(first.contextId) || name === 'context id points at nothing' || name === 'context id missing', name);
    const outcome = evaluateTargetForPathwayStage({ pathwayId:'context', stageId:'recognise', content: contentWithoutBank(content), target, seed:'x' });
    assert.equal(outcome.eligible, false, name);
    assert.equal(outcome.strictFailures[0]?.kind, 'gap-fill', name);
  }
});
function contentWithoutBank(content) {
  return contentFrom({ items:content.items, occurrences:content.occurrences, contexts:content.contexts, activities:content.activities.filter(notBank) });
}

test('a malformed language-bank row is ignored rather than served', () => {
  const good = languageBankContextsFor({ vocabularyId:'vocab_avoid' }, unit1.activities);
  assert.ok(good.length >= 6);
  assert.deepEqual(bankContextProblems(good[0]), []);
  const broken = [
    { ...good[0], distractors:good[0].distractors.slice(0, 2) },
    { ...good[0], distractors:[good[0].distractors[0], good[0].distractors[0], good[0].distractors[1]] },
    { ...good[0], distractors:[{ text:good[0].answer }, ...good[0].distractors.slice(1)] },
    { ...good[0], text:'No blank here.' }
  ];
  for (const context of broken) assert.ok(bankContextProblems(context).length > 0);
  const rows = unit1.activities.map(activity => activity.activityData?.languageBankContextId === good[0].id
    ? { ...activity, activityData:{ ...activity.activityData, distractors:activity.activityData.distractors.slice(0, 2) } } : activity);
  assert.equal(languageBankContextsFor({ vocabularyId:'vocab_avoid' }, rows).length, good.length - 1);
});

// ---- 7. context ids prevent contamination -------------------------------------------------------------------------------------
test('reviewed gap rows are keyed by context id, so the same word or sentence in another unit cannot borrow them', () => {
  const { item, target } = targetFor(unitContent, 'permit');
  const rows = item.senses[0].gapDistractors;
  // Unit 2 publishes the same word with the very same sentences but its own context ids.
  const renamed = id => id.replace(/^u1_/, 'u2_');
  const occurrence = { ...target, unitNumber:2, occurrenceId:renamed(target.occurrenceId), contextIds:target.contextIds.map(renamed) };
  const contexts = unitContent.contextsByOccurrence[target.occurrenceId].map(context => ({ ...context, occurrenceId:occurrence.occurrenceId, contextId:renamed(context.contextId) }));
  const candidates = grammaticalBlankCandidates({ item, occurrence, contexts });
  assert.ok(candidates.length > 0);
  // Unit 1's rows copied onto the Unit 2 word: every one points at a context that is not this word's, and is refused.
  const index = gapDistractorIndex({ item, occurrence, contexts, candidates });
  assert.equal(index.byContextId.size, 0);
  assert.ok(index.problems.length >= rows.length);
  assert.ok(index.problems.every(problem => /does not belong/.test(problem.problem)));
  // The old sentence-keyed table is not consulted outside Unit 1 either.
  const bare = withoutReviewedFields(item);
  const clean = gapDistractorIndex({ item:bare, occurrence, contexts, candidates });
  assert.equal(clean.present, false);
});

// ---- 8. Unit 1 readiness is unchanged -----------------------------------------------------------------------------------------
test('Unit 1 readiness after the migration: five pathways live, Paraphrasing locked, same counts', () => {
  const readiness = evaluateUnitReadiness({ content:unitContent });
  const live = Object.fromEntries(Object.entries(readiness.pathways).map(([id, row]) => [id, row.live]));
  assert.deepEqual(live, { meaning:true, context:true, word_families:true, paraphrasing:false, precision_use:true, spelling_recall:true });
  assert.deepEqual(stageCounts(readiness, 'meaning'), { recognise:50, match:48, apply:50, recall:50, mastery:50 });
  assert.deepEqual(stageCounts(readiness, 'context'), { recognise:48, match:50, apply:48, recall:48, mastery:48 });
  assert.deepEqual(stageCounts(readiness, 'word_families'), { recognise:37, match:37, apply:37, recall:37, mastery:37 });
  assert.deepEqual(stageCounts(readiness, 'paraphrasing'), { recognise:24, match:12, apply:24, recall:12, mastery:24 });
  assert.deepEqual(stageCounts(readiness, 'precision_use'), { recognise:50, match:50, apply:50, recall:50, mastery:50 });
  assert.deepEqual(stageCounts(readiness, 'spelling_recall'), { recognise:50, match:50, apply:50, recall:50, mastery:50 });
  assert.equal(readiness.pathways.meaning.servedCount, 48);
  assert.equal(readiness.pathways.context.servedCount, 48);
  assert.equal(readiness.pathways.paraphrasing.reason, 'diversity_below_minimum');
  assert.deepEqual(readiness.authoring, { gapSentences:182, gapSentencesReviewed:182, gapMalformed:0, situationWordsReviewed:50, situationWordsMalformed:0, words:50 });
  for (const row of Object.values(readiness.pathways)) assert.equal(Object.values(row.stageReview).reduce((total, stage) => total + stage.unreviewed, 0), 0);
});

// ---- the republish SQL ------------------------------------------------------------------------------------------------------------
import fs from 'node:fs';
test('the Unit 1 republish SQL carries exactly the reviewed fields the build produces', () => {
  const sql = fs.readFileSync(new URL('../docs/vocabulary-content-updates/unit-01-reviewed-content-in-unit-data.sql', import.meta.url), 'utf8');
  assert.match(sql, /^begin;$/m);
  assert.match(sql, /^commit;$/m);
  let statements = 0;
  for (const item of unit1.items) {
    const sense = item.senses[0];
    const fields = Object.fromEntries(['situationDistractors','gapDistractors','spellingErrors'].filter(key => sense[key] !== undefined).map(key => [key, sense[key]]));
    const line = sql.split('\n').find(row => row.includes(`where vocabulary_id='${item.vocabularyId}'`));
    assert.ok(line, `${item.term}: missing statement`);
    assert.ok(line.includes(`$sx$${JSON.stringify(fields)}$sx$`), `${item.term}: SQL is out of date with the unit data`);
    assert.ok(/jsonb_set\(senses,'\{0\}',\(senses->0\) \|\|/.test(line), 'the update must merge into the existing sense');
    statements += 1;
  }
  assert.equal(statements, 50);
  assert.ok(!/\bdelete\b|\bdrop\b|\btruncate\b/i.test(sql.replace(/\$sx\$.*?\$sx\$/g, '')));
});

test('applying the republish SQL to the pre-migration published data reproduces the current unit data exactly', () => {
  const sql = fs.readFileSync(new URL('../docs/vocabulary-content-updates/unit-01-reviewed-content-in-unit-data.sql', import.meta.url), 'utf8');
  const published = unit1.items.map(withoutReviewedFields); // what the database held before the republish
  for (const item of published) {
    const line = sql.split('\n').find(row => row.includes(`where vocabulary_id='${item.vocabularyId}'`));
    const merged = JSON.parse(line.match(/\|\| \$sx\$(.*)\$sx\$::jsonb/)[1]);
    item.senses = [{ ...item.senses[0], ...merged }, ...item.senses.slice(1)]; // senses->0 || fields
  }
  assert.deepEqual(published, unit1.items);
});
