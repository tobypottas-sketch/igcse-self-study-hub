// Reviewed language-bank sentences. They are published with the unit as `language_bank_context` activity rows (sentence, answer and
// three reviewed wrong options), so the engine reads them from the unit's own data and never from a bundled table.
function text(value) {
  return String(value ?? '').trim();
}
function array(value) {
  return Array.isArray(value) ? value : [];
}

// One published bank row -> { id, text, answer, distractors }, or null when the row is not a usable bank context.
function contextFromActivity(activity, vocabularyId) {
  const data = activity?.activityData;
  if (data?.taskType !== 'language_bank_context') return null;
  if (!array(data.linkedVocabularyIds).includes(vocabularyId) || data.primaryEvidenceTargetId !== vocabularyId) return null;
  const id = text(data.languageBankContextId);
  const answer = text(array(data.acceptedAnswers)[0]);
  const source = text(data.sourceText);
  if (!id || !answer || !source || activity.activityContentId !== `language-bank:${id}`) return null;
  return { id, text:source, answer, distractors:array(data.distractors) };
}

// A bank context is reviewed only if it is well formed: a blank to fill, an answer, and three distinct usable wrong options that
// do not include the answer. Anything else is ignored rather than served.
export function bankContextProblems(context) {
  const problems = [];
  if (!text(context?.text).includes('____')) problems.push('no blank in the sentence');
  if (!text(context?.answer)) problems.push('no answer');
  const wrong = array(context?.distractors).map(row => text(row?.text));
  const keys = new Set(wrong.map(value => value.toLocaleLowerCase('en')));
  if (wrong.length !== 3 || wrong.some(value => !value)) problems.push('needs exactly three usable wrong options');
  else if (keys.size !== 3) problems.push('wrong options are repeated');
  if (keys.has(text(context?.answer).toLocaleLowerCase('en'))) problems.push('the answer is among the wrong options');
  return problems;
}

export function languageBankContextsFor(item = {}, unitActivities = []) {
  const vocabularyId = text(item?.vocabularyId);
  if (!vocabularyId) return [];
  return array(unitActivities)
    .map(activity => contextFromActivity(activity, vocabularyId))
    .filter(context => context && !bankContextProblems(context).length);
}

export function languageBankContextForItem(item = {}, usedContentIds = [], seed = '', unitActivities = []) {
  const contexts = languageBankContextsFor(item, unitActivities);
  if (!contexts.length) return null;

  const used = new Set(array(usedContentIds).map(String));
  const unused = contexts.filter(context => !used.has(`language-bank:${context.id}`) && !used.has(String(context.id)));
  const candidates = unused.length ? unused : contexts;

  let hash = 2166136261;
  for (const char of `${seed}:${termKey(item)}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return candidates[hash % candidates.length];
}

function termKey(item) {
  return text(item?.vocabularyId) || text(item?.term);
}
