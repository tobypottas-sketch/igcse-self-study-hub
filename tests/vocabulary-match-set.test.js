import test from 'node:test';
import assert from 'node:assert/strict';
import unit from '../content/vocabulary/releases/unit-01.js';
import { harness } from './vocabulary-app-harness.mjs';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { buildMatchSet, checkMatchSet, finishedMatchState, isMatchSetComplete, matchSetPairs, newMatchState, revealMatchSet, tapMatchItem, pairMatchItems, usesMatchSet } from '../src/vocabulary/match-set.js';
import { matchKeyTarget, matchStatusText, renderMatchSet } from '../src/vocabulary/match-set-view.js';

const sleep = ms => new Promise(done => setTimeout(done, ms));
const TYPES = ['word_definition_match'];
const APPLY_DRAG_TYPES = ['drag_word_definition', 'drag_definition_word'];   // legacy single-decision builders (off the ladder since Job 8)
const APPLY_LADDER_TYPES = ['which_situation_fits', 'meaning_in_context'];

// ── Fixtures: the real builders over real Unit 1 content ────────────────────────────────────────────
function realQuestion(activityType, occurrence = unit.occurrences[0], seed = 'seed') {
  const item = unit.items.find(row => row.vocabularyId === occurrence.vocabularyId);
  return buildActivity({
    activityType, occurrence, item, contexts:unit.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId),
    unitActivities:unit.activities, unitItems:unit.items, unitContexts:unit.contexts, unitOccurrences:unit.occurrences, mastery:{}, readinessStage:'emerging', seed
  });
}
const wordText = (set, id) => set.words.find(row => row.id === id).text;
const defText = (set, id) => set.definitions.find(row => row.id === id).text;
// Pairs every word with its correct definition, except the words in `wrong`, which are rotated among themselves.
function pairAll(set, state, wrong = []) {
  let next = state;
  const free = set.words.map(word => word.id).filter(id => !next.settled[id]);
  const swapped = Object.fromEntries(free.map(id => [id, set.key[id]]));
  if (wrong.length >= 2) wrong.forEach((id, index) => { swapped[id] = set.key[wrong[(index + 1) % wrong.length]]; });
  for (const id of free) {
    next = tapMatchItem(set, next, 'word', id);
    next = tapMatchItem(set, next, 'definition', swapped[id]);
  }
  return next;
}

// ── Layout: shuffled, unique, one valid definition per word ──────────────────────────────────────────
for (const type of TYPES) {
  test(`${type}: 4 unique words, 4 unique shuffled definitions, exactly one valid definition per word`, () => {
    for (const occurrence of unit.occurrences.slice(0, 12)) {
      const question = realQuestion(type, occurrence);
      assert.equal(usesMatchSet(question), true, `${occurrence.occurrenceId} renders as a matching set`);
      const set = buildMatchSet(question);
      assert.ok(set.words.length >= 4 && set.words.length <= 5, '4–5 pairs');
      assert.equal(set.definitions.length, set.words.length);
      assert.equal(new Set(set.words.map(row => row.text.toLowerCase())).size, set.words.length, 'no duplicate words');
      assert.equal(new Set(set.definitions.map(row => row.text.toLowerCase())).size, set.definitions.length, 'no duplicate definitions');
      // a bijection: every word has exactly one definition and every definition belongs to exactly one word
      assert.deepEqual(Object.keys(set.key).sort(), set.words.map(row => row.id).sort());
      assert.equal(new Set(Object.values(set.key)).size, set.words.length);
      for (const [wordId, definitionId] of Object.entries(set.key)) {
        const pair = matchSetPairs(question).find(row => row.term === wordText(set, wordId));
        assert.equal(defText(set, definitionId), pair.definition, 'the key matches the curated pair');
      }
      // shuffled: no definition sits in the row of its own word, and the order is not simply the word order
      set.words.forEach((word, row) => assert.notEqual(set.key[word.id], set.definitions[row].id, 'row does not give the pairing away'));
      assert.notDeepEqual(set.definitions.map(row => row.text), matchSetPairs(question).map(row => row.definition));
      // stable for one question (re-renders never reshuffle)
      assert.deepEqual(buildMatchSet(question), set);
    }
  });
}

test('layout shuffle differs between questions rather than being one fixed permutation', () => {
  const orders = new Set(unit.occurrences.slice(0, 20).map(occurrence => {
    const set = buildMatchSet(realQuestion('word_definition_match', occurrence));
    return set.words.map(word => set.definitions.findIndex(def => def.id === set.key[word.id])).join('');
  }));
  assert.ok(orders.size > 1);
});

test('duplicate definitions or words are removed; fewer than three pairs falls back to the legacy single-answer layout', () => {
  const base = realQuestion('word_definition_match');
  const dup = { ...base, pairs:[...base.pairs, { ...base.pairs[1], vocabularyId:'dup-id' }, { vocabularyId:'x', term:'zzz', definition:base.pairs[0].definition.toUpperCase() }] };
  assert.equal(matchSetPairs(dup).length, base.pairs.length, 'duplicate word and duplicate definition dropped');
  assert.equal(usesMatchSet({ ...base, pairs:base.pairs.slice(0, 2) }), false);
  assert.equal(usesMatchSet({ ...base, primaryEvidenceTargetId:'not-in-the-set' }), false);
  assert.equal(usesMatchSet({ ...base, type:'meaning_match' }), false, 'other activities are untouched');
});

// ── Pairing state machine ───────────────────────────────────────────────────────────────────────────
function fixture() { const question = realQuestion('word_definition_match'); const set = buildMatchSet(question); return { question, set, key:set.key }; }

test('tap word → tap definition → locked pair; either order pairs; selection replaces itself on the same side', () => {
  const { set, key } = fixture();
  const [w1, w2] = set.words.map(row => row.id);
  let state = tapMatchItem(set, newMatchState(), 'word', w1);
  assert.deepEqual(state.selected, { side:'word', id:w1 });
  state = tapMatchItem(set, state, 'word', w2);
  assert.deepEqual(state.selected, { side:'word', id:w2 }, 'choosing another word moves the selection');
  state = tapMatchItem(set, state, 'definition', key[w2]);
  assert.deepEqual(state.pairs, { [w2]:key[w2] });
  assert.equal(state.selected, null);
  assert.deepEqual(state.flash.paired, [w2]);
  const reverse = tapMatchItem(set, tapMatchItem(set, newMatchState(), 'definition', key[w1]), 'word', w1);
  assert.deepEqual(reverse.pairs, { [w1]:key[w1] });
});

test('a paired item cannot be reused: a definition or word is never in two pairs at once', () => {
  const { set, key } = fixture();
  const [w1, w2] = set.words.map(row => row.id);
  let state = tapMatchItem(set, tapMatchItem(set, newMatchState(), 'word', w1), 'definition', key[w2]);   // w1 ↔ (w2's definition)
  assert.equal(state.pairs[w1], key[w2]);
  // w2 is selected and then asks for the definition that is already taken: it does NOT get it while the pair stands
  state = tapMatchItem(set, state, 'word', w2);
  assert.equal(state.pairs[w2], undefined, 'selecting a word does not take a definition');
  assert.equal(state.pairs[w1], key[w2], 'the existing pair is untouched by selecting another word');
  state = tapMatchItem(set, state, 'definition', key[w2]);                                                 // tapping a paired item only releases that pair
  assert.equal(state.pairs[w2], undefined, 'the used definition was not handed to a second word');
  assert.equal(Object.keys(state.pairs).length, 0);
  for (const variant of [state, tapMatchItem(set, tapMatchItem(set, state, 'word', w2), 'definition', key[w2])]) {
    const used = Object.values({ ...variant.pairs, ...variant.settled });
    assert.equal(new Set(used).size, used.length, 'every definition is in at most one pair');
  }
});

test('a pair can be changed before Check, in either direction', () => {
  const { set, key } = fixture();
  const [w1, w2] = set.words.map(row => row.id);
  let state = tapMatchItem(set, tapMatchItem(set, newMatchState(), 'word', w1), 'definition', key[w2]);
  state = tapMatchItem(set, state, 'word', w1);                      // tap the paired word: releases and reselects it
  assert.deepEqual(state.pairs, {});
  assert.deepEqual(state.selected, { side:'word', id:w1 });
  state = tapMatchItem(set, state, 'definition', key[w1]);
  assert.deepEqual(state.pairs, { [w1]:key[w1] });
  state = tapMatchItem(set, state, 'definition', key[w1]);           // releasing from the definition side works too
  assert.deepEqual(state.pairs, {});
  assert.deepEqual(state.selected, { side:'definition', id:key[w1] });
});

test('nothing is marked until the whole set is paired; Check is not available early', () => {
  const { set, key } = fixture();
  let state = tapMatchItem(set, tapMatchItem(set, newMatchState(), 'word', set.words[0].id), 'definition', key[set.words[0].id]);
  assert.equal(isMatchSetComplete(set, state), false);
  const early = checkMatchSet(set, state);
  assert.equal(early.complete, false);
  assert.equal(early.rawAnswer, null);
  assert.deepEqual(early.state, state, 'an early check changes nothing');
  assert.deepEqual(state.settled, {}, 'no correctness shown while pairing');
});

test('Check evaluates the whole set: correct pairs lock for good, incorrect pairs reopen', () => {
  const { set } = fixture();
  const [a, b, c, d] = set.words.map(row => row.id);
  const checked = checkMatchSet(set, pairAll(set, newMatchState(), [a, b]));         // a and b swapped, c and d right
  assert.equal(checked.complete, true);
  assert.equal(checked.allCorrect, false);
  assert.deepEqual(checked.results, { [a]:'incorrect', [b]:'incorrect', [c]:'correct', [d]:'correct' });
  assert.deepEqual(Object.keys(checked.state.settled).sort(), [c, d].sort(), 'correct pairs settle');
  assert.deepEqual(checked.state.pairs, {}, 'incorrect pairs are released');
  assert.deepEqual([...checked.state.flash.incorrect].sort(), [a, b].sort());
  assert.deepEqual([...checked.state.flash.correct].sort(), [c, d].sort());
  assert.equal(checked.state.lastCheck.right, 2);
  // settled items cannot be moved or reused
  let next = tapMatchItem(set, checked.state, 'word', c);
  assert.deepEqual(next.settled, checked.state.settled);
  assert.equal(next.selected, null);
  next = tapMatchItem(set, tapMatchItem(set, checked.state, 'word', a), 'definition', set.key[c]);
  assert.equal(next.pairs[a], undefined, 'a locked definition cannot be taken');
});

test('retry/rematch: the reopened pairs can be matched again and the set completes', () => {
  const { set } = fixture();
  const [a, b] = set.words.map(row => row.id);
  const first = checkMatchSet(set, pairAll(set, newMatchState(), [a, b]));
  const again = checkMatchSet(set, pairAll(set, first.state));
  assert.equal(again.allCorrect, true);
  assert.equal(Object.keys(again.state.settled).length, set.words.length);
  assert.equal(again.state.checks, 2);
  assert.equal(isMatchSetComplete(set, finishedMatchState(set, again.state)), true);
  const shown = revealMatchSet(set, first.state);
  assert.deepEqual(shown.settled, set.key);
  assert.equal(shown.revealed, true);
  assert.deepEqual(tapMatchItem(set, shown, 'word', a), shown, 'a revealed set is read-only');
});

// ── The answer the existing attempt model records ─────────────────────────────────────────────────
for (const type of TYPES) {
  test(`${type}: the recorded answer is exactly what the server marks for the primary evidence target`, () => {
    for (const occurrence of unit.occurrences.slice(0, 10)) {
      const item = unit.items.find(row => row.vocabularyId === occurrence.vocabularyId);
      const sense = item.senses.find(row => row.senseId === occurrence.senseId) ?? item.senses[0];
      const question = realQuestion(type, occurrence);
      const set = buildMatchSet({ ...question, primaryEvidenceTargetId:question.primaryEvidenceTargetId });
      const markOf = raw => markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:{ contextId:question.contentId, acceptedAnswers:question.markingReference.acceptedAnswers }, questionType:type, rawAnswer:raw }).correct;
      const right = checkMatchSet(set, pairAll(set, newMatchState()));
      assert.equal(right.primaryCorrect, true);
      assert.equal(markOf(right.rawAnswer), true, 'correct set → the existing marker accepts the single recorded answer');
      assert.equal(right.rawAnswer, set.definitions.find(row => row.id === set.primaryDefinitionId).text);
      const wrongPair = checkMatchSet(set, pairAll(set, newMatchState(), [set.primaryWordId, set.words.find(word => word.id !== set.primaryWordId).id]));
      assert.equal(wrongPair.primaryCorrect, false);
      assert.equal(markOf(wrongPair.rawAnswer), false, 'primary pair wrong → the existing marker rejects it');
      assert.ok(String(wrongPair.rawAnswer).length > 0 && String(wrongPair.rawAnswer).length <= 500);
    }
  });
}

// ── Rendering ────────────────────────────────────────────────────────────────────────────────────
test('the set renders two sides with no dropdown, no drop zone, no chips and no duplicate fallback UI', () => {
  const { set } = fixture();
  const html = renderMatchSet(set, newMatchState());
  assert.equal((html.match(/data-match-word=/g) ?? []).length, set.words.length);
  assert.equal((html.match(/data-match-definition=/g) ?? []).length, set.definitions.length);
  assert.doesNotMatch(html, /<select|<option|data-drop-target|data-gap-drop|vocab-drop-zone|draggable|data-drag-|vocab-drag-token|vocab-accessible-fallback|Drop answer/i);
  assert.equal((html.match(/type="submit"/g) ?? []).length, 1, 'one Check control');
  assert.equal((html.match(/data-match-set(?=[\s>])/g) ?? []).length, 1);
  assert.match(html, /aria-disabled="true"[^>]*>Check answers/, 'Check is not available until everything is paired');
  assert.match(html, /role="status" aria-live="polite"/);
  assert.doesNotMatch(html, /data-correct|data-answer|data-key|is-correct/, 'correctness is not in the markup before Check');
  assert.equal((html.match(/data-match-word="w\d" style="grid-row:\d"/g) ?? []).length, set.words.length, 'one row per word');
});

test('paired items are identified by number, tone and partner label, and Check becomes available when all are paired', () => {
  const { set } = fixture();
  const state = pairAll(set, newMatchState());
  const html = renderMatchSet(set, state);
  assert.match(html, /aria-disabled="false"[^>]*>Check answers/);
  assert.equal((html.match(/is-paired/g) ?? []).length, set.words.length * 2);
  assert.match(html, /tone-1/); assert.match(html, /vocab-matchset__partner/);
  assert.match(html, /paired with/);
  assert.match(matchStatusText(set, state), /All \d paired\. Check your answers\./);
  const checked = checkMatchSet(set, pairAll(set, newMatchState(), set.words.slice(0, 2).map(row => row.id)));
  const reopened = renderMatchSet(set, checked.state, { retry:true });
  assert.match(reopened, /is-settled/); assert.match(reopened, /is-shake/); assert.match(reopened, /is-ticked/);
  assert.match(reopened, /2 of \d matched correctly\. Match the other 2 again\./);
  const done = renderMatchSet(set, finishedMatchState(set, checkMatchSet(set, pairAll(set, newMatchState())).state), { finished:true });
  assert.doesNotMatch(done, /type="submit"/);
  assert.match(done, /All \d matches are correct\./);
  assert.equal((done.match(/ disabled/g) ?? []).length, set.words.length * 2, 'finished items are read-only');
});

test('keyboard model: arrows move within and across columns; Enter/Space use the native button', () => {
  const { set } = fixture();
  const [w1, w2] = set.words.map(row => row.id); const [d1] = set.definitions.map(row => row.id);
  assert.deepEqual(matchKeyTarget(set, 'word', w1, 'ArrowDown'), { side:'word', id:w2 });
  assert.deepEqual(matchKeyTarget(set, 'word', w1, 'ArrowUp'), { side:'word', id:w1 });
  assert.deepEqual(matchKeyTarget(set, 'word', w1, 'ArrowRight'), { side:'definition', id:d1 });
  assert.deepEqual(matchKeyTarget(set, 'definition', d1, 'ArrowLeft'), { side:'word', id:w1 });
  assert.deepEqual(matchKeyTarget(set, 'word', w1, 'End'), { side:'word', id:set.words.at(-1).id });
  assert.equal(matchKeyTarget(set, 'word', w1, 'a'), null);
  assert.match(renderMatchSet(set, newMatchState()), /<button type="button" class="vocab-matchset__item vocab-matchset__item--word/);
});

// ── Inside the real controller: one set is one activity ────────────────────────────────────────────
// The fake server marks exactly as the Edge Function does for item-backed activities (itemMarking + markCuratedAnswer).
function serverMark(payload) {
  const occurrence = unit.occurrences.find(row => row.occurrenceId === payload.occurrenceId);
  const item = unit.items.find(row => row.vocabularyId === occurrence.vocabularyId);
  const sense = item.senses.find(row => row.senseId === occurrence.senseId) ?? item.senses[0];
  const acceptedAnswers = ['definition_to_word', 'drag_definition_word'].includes(payload.questionType)
    ? [item.term] : [...new Set([sense.meaning, item.coreMeaning, ...(sense.acceptedParaphrases ?? [])].map(value => String(value ?? '').trim()).filter(Boolean))];
  return markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:{ acceptedAnswers }, questionType:payload.questionType, rawAnswer:payload.rawAnswer }).correct;
}
async function play(options = {}) {
  // The planner picks one of two Match-stage activities at random; keep starting until the matching set is served.
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const h = harness({ pathwayId:'meaning', stage:'match', size:3, deterministic:true, serverCorrect:payload => serverMark(payload), ...options });
    await h.run("startPathwaySession('meaning')");
    if (h.state.current?.matchSet) return h;
  }
  throw new Error('The matching set was never served');
}
const cur = h => h.state.current;
const tap = (h, side, id) => h.run(`handleMatchTap({ dataset:{ ${side === 'word' ? 'matchWord' : 'matchDefinition'}:'${id}' } })`);
const pairAllInApp = (h, wrong = []) => {
  const { matchSet } = cur(h);
  const mapping = Object.fromEntries(matchSet.words.filter(word => !cur(h).matchState.settled[word.id]).map(word => [word.id, matchSet.key[word.id]]));
  if (wrong.length >= 2) wrong.forEach((id, index) => { mapping[id] = matchSet.key[wrong[(index + 1) % wrong.length]]; });
  for (const [wordId, definitionId] of Object.entries(mapping)) { tap(h, 'word', wordId); tap(h, 'definition', definitionId); }
};
const check = h => h.run('handleAnswer(null)');
const practised = h => h.state.session.summary.practised;

test('the Match stage serves the matching set, and its answer payload is the existing single-answer attempt', async () => {
  const h = await play();
  const current = cur(h);
  assert.equal(current.question.type, 'word_definition_match');
  assert.ok(current.matchSet && current.matchState);
  pairAllInApp(h);
  check(h);
  await h.state.attempts.settled();
  assert.equal(h.saved.length, 1, 'one attempt for one set');
  const payload = h.saved[0];
  assert.equal(payload.questionType, 'word_definition_match');
  assert.equal(payload.firstAttempt, true); assert.equal(payload.retryUsed, false);
  assert.equal(payload.primaryEvidenceTargetId, current.primaryEvidenceTargetId);
  assert.equal(payload.rawAnswer, current.matchSet.definitions.find(row => row.id === current.matchSet.primaryDefinitionId).text);
  assert.equal(h.rejected.length, 0, 'the server validation accepts the payload');
  assert.equal(current.answered, true);
});

test('mission counting: one set is one counted activity, however many pairs it holds or how often it is rechecked', async () => {
  const h = await play({ size:3 });
  const before = practised(h);
  const first = cur(h);
  // 1) Check with the primary pair wrong → first attempt wrong, supported retry, nothing counted yet
  pairAllInApp(h, [first.matchSet.primaryWordId, first.matchSet.words.find(word => word.id !== first.matchSet.primaryWordId).id]);
  check(h);
  assert.equal(first.retry, true); assert.equal(Boolean(first.answered), false);
  assert.equal(practised(h), before, 'a miss on the first Check does not count the activity yet');
  assert.equal(h.state.session.completedTargetIds.length, 0);
  assert.equal(Object.keys(first.matchState.settled).length >= 1, true, 'correct pairs stayed locked');
  assert.equal(first.matchState.pairs[first.matchSet.primaryWordId], undefined, 'the missed pair reopened');
  // 2) Rematch → the retry attempt, then the activity counts exactly once
  pairAllInApp(h);
  check(h);
  await h.state.attempts.settled();
  assert.equal(first.answered, true);
  assert.equal(practised(h), before, 'a set that needed the retry is recycled for recovery like any activity: it is counted when the recovery succeeds, never per pair');
  assert.equal(h.state.session.completedTargetIds.length, 0);
  assert.deepEqual(h.saved.map(row => [row.firstAttempt, row.retryUsed]), [[true, false], [false, true]], 'first attempt then supported retry, as for every activity');
  assert.equal(new Set(h.saved.map(row => row.attemptId)).size, 2, 'two attempts, two stable ids');
  assert.equal(h.state.queue.some(target => target.occurrenceId === first.target.occurrenceId), true, 'the missed target is queued for recovery exactly like any other activity');
});

test('a clean set is one attempt and counts once; the whole mission never inflates', async () => {
  const h = await play({ size:3 });
  let activities = 0; let sets = 0;
  for (let guard = 0; guard < 12 && h.state.current && !h.summaries.length; guard += 1) {
    const current = cur(h);
    if (current.matchSet) { pairAllInApp(h); check(h); sets += 1; }
    else await h.run(`handleAnswer(null, ${JSON.stringify(current.question.markingReference.acceptedAnswers[0])})`);
    activities += 1;
    await h.state.attempts.settled();
    if (cur(h)?.answered) await h.run('advanceToNextQuestion()');
  }
  await h.state.attempts.settled(); await sleep(5);
  assert.ok(sets >= 1);
  assert.equal(activities, 3);
  assert.equal(h.summaries.length, 1);
  assert.equal(h.saved.length, activities, 'exactly one persisted attempt per activity (no per-pair attempts)');
  assert.equal(h.state.session.summary.practised, 3, 'three targets, three counted activities — not 4 × 3 pairs');
  assert.equal(h.rejected.length, 0);
});

test('primary pair right but another pair wrong is formative: no attempt, no counters, then the set completes as a first-attempt success', async () => {
  const h = await play({ size:3 });
  const current = cur(h); const { matchSet } = current;
  const others = matchSet.words.filter(word => word.id !== matchSet.primaryWordId);
  pairAllInApp(h, [others[0].id, others[1].id]);          // two non-primary words swapped
  check(h);
  assert.equal(h.requests.length, 0, 'nothing sent');
  assert.equal(h.saved.length, 0);
  assert.equal(practised(h), 0);
  assert.equal(current.retry, false, 'the supported retry was not consumed');
  assert.equal(Boolean(current.answered), false);
  assert.equal(current.matchState.settled[matchSet.primaryWordId], matchSet.key[matchSet.primaryWordId]);
  assert.equal(Object.keys(current.matchState.pairs).length, 0, 'wrong pairs reopened');
  pairAllInApp(h);
  check(h);
  await h.state.attempts.settled();
  assert.equal(h.saved.length, 1);
  assert.equal(h.saved[0].firstAttempt, true, 'the primary pair was right the first time it was checked');
  assert.equal(practised(h), 1);
});

test('Check before every word is paired does nothing: no attempt, no counters, set kept', async () => {
  const h = await play({ size:3 });
  const current = cur(h);
  tap(h, 'word', current.matchSet.words[0].id); tap(h, 'definition', current.matchSet.key[current.matchSet.words[0].id]);
  check(h);
  assert.equal(h.requests.length, 0); assert.equal(practised(h), 0); assert.equal(Boolean(current.answered), false);
  assert.equal(Object.keys(current.matchState.pairs).length, 1, 'the pairing made so far is kept');
});

test('a second miss on the primary pair shows the answers and moves on; the target is recycled once', async () => {
  const h = await play({ size:3 });
  const current = cur(h); const { matchSet } = current;
  const other = matchSet.words.find(word => word.id !== matchSet.primaryWordId).id;
  pairAllInApp(h, [matchSet.primaryWordId, other]); check(h);
  assert.equal(current.retry, true);
  pairAllInApp(h, [matchSet.primaryWordId, other]); check(h);          // both reopened, the same two swapped again
  await h.state.attempts.settled();
  assert.equal(current.answered, true);
  assert.equal(current.support?.action, 'move_on');
  assert.equal(current.matchState.revealed, true);
  assert.deepEqual(current.matchState.settled, matchSet.key, 'the correct matches are shown');
  assert.equal(h.saved.length, 2);
  assert.equal(h.state.queue.filter(target => target.occurrenceId === current.target.occurrenceId).length, 1, 'queued for recovery once');
  assert.equal(practised(h), 0, 'not counted until its recovery succeeds, exactly like every other activity');
  assert.equal(h.rejected.length, 0);
});

test('persistence semantics hold for a set: a failed save retries with the same attempt id, once', async () => {
  const h = await play({ size:3, fail:(_payload, index) => index <= 1 });
  pairAllInApp(h); check(h);
  await h.state.attempts.settled();
  assert.equal(h.requests.length, 2);
  assert.equal(new Set(h.requests.map(row => row.attemptId)).size, 1, 'same attempt id on the retry');
  assert.equal(h.saved.length, 1);
  assert.equal(h.state.attempts.blocked, false);
});

// ── Meaning → Apply is a different task: a contextual situation, never the word/definition set ─────────
// The deterministic harness serves a fixed Apply activity per session size; try sizes until the wanted type appears.
const playApply = async (wanted, options = {}) => {
  // The first word of the Set is the first served, so try each word as the first until the wanted type appears.
  for (const size of options.size ? [options.size] : [2, 3, 4, 5, 6, 7, 8]) {
    for (const first of unit.items.slice(0, 12).map(row => row.term)) {
      const h = harness({ pathwayId:'meaning', stage:'apply', deterministic:true, serverCorrect:payload => serverMark(payload), ...options, size, terms:[first] });
      await h.run("startPathwaySession('meaning')");
      if (wanted.includes(cur(h).question.type)) return h;
    }
  }
  return null;
};
const answerNow = (h, value) => h.run(`handleAnswer(null, ${JSON.stringify(value)})`);

test('Apply: drag_word_definition and drag_definition_word are single-decision situation choices, not the word/definition set', () => {
  for (const type of APPLY_DRAG_TYPES) {
    let built = 0;
    for (const occurrence of unit.occurrences) {
      const item = unit.items.find(row => row.vocabularyId === occurrence.vocabularyId);
      let question;
      try { question = realQuestion(type, occurrence); } catch (error) { assert.match(error.message, /plausible unit alternatives|situation/i); continue; } // not eligible: the session never offers it
      built += 1;
      assert.equal(usesMatchSet(question), false, `${type} must not use the tap-to-match set`);
      assert.equal(question.responseMode, 'choice');
      assert.equal(question.pairs, undefined);
      const [instruction, ...situationLines] = question.prompt.split('\n');
      const situation = situationLines.join('\n');
      assert.ok(situation.length > 20, 'a real situation is shown');
      assert.match(instruction, /situation/i);
      assert.equal(situation.toLowerCase().includes(item.term.toLowerCase()), false, `${type}: the situation does not show the target word`);
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options).size, 4);
      assert.ok(question.options.includes(question.markingReference.acceptedAnswers[0]));
      assert.equal(question.primaryEvidenceTargetId, item.vocabularyId);
      // the situation is not a dictionary definition of the word
      const sense = item.senses.find(row => row.senseId === occurrence.senseId) ?? item.senses[0];
      assert.notEqual(situation.trim().toLowerCase(), String(sense.meaning).trim().toLowerCase());
    }
    assert.ok(built >= 20, `${type}: the live Unit 1 content serves many Apply situations (${built})`);
  }
});

test('Apply: the server marks the situation answer with the existing rules (word for Situation → Word, meaning for Situation → Meaning)', () => {
  for (const type of APPLY_DRAG_TYPES) {
    for (const occurrence of unit.occurrences.slice(0, 20)) {
      const question = realQuestion(type, occurrence);
      const item = unit.items.find(row => row.vocabularyId === occurrence.vocabularyId);
      const answer = question.markingReference.acceptedAnswers[0];
      if (type === 'drag_definition_word') assert.equal(answer, item.term);
      const base = { occurrenceId:occurrence.occurrenceId, questionType:type };
      assert.equal(serverMark({ ...base, rawAnswer:answer }), true);
      for (const wrong of question.options.filter(option => option !== answer)) assert.equal(serverMark({ ...base, rawAnswer:wrong }), false, `${type}: distractor "${wrong}" is not accepted`);
    }
  }
});

test('Apply (browser-free app run): no set, no drop zone, no dropdown; one decision is one attempt and one counted activity', async () => {
  const served = [];
  for (const type of APPLY_LADDER_TYPES) {
    const h = await playApply([type]);
    if (!h) continue;
    served.push(type);
    const current = cur(h);
    assert.equal(Boolean(current.matchSet), false, `${type} never builds a match set`);
    assert.ok(!current.matchState);
    const before = practised(h);
    const answer = current.question.markingReference.acceptedAnswers[0];
    await answerNow(h, answer);
    await h.state.attempts.settled();
    assert.equal(h.saved.length, 1, 'one visible activity = one attempt');
    assert.equal(h.saved[0].rawAnswer, answer);
    assert.equal(h.saved[0].questionType, type);
    assert.equal(h.saved[0].primaryEvidenceTargetId, current.primaryEvidenceTargetId);
    assert.equal(h.saved[0].firstAttempt, true); assert.equal(h.saved[0].retryUsed, false);
    assert.equal(h.rejected.length, 0, 'the server validation accepts the payload');
    assert.equal(practised(h), before + 1, 'the mission counter advances exactly once');
  }
  assert.ok(served.includes('which_situation_fits'), `the Apply stage serves the situation task (${served})`);
});

test('Apply retry/recovery: a miss gives a supported retry, the target comes back once, and the activity counts exactly once', async () => {
  const h = await playApply(['which_situation_fits'], { size:2 });
  const first = cur(h);
  const answer = first.question.markingReference.acceptedAnswers[0];
  const wrong = first.question.options.find(option => option !== answer);
  await answerNow(h, wrong);
  assert.equal(first.retry, true, 'a supported retry follows the first miss');
  assert.equal(Boolean(first.matchSet), false);
  assert.ok(first.question.options.length <= 4);
  assert.equal(practised(h), 0, 'a miss does not count the activity');
  await answerNow(h, answer);                                              // supported retry succeeds
  await h.state.attempts.settled();
  await h.run('advanceToNextQuestion()');
  // size 2: the other target is served first (answered correctly), then the missed target returns as a recovery question
  let guard = 0;
  while (!cur(h).recovery && guard++ < 4) {
    await answerNow(h, cur(h).question.markingReference.acceptedAnswers[0]);
    await h.state.attempts.settled(); await h.run('advanceToNextQuestion()');
  }
  const recovery = cur(h);
  assert.equal(recovery.recovery, true, 'the missed target is recycled once');
  assert.equal(recovery.target.occurrenceId, first.target.occurrenceId);
  await answerNow(h, recovery.question.markingReference.acceptedAnswers[0]);
  await h.state.attempts.settled(); await h.run('advanceToNextQuestion()'); await sleep(5);
  assert.equal(practised(h), 2, 'two targets, each counted once (the missed one only after its recovery)');
  assert.equal(h.saved.length, 4, 'miss, retry, other target, recovery: one attempt each, never more');
  assert.equal(new Set(h.saved.map(row => row.attemptId)).size, 4);
  assert.equal(h.rejected.length, 0);
});

test('Apply persistence: a failed save retries with the same attempt id, once', async () => {
  const h = await playApply(['which_situation_fits'], { size:2, fail:(_payload, index) => index <= 1 });
  await answerNow(h, cur(h).question.markingReference.acceptedAnswers[0]);
  await h.state.attempts.settled();
  assert.equal(h.requests.length, 2);
  assert.equal(new Set(h.requests.map(row => row.attemptId)).size, 1);
  assert.equal(h.saved.length, 1);
  assert.equal(h.state.attempts.blocked, false);
});

test('a missed set is recovered by a fresh question and then counts exactly once (mission total unchanged)', async () => {
  const h = await play({ size:1 });
  const first = cur(h); const { matchSet } = first;
  const other = matchSet.words.find(word => word.id !== matchSet.primaryWordId).id;
  pairAllInApp(h, [matchSet.primaryWordId, other]); check(h);            // first attempt wrong
  pairAllInApp(h); check(h);                                              // supported retry succeeds
  await h.state.attempts.settled();
  await h.run('advanceToNextQuestion()');
  const recovery = cur(h);
  assert.notEqual(recovery, first);
  assert.equal(recovery.recovery, true, 'the missed target comes back as a recovery question');
  assert.equal(recovery.target.occurrenceId, first.target.occurrenceId);
  if (recovery.matchSet) { pairAllInApp(h); check(h); } else await h.run(`handleAnswer(null, ${JSON.stringify(recovery.question.markingReference.acceptedAnswers[0])})`);
  await h.state.attempts.settled(); await h.run('advanceToNextQuestion()'); await sleep(5);
  assert.equal(h.state.session.summary.practised, 1, 'one target, counted once');
  assert.equal(h.state.session.completedTargetIds.length, 1);
  assert.equal(h.summaries.length, 1);
  assert.equal(h.saved.length, 3, 'miss, retry, recovery — one attempt each, never one per pair');
  assert.equal(new Set(h.saved.map(row => row.attemptId)).size, 3);
});

test('pairMatchItems (drag and drop) pairs a word and definition, replaces earlier pairings, and ignores unknown or settled items', () => {
  const set = buildMatchSet(realQuestion('word_definition_match'));
  const [a, b] = set.words;
  const defA = set.pairs ? set.pairs[a.id] : null;
  const ids = set.definitions.map(row => row.id);
  let state = pairMatchItems(set, newMatchState(set), a.id, ids[0]);
  assert.equal(state.pairs[a.id], ids[0]);
  assert.deepEqual(state.flash.paired, [a.id]);
  // dropping a second word on the same definition steals it: one definition, one word
  state = pairMatchItems(set, state, b.id, ids[0]);
  assert.equal(state.pairs[b.id], ids[0]);
  assert.equal(state.pairs[a.id], undefined);
  // re-dropping the first word on another definition moves it
  state = pairMatchItems(set, state, a.id, ids[1]);
  assert.equal(state.pairs[a.id], ids[1]);
  assert.equal(Object.keys(state.pairs).length, 2);
  // unknown ids and settled pairs are ignored
  assert.equal(pairMatchItems(set, state, 'nope', ids[2]), state);
  const settled = { ...state, settled: { [a.id]: ids[1] }, pairs: {} };
  assert.equal(pairMatchItems(set, settled, a.id, ids[2]), settled);
  void defA;
});
