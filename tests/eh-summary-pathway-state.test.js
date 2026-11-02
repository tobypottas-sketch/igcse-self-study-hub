// H1: the Evidence Hub summary derives pathway state from the SAME persisted inputs and the SAME shared pure logic as the student app.
// Each scenario is run through the real student path (buildSetPathwayStates fed by coverageFromServerSetMembers) and through
// derivePathwayStates; `available` and `mastered` must agree. Synthetic fixtures only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSetPathwayStates } from '../src/vocabulary/set-progress.js';
import { coverageFromServerSetMembers } from '../src/vocabulary/data.js';
import { activeSetStep, groupSetRows, computePathwaySets } from '../supabase/functions/_shared/vocabulary-pathway-sets.js';
import { PATHWAY_IDS } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';
import { VOCABULARY_PATHWAYS } from '../src/vocabulary/pathway-model.js';
import { derivePathwayStates, isLiveOccurrence, LIVE_OCCURRENCE_FILTER } from '../supabase/functions/eh-summary/pathway-state.js';

const STUDENT = '00000000-0000-4000-8000-000000000001';
const occId = (unit, n) => `u${unit}_w${String(n).padStart(3, '0')}`;
const occurrences = (unit, count, over = {}) => Array.from({ length: count }, (_, i) => ({ occurrence_id: occId(unit, i + 1), unit_number: unit, position_in_unit: i + 1, status: 'live', active: true, ...over }));
const members = (unit, pathway, setCount, startSet = 1) => Array.from({ length: setCount * 10 }, (_, i) => ({ unit_number: unit, pathway_id: pathway, set_number: startSet + Math.floor(i / 10), position: (i % 10) + 1, occurrence_id: occId(unit, (startSet - 1) * 10 + i + 1) }));
const maintain = (unit, pathway, n) => ({ student_id: STUDENT, unit_number: unit, pathway_id: pathway, set_number: n, stage: 'mastery', phase: 'stage', status: 'maintain', completed_stages: ['recognise', 'match', 'apply', 'recall', 'mastery'] });
const active = (unit, pathway, n, stage = 'apply', phase = 'stage') => ({ student_id: STUDENT, unit_number: unit, pathway_id: pathway, set_number: n, stage, phase, status: 'active', completed_stages: [] });
const maintainAll = (unit, pathway, count) => Array.from({ length: count }, (_, i) => maintain(unit, pathway, i + 1));

// The student path, exactly as the app wires it: live+active occurrences of the unit in authored order, server members of the unit,
// and that unit's Set rows.
function studentStates({ unit, members: allMembers, occurrences: allOccurrences, setRows }) {
  const live = allOccurrences.filter(row => row.unit_number === unit && row.status === 'live' && row.active === true).sort((a, b) => a.position_in_unit - b.position_in_unit);
  const unitMembers = allMembers.filter(row => row.unit_number === unit);
  const coverage = coverageFromServerSetMembers(unitMembers, live);
  return buildSetPathwayStates({ occurrences: live, coverageByPathway: coverage, setRows: setRows.filter(row => row.unit_number === unit) });
}

function assertParity(label, scenario) {
  const unit = scenario.unit ?? 1;
  const student = studentStates({ ...scenario, unit });
  const derived = derivePathwayStates(scenario).units[unit]?.pathways ?? {};
  for (const pathway of VOCABULARY_PATHWAYS) {
    const s = student[pathway.id];
    const d = derived[pathway.id];
    assert.ok(d, `${label}: ${pathway.id} present`);
    assert.equal(d.available, s.available, `${label}: ${pathway.id} available`);
    assert.equal(d.state === 'mastered', s.mastered === true, `${label}: ${pathway.id} mastered`);
    assert.equal(d.state === 'none' || d.available === true, true, `${label}: ${pathway.id} none/available coherent`);
    if (!s.available) assert.equal(d.state, 'none', `${label}: ${pathway.id} unavailable is none`);
  }
  return { student, derived };
}

const base = () => ({
  occurrences: [...occurrences(1, 50), ...occurrences(2, 50)],
  members: [...members(1, 'meaning', 5), ...members(1, 'context', 5), ...members(2, 'meaning', 5)],
  setRows: [...maintainAll(1, 'meaning', 5), ...maintainAll(1, 'context', 3), ...maintainAll(2, 'meaning', 5)]
});

test('baseline: complete pathway is mastered, partial is in progress, unstarted/unpublished is none', () => {
  const { derived } = assertParity('baseline', base());
  assert.equal(derived.meaning.state, 'mastered');
  assert.equal(derived.context.state, 'in_progress');
  assert.equal(derived.word_families.state, 'none');
  assert.equal(derived.word_families.available, false);
});

test('an occurrence changed to non-live: 49 live ids leaves 4 Sets, so the 5-Set pathway is judged on 4', () => {
  const s = base();
  s.occurrences = s.occurrences.map(row => row.occurrence_id === occId(1, 50) ? { ...row, status: 'draft' } : row);
  assertParity('non-live', s);
  assert.equal(derivePathwayStates(s).units[1].pathways.meaning.setCount, 4);
});

test('active=false occurrence', () => {
  const s = base();
  s.occurrences = s.occurrences.map(row => row.occurrence_id === occId(1, 3) ? { ...row, active: false } : row);
  assertParity('inactive', s);
});

test('fewer than 10 live member ids while every Set is in maintain: unavailable, never mastered', () => {
  const s = base();
  s.occurrences = s.occurrences.map(row => row.unit_number === 1 && row.position_in_unit > 5 ? { ...row, active: false } : row);
  const { derived } = assertParity('below ten', s);
  assert.equal(derived.meaning.available, false);
  assert.equal(derived.meaning.state, 'none');
});

test('a sixth Set added reopens a completed pathway', () => {
  const s = base();
  s.occurrences = [...occurrences(1, 60), ...occurrences(2, 50)];
  s.members = [...members(1, 'meaning', 6), ...members(1, 'context', 5), ...members(2, 'meaning', 5)];
  const { derived } = assertParity('sixth set', s);
  assert.equal(derived.meaning.state, 'in_progress');
});

test('draft, reviewed and approved occurrences do not count as live', () => {
  for (const status of ['draft', 'reviewed', 'approved']) {
    const s = base();
    s.occurrences = s.occurrences.map(row => row.unit_number === 1 && row.position_in_unit <= 10 ? { ...row, status } : row);
    assertParity(status, s);
  }
});

test('duplicate member rows do not create extra Sets', () => {
  const s = base();
  s.members = [...s.members, ...s.members];
  assertParity('duplicates', s);
});

test('member rows for non-authored occurrences are ignored', () => {
  const s = base();
  s.members = [...s.members, ...Array.from({ length: 20 }, (_, i) => ({ unit_number: 1, pathway_id: 'meaning', set_number: 6 + Math.floor(i / 10), position: (i % 10) + 1, occurrence_id: `u1_missing${i}` }))];
  assertParity('non-authored', s);
});

test('unit isolation: other units neither add occurrences nor Set rows', () => {
  const s = base();
  const states = derivePathwayStates(s).units;
  assertParity('unit1', { ...s, unit: 1 });
  assertParity('unit2', { ...s, unit: 2 });
  assert.equal(states[1].pathways.meaning.state, 'mastered');
  assert.equal(states[2].pathways.context.state, 'none');
  assert.equal(states[2].pathways.context.available, false);
  const onlyOtherUnitRows = { ...s, setRows: maintainAll(2, 'meaning', 5) };
  assert.equal(derivePathwayStates(onlyOtherUnitRows).units[1].pathways.meaning.state, 'none');
});

test('12-Set cap', () => {
  const s = { occurrences: occurrences(1, 140), members: members(1, 'meaning', 14), setRows: maintainAll(1, 'meaning', 12) };
  const { derived } = assertParity('cap', s);
  assert.equal(derived.meaning.setCount, 12);
  assert.equal(derived.meaning.state, 'mastered');
});

test('unknown pathway ids in members or Set rows are ignored', () => {
  const s = base();
  s.members = [...s.members, ...members(1, 'future_pathway', 5)];
  s.setRows = [...s.setRows, ...maintainAll(1, 'future_pathway', 5)];
  const { derived } = assertParity('unknown pathway', s);
  assert.deepEqual(Object.keys(derived).sort(), [...PATHWAY_IDS].sort());
});

test('units with no live occurrences produce no entry', () => {
  const s = { occurrences: occurrences(3, 50, { status: 'draft' }), members: members(3, 'meaning', 5), setRows: maintainAll(3, 'meaning', 5) };
  assert.equal(derivePathwayStates(s).units[3], undefined);
});

test('malformed and hostile inputs fail neutral without throwing', () => {
  assert.deepEqual(derivePathwayStates({}).units, {});
  assert.deepEqual(derivePathwayStates({ occurrences: null, members: 'x', setRows: 5 }).units, {});
  const s = base();
  s.setRows = [...s.setRows, null, undefined, 'junk', { pathway_id: 'meaning' }, { unit_number: 1, pathway_id: 'meaning', set_number: 'NaN', status: 'maintain' }];
  assert.doesNotThrow(() => derivePathwayStates(s));
});

test('completion parity matrix: Set count 0..4 × row status/stage/phase combinations agree with activeSetStep and buildSetPathwayStates', () => {
  const variants = [
    { status: 'maintain', stage: 'mastery', phase: 'stage' },
    { status: 'active', stage: 'apply', phase: 'stage' },
    { status: 'active', stage: 'recall', phase: 'recovery' },
    { status: 'active', stage: 'match', phase: 'consolidate' },
    { status: 'active', stage: 'mastery', phase: 'fresh' },
    { status: 'weird', stage: 'bogus', phase: 'bogus' },
    null
  ];
  for (let setCount = 0; setCount <= 4; setCount += 1) {
    const total = variants.length ** setCount;
    for (let combo = 0; combo < total; combo += 1) {
      const rows = [];
      let rest = combo;
      for (let n = 1; n <= setCount; n += 1) {
        const v = variants[rest % variants.length];
        rest = Math.floor(rest / variants.length);
        if (v) rows.push({ student_id: STUDENT, unit_number: 1, pathway_id: 'meaning', set_number: n, completed_stages: [], ...v });
      }
      const scenario = { occurrences: occurrences(1, setCount * 10), members: members(1, 'meaning', setCount), setRows: rows };
      if (setCount === 0) {                                  // no live occurrences: the student app shows no unit, the summary has no entry
        assert.equal(derivePathwayStates(scenario).units[1], undefined);
        continue;
      }
      const { student, derived } = assertParity(`matrix ${setCount}/${combo}`, scenario);
      const expected = activeSetStep({ sets: computePathwaySets(Array.from({ length: setCount * 10 }, (_, i) => occId(1, i + 1)), { pathwayId: 'meaning' }), rowsForPathway: groupSetRows(rows).meaning ?? {} });
      assert.equal(derived.meaning.state === 'mastered', expected.firstPassComplete === true, `matrix ${setCount}/${combo} vs activeSetStep`);
      assert.equal(student.meaning.mastered, expected.firstPassComplete);
    }
  }
});

test('in_progress requires a Set row inside the current Set range; internal counts are exposed only as internal fields', () => {
  const s = { occurrences: occurrences(1, 30), members: members(1, 'meaning', 3), setRows: [active(1, 'meaning', 9)] };
  assert.equal(derivePathwayStates(s).units[1].pathways.meaning.state, 'none');
  s.setRows = [active(1, 'meaning', 2)];
  const meaning = derivePathwayStates(s).units[1].pathways.meaning;
  assert.equal(meaning.state, 'in_progress');
  assert.equal(meaning.setCount, 3);
  assert.equal(meaning.setsMaintained, 0);
});

test('pathway ids come from the shared contract and match the student pathway list', () => {
  assert.deepEqual(VOCABULARY_PATHWAYS.map(p => p.id), [...PATHWAY_IDS]);
});

test('static: the live-occurrence filter equals the student app filter', () => {
  assert.deepEqual(LIVE_OCCURRENCE_FILTER, { status: 'live', active: true });
  assert.equal(isLiveOccurrence({ status: 'live', active: true }), true);
  for (const bad of [{ status: 'draft', active: true }, { status: 'reviewed', active: true }, { status: 'approved', active: true }, { status: 'live', active: false }, { status: 'live' }, { active: true }, null, undefined]) assert.equal(isLiveOccurrence(bad), false);
  const data = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8').replace(/\s+/g, '');
  const needle = ".eq('status','live').eq('active',true)";
  assert.ok(data.split(needle).length - 1 >= 2, 'student dashboard and unit loaders both filter on status=live and active=true');
  const state = fs.readFileSync(new URL('../supabase/functions/eh-summary/pathway-state.js', import.meta.url), 'utf8');
  assert.match(state, /from '\.\.\/_shared\/vocabulary-pathway-sets\.js'/);
  assert.match(state, /from '\.\.\/_shared\/vocabulary-pathway-contract\.js'/);
  const imports = [...state.matchAll(/^\s*import[^;]*from\s+'([^']+)'/gm)].map(m => m[1]).sort();
  assert.deepEqual(imports, ['../_shared/vocabulary-pathway-contract.js', '../_shared/vocabulary-pathway-sets.js']);
});

test('static: pathway-state.js reimplements no Set arithmetic', () => {
  const state = fs.readFileSync(new URL('../supabase/functions/eh-summary/pathway-state.js', import.meta.url), 'utf8');
  assert.doesNotMatch(state, /Math\.floor|\/\s*10|SET_SIZE\s*\*|MAX_SETS/);
});
