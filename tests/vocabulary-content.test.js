import test from 'node:test';
import assert from 'node:assert/strict';

async function schema() {
  return import('../content/vocabulary/schema.js');
}

function makeItem(overrides = {}) {
  return {
    vocabularyId: 'vocab_significant',
    term: 'significant',
    partOfSpeech: 'adjective',
    coreMeaning: 'important or noticeable enough to matter',
    senses: [{
      senseId: 'significant_1',
      meaning: 'important or noticeable enough to matter',
      acceptedParaphrases: ['important', 'notable'],
      contextDependentParaphrases: [{ contextId: 'sig_ctx_1', answers: ['substantial'] }],
      misleadingDistractors: ['famous']
    }],
    wordFamily: ['significance', 'significantly'],
    collocations: ['significant increase'],
    status: 'approved',
    ...overrides
  };
}

function makeContexts(vocabularyId = 'vocab_significant', occurrenceId = 'u1_46_significant') {
  return [
    { contextId:'sig_ctx_1', vocabularyId, occurrenceId, senseId:'significant_1', type:'meaning_context', text:'There was a significant increase in participation.', acceptedAnswers:['important'] },
    { contextId:'sig_ctx_2', vocabularyId, occurrenceId, senseId:'significant_1', type:'paraphrase_context', text:'The change had a significant impact.', acceptedAnswers:['important','notable'] },
    { contextId:'sig_ctx_3', vocabularyId, occurrenceId, senseId:'significant_1', type:'production_context', text:'Rewrite “a major change” using the target word.', acceptedAnswers:['a significant change'] }
  ];
}

function makeOccurrence(position, vocabularyId = `vocab_word_${position}`, overrides = {}) {
  return {
    occurrenceId: `u1_${String(position).padStart(2,'0')}_${vocabularyId.replace(/^vocab_/, '')}`,
    vocabularyId,
    unitNumber: 1,
    unitTitle: 'Sports and Free Time',
    setNumber: Math.ceil(position / 10),
    positionInUnit: position,
    senseId: `${vocabularyId.replace(/^vocab_/, '')}_1`,
    contextIds: [`ctx_${position}_1`, `ctx_${position}_2`, `ctx_${position}_3`],
    status: 'approved',
    ...overrides
  };
}

function makeLiveUnit() {
  const items = [];
  const occurrences = [];
  const contexts = [];
  for (let position = 1; position <= 50; position += 1) {
    const vocabularyId = `vocab_word_${position}`;
    items.push(makeItem({
      vocabularyId,
      term: `word ${position}`,
      senses:[{ senseId:`word_${position}_1`, meaning:`meaning ${position}`, acceptedParaphrases:[`equivalent ${position}`], contextDependentParaphrases:[], misleadingDistractors:[`wrong ${position}`] }]
    }));
    occurrences.push(makeOccurrence(position, vocabularyId));
    contexts.push(
      { contextId:`ctx_${position}_1`, vocabularyId, occurrenceId:occurrences.at(-1).occurrenceId, senseId:`word_${position}_1`, type:'meaning_context', text:`Meaning context ${position}`, acceptedAnswers:[`equivalent ${position}`] },
      { contextId:`ctx_${position}_2`, vocabularyId, occurrenceId:occurrences.at(-1).occurrenceId, senseId:`word_${position}_1`, type:'paraphrase_context', text:`Paraphrase context ${position}`, acceptedAnswers:[`equivalent ${position}`] },
      { contextId:`ctx_${position}_3`, vocabularyId, occurrenceId:occurrences.at(-1).occurrenceId, senseId:`word_${position}_1`, type:'production_context', text:`Production context ${position}`, acceptedAnswers:[`word ${position}`] }
    );
  }
  return { unitNumber:1, unitTitle:'Sports and Free Time', status:'live', items, occurrences, contexts };
}

test('live units require exactly 50 distinct targets in five sets of ten', async () => {
  const { validateUnit } = await schema();
  const valid = makeLiveUnit();
  assert.equal(validateUnit(valid).ok, true);

  const short = { ...valid, occurrences: valid.occurrences.slice(0, 49) };
  assert.equal(validateUnit(short).ok, false);

  const duplicate = structuredClone(valid);
  duplicate.occurrences[49].vocabularyId = duplicate.occurrences[0].vocabularyId;
  assert.equal(validateUnit(duplicate).ok, false);

  const wrongSet = structuredClone(valid);
  wrongSet.occurrences[19].setNumber = 1;
  assert.equal(validateUnit(wrongSet).ok, false);
});

test('every live target needs meaning part of speech three contexts and production marking material', async () => {
  const { validateUnit } = await schema();
  const unit = makeLiveUnit();
  unit.items[0].coreMeaning = '';
  unit.items[1].partOfSpeech = '';
  unit.occurrences[2].contextIds = unit.occurrences[2].contextIds.slice(0, 2);
  unit.contexts.find(context => context.contextId === 'ctx_4_3').acceptedAnswers = [];

  const result = validateUnit(unit);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => /meaning/i.test(error)));
  assert.ok(result.errors.some(error => /part of speech/i.test(error)));
  assert.ok(result.errors.some(error => /three/i.test(error)));
  assert.ok(result.errors.some(error => /accepted answer/i.test(error)));
});

test('multi-word expressions remain a single vocabulary target', async () => {
  const { validateVocabularyItem } = await schema();
  const result = validateVocabularyItem(makeItem({ vocabularyId:'vocab_goal_oriented', term:'goal-oriented' }));
  assert.equal(result.ok, true);
  const phrase = validateVocabularyItem(makeItem({ vocabularyId:'vocab_quality_of_life', term:'quality of life' }));
  assert.equal(phrase.ok, true);
});

test('context-dependent paraphrases remain scoped instead of becoming global accepted answers', async () => {
  const { acceptedAnswersForContext } = await schema();
  const item = makeItem();
  assert.deepEqual(acceptedAnswersForContext(item, 'significant_1', 'sig_ctx_1').sort(), ['important','notable','substantial'].sort());
  assert.deepEqual(acceptedAnswersForContext(item, 'significant_1', 'sig_ctx_2').sort(), ['important','notable'].sort());
});

test('same global vocabulary item may appear in another unit without becoming a duplicate within one unit', async () => {
  const { validateUnit } = await schema();
  const unit = makeLiveUnit();
  const shared = makeItem({ vocabularyId:'vocab_achievement', term:'achievement', senses:[{ senseId:'achievement_1', meaning:'something successfully completed', acceptedParaphrases:['accomplishment'], contextDependentParaphrases:[], misleadingDistractors:['activity'] }] });
  unit.items[0] = shared;
  unit.occurrences[0] = makeOccurrence(1, shared.vocabularyId, { occurrenceId:'u1_01_achievement', senseId:'achievement_1', contextIds:['ach_1','ach_2','ach_3'] });
  unit.contexts = unit.contexts.filter(context => !context.contextId.startsWith('ctx_1_')).concat(makeContexts('vocab_achievement','u1_01_achievement').map((context,index) => ({ ...context, contextId:`ach_${index + 1}`, senseId:'achievement_1' })));
  assert.equal(validateUnit(unit).ok, true);
});
