// Word Families Mastery eligibility (STAGE_CONTRACT v2, Locked Decision 6 / Job 7 Part 10).
// A word may run Word Families MASTERY only when its family is COMPLETE, authentic and authored:
//   - at least 3 useful forms INCLUDING the target,
//   - at least 2 distinct parts of speech among them,
//   - every counted form is marked common/authentic enough for IGCSE by an author,
//   - every counted form has authored example/context support.
// The data model today stores a family as bare strings (item.wordFamily = ['prefer','preferable']), which carries NONE of the per-form
// facts above. This module NEVER infers part of speech from a suffix, NEVER invents a form and NEVER loosens the rule: a bare string is
// reported as `unknown`, so a caller cannot mistake "not yet authored" for "eligible".
//
// Target schema (additive; the bare-string field stays valid and untouched):
//   item.wordFamilyForms = [{ form:'preference', pos:'noun', authentic:true, contextIds:['ctx_...'] }, ...]
//   - pos: 'noun' | 'verb' | 'adjective' | 'adverb'
//   - authentic: author's judgement that the form is common and genuinely used at IGCSE level
//   - contextIds: ids of authored contexts / examples that show this form in use
export const FAMILY_POS = Object.freeze(['noun', 'verb', 'adjective', 'adverb']);
export const MIN_FORMS = 3;
export const MIN_PARTS_OF_SPEECH = 2;
export const FAMILY_STATUS = Object.freeze({ ELIGIBLE: 'eligible', INELIGIBLE: 'ineligible', UNKNOWN: 'unknown' });

export function evaluateFamilyEligibility(item = {}) {
  const rich = Array.isArray(item.wordFamilyForms) ? item.wordFamilyForms : null;
  if (!rich || rich.length === 0) {
    const bare = Array.isArray(item.wordFamily) ? item.wordFamily.length : 0;
    return { status: FAMILY_STATUS.UNKNOWN, reason: bare ? 'family forms are bare strings: no part of speech, authenticity or context per form' : 'no family authored', countedForms: 0, partsOfSpeech: [] };
  }
  const term = String(item.term ?? '').toLowerCase();
  const counted = rich.filter(row => row && typeof row.form === 'string' && row.form.trim()
    && FAMILY_POS.includes(row.pos) && row.authentic === true && Array.isArray(row.contextIds) && row.contextIds.length > 0);
  const forms = new Set(counted.map(row => row.form.trim().toLowerCase()));
  const hasTarget = forms.has(term);
  const parts = [...new Set(counted.map(row => row.pos))].sort();
  const problems = [];
  if (!hasTarget) problems.push('the target itself is not an authored, authentic form with context support');
  if (forms.size < MIN_FORMS) problems.push(`only ${forms.size} qualifying form(s); ${MIN_FORMS} needed`);
  if (parts.length < MIN_PARTS_OF_SPEECH) problems.push(`only ${parts.length} part(s) of speech; ${MIN_PARTS_OF_SPEECH} needed`);
  return { status: problems.length ? FAMILY_STATUS.INELIGIBLE : FAMILY_STATUS.ELIGIBLE, reason: problems.join('; ') || null, countedForms: forms.size, partsOfSpeech: parts };
}

// Unit-level report: how many words are eligible / ineligible / not yet evaluable. Used by readiness reporting and content authors.
export function familyEligibilityReport(items = []) {
  const report = { eligible: [], ineligible: [], unknown: [] };
  for (const item of items) {
    const verdict = evaluateFamilyEligibility(item);
    report[verdict.status].push({ term: item.term, ...verdict });
  }
  return report;
}
