// Characterisation ("golden") test for the pure Set availability/completion chain. It pins the CURRENT behaviour of
// computePathwaySets, setsFromCoverage, coverageFromServerSetMembers, normalizeSetRow, groupSetRows, activeSetStep and the Set
// constants through the student-facing modules, so moving the code into supabase/functions/_shared cannot change it.
// Synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as sets from '../src/vocabulary/pathway-sets.js';
import * as progress from '../src/vocabulary/set-progress.js';
import { coverageFromServerSetMembers } from '../src/vocabulary/data.js';
import { STAGE_ORDER } from '../src/vocabulary/stage-progression.js';
import { VOCABULARY_PATHWAYS } from '../src/vocabulary/pathway-model.js';
import { PATHWAY_IDS, PATHWAY_STAGE_IDS } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ids = n => Array.from({ length: n }, (_, i) => `u1_w${String(i + 1).padStart(3, '0')}`);

function computeMatrix() {
  const out = {};
  out.constants = { SET_SIZE: sets.SET_SIZE, MAX_SETS: sets.MAX_SETS, SET_READINESS: sets.SET_READINESS };
  out.setId = [sets.setIdFor('meaning', 3), sets.setIdFor(null, 1), sets.setIdFor(undefined, 12)];

  out.compute = [0, 1, 9, 10, 11, 19, 20, 49, 50, 51, 119, 120, 121, 200].map(n => sets.computePathwaySets(ids(n), { pathwayId: 'meaning' }));
  out.computeEdge = [
    sets.computePathwaySets(), sets.computePathwaySets(null), sets.computePathwaySets('nope'),
    sets.computePathwaySets([...ids(10), ...ids(10)], { pathwayId: 'context' }),
    sets.computePathwaySets(['', null, undefined, ...ids(10)].filter(() => true), {}),
    sets.computePathwaySets([...ids(9), 'u1_w001'])
  ];

  const authored = ids(30);
  const shuffled = [...authored].reverse();
  out.fromCoverage = [
    sets.setsFromCoverage('meaning', null),
    sets.setsFromCoverage('meaning', { available: false, occurrenceIds: authored }),
    sets.setsFromCoverage('meaning', { available: true, occurrenceIds: authored }),
    sets.setsFromCoverage('meaning', { available: true, occurrenceIds: shuffled }),
    sets.setsFromCoverage('meaning', { available: true, occurrenceIds: shuffled }, authored),
    sets.setsFromCoverage('meaning', { available: true, occurrenceIds: 'bad' }),
    sets.setsFromCoverage('meaning', { occurrenceIds: authored }, []),
    sets.setsFromCoverage('meaning', { available: true, occurrenceIds: authored }, authored.slice(0, 5))
  ];

  const member = (pathway, set, position, occ) => ({ pathway_id: pathway, set_number: set, position, occurrence_id: occ });
  const fullRows = pathway => ids(50).map((occ, i) => member(pathway, Math.floor(i / 10) + 1, (i % 10) + 1, occ));
  const rows = [...fullRows('meaning'), ...fullRows('context').slice(0, 20), ...fullRows('word_families').slice(0, 9)];
  const live = ids(50).map(occ => ({ occurrence_id: occ }));
  out.serverCoverage = [
    coverageFromServerSetMembers(rows, live),
    coverageFromServerSetMembers(rows, live.slice(0, 49)),
    coverageFromServerSetMembers(rows, live.slice(0, 15)),
    coverageFromServerSetMembers(rows, []),
    coverageFromServerSetMembers([], live),
    coverageFromServerSetMembers(undefined, undefined),
    coverageFromServerSetMembers([...rows, ...rows], live),
    coverageFromServerSetMembers([...rows, member('not_a_pathway', 1, 1, 'u1_w001'), member('meaning', 99, 1, 'u9_x')], live),
    coverageFromServerSetMembers(rows, live.map(({ occurrence_id }) => ({ occurrenceId: occurrence_id })))
  ];

  const rawRows = [
    {}, { pathway_id: 'meaning', set_number: 1 }, { pathwayId: 'meaning', setNumber: 2, stage: 'apply', phase: 'consolidate', status: 'maintain' },
    { pathway_id: 'meaning', unit_number: '3', set_number: '4', stage: 'bogus', phase: 'bogus', status: 'weird', completed_stages: ['recognise', 'nope', 'match'], weak_target_ids: [1, 2], advanced_with_support: 'x', support_flags: [{ a: 1 }] },
    { pathway_id: 'context', set_number: 0 }, { pathway_id: '', set_number: 1 }, { pathway_id: 'context', set_number: 1, status: 'maintain', stage: 'mastery' },
    null, undefined, 'junk'
  ];
  out.normalize = rawRows.filter(r => r !== null && r !== undefined && typeof r === 'object').map(r => progress.normalizeSetRow(r));
  out.normalizeDefault = progress.normalizeSetRow();
  out.group = [progress.groupSetRows(rawRows.filter(r => r !== null && r !== undefined)), progress.groupSetRows(), progress.groupSetRows('x'), progress.groupSetRows([])];

  const maint = n => ({ pathway_id: 'meaning', set_number: n, status: 'maintain', stage: 'mastery', phase: 'stage' });
  const act = (n, stage = 'apply', phase = 'stage') => ({ pathway_id: 'meaning', set_number: n, status: 'active', stage, phase, completed_stages: STAGE_ORDER.slice(0, STAGE_ORDER.indexOf(stage)) });
  const step = (count, rowList) => {
    const s = sets.computePathwaySets(ids(count * 10), { pathwayId: 'meaning' });
    return progress.activeSetStep({ sets: s, rowsForPathway: progress.groupSetRows(rowList).meaning ?? {} });
  };
  out.step = [
    progress.activeSetStep(), progress.activeSetStep({}), step(0, []), step(1, []), step(3, []),
    step(3, [maint(1)]), step(3, [maint(1), maint(2)]), step(3, [maint(1), maint(2), maint(3)]),
    step(3, [maint(1), act(2, 'recall', 'recovery')]), step(3, [act(1, 'match', 'consolidate')]), step(3, [act(1, 'mastery', 'fresh')]),
    step(2, [maint(1), maint(2), maint(3)]), step(5, [maint(1), maint(2), maint(3), maint(4)]), step(5, [maint(1), maint(2), maint(3), maint(4), maint(5)]),
    step(3, [maint(2), maint(3)]), step(3, [{ pathway_id: 'meaning', set_number: 1, status: 'maintain', stage: 'bogus' }]),
    progress.activeSetStep({ sets: sets.computePathwaySets(ids(20), { pathwayId: 'meaning' }), rowsForPathway: null })
  ];
  return out;
}

// Replaced with the digest recorded against the pre-extraction code.
const GOLDEN = {
  constants: '91a12bf0c1257429838d1a71f2183c14871024ef7d70239ef8f725877fd644b4', setId: '0a3d53c4f65f51ef2d90870f16feada53dff5a1bb439ef2b4785d36bba6407e7', compute: '073d1fd5e94cc61a0c0c3e071bc52f1151d11a357d4c9aed9a9b9596c09fb7c5', computeEdge: '08f1fc028ca88c0e2e7c3e363d10b41ea3f61f043ecf899f7ec88486b0be6d99', fromCoverage: 'bdd04406c725faa1f9dcd6c55cfcc810b95936f1fd8041c458208c72c6e33608',
  serverCoverage: '933396c498d33a93bccd13bd935fdcaa5e4610fc39c09871f92e060254ba3e79', normalize: '70353cf6d2691a296b948aab55bbd0425d3912906e6f9acde3f0aa0f762f1ab6', normalizeDefault: '7412abf3bb1dec34edc698c2bb44f5a9245c290a66b56d0bf94fd1a3fc798b04', group: 'c7dcef32de7b225c305ded157aa046012c5b6abdcef1ed23364a5e5fcd0c455b', step: '89ac4f645f757e4d2be2df1ed12c7a87fa63c6e0903ddde4fa508e208ef4a1e2'
};

test('golden: pure Set chain outputs are unchanged', () => {
  const matrix = computeMatrix();
  if (process.env.PRINT_GOLDEN) console.log(JSON.stringify(Object.fromEntries(Object.entries(matrix).map(([k, v]) => [k, digest(v)])), null, 2));
  for (const key of Object.keys(GOLDEN)) assert.equal(digest(matrix[key]), GOLDEN[key], key);
});

test('golden: spot checks that anchor the digests to known values', () => {
  assert.equal(sets.SET_SIZE, 10);
  assert.equal(sets.MAX_SETS, 12);
  assert.equal(sets.computePathwaySets(ids(49)).setCount, 4);
  assert.equal(sets.computePathwaySets(ids(200)).setCount, 12);
  assert.equal(coverageFromServerSetMembers([], []).meaning.available, false);
  assert.equal(progress.activeSetStep({ sets: sets.computePathwaySets(ids(0)) }).available, false);
});

test('contract: stage order and pathway ids match the shared contract', () => {
  assert.deepEqual([...STAGE_ORDER], [...PATHWAY_STAGE_IDS]);
  assert.deepEqual(VOCABULARY_PATHWAYS.map(p => p.id), [...PATHWAY_IDS]);
});
