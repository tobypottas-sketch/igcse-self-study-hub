// H2: pure per-student summary derivation. Synthetic fixtures only; no I/O.
import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveSummary } from '../supabase/functions/eh-summary/derive.js';

const STUDENT = '00000000-0000-4000-8000-000000000001';
const occId = (unit, n) => `u${unit}_w${String(n).padStart(3, '0')}`;
const occurrences = (unit, count) => Array.from({ length: count }, (_, i) => ({ occurrence_id: occId(unit, i + 1), unit_number: unit, position_in_unit: i + 1, status: 'live', active: true }));
const members = (unit, pathway, setCount) => Array.from({ length: setCount * 10 }, (_, i) => ({ unit_number: unit, pathway_id: pathway, set_number: Math.floor(i / 10) + 1, position: (i % 10) + 1, occurrence_id: occId(unit, i + 1) }));
const setRow = (unit, pathway, n, status = 'maintain', updated = '2026-10-20T04:00:00Z') => ({ student_id: STUDENT, unit_number: unit, pathway_id: pathway, set_number: n, stage: status === 'maintain' ? 'mastery' : 'apply', phase: 'stage', status, completed_stages: [], updated_at: updated, completed_at: status === 'maintain' ? updated : null });
const done = (unit, pathway, count, updated) => Array.from({ length: count }, (_, i) => setRow(unit, pathway, i + 1, 'maintain', updated));
const NOW = '2026-11-02T03:00:00Z';                                    // 11:00 on 2026-11-02 in Asia/Shanghai (a Monday)

const inputs = (over = {}) => ({ occurrences: [...occurrences(1, 50), ...occurrences(2, 50)], members: [], setRows: [], unitChecks: [], merits: [], events: [], now: NOW, since: '2026-09-01', ...over });
const meaningUnit1 = () => ({ members: members(1, 'meaning', 5), setRows: done(1, 'meaning', 5) });

// ---- activation ----------------------------------------------------------------------------------------------------------
test('one completed pair does not activate', () => {
  const s = deriveSummary(inputs({ ...meaningUnit1() }));
  assert.deepEqual(s.activation, { requiredPairs: 2, completedPairs: 1, activated: false });
});

test('two completed pairs activate', () => {
  const s = deriveSummary(inputs({ members: [...members(1, 'meaning', 5), ...members(1, 'context', 5)], setRows: [...done(1, 'meaning', 5), ...done(1, 'context', 5)] }));
  assert.deepEqual(s.activation, { requiredPairs: 2, completedPairs: 2, activated: true });
});

test('same pathway across two units is two pairs', () => {
  const s = deriveSummary(inputs({ members: [...members(1, 'meaning', 5), ...members(2, 'meaning', 5)], setRows: [...done(1, 'meaning', 5), ...done(2, 'meaning', 5)] }));
  assert.equal(s.activation.completedPairs, 2);
  assert.equal(s.activation.activated, true);
});

test('two pathways in one unit is two pairs', () => {
  const s = deriveSummary(inputs({ members: [...members(1, 'meaning', 5), ...members(1, 'word_families', 5)], setRows: [...done(1, 'meaning', 5), ...done(1, 'word_families', 5)] }));
  assert.equal(s.activation.completedPairs, 2);
});

test('a partial pathway does not count and is reported in progress', () => {
  const s = deriveSummary(inputs({ members: members(1, 'meaning', 5), setRows: done(1, 'meaning', 3) }));
  assert.equal(s.activation.completedPairs, 0);
  assert.deepEqual(s.pairs.map(p => [p.unit, p.pathway, p.state]), [[1, 'meaning', 'in_progress']]);
});

test('an unavailable pathway does not count and is not listed', () => {
  const s = deriveSummary(inputs({ members: members(1, 'meaning', 5), setRows: done(1, 'meaning', 5), occurrences: occurrences(1, 5) }));
  assert.equal(s.activation.completedPairs, 0);
  assert.deepEqual(s.pairs, []);
});

test('unknown pathways are ignored', () => {
  const s = deriveSummary(inputs({ members: [...members(1, 'future_pathway', 5), ...members(1, 'meaning', 5)], setRows: [...done(1, 'future_pathway', 5), ...done(1, 'meaning', 5)] }));
  assert.equal(s.activation.completedPairs, 1);
  assert.deepEqual(s.pairs.map(p => p.pathway), ['meaning']);
});

test('replay, Games, Unit Checks and merits do not add pairs', () => {
  const noise = {
    events: Array.from({ length: 30 }, (_, i) => ({ event_type: 'exercise_result', occurred_at: `2026-10-${String(1 + (i % 28)).padStart(2, '0')}T04:00:00Z`, pathway_id: null })),
    unitChecks: [{ unit_number: 1, attempt_number: 1, score: 10, max_score: 10, completed_at: '2026-10-01T04:00:00Z' }],
    merits: [{ merit_number: 1, awarded_at: '2026-10-02T04:00:00Z' }, { merit_number: 2, awarded_at: '2026-10-03T04:00:00Z' }]
  };
  const s = deriveSummary(inputs({ ...meaningUnit1(), ...noise }));
  assert.equal(s.activation.completedPairs, 1);
  assert.equal(s.activation.activated, false);
});

test('pairs are ordered by unit then pathway and carry only unit, pathway, state and lastActivityOn (no Set counts)', () => {
  const s = deriveSummary(inputs({
    members: [...members(2, 'meaning', 5), ...members(1, 'context', 5), ...members(1, 'meaning', 5)],
    setRows: [...done(2, 'meaning', 5, '2026-10-21T20:00:00Z'), ...done(1, 'context', 5, '2026-10-18T04:00:00Z'), ...done(1, 'meaning', 5, '2026-10-19T04:00:00Z')]
  }));
  assert.deepEqual(s.pairs.map(p => `${p.unit}:${p.pathway}`), ['1:meaning', '1:context', '2:meaning']);
  for (const pair of s.pairs) assert.deepEqual(Object.keys(pair).sort(), ['lastActivityOn', 'pathway', 'state', 'unit']);
  assert.ok(!JSON.stringify(s).match(/setCount|setsMaintained|setsMastered|setsTotal|masteredOn/));
});

test('lastActivityOn is the latest Set update as an Asia/Shanghai date; a late-evening UTC time rolls to the next local day', () => {
  const rows = [setRow(1, 'meaning', 1, 'maintain', '2026-10-19T04:00:00Z'), setRow(1, 'meaning', 2, 'maintain', '2026-10-20T17:30:00Z'), ...[3, 4, 5].map(n => setRow(1, 'meaning', n, 'maintain', '2026-10-15T04:00:00Z'))];
  const s = deriveSummary(inputs({ members: members(1, 'meaning', 5), setRows: rows }));
  assert.equal(s.pairs[0].lastActivityOn, '2026-10-21');
  assert.equal(s.lastPathwayActivityOn, '2026-10-21');
});

test('no pairs: no lastPathwayActivityOn key', () => {
  const s = deriveSummary(inputs());
  assert.deepEqual(s.pairs, []);
  assert.ok(!('lastPathwayActivityOn' in s));
});

// ---- Unit Checks ---------------------------------------------------------------------------------------------------------
test('Unit Checks list every attempt in unit then attempt order, with factual score, max and completion date', () => {
  const s = deriveSummary(inputs({ unitChecks: [
    { unit_number: 2, attempt_number: 1, score: 9, max_score: 10, completed_at: '2026-10-25T04:00:00Z', form_id: 'A', student_id: STUDENT },
    { unit_number: 1, attempt_number: 3, score: 4, max_score: 10, completed_at: '2026-10-22T04:00:00Z', form_id: 'C' },
    { unit_number: 1, attempt_number: 1, score: 8, max_score: 10, completed_at: '2026-10-10T04:00:00Z', form_id: 'A' },
    { unit_number: 1, attempt_number: 2, score: 10, max_score: 10, completed_at: '2026-10-15T16:30:00Z', form_id: 'B' }
  ] }));
  assert.deepEqual(s.unitChecks, [
    { unit: 1, attempt: 1, score: 8, max: 10, completedOn: '2026-10-10' },
    { unit: 1, attempt: 2, score: 10, max: 10, completedOn: '2026-10-16' },
    { unit: 1, attempt: 3, score: 4, max: 10, completedOn: '2026-10-22' },
    { unit: 2, attempt: 1, score: 9, max: 10, completedOn: '2026-10-25' }
  ]);
});

test('the latest attempt is last in its unit; the best attempt is never substituted or marked', () => {
  const s = deriveSummary(inputs({ unitChecks: [
    { unit_number: 1, attempt_number: 1, score: 10, max_score: 10, completed_at: '2026-10-10T04:00:00Z' },
    { unit_number: 1, attempt_number: 2, score: 3, max_score: 10, completed_at: '2026-10-20T04:00:00Z' }
  ] }));
  assert.equal(s.unitChecks.at(-1).score, 3);
  assert.ok(!JSON.stringify(s.unitChecks).match(/best|latest|good|bad|pass|fail/i));
});

test('invalid Unit Check rows are dropped; attempts above 3 are ignored; no attempts means no key', () => {
  const s = deriveSummary(inputs({ unitChecks: [
    null, 'x', { unit_number: 1, attempt_number: 4, score: 5, max_score: 10, completed_at: '2026-10-10T04:00:00Z' },
    { unit_number: 1, attempt_number: 1, score: 11, max_score: 10, completed_at: '2026-10-10T04:00:00Z' },
    { unit_number: 1, attempt_number: 1, score: 5, max_score: 10, completed_at: 'not a date' },
    { unit_number: 'x', attempt_number: 1, score: 5, max_score: 10, completed_at: '2026-10-10T04:00:00Z' }
  ] }));
  assert.ok(!('unitChecks' in s));
  assert.ok(!('unitChecks' in deriveSummary(inputs({ unitChecks: [] }))));
  assert.ok(!('unitChecks' in deriveSummary(inputs({ unitChecks: undefined }))));
});

// ---- merits --------------------------------------------------------------------------------------------------------------
test('merits report the factual count and the latest award date', () => {
  const s = deriveSummary(inputs({ merits: [{ merit_number: 1, awarded_at: '2026-09-10T04:00:00Z', awarded_by: STUDENT }, { merit_number: 2, awarded_at: '2026-10-25T04:00:00Z' }] }));
  assert.deepEqual(s.merits, { count: 2, latestAwardedOn: '2026-10-25' });
});

test('zero merits is a genuine zero with no date; unknown merits omit the key', () => {
  assert.deepEqual(deriveSummary(inputs({ merits: [] })).merits, { count: 0 });
  assert.ok(!('merits' in deriveSummary(inputs({ merits: undefined }))));
  assert.ok(!('merits' in deriveSummary(inputs({ merits: null }))));
});

// ---- engagement ----------------------------------------------------------------------------------------------------------
const ev = (at, over = {}) => ({ event_type: 'exercise_result', pathway_id: 'meaning', occurred_at: at, ...over });

test('pathway exercise_result events count; app_open, active_time, section_use, support_use and Games do not', () => {
  const s = deriveSummary(inputs({ events: [
    ev('2026-10-30T04:00:00Z'),
    ev('2026-10-29T04:00:00Z', { event_type: 'app_open' }), ev('2026-10-28T04:00:00Z', { event_type: 'active_time' }),
    ev('2026-10-27T04:00:00Z', { event_type: 'section_use' }), ev('2026-10-26T04:00:00Z', { event_type: 'support_use' }),
    ev('2026-10-25T04:00:00Z', { pathway_id: null }), ev('2026-10-24T04:00:00Z', { pathway_id: '' }), ev('2026-10-23T04:00:00Z', { pathway_id: undefined })
  ] }));
  assert.deepEqual(s.engagement, { lastActiveOn: '2026-10-30', activeDays8w: 1, activeWeeks8w: 1 });
});

test('a Unit Check completion counts as an active day', () => {
  const s = deriveSummary(inputs({ unitChecks: [{ unit_number: 1, attempt_number: 1, score: 7, max_score: 10, completed_at: '2026-10-28T04:00:00Z' }], events: [ev('2026-10-30T04:00:00Z')] }));
  assert.deepEqual(s.engagement, { lastActiveOn: '2026-10-30', activeDays8w: 2, activeWeeks8w: 1 });
});

test('several events on one local day are one active day, and the day boundary is Asia/Shanghai', () => {
  const s = deriveSummary(inputs({ events: [ev('2026-10-30T00:05:00Z'), ev('2026-10-30T09:00:00Z'), ev('2026-10-30T15:59:00Z'), ev('2026-10-30T16:01:00Z')] }));
  assert.equal(s.engagement.activeDays8w, 2);                       // 30th (UTC 00:05–15:59) and 31st local (UTC 16:01)
  assert.equal(s.engagement.lastActiveOn, '2026-10-31');
});

test('activeWeeks8w counts distinct calendar weeks (Monday start) inside the 56-day window', () => {
  const s = deriveSummary(inputs({ events: [
    ev('2026-11-01T04:00:00Z'),   // Sun 1 Nov  -> week of 26 Oct
    ev('2026-10-26T04:00:00Z'),   // Mon 26 Oct -> week of 26 Oct
    ev('2026-10-25T04:00:00Z'),   // Sun 25 Oct -> week of 19 Oct
    ev('2026-10-05T04:00:00Z'),   // Mon 5 Oct  -> week of 5 Oct
    ev('2026-09-10T04:00:00Z')    // Thu 10 Sep -> week of 7 Sep
  ] }));
  assert.equal(s.engagement.activeDays8w, 5);
  assert.equal(s.engagement.activeWeeks8w, 4);
});

test('weeks start on Monday: Sunday and the following Monday are different weeks, Monday and the following Sunday the same week', () => {
  assert.equal(deriveSummary(inputs({ events: [ev('2026-10-25T04:00:00Z'), ev('2026-10-26T04:00:00Z')] })).engagement.activeWeeks8w, 2);   // Sun 25, Mon 26 Oct
  assert.equal(deriveSummary(inputs({ events: [ev('2026-10-26T04:00:00Z'), ev('2026-11-01T04:00:00Z')] })).engagement.activeWeeks8w, 1);   // Mon 26 Oct, Sun 1 Nov
});

test('the window is exactly 56 days ending today: day 56 back is in, day 57 back is out', () => {
  const inside = deriveSummary(inputs({ events: [ev('2026-09-08T04:00:00Z')] }));    // 55 days before 2 Nov
  const outside = deriveSummary(inputs({ events: [ev('2026-09-07T04:00:00Z')] }));   // 56 days before 2 Nov
  assert.equal(inside.engagement.activeDays8w, 1);
  assert.equal(outside.engagement.activeDays8w, 0);
  assert.equal(outside.engagement.lastActiveOn, '2026-09-07');
});

test('events in the future are ignored', () => {
  const s = deriveSummary(inputs({ events: [ev('2026-11-05T04:00:00Z'), ev('2026-10-30T04:00:00Z')] }));
  assert.equal(s.engagement.activeDays8w, 1);
  assert.equal(s.engagement.lastActiveOn, '2026-10-30');
});

test('no active days at all: window counts are a genuine zero and lastActiveOn is omitted', () => {
  const s = deriveSummary(inputs({ events: [] }));
  assert.deepEqual(s.engagement, { activeDays8w: 0, activeWeeks8w: 0 });
});

test('since omitted: window counts are omitted (unknown), lastActiveOn is still reported', () => {
  const s = deriveSummary(inputs({ since: undefined, events: [ev('2026-10-30T04:00:00Z')] }));
  assert.deepEqual(s.engagement, { lastActiveOn: '2026-10-30' });
});

test('since later than the window start: counts would be incomplete, so they are omitted', () => {
  const s = deriveSummary(inputs({ since: '2026-10-15', events: [ev('2026-10-30T04:00:00Z')] }));
  assert.deepEqual(s.engagement, { lastActiveOn: '2026-10-30' });
});

test('events unknown (not an array): engagement is omitted entirely', () => {
  assert.ok(!('engagement' in deriveSummary(inputs({ events: undefined }))));
  assert.ok(!('engagement' in deriveSummary(inputs({ events: null }))));
});

test('invalid now: window counts omitted, nothing throws', () => {
  const s = deriveSummary(inputs({ now: 'nope', events: [ev('2026-10-30T04:00:00Z')] }));
  assert.deepEqual(s.engagement, { lastActiveOn: '2026-10-30' });
});

// ---- privacy and shape ---------------------------------------------------------------------------------------------------
test('the summary never contains identity, answers, form ids, event payloads or awarded_by', () => {
  const s = deriveSummary(inputs({
    ...meaningUnit1(),
    unitChecks: [{ unit_number: 1, attempt_number: 1, score: 8, max_score: 10, completed_at: '2026-10-10T04:00:00Z', form_id: 'A', student_id: STUDENT, answers: ['secret'] }],
    merits: [{ merit_number: 1, awarded_at: '2026-10-02T04:00:00Z', awarded_by: STUDENT, student_id: STUDENT }],
    events: [ev('2026-10-30T04:00:00Z', { metadata: { answer: 'secret' }, user_id: STUDENT, email: 'a@b.example', display_name: 'Fake Name' })]
  }));
  const text = JSON.stringify(s);
  assert.ok(!text.includes('@'));
  assert.ok(!text.includes(STUDENT));
  assert.ok(!text.match(/email|display|answer|secret|form|awarded_by|student_id|user_id|Fake Name/i));
});

test('top-level keys are only the contract keys', () => {
  const s = deriveSummary(inputs({ ...meaningUnit1(), merits: [], events: [ev('2026-10-30T04:00:00Z')], unitChecks: [{ unit_number: 1, attempt_number: 1, score: 8, max_score: 10, completed_at: '2026-10-10T04:00:00Z' }] }));
  assert.deepEqual(Object.keys(s).sort(), ['activation', 'engagement', 'lastPathwayActivityOn', 'merits', 'pairs', 'unitChecks']);
});

test('malformed inputs fail neutral without throwing', () => {
  assert.doesNotThrow(() => deriveSummary());
  assert.doesNotThrow(() => deriveSummary({}));
  assert.doesNotThrow(() => deriveSummary({ members: 5, occurrences: 'x', setRows: {}, unitChecks: 3, merits: 'm', events: 1, now: 5, since: 7 }));
  const s = deriveSummary({});
  assert.deepEqual(s.activation, { requiredPairs: 2, completedPairs: 0, activated: false });
  assert.deepEqual(s.pairs, []);
});

test('pure: inputs are not mutated and repeated calls give identical output', () => {
  const input = inputs({ ...meaningUnit1(), merits: [{ merit_number: 1, awarded_at: '2026-10-02T04:00:00Z' }], events: [ev('2026-10-30T04:00:00Z')] });
  const before = JSON.stringify(input);
  const a = deriveSummary(input);
  const b = deriveSummary(input);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(a, b);
});

test('derive.js reuses the H1 pathway state and does no I/O or logging', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../supabase/functions/eh-summary/derive.js', import.meta.url), 'utf8');
  assert.match(src, /from '\.\/pathway-state\.js'/);
  assert.doesNotMatch(src, /console\.|fetch\(|Deno\.|process\.|createClient|\.from\(/);
  assert.doesNotMatch(src, /Math\.floor\([^)]*\/\s*10\)|SET_SIZE|MAX_SETS/);
});
