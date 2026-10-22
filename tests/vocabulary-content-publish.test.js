import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import releasedUnit1 from '../content/vocabulary/releases/unit-01.js';

async function publisher() {
  return import('../scripts/publish-vocabulary-content.mjs');
}

function minimalLiveUnit() {
  const items = Array.from({ length: 50 }, (_, index) => {
    const n = index + 1;
    return {
      vocabularyId:`vocab_word_${n}`,
      term:`word ${n}`,
      partOfSpeech:'noun',
      coreMeaning:`meaning ${n}`,
      senses:[{ senseId:`word_${n}_1`, meaning:`meaning ${n}`, acceptedParaphrases:[`equivalent ${n}`], contextDependentParaphrases:[], misleadingDistractors:[`wrong ${n}`] }],
      wordFamily:[],
      collocations:[],
      status:'approved'
    };
  });
  const occurrences = items.map((item,index) => {
    const n = index + 1;
    return { occurrenceId:`u1_${n}`, vocabularyId:item.vocabularyId, unitNumber:1, unitTitle:'Sports and Free Time', setNumber:Math.ceil(n/10), positionInUnit:n, senseId:`word_${n}_1`, contextIds:[`c${n}a`,`c${n}b`,`c${n}c`], status:'approved' };
  });
  const contexts = occurrences.flatMap((occ,index) => {
    const n = index + 1;
    return ['a','b','c'].map((suffix,ctxIndex) => ({ contextId:`c${n}${suffix}`, vocabularyId:occ.vocabularyId, occurrenceId:occ.occurrenceId, senseId:`word_${n}_1`, type:ctxIndex === 2 ? 'production_context' : 'meaning_context', text:`context ${n}${suffix}`, acceptedAnswers:[`word ${n}`] }));
  });
  return { unitNumber:1, unitTitle:'Sports and Free Time', status:'live', items, occurrences, contexts, activities:[] };
}

test('publisher refuses non-live or invalid units', async () => {
  const { buildPublicationBatch } = await publisher();
  const draft = minimalLiveUnit();
  draft.status = 'draft';
  assert.throws(() => buildPublicationBatch([draft]), /live/i);

  const invalid = minimalLiveUnit();
  invalid.occurrences.pop();
  assert.throws(() => buildPublicationBatch([invalid]), /validation/i);
});

test('publisher deduplicates global items but keeps separate unit occurrences', async () => {
  const { buildPublicationBatch } = await publisher();
  const unit1 = minimalLiveUnit();
  const unit2 = structuredClone(unit1);
  unit2.unitNumber = 2;
  unit2.unitTitle = 'Travel and Transport';
  unit2.occurrences = unit2.occurrences.map((occ,index) => ({ ...occ, occurrenceId:`u2_${index + 1}`, unitNumber:2, unitTitle:'Travel and Transport' }));
  unit2.contexts = unit2.contexts.map((ctx,index) => ({ ...ctx, occurrenceId:`u2_${Math.floor(index / 3) + 1}`, contextId:`u2_${ctx.contextId}` }));
  unit2.occurrences = unit2.occurrences.map((occ,index) => ({ ...occ, contextIds:[`u2_c${index + 1}a`,`u2_c${index + 1}b`,`u2_c${index + 1}c`] }));

  const batch = buildPublicationBatch([unit1, unit2]);
  assert.equal(batch.items.length, 50);
  assert.equal(batch.occurrences.length, 100);
  assert.equal(batch.contexts.length, 300);
  assert.deepEqual(batch.activities, []);
});

test('publisher carries curated unit activities as a fourth content collection', async () => {
  const { buildPublicationBatch } = await publisher();
  const unit = minimalLiveUnit();
  unit.activities = [{
    activityContentId:'u1_phrase_01', unitNumber:1, contentType:'phrase_set', status:'live',
    activityData:{ originalPhrase:'free time', equivalentPhrase:'leisure time', acceptedVariants:['spare time'], chunks:['leisure','time'], commonMeaningDistortions:['working time'], linkedVocabularyIds:['vocab_word_1'], primaryEvidenceTargetId:'vocab_word_1' }
  }];
  const batch = buildPublicationBatch([unit]);
  assert.equal(batch.activities.length, 1);
  assert.equal(batch.activities[0].activityContentId, 'u1_phrase_01');
});

test('released Unit 1 is a strict live batch with 50 targets and curated grammar retrieval contexts', async () => {
  const { buildPublicationBatch } = await publisher();
  const batch = buildPublicationBatch([releasedUnit1]);
  assert.equal(releasedUnit1.status, 'live');
  assert.equal(batch.items.length, 50);
  assert.equal(batch.occurrences.length, 50);
  assert.equal(batch.contexts.length, 342);
  assert.equal(batch.items.every(row => row.status === 'live'), true);
  assert.equal(batch.occurrences.every(row => row.status === 'live'), true);
});

test('publisher output contains curated content tables only including unit activities', async () => {
  const { CONTENT_TABLES } = await publisher();
  assert.deepEqual(CONTENT_TABLES, ['vocabulary_items','vocabulary_unit_occurrences','vocabulary_contexts','vocabulary_unit_activities']);
  assert.equal(CONTENT_TABLES.some(name => /mastery|intervention|activity_events/i.test(name)), false);
});

test('SQL export includes vocabulary_unit_activities and still excludes student evidence tables', () => {
  const source = fs.readFileSync(new URL('../scripts/export-vocabulary-sql.mjs', import.meta.url), 'utf8');
  assert.match(source, /vocabulary_unit_activities/);
  assert.doesNotMatch(source, /insert into public\.vocabulary_(?:global|unit)_mastery/i);
  assert.doesNotMatch(source, /insert into public\.activity_events/i);
});
