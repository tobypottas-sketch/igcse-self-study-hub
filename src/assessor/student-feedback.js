// Shared "Get My Feedback" panel for any writing app. An app supplies a small adapter:
//   mountStudentFeedback(host, { app:'email'|'review', getTask(), getResponse(), getClient(), onRevise?() })
// It reuses the assessor progress card, keeps nothing in storage and shows only an AI-estimated score (never teacher-only reasons).
import { createAssessmentProgress } from './progress.js';
import { requestFeedback, FeedbackError } from './student-client.js';
import { PRIVACY_SUMMARY, PRIVACY_DETAIL, PRIVACY_CONSENT } from './student-privacy-notice.js';
const el = (doc, tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
export function renderStudentFeedback(doc, feedback, { onRevise } = {}) {
  const box = el(doc, 'div', 'sf-result');
  const panel = el(doc, 'section', 'sf-panel');
  panel.setAttribute('aria-label', 'Your feedback');
  const row = (kind, label) => { const r = el(doc, 'div', 'sf-row sf-row--' + kind); r.append(el(doc, 'h3', 'sf-label', label)); return r; };
  const quote = text => el(doc, 'blockquote', 'sf-quote', text);
  const scoreBlock = el(doc, 'div', 'sf-score');
  const sc = feedback.scores;
  if (sc && !feedback.partial) {
    const tile = (name, value, max, total) => { const t = el(doc, 'div', 'sf-score__tile' + (total ? ' sf-score__tile--total' : '')); const v = el(doc, 'p', 'sf-score__value'); v.append(el(doc, 'strong', '', String(value)), el(doc, 'span', '', '/' + max)); t.append(el(doc, 'p', 'sf-score__name', name), v); return t; };
    const grid = el(doc, 'div', 'sf-score__grid'); grid.append(tile('Content', sc.content, 6), tile('Language', sc.language, 9), tile('Total', sc.total, 15, true));
    scoreBlock.append(el(doc, 'h3', 'sf-label', 'AI-estimated score'), grid, el(doc, 'p', 'sf-score__note', 'An AI estimate to guide your revision. It is not an official Cambridge mark.'));
  } else {
    scoreBlock.classList.add('sf-score--none'); scoreBlock.append(el(doc, 'h3', 'sf-label', 'AI-estimated score'), el(doc, 'p', 'sf-score__unavailable', 'Score unavailable'));
  }
  panel.append(scoreBlock);
  if (feedback.partial) {
    const r = el(doc, 'div', 'sf-row sf-row--notice');
    r.append(el(doc, 'h3', 'sf-label', 'No specific feedback this time'), el(doc, 'p', 'sf-advice', 'We only show comments we can match to your exact words, and we could not do that for this version. This does not mean your writing has no mistakes. Try again after revising, or check it with your teacher.'));
    panel.append(r);
  } else {
    const n = feedback.lengthNotice;
    if (n) {
      const target = Number.isInteger(n.maximum) ? n.minimum + '\u2013' + n.maximum : 'at least ' + n.minimum;
      panel.append(el(doc, 'p', 'sf-length', n.wordCount + ' words: the task asks for ' + target + '. Add a reason, example or detail to each point to develop your ideas.'));
    }
    const best = feedback.strengths[0];
    if (best) { const r = row('good', 'Strength'); r.append(quote(best.quote), el(doc, 'p', 'sf-advice', best.advice)); panel.append(r); }
    const fixes = feedback.improvements.slice(0, 2);
    if (fixes.length) {
      const r = row('fix', fixes.length > 1 ? 'Corrections' : 'Correction'); const ul = el(doc, 'ul', 'sf-list');
      fixes.forEach(item => {
        const li = el(doc, 'li', 'sf-fix');
        if (item.type === 'error' && item.suggestion) {
          const change = el(doc, 'p', 'sf-change');
          const wrong = el(doc, 'span', 'sf-wrong', item.quote); const right = el(doc, 'span', 'sf-right', item.suggestion);
          wrong.prepend(el(doc, 'span', 'sf-sr', 'Incorrect: ')); right.prepend(el(doc, 'span', 'sf-sr', 'Correct: '));
          change.append(wrong, el(doc, 'span', 'sf-arrow', '\u2192'), right); li.append(change);
        } else {
          if (item.type !== 'error') li.append(el(doc, 'p', 'sf-tag', 'Optional wording change'));
          li.append(quote(item.quote));
          if (item.suggestion) { const s = el(doc, 'p', 'sf-suggestion'); s.append(el(doc, 'strong', '', 'You could write: '), doc.createTextNode(item.suggestion)); li.append(s); }
        }
        li.append(el(doc, 'p', 'sf-advice', item.advice)); ul.append(li);
      });
      r.append(ul); panel.append(r);
    }
    if (feedback.nextStep) { const r = row('next', 'Next step'); r.append(el(doc, 'p', 'sf-advice', feedback.nextStep)); panel.append(r); }
  }
  panel.append(el(doc, 'p', 'sf-note', 'Based on the version you just sent. This is not a full list of mistakes, and AI can make errors, so check anything that seems wrong with your teacher.'));
  box.append(panel);
  if (onRevise) { const b = el(doc, 'button', 'sf-button sf-revise', 'Revise my writing'); b.type = 'button'; b.addEventListener('click', onRevise); box.append(b); }
  return box;
}
export function mountStudentFeedback(host, options) {
  const doc = host.ownerDocument; const win = doc.defaultView;
  const { app, getTask, getResponse, getClient, onRevise, request = requestFeedback, progressOptions = {}, label = 'Get My Feedback' } = options;
  let busy = false, disposed = false, generation = 0, pending = null, count = 0;
  const section = el(doc, 'section', 'student-feedback');
  const title = el(doc, 'h2', 'sf-title', 'Get feedback on your writing');
  const lead = el(doc, 'p', 'sf-lead', 'Get an AI-estimated score, a strength, up to two corrections and one next step. Then revise and ask again.');
  const privacy = el(doc, 'details', 'sf-privacy'); privacy.append(el(doc, 'summary', '', 'How your writing is used'), el(doc, 'p', '', PRIVACY_SUMMARY));
  const list = el(doc, 'ul', 'sf-privacy-list'); PRIVACY_DETAIL.forEach(t => list.append(el(doc, 'li', '', t))); privacy.append(list);
  const consentLabel = el(doc, 'label', 'sf-consent'); const box = el(doc, 'input'); box.type = 'checkbox'; consentLabel.append(box, el(doc, 'span', '', PRIVACY_CONSENT));
  const button = el(doc, 'button', 'sf-button', label); button.type = 'button';
  const progressHost = el(doc, 'div', 'sf-progress'); progressHost.hidden = true;
  const status = el(doc, 'p', 'sf-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const result = el(doc, 'div', 'sf-output'); result.setAttribute('aria-live', 'polite');
  section.append(title, lead, privacy, consentLabel, button, progressHost, status, result); host.replaceChildren(section);
  const progress = createAssessmentProgress(progressHost, { label: 'Getting your feedback', ...progressOptions });
  const say = (message, tone = '') => { status.textContent = message; status.className = 'sf-status' + (tone ? ' sf-status--' + tone : ''); };
  function clear() { generation++; pending?.abort(); pending = null; busy = false; progress.reset(); result.replaceChildren(); say(''); button.disabled = false; button.textContent = count ? 'Get feedback on my revised writing' : label; }
  async function run() {
    if (busy || disposed) return;
    const response = String(getResponse() ?? ''), task = String(getTask() ?? '');
    if (task.trim().length < 10) { say('Choose your writing task first, so the feedback matches the question.', 'warn'); return; }
    if (response.trim().length < 4) { say('Write something first, then ask for feedback.', 'warn'); return; }
    if (!box.checked) { say('Please read how your writing is used and tick the box first.', 'warn'); box.focus?.(); return; }
    busy = true; button.disabled = true; button.textContent = 'Getting your feedback…'; result.replaceChildren(); say('');
    const current = ++generation; pending = new AbortController(); progress.start();
    try {
      const client = await getClient();
      const feedback = await request(client, { app, task, response, privacyNoticeAccepted: true }, { signal: pending.signal });
      if (disposed || current !== generation) return;
      await progress.succeed();
      if (disposed || current !== generation) return;
      count++; result.append(renderStudentFeedback(doc, feedback, { onRevise })); say('Your feedback is ready.', 'ok');
    } catch (error) {
      if (disposed || current !== generation || error?.name === 'AbortError') return;
      const message = error instanceof FeedbackError ? error.message : 'We could not get your feedback this time. Your writing is still here and nothing was saved. Please try again in a minute.';
      progress.fail(message, { timedOut: error?.code === 'timeout' }); say(message, 'error');
      status.classList.add('sf-sr');   // the card already shows the words; keep the status line for screen readers only
    } finally { if (!disposed && current === generation) { busy = false; pending = null; button.disabled = false; button.textContent = count ? 'Get feedback on my revised writing' : label; } }
  }
  button.addEventListener('click', run);
  const leave = () => clear(); win?.addEventListener('pagehide', leave);
  return { clear, dispose() { if (disposed) return; clear(); disposed = true; button.removeEventListener('click', run); win?.removeEventListener('pagehide', leave); host.replaceChildren(); } };
}
