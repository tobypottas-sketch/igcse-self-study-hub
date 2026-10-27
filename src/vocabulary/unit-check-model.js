const FORM_BY_ATTEMPT = Object.freeze({ 1:'A', 2:'B', 3:'C' });

function normalizedAttempts(attempts = []) {
  return [...attempts]
    .filter(row => Number.isInteger(Number(row?.attempt_number)) && Number(row.attempt_number) >= 1 && Number(row.attempt_number) <= 3)
    .sort((a,b) => Number(a.attempt_number) - Number(b.attempt_number));
}

export function nextCheckState(attempts = []) {
  const saved = normalizedAttempts(attempts);
  const used = new Set(saved.map(row => Number(row.attempt_number)));
  const attemptNumber = [1,2,3].find(number => !used.has(number)) ?? null;
  if (attemptNumber == null) return { attemptNumber:null, formId:null, locked:true };
  return { attemptNumber, formId:FORM_BY_ATTEMPT[attemptNumber], locked:false };
}

export function normalizeCheckAnswer(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

export function markCheck(question, answer) {
  if (!question) return false;
  return normalizeCheckAnswer(answer) === normalizeCheckAnswer(question.answer);
}

export function scoreCheck(form, answers = {}) {
  const results = (form?.questions ?? []).map(question => {
    const studentAnswer = answers?.[question.id] ?? '';
    return { questionId:question.id, studentAnswer, correct:markCheck(question, studentAnswer) };
  });
  return {
    score:results.filter(result => result.correct).length,
    maxScore:results.length,
    results
  };
}

export function scoreSummary(attempts = []) {
  const normalized = normalizedAttempts(attempts);
  const saved = normalized.filter(row => Number.isFinite(Number(row.score)) && Number.isFinite(Number(row.max_score)));
  if (!saved.length) return { latest:null, best:null, attemptsUsed:normalized.length };
  const latestRow = saved.at(-1);
  const bestRow = saved.reduce((best,row) => Number(row.score) > Number(best.score) ? row : best, saved[0]);
  return {
    latest:{ score:Number(latestRow.score), maxScore:Number(latestRow.max_score) },
    best:{ score:Number(bestRow.score), maxScore:Number(bestRow.max_score) },
    attemptsUsed:normalized.length
  };
}

export function feedbackForAttempt(form, results = [], attemptNumber) {
  const byId = new Map((form?.questions ?? []).map(question => [question.id, question]));
  const full = Number(attemptNumber) === 3;
  const selected = full ? results : results.filter(result => !result.correct);
  return {
    mode:full ? 'full' : 'diagnostic',
    items:selected.map(result => {
      const question = byId.get(result.questionId);
      const base = { questionId:result.questionId, studentAnswer:result.studentAnswer, correct:result.correct, diagnostic:question?.diagnostic ?? '' };
      return full ? { ...base, correctAnswer:question?.answer ?? '', explanation:question?.explanation ?? '' } : base;
    })
  };
}

export function attemptPayload({ unitNumber, formId, attemptNumber, score, maxScore } = {}) {
  return {
    unit_number:Number(unitNumber),
    form_id:String(formId ?? ''),
    attempt_number:Number(attemptNumber),
    score:Number(score),
    max_score:Number(maxScore)
  };
}
