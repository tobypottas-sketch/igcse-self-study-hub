// Shared "Get My Feedback" panel for any writing app. An app supplies a small adapter:
//   mountStudentFeedback(host, { app:'email'|'review', getTask(), getResponse(), getClient(), onRevise?() })
// It reuses the assessor progress card, keeps nothing in storage and never shows marks.
import { createAssessmentProgress } from './progress.js';
import { requestFeedback, FeedbackError } from './student-client.js';
import { PRIVACY_SUMMARY, PRIVACY_DETAIL, PRIVACY_CONSENT } from './student-privacy-notice.js';
const el = (doc, tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
export function renderStudentFeedback(doc, feedback, { onRevise } = {}) {
  const box = el(doc, 'div', 'sf-result');
  const heading = (t, tag = 'h3') => el(doc, tag, 'sf-heading', t);
  const point = (item, kind) => {
    const li = el(doc, 'li', 'sf-point');
    if (kind) li.append(el(doc, 'p', 'sf-tag', kind));
    li.append(el(doc, 'blockquote', 'sf-quote', item.quote), el(doc, 'p', 'sf-advice', item.advice));
    if (item.suggestion) { const s = el(doc, 'p', 'sf-suggestion'); s.append(el(doc, 'strong', '', item.type === 'error' ? 'Try this: ' : 'You could write: '), doc.createTextNode(item.suggestion)); li.append(s); }
    return li;
  };
  if (feedback.partial) {
    const note = el(doc, 'section', 'sf-card sf-card--notice');
    note.append(heading('We could not check specific feedback this time'), el(doc, 'p', '', 'We only show comments that we can match to your exact words, and we could not do that for this version. This does not mean your writing has no mistakes. Read it again slowly, check each task point, then ask again when you have changed something.'));
    box.append(note);
  } else {
    if (feedback.lengthNotice) { const c = el(doc, 'section', 'sf-card sf-card--length'); c.append(heading('Length'), el(doc, 'p', '', feedback.lengthNotice.message), el(doc, 'p', '', feedback.lengthNotice.suggestion)); box.append(c); }
    if (feedback.strengths.length) { const c = el(doc, 'section', 'sf-card sf-card--good'); const ul = el(doc, 'ul', 'sf-list'); feedback.strengths.forEach(s => ul.append(point(s))); c.append(heading('What you did well'), ul); box.append(c); }
    if (feedback.improvements.length) {
      const c = el(doc, 'section', 'sf-card sf-card--fix'); const ul = el(doc, 'ul', 'sf-list');
      feedback.improvements.forEach(i => ul.append(point(i, i.type === 'error' ? 'Correction' : 'Optional wording change')));
      c.append(heading('What to fix or try'), ul, el(doc, 'p', 'sf-note', 'This is not a full list of every mistake. Read your whole text again.')); box.append(c);
    }
    if (feedback.nextStep) { const c = el(doc, 'section', 'sf-card sf-card--next'); c.append(heading('Your next step'), el(doc, 'p', '', feedback.nextStep)); box.append(c); }
  }
  const foot = el(doc, 'div', 'sf-foot');
  foot.append(el(doc, 'p', 'sf-note', 'This feedback is about the version you just sent. If you change your writing, the examples above may no longer match. AI can make mistakes, so check anything that seems wrong with your teacher.'));
  if (onRevise) { const b = el(doc, 'button', 'sf-button sf-button--ghost', 'Revise my writing'); b.type = 'button'; b.addEventListener('click', onRevise); foot.append(b); }
  box.append(foot);
  return box;
}
export function mountStudentFeedback(host, options) {
  const doc = host.ownerDocument; const win = doc.defaultView;
  const { app, getTask, getResponse, getClient, onRevise, request = requestFeedback, progressOptions = {}, label = 'Get My Feedback' } = options;
  let busy = false, disposed = false, generation = 0, pending = null, count = 0;
  const section = el(doc, 'section', 'student-feedback');
  const title = el(doc, 'h2', 'sf-title', 'Get feedback on your writing');
  const lead = el(doc, 'p', 'sf-lead', 'Ask for specific comments on your writing. You will see strengths, corrections and one next step, but no marks. Then you can revise and ask again.');
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
