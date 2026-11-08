// Pure helpers that turn each writing app's own data into the task text and response text sent to the shared assessor.
// To add another writing app: write two small functions like these and call mountStudentFeedback (see student-feedback.js).
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const sentence = value => { const t = clean(value); return t && !/[.!?]$/.test(t) ? t + '.' : t; };
function range(min, max) {
  const lo = Number.parseInt(min, 10), hi = Number.parseInt(max, 10);
  if (Number.isInteger(lo) && Number.isInteger(hi) && lo > 0 && hi >= lo) return ' Write between ' + lo + ' and ' + hi + ' words.';
  return '';
}
// Informal Email: the question, the audience and the three bullet points the student must cover.
export function emailTaskText(config = {}) {
  if (!clean(config.taskQ)) return '';   // no task chosen yet: the panel asks the student to choose one
  const points = [config.bp1, config.bp2, config.bp3].map(clean).filter(Boolean);
  const audience = clean(config.audience) || 'a friend';
  const parts = [sentence(config.taskQ)];
  if (!/\bemail\b/i.test(config.taskQ)) parts.push('Write an informal email to ' + audience + '.');   // most task questions already say so
  if (points.length) parts.push('In your email, you must: ' + points.map(p => p.replace(/[.!?]+$/, '')).join('; ') + '.');
  return parts.filter(Boolean).join(' ') + range(config.minWords, config.maxWords);
}
// The sign-off box usually holds the student's own name, which must not be sent. Only a short, known closing phrase ending in a comma is kept;
// everything else (names, surnames, classes) is replaced by a placeholder.
const CLOSING = /^(?:(?:best|kind|warm|many)\s+)?(?:wishes|regards|thanks)\s*,$|^(?:yours|love|lots of love|cheers|see you soon|take care|speak soon|write soon|your friend)\s*,$/i;
export function safeSignoff(value) {
  const lines = String(value ?? '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return '';
  const closing = lines.find(l => l.split(/\s+/).length <= 4 && CLOSING.test(l));
  return (closing ? closing + '\n' : '') + '[Name]';
}
export function emailResponseText(sections = {}) {
  const body = [sections.opening, sections.bp1, sections.bp2, sections.bp3, sections.closing].map(v => String(v ?? '').trim()).filter(Boolean);
  const sign = safeSignoff(sections.signoff);
  return [...body, sign].filter(Boolean).join('\n\n');
}
// Review Writing: the chosen or teacher-supplied prompt, plus the word range if the prompt does not already state one.
export function reviewTaskText(prompt, { min = 120, max = 160 } = {}) {
  const t = clean(prompt);
  return /\bwords?\b/i.test(t) ? t : t + range(min, max);
}
export function reviewResponseText(sections = []) {
  return (Array.isArray(sections) ? sections : Object.values(sections)).map(v => String(v ?? '').trim()).filter(Boolean).join('\n\n');
}
// Essay Writing: the question plus its prompts (and the word range if the question does not already state one). Kept under the Worker's 1,500-character limit
// by dropping the prompts first: the question and the range always matter more.
export function essayTaskText(task = {}, { min = 120, max = 160 } = {}) {
  const question = sentence(task.question);
  if (!question) return '';
  const prompts = (Array.isArray(task.prompts) ? task.prompts : String(task.prompts ?? '').split(/\n+/))
    .map(p => clean(p).replace(/^[•*-]\s*/, '').replace(/[.!?]+$/, '')).filter(Boolean);
  const finish = text => /\bwords?\b/i.test(question) ? text : text + range(task.wordMin ?? min, task.wordMax ?? max);
  const withPrompts = finish(question + (prompts.length ? ' Ideas to consider: ' + prompts.join('; ') + '.' : ''));
  return (withPrompts.length <= 1500 ? withPrompts : finish(question)).slice(0, 1500);
}
// The four essay sections in order (introduction, two arguments or an argument and the other side, conclusion).
export function essayResponseText(sections = {}) {
  return [sections.intro, sections.arg1, sections.arg2, sections.conc].map(v => String(v ?? '').trim()).filter(Boolean).join('\n\n');
}
