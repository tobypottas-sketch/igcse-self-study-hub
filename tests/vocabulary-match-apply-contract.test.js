import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import unit from '../content/vocabulary/releases/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { ACTIVITY_TYPES, activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { MATCH_SET_TYPES, usesMatchSet } from '../src/vocabulary/match-set.js';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';
import { activityTypesForPathwayStage } from '../src/vocabulary/pathway-model.js';
import { pathwayStageActivities } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

// Contract: Meaning → Match and Meaning → Apply must never render the same activity again.
//   Recognise: meaning_match and definition_to_word (single-word meaning recognition).
//   Match: word_definition_match ONLY (the tap-to-match word ↔ definition set).
//   Apply: which_situation_fits and meaning_in_context (a contextual situation + answer cards). The old drag types are retired from the ladder (Job 8).
const MATCH_STAGE = ['word_definition_match'];
const RECOGNISE_STAGE = ['meaning_match', 'definition_to_word'];
const APPLY_STAGE = ['which_situation_fits', 'meaning_in_context'];
const FORBIDDEN_UI = /<select|draggable|data-drag-|data-drop-target|data-gap-drop|vocab-drop-zone|vocab-drag-token|vocab-accessible-fallback|data-match-set|data-match-word|data-match-definition/;

const question = (activityType, occurrence) => {
  const item = unit.items.find(row => row.vocabularyId === occurrence.vocabularyId);
  return buildActivity({
    activityType, occurrence, item, contexts:unit.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId),
    unitActivities:unit.activities, unitItems:unit.items, unitContexts:unit.contexts, unitOccurrences:unit.occurrences, mastery:{}, readinessStage:'emerging', seed:'contract'
  });
};
const html = q => { const target = { innerHTML:'' }; renderVocabularyQuestion(target, { unitNumber:1, unitTitle:'Sports and Free Time', question:q, term:'x', sessionLabel:'1 / 10 activities', support:null, retry:false }); return target.innerHTML; };

test('regression: Meaning → Match serves exactly the word/definition set and nothing else', () => {
  assert.deepEqual(activityTypesForPathwayStage('meaning', 'match'), ['word_definition_match']);
  assert.equal(activityTypesForPathwayStage('meaning', 'match').includes('definition_to_word'), false, 'no one-at-a-time "Which word means…?" card in Match');
  assert.deepEqual([...activityTypesForPathwayStage('meaning', 'recognise')].sort(), [...RECOGNISE_STAGE].sort(), 'definition_to_word lives in Recognise');
  assert.deepEqual(activityTypesForPathwayStage('meaning', 'recall'), ['type_word_from_definition']);
  assert.deepEqual(activityTypesForPathwayStage('meaning', 'mastery'), ['gloss_in_context_type']);
});

test('pathway contract: Meaning Match and Meaning Apply keep their documented activity types', () => {
  assert.deepEqual([...pathwayStageActivities('meaning', 'match')].sort(), [...MATCH_STAGE].sort());
  assert.deepEqual([...pathwayStageActivities('meaning', 'apply')].sort(), [...APPLY_STAGE].sort());
});

test('only Meaning → Match activities may use the tap-to-match word/definition set', () => {
  assert.deepEqual([...MATCH_SET_TYPES], ['word_definition_match']);
  for (const type of APPLY_STAGE) assert.equal(MATCH_SET_TYPES.includes(type), false, `${type} must never use the set`);
  assert.deepEqual(MATCH_STAGE.filter(type => MATCH_SET_TYPES.includes(type)), MATCH_STAGE, 'every Match-stage type uses the set');
});

test('Apply activities are choice-based situation tasks; no live activity type uses the old drag_match mode', () => {
  assert.equal(activityDefinition('word_definition_match').responseMode, 'matching');
  for (const type of APPLY_STAGE) assert.equal(activityDefinition(type).responseMode, 'choice', type);
  for (const definition of ACTIVITY_TYPES) assert.notEqual(definition.responseMode, 'drag_match', `${definition.id} must not use the retired drag_match mode`);
});

test('rendered Apply activities never show the set, a dropdown, chips or a drop zone, and Match activities never show the Apply situation UI', () => {
  let applyChecked = 0; let matchChecked = 0;
  for (const occurrence of unit.occurrences) {
    for (const type of APPLY_STAGE) {
      let q; try { q = question(type, occurrence); } catch { continue; }
      assert.equal(usesMatchSet(q), false, `${type} ${occurrence.occurrenceId}`);
      const out = html(q);
      assert.doesNotMatch(out, FORBIDDEN_UI, `${type} ${occurrence.occurrenceId}`);
      assert.ok((out.match(/data-choice-answer=/g) ?? []).length >= 3, `${type}: answer cards`);
      applyChecked += 1;
    }
    // definition_to_word renders a single-cue match card; word_definition_match renders only through its set (match-set tests).
    let cue; try { cue = question('definition_to_word', occurrence); } catch { cue = null; }
    if (cue) {
      assert.doesNotMatch(html(cue), /<select|vocab-drop-zone|data-drop-target|draggable|data-match-set/, 'definition_to_word');
      matchChecked += 1;
    }
  }
  assert.ok(applyChecked >= 40 && matchChecked >= 40, `audited ${applyChecked} Apply and ${matchChecked} Match activities`);
});

test('Apply and Match never build the same activity: Apply shows a target-free situation, Match shows a set of pairs', () => {
  const occurrence = unit.occurrences.find(row => { try { question('drag_definition_word', row); question('drag_word_definition', row); question('word_definition_match', row); return true; } catch { return false; } });
  assert.ok(occurrence);
  const match = question('word_definition_match', occurrence);
  assert.ok(match.pairs.length >= 3 && usesMatchSet(match));
  for (const type of ['drag_word_definition', 'drag_definition_word']) {
    const apply = question(type, occurrence);
    assert.equal(apply.pairs, undefined);
    assert.equal(usesMatchSet(apply), false);
    assert.notEqual(apply.responseMode, match.responseMode);
    assert.notEqual(apply.prompt, match.prompt);
  }
});

test('source: the live renderer and controller have no route to the retired drag-match / dropdown UI', () => {
  const read = file => readFileSync(new URL(`../src/vocabulary/${file}`, import.meta.url), 'utf8');
  const sources = readdirSync(new URL('../src/vocabulary/', import.meta.url)).filter(file => file.endsWith('.js'));
  for (const file of sources) assert.doesNotMatch(read(file), /drag_match/, `${file} still references the retired drag_match mode`);
  const views = read('views.js');
  const matchingBranch = views.slice(views.indexOf("if (responseMode === 'matching') {"), views.indexOf("if (responseMode === 'drag_gap') {"));
  assert.ok(matchingBranch.length > 100, 'found the matching branch');
  assert.doesNotMatch(matchingBranch.replace(/\/\/.*$/gm, ''), /<select|drop-zone|data-drop-target|draggable/, 'the matching branch renders no dropdown, chips or drop zone');
  assert.match(views, /responseMode === 'drag_gap'/, 'the unrelated gap-fill drag UI is untouched');
  assert.match(read('views.js'), /Meaning Match needs its set of curated pairs/, 'Match without its set fails loudly instead of degrading to a dropdown');
  assert.match(read('match-set.js'), /MATCH_SET_TYPES\s*=\s*Object\.freeze\(\['word_definition_match'\]\)/);
});
