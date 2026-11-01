// The Unit Check registry: which units have an authored Unit Check. A unit with no entry has NO Unit Check: its card is not shown.
// To add a unit's check, author content/vocabulary/checks/unit-NN-check.js (same shape as unit-01-check.js) and list it here.
import { unit1VocabularyCheck } from './unit-01-check.js';
import { unit2VocabularyCheck } from './unit-02-check.js';
import { unit3VocabularyCheck } from './unit-03-check.js';
import { unit4VocabularyCheck } from './unit-04-check.js';
import { unit5VocabularyCheck } from './unit-05-check.js';
import { unit6VocabularyCheck } from './unit-06-check.js';

export const UNIT_CHECKS = Object.freeze({ 1:unit1VocabularyCheck, 2:unit2VocabularyCheck, 3:unit3VocabularyCheck, 4:unit4VocabularyCheck, 5:unit5VocabularyCheck, 6:unit6VocabularyCheck });

// The authored check for a unit, or null when the unit has none (or none with at least one form).
export function unitCheckFor(unitNumber, registry = UNIT_CHECKS) {
  const check = registry[String(Math.trunc(Number(unitNumber)))] ?? null;
  return check && Object.keys(check.forms ?? {}).length ? check : null;
}
