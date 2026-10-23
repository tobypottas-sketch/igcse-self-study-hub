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

export function expectedFailure(meta, name, fn) {
  need(meta, ['rule', 'today', 'turnsGreenWhen'], name);
  EXPECTED_FAILURES.push({ name, ...meta });
  return test(`[expected-fail] ${name}`, { todo: `${meta.rule} | today: ${meta.today} | green when: ${meta.turnsGreenWhen}` }, fn);
}

// A rule the locked contract does not yet decide. It is skipped with the exact open question, never guessed.
export function unresolvedDecision(meta, name) {
  need(meta, ['rule', 'openQuestion', 'needed'], name);
  UNRESOLVED.push({ name, ...meta });
  return test(`[unresolved] ${name}`, { skip: `${meta.rule} | open: ${meta.openQuestion} | needed: ${meta.needed}` }, () => {});
}
