import test from 'node:test';
import assert from 'node:assert/strict';

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
  return { unitNumber:1, unitTitle:'Sports and Free Time', status:'live', items, occurrences, contexts };
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
});

test('publisher output contains curated content tables only', async () => {
  const { CONTENT_TABLES } = await publisher();
  assert.deepEqual(CONTENT_TABLES, ['vocabulary_items','vocabulary_unit_occurrences','vocabulary_contexts']);
  assert.equal(CONTENT_TABLES.some(name => /mastery|intervention|activity_events/i.test(name)), false);
});
