const practice = Object.freeze({
  engagement: true, answerAttempts: true, completions: 'limited',
  assessment: 'limited', coverage: 'limited', release: 'production', drilldown: 'activity'
});
const writer = Object.freeze({
  submissions: true, coverage: 'limited', release: 'production', drilldown: 'writing-activity'
});

export const REPORTING_CAPABILITIES = Object.freeze({
  vocabulary_paraphrase: Object.freeze({
    ...practice, completions: true, assessment: true, mastery: true, merits: true, drilldown: 'vocabulary'
  }),
  email_writing: writer,
  essay_writing: Object.freeze({ ...writer, engagement: true }),
  review_writing: Object.freeze({ ...writer, pilot: 'structure', preview: 'academy' }),
  reading: practice,
  listening: practice,
  paraphrasing: practice
});

export function evidenceState({ retrieval = 'ok', coverage, hasEvidence = false, sufficient = true } = {}) {
  if (retrieval === 'restricted') return 'permission-restricted';
  if (retrieval !== 'ok') return 'retrieval-failure';
  if (coverage === 'pilot') return 'pilot-only';
  if (!coverage || coverage === 'unavailable') return 'tracking-unavailable';
  if (!sufficient) return 'insufficient-evidence';
  if (hasEvidence) return 'recorded';
  return coverage === 'limited' ? 'limited-coverage' : 'no-records';
}
