import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStageVariant } from '../src/vocabulary/stage-variants.js';

const item = { term:'compete', wordFamily:['competitor','competition','competitive'] };

test('Word Families Apply presents the choice as a drag-into-gap task; type and answer are unchanged', () => {
  const q = { type:'word_family_choice', options:['compete','competition','competitive'], sourceText:'Entry to the _____ is free.', markingReference:{ acceptedAnswers:['competition'] }, responseMode:'choice' };
  const v = applyStageVariant(q, { pathwayId:'word_families', servedStage:'apply', item });
  assert.equal(v.type, 'word_family_choice'); assert.equal(v.responseMode, 'drag_gap');
  assert.deepEqual(v.draggables, q.options); assert.deepEqual(v.markingReference, q.markingReference);
  assert.equal(applyStageVariant(q, { pathwayId:'word_families', servedStage:'recognise', item }).responseMode, 'choice');
});

test('typed recall shows a clue; mastery shows none', () => {
  const wf = { type:'word_family_switch', markingReference:{ acceptedAnswers:['competition'] } };
  assert.match(applyStageVariant(wf, { pathwayId:'word_families', servedStage:'recall', item }).clue, /^Related forms: compete · competitor · competitive$/);
  assert.equal(applyStageVariant(wf, { pathwayId:'word_families', servedStage:'mastery', item }).clue, undefined);
  const ctx = { type:'type_missing_word', markingReference:{ acceptedAnswers:['leisure'] } };
  assert.match(applyStageVariant(ctx, { pathwayId:'context', servedStage:'recall' }).clue, /starts with “l” · 7 letters/);
  assert.equal(applyStageVariant(ctx, { pathwayId:'context', servedStage:'mastery' }).clue, undefined);
  assert.match(applyStageVariant({ type:'type_missing_word', markingReference:{ acceptedAnswers:['free time'] } }, { pathwayId:'context', servedStage:'recall' }).clue, /2 words/);
});
test('other pathways and missing data pass through untouched', () => {
  const q = { type:'meaning_match' };
  assert.equal(applyStageVariant(q, { pathwayId:'meaning', servedStage:'recall' }), q);
  assert.equal(applyStageVariant(null, {}), null);
});
