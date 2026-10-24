// Expected-failure and unresolved-decision helpers for the vocabulary contract rails.
// An expected failure runs for real (so it reports what is wrong today) but is registered as a node:test TODO, so it does not
// fail the suite. It must say which locked rule it encodes, why today's code fails, and what will turn it green.
// When the future implementation lands the test passes and node reports it as a passing TODO: remove the marker then.
import test from 'node:test';

export const EXPECTED_FAILURES = [];
export const UNRESOLVED = [];

function need(meta, keys, name) {
  for (const key of keys) {
    if (typeof meta?.[key] !== 'string' || meta[key].trim().length < 20) throw new Error(`"${name}" must state "${key}" (>= 20 characters).`);
  }
}

// Job 7 (Part 18): every expected failure must carry an explicit classification. No "later", "known issue" or "not implemented".
//   B = content-authoring gap: the code is correct and fails closed or reports; the fix is authored content (named below).
//   C = intentionally deferred architecture: needs a decision or a change the rules forbid inside the Vocabulary Builder hardening jobs.
//   An unclassified expected failure throws, so a new one cannot be added without a reason. A production defect must be FIXED, not listed.
const LADDER_REASON = 'The production ladder (supabase/functions/_shared/vocabulary-pathway-contract.js PATHWAY_ACTIVITY_MAP) is also the Edge Function allow-list and the identity of every live Set stage. Moving to the locked STAGE_CONTRACT v2 ladder needs new builders (type_in_passage, gloss_in_context_type, spelling_rebuild, upgrade_passage, word_family_identify...), an Edge Function redeploy and a decision on students mid-journey; the owner ruled "no stage-type redesign" inside the Sets and hardening jobs.';
export const CLASSIFICATIONS = Object.freeze([
  { class: 'C', test: /^production [a-z_]+: (ladder equals approved manifest|no activity type repeated across stages)/, reason: LADDER_REASON },
  { class: 'C', test: /^production [a-z_]+\/(mastery|recall): only approved (mastery|recall) modes/, reason: `${LADDER_REASON} Until then Mastery/Recall use the existing allow-listed types.` },
  { class: 'B', test: /^unit 1: Word Families Mastery eligibility/, reason: 'Unit 1 stores a word family as bare strings (37 of 50 words). Per-form part of speech, authenticity and context links must be AUTHORED; src/vocabulary/word-family-eligibility.js defines the schema and the rule and reports every word as unknown. Nothing is inferred.' },
  { class: 'C', test: /^production classifyTypedAnswer/, reason: 'Wiring the five-class classifier into marking would make one-edit slips count as correct outside Spelling. That changes scoring, which the hardening rules forbid; it needs an explicit product decision and an Edge Function redeploy. Marking today is exact (strict), which is the safe side.' },
  { class: 'C', test: /^production multi-part scoring/, reason: 'Per-component evidence needs a new attempt-metadata field in the server allow-list (vocabulary_activity_metadata_is_safe) and a scoring decision. Evidence and scoring are frozen for this job.' },
  { class: 'C', test: /^production treats Paraphrasing Mastery evidence as provisional/, reason: 'Paraphrasing is not live for Unit 1 (diversity below minimum, no Sets seeded), so no student can reach it. The provisional-evidence flag belongs to the evidence model, which is frozen.' },
  { class: 'B', test: /question fingerprints differ from the previous mission/, reason: 'Each word has ONE authored prompt/cue for this stage (spelling_recall: one cue per word; meaning recall: one definition per sense). A second mission therefore repeats the question. Fix = author further cues or definitions per word; the code already rotates what exists.' },
  { class: 'B', test: /^bank meaning\/mastery\/meaning_in_context|Meaning Mastery for/, reason: 'The authored wrong meanings for Meaning Mastery are one- or two-word glosses while the correct meaning is a phrase. Rebuilding the options needs authored phrase-length wrong meanings per word (or the typed gloss_in_context_type Mastery, class C above).' },
  { class: 'B', test: /^bank (meaning|context|precision_use)\//, reason: 'Residual after the production quality gate prefers clean candidates: the remaining sets are fixed by the authored options (single-word distractors beside a phrase, or base-form distractors beside an inflected answer). Fix = author matched-shape and matched-inflection distractors for the listed targets.' },
  { class: 'B', test: /^solver /, reason: 'A knowledge-free shortcut (longest / odd word count / prompt overlap) still beats chance on authored option sets whose correct answer is systematically longer. The gate already rejects the worst sets; the rest need authored distractors of matching length.' }
]);
export function classify(name) { return CLASSIFICATIONS.find(rule => rule.test.test(name)) ?? null; }

export function expectedFailure(meta, name, fn) {
  need(meta, ['rule', 'today', 'turnsGreenWhen'], name);
  const verdict = classify(name);
  if (!verdict) throw new Error(`Expected failure "${name}" has no classification (B content gap / C deferred). Fix it or classify it in xfail.js.`);
  EXPECTED_FAILURES.push({ name, ...meta, class: verdict.class, classReason: verdict.reason });
  return test(`[expected-fail] ${name}`, { todo: `[${verdict.class}] ${meta.rule} | today: ${meta.today} | why not fixed: ${verdict.reason} | green when: ${meta.turnsGreenWhen}` }, fn);
}

// A rule the locked contract does not yet decide. It is skipped with the exact open question, never guessed.
export function unresolvedDecision(meta, name) {
  need(meta, ['rule', 'openQuestion', 'needed'], name);
  UNRESOLVED.push({ name, ...meta });
  return test(`[unresolved] ${name}`, { skip: `${meta.rule} | open: ${meta.openQuestion} | needed: ${meta.needed}` }, () => {});
}
