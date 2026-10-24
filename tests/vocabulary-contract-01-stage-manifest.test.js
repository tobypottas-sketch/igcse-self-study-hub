// Part 1: the approved stage contract as an executable manifest, and today's production map checked against it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGE_CONTRACT, STAGE_ORDER, PATHWAY_ORDER, MODE_RANK, ACTIVITY_REGISTRY, contractTypes, contractName } from './support/vocabulary-contract/stage-contract-manifest.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';
import { PATHWAY_ACTIVITY_MAP, PATHWAY_STAGE_IDS, PATHWAY_IDS } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

// ---------- A. The manifest itself is coherent (these protect the contract from drifting) ----------
test('manifest: all six pathways exist, in the approved set', () => {
  assert.deepEqual([...PATHWAY_ORDER].sort(), ['context', 'meaning', 'paraphrasing', 'precision_use', 'spelling_recall', 'word_families']);
  assert.deepEqual(Object.keys(STAGE_CONTRACT).sort(), [...PATHWAY_ORDER].sort());
});
test('manifest: stage names and order are exactly Recognise → Match → Apply → Recall → Mastery', () => {
  assert.deepEqual([...STAGE_ORDER], ['recognise', 'match', 'apply', 'recall', 'mastery']);
  for (const p of PATHWAY_ORDER) assert.deepEqual(Object.keys(STAGE_CONTRACT[p]), [...STAGE_ORDER], p);
});
test('manifest: every stage has at least one activity type and every type is registered', () => {
  for (const p of PATHWAY_ORDER) for (const s of STAGE_ORDER) {
    const types = contractTypes(p, s);
    assert.ok(types.length >= 1, `${p}/${s} has no activity`);
    for (const t of types) assert.ok(ACTIVITY_REGISTRY[t], `${p}/${s}: ${t} is not in the registry`);
  }
});
test('manifest: response-mode rank never decreases, and every activity matches its stage rank', () => {
  for (const p of PATHWAY_ORDER) {
    let previous = 0;
    for (const s of STAGE_ORDER) {
      const entry = STAGE_CONTRACT[p][s];
      assert.ok(entry.responseModeRank >= previous, `${p}/${s} rank drops`);
      previous = entry.responseModeRank;
      for (const t of entry.activityTypes) assert.equal(MODE_RANK[ACTIVITY_REGISTRY[t].mode], entry.responseModeRank, `${p}/${s}/${t} mode rank differs from its stage`);
    }
  }
});
test('manifest: Mastery rank is at least Recall rank in every pathway', () => {
  for (const p of PATHWAY_ORDER) assert.ok(STAGE_CONTRACT[p].mastery.responseModeRank >= STAGE_CONTRACT[p].recall.responseModeRank, p);
});
test('manifest: no activity type appears in two stages of one pathway', () => {
  for (const p of PATHWAY_ORDER) {
    const seen = new Map();
    for (const s of STAGE_ORDER) for (const t of contractTypes(p, s)) {
      assert.ok(!seen.has(t), `${p}: ${t} appears in both ${seen.get(t)} and ${s}`);
      seen.set(t, s);
    }
  }
});
test('manifest: Mastery allows no options or word bank and requires typing', () => {
  for (const p of PATHWAY_ORDER) {
    const m = STAGE_CONTRACT[p].mastery;
    assert.equal(m.optionsAllowed, false, p); assert.equal(m.bankAllowed, false, p); assert.equal(m.typingRequired, true, p);
    assert.equal(m.scaffoldCeiling, 'none', p);
    for (const t of m.activityTypes) assert.equal(ACTIVITY_REGISTRY[t].mode, 'typed_transfer', `${p}/${t}`);
  }
});
test('manifest: Recall and Mastery are productive; Recognise, Match and Apply are not', () => {
  for (const p of PATHWAY_ORDER) for (const s of STAGE_ORDER) {
    const e = STAGE_CONTRACT[p][s];
    assert.equal(e.productive, s === 'recall' || s === 'mastery', `${p}/${s}`);
    assert.equal(e.typingRequired, e.productive, `${p}/${s}`);
  }
});
test('manifest: receptive and supported stages can never satisfy "secure" on their own', () => {
  for (const p of PATHWAY_ORDER) for (const s of ['recognise', 'match', 'apply']) assert.equal(STAGE_CONTRACT[p][s].canSatisfySecureAlone, false, `${p}/${s}`);
});
test('manifest: Recall scaffold ceiling is a maximum (first letter and length), and only Paraphrasing Mastery is provisional', () => {
  for (const p of PATHWAY_ORDER) {
    assert.equal(STAGE_CONTRACT[p].recall.scaffoldCeiling, 'first_letter_and_length');
    assert.equal(STAGE_CONTRACT[p].mastery.provisionalEvidenceAllowed, p === 'paraphrasing', p);
    assert.equal(STAGE_CONTRACT[p].mastery.canSatisfySecureAlone, p !== 'paraphrasing', p);
  }
});
test('manifest: multi-part evidence is allowed exactly where the contract names it', () => {
  const multi = PATHWAY_ORDER.flatMap(p => STAGE_ORDER.filter(s => STAGE_CONTRACT[p][s].multiPartAllowed).map(s => `${p}/${s}`)).sort();
  assert.deepEqual(multi, ['context/mastery', 'precision_use/mastery', 'word_families/mastery']);
});

// ---------- B. Today's production map is held against the manifest ----------
test('production map uses the same pathway ids and stage order as the manifest', () => {
  assert.deepEqual([...PATHWAY_STAGE_IDS], [...STAGE_ORDER]);
  assert.deepEqual([...PATHWAY_IDS].sort(), [...PATHWAY_ORDER].sort());
});

const TODAY = 'supabase/functions/_shared/vocabulary-pathway-contract.js PATHWAY_ACTIVITY_MAP is the pre-contract map';
const GREEN = 'PATHWAY_ACTIVITY_MAP (also the server allow-list) is regenerated from the approved manifest and the new activity types exist';

for (const p of PATHWAY_ORDER) {
  const ladder = PATHWAY_ACTIVITY_MAP[p];
  const duplicated = (() => { const seen = new Map(); const dup = []; for (const s of STAGE_ORDER) for (const t of ladder[s].map(contractName)) { if (seen.has(t)) dup.push(`${t} (${seen.get(t)} and ${s})`); else seen.set(t, s); } return dup; })();
  if (duplicated.length) {
    expectedFailure({ rule: 'No duplicate activity type across stages in one pathway (Contract invariant 2)', today: `${p} repeats: ${duplicated.join('; ')}`, turnsGreenWhen: GREEN },
      `production ${p}: no activity type repeated across stages`, () => assert.deepEqual(duplicated, []));
  } else {
    test(`production ${p}: no activity type repeated across stages`, () => assert.deepEqual(duplicated, []));
  }
  const mismatches = STAGE_ORDER.filter(s => JSON.stringify(ladder[s].map(contractName).sort()) !== JSON.stringify([...contractTypes(p, s)].sort()));
  if (mismatches.length) {
    expectedFailure({ rule: 'Production stage ladder equals the locked stage contract', today: `${p} differs from the approved ladder at: ${mismatches.join(', ')}`, turnsGreenWhen: GREEN },
      `production ${p}: ladder equals approved manifest`, () => assert.deepEqual(mismatches, []));
  } else {
    test(`production ${p}: ladder equals approved manifest`, () => assert.deepEqual(mismatches, []));
  }
}

// Types the production map still allows at Recall/Mastery must be typed under the contract. The registry knows the
// approved mode of every type, so this catches e.g. meaning_in_context (an MCQ) sitting at Mastery.
for (const p of PATHWAY_ORDER) for (const s of ['recall', 'mastery']) {
  const wrong = PATHWAY_ACTIVITY_MAP[p][s].map(contractName).filter(t => !ACTIVITY_REGISTRY[t] || ACTIVITY_REGISTRY[t].mode !== (s === 'recall' ? 'typed_cued' : 'typed_transfer'));
  if (wrong.length) {
    expectedFailure({ rule: `${s === 'recall' ? 'Recall must require actual typed retrieval' : 'Mastery must be unsupported typed production, never a plain MCQ'}`, today: `production ${p}/${s} still lists ${wrong.join(', ')}, whose approved mode is not ${s === 'recall' ? 'typed_cued' : 'typed_transfer'}`, turnsGreenWhen: GREEN },
      `production ${p}/${s}: only approved ${s} modes`, () => assert.deepEqual(wrong, []));
  } else {
    test(`production ${p}/${s}: only approved ${s} modes`, () => assert.deepEqual(wrong, []));
  }
}
