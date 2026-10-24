// Word Families data model and Mastery eligibility (STAGE_CONTRACT v2, Job 8). Shared by the browser builders, readiness and the
// Edge Function marker so "which forms are asked" has ONE derivation.
//
// AUTHORED STRUCTURE (additive; the bare-string `item.wordFamily` stays valid and untouched). Lives on the SENSE so it travels in the
// existing `senses` jsonb with no database column change:
//   sense.wordFamilyForms = [
//     { form:'preference', partOfSpeech:'noun', example:'Customers showed a clear preference for the cheaper trainers.',
//       pedagogicallyUseful:true, note:'optional author note' }, ...
//   ]
//   - form: the exact word as it appears in `example`
//   - partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' (AUTHORED, never inferred from a suffix)
//   - example: an authored sentence that contains `form` exactly once
//   - pedagogicallyUseful: the author's judgement that the form is common and authentic at IGCSE level
//
// ELIGIBILITY for Mastery (locked): at least 3 pedagogically useful forms INCLUDING the target, at least 2 distinct parts of speech,
// every counted form with an authored example. Nothing is inferred, invented or loosened: a family with bare strings only is `unknown`.
import { blankTargetInSentence, wholeWordMatches } from './vocabulary-typed-forms.js';

export const FAMILY_POS = Object.freeze(['noun', 'verb', 'adjective', 'adverb']);
export const MIN_FORMS = 3;
export const MIN_PARTS_OF_SPEECH = 2;
export const MIN_MASTERY_SLOTS = 2;
export const MAX_MASTERY_SLOTS = 3;
export const FAMILY_STATUS = Object.freeze({ ELIGIBLE: 'eligible', INELIGIBLE: 'ineligible', UNKNOWN: 'unknown' });

function text(value) { return String(value ?? '').trim(); }
function lower(value) { return text(value).toLocaleLowerCase('en'); }

export function familyFormsOf(item = {}, sense = {}) {
  const fromSense = Array.isArray(sense?.wordFamilyForms) ? sense.wordFamilyForms : null;
  const fromItem = Array.isArray(item?.wordFamilyForms) ? item.wordFamilyForms : null;
  return fromSense ?? fromItem ?? null;
}

function countedForms(rows) {
  return rows.filter(row => row && typeof row === 'object'
    && text(row.form) && FAMILY_POS.includes(row.partOfSpeech) && row.pedagogicallyUseful === true
    && text(row.example) && wholeWordMatches(text(row.example), text(row.form)).length === 1);
}

export function evaluateFamilyEligibility(item = {}, sense = {}) {
  const rows = familyFormsOf(item, sense);
  if (!rows || rows.length === 0) {
    const bare = Array.isArray(item.wordFamily) ? item.wordFamily.length : 0;
    return { status: FAMILY_STATUS.UNKNOWN, reason: bare ? 'family forms are bare strings: no part of speech, usefulness judgement or authored example per form' : 'no family authored', countedForms: 0, partsOfSpeech: [] };
  }
  const counted = countedForms(rows);
  const term = lower(item.term);
  const forms = new Set(counted.map(row => lower(row.form)));
  const hasTarget = forms.has(term);
  const parts = [...new Set(counted.map(row => row.partOfSpeech))].sort();
  const problems = [];
  if (!hasTarget) problems.push('the target itself is not an authored, useful form with an example');
  if (forms.size < MIN_FORMS) problems.push(`only ${forms.size} qualifying form(s); ${MIN_FORMS} needed`);
  if (parts.length < MIN_PARTS_OF_SPEECH) problems.push(`only ${parts.length} part(s) of speech; ${MIN_PARTS_OF_SPEECH} needed`);
  // A Mastery task needs at least two blankable non-target forms.
  if (!problems.length && eligibleSlotForms(item, sense).length < MIN_MASTERY_SLOTS) problems.push('fewer than two non-target forms have a blankable authored example');
  return { status: problems.length ? FAMILY_STATUS.INELIGIBLE : FAMILY_STATUS.ELIGIBLE, reason: problems.join('; ') || null, countedForms: forms.size, partsOfSpeech: parts };
}

// Non-target forms that can be asked: counted, authored example blanks cleanly, answer not left in the blanked example.
export function eligibleSlotForms(item = {}, sense = {}) {
  const rows = familyFormsOf(item, sense) ?? [];
  const term = lower(item.term);
  return countedForms(rows)
    .filter(row => lower(row.form) !== term)
    .map(row => {
      const blank = blankTargetInSentence(row.example, { term: row.form }, {});
      return blank && lower(blank.answer) === lower(row.form) ? { form: text(row.form), partOfSpeech: row.partOfSpeech, sourceText: blank.sourceText, example: text(row.example) } : null;
    })
    .filter(Boolean);
}

// Every non-empty subset of size 2..3 of the eligible slot forms, as a bitmask over the eligible list. The mask travels as the
// attempt's activity variant (`q<n>`), so client and server agree on exactly which forms were asked.
//
// A family whose only non-target forms are two has a single mask, hence a single prompt, and per-word Mastery needs two DIFFERENT prompts.
// An author may therefore give a form a SECOND, hand-written example sentence (`altExample`). The alternate prompt asks the same forms in
// their second sentences; it is encoded as the same mask with bit 64 set (`q<mask+64>`), so the variant format and its validation are unchanged.
// A form without an `altExample` simply has no alternate prompt: nothing is generated.
export const ALT_BIT = 64;
export const MAX_SLOT_FORMS = 6;
function altSlot(item, sense, slot) {
  const row = countedForms(familyFormsOf(item, sense) ?? []).find(r => lower(r.form) === lower(slot.form));
  const example = text(row?.altExample);
  if (!example || lower(example) === lower(slot.example) || wholeWordMatches(example, slot.form).length !== 1) return null;
  const blank = blankTargetInSentence(example, { term: slot.form }, {});
  return blank && lower(blank.answer) === lower(slot.form) ? { ...slot, sourceText: blank.sourceText, example } : null;
}
export function familyMasks(item, sense) {
  const forms = eligibleSlotForms(item, sense).slice(0, MAX_SLOT_FORMS);
  const alt = forms.map(slot => altSlot(item, sense, slot));
  const masks = [];
  for (let mask = 1; mask < (1 << forms.length); mask += 1) {
    const size = mask.toString(2).replaceAll('0', '').length;
    if (size < MIN_MASTERY_SLOTS || size > MAX_MASTERY_SLOTS) continue;
    masks.push(mask);
    if (forms.every((_, index) => !((mask >> index) & 1) || alt[index])) masks.push(mask | ALT_BIT);
  }
  return masks;
}
export function familySlotsForMask(item, sense, variant) {
  const forms = eligibleSlotForms(item, sense).slice(0, MAX_SLOT_FORMS);
  const useAlt = (variant & ALT_BIT) !== 0, mask = variant & (ALT_BIT - 1);
  const chosen = forms.filter((_, index) => (mask >> index) & 1).map(slot => useAlt ? altSlot(item, sense, slot) : slot);
  return chosen.length >= MIN_MASTERY_SLOTS && chosen.length <= MAX_MASTERY_SLOTS && chosen.every(Boolean) ? chosen : null;
}
export function familyVariantId(mask) { return `q${mask}`; }
export function familyMaskFromVariant(variant) { const match = /^q(\d{1,3})$/.exec(String(variant ?? '')); return match ? Number(match[1]) : null; }

export function familyEligibilityReport(items = [], senseOf = (item) => item?.senses?.[0] ?? {}) {
  const report = { eligible: [], ineligible: [], unknown: [] };
  for (const item of items) {
    const verdict = evaluateFamilyEligibility(item, senseOf(item));
    report[verdict.status].push({ term: item.term, ...verdict });
  }
  return report;
}
