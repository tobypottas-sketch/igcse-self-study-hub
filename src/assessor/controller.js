import { assessWriting } from './client.js';
import { PRACTICE_TASKS, renderAssessor, renderAssessmentResult } from './view.js';
export function openWritingAssessor(root, client, profile, { onBack, requestAssessment = assessWriting } = {}) {
  if (!renderAssessor(root, profile)) return { dispose(){} };
  const form = root.querySelector('[data-assessor-form]');
  const status = root.querySelector('[data-assessor-status]');
  const result = root.querySelector('[data-assessor-result]');
  const submit = form.querySelector('[type="submit"]');
  const back = root.querySelector('[data-assessor-back]');
  const clearButton = root.querySelector('[data-assessor-clear]');
  const practice = root.querySelector('[data-assessor-practice]');
  const lifecycle = root.ownerDocument.defaultView;
  let busy = false, disposed = false, generation = 0, pending;
  function clear() {
    generation++; pending?.abort(); pending = null; busy = false;
    form.reset();
    // Explicit assignments also remove browser-restored text, rather than defaults.
    form.elements.task.value = ''; form.elements.response.value = '';
    form.elements.privacyConfirmed.checked = false;
    result.replaceChildren(); status.textContent = ''; submit.disabled = false;
    form.removeAttribute('aria-busy');
  }
  function dispose() {
    if (disposed) return;
    clear(); disposed = true;
    form.removeEventListener('submit', assess); back.removeEventListener('click', goBack);
    practice.removeEventListener('change', selectTask); clearButton.removeEventListener('click', clear);
    lifecycle.removeEventListener('pagehide', clear); subscription?.unsubscribe();
  }
  function goBack() { dispose(); onBack?.(); }
  function selectTask() {
    const chosen = PRACTICE_TASKS[practice.value];
    if (chosen) { form.elements.taskType.value = practice.value; form.elements.task.value = chosen.task; }
  }
  async function assess(event) {
    event.preventDefault();
    if (busy || disposed || !form.reportValidity()) return;
    busy = true; submit.disabled = true; form.setAttribute('aria-busy','true'); result.replaceChildren();
    status.textContent = 'Checking evidence and estimating marks…';
    const current = ++generation; pending = new AbortController();
    try {
      const value = await requestAssessment(client, { taskType:form.elements.taskType.value,
        task:form.elements.task.value, response:form.elements.response.value, privacyConfirmed:form.elements.privacyConfirmed.checked }, { signal:pending.signal });
      if (disposed || current !== generation) return;
      renderAssessmentResult(result,value); status.textContent = 'Estimate ready. Check the evidence and marks before using them.';
    } catch (error) {
      if (disposed || current !== generation) return;
      if (error?.code === 'access_denied') clear();
      status.textContent = error?.code ? error.message : 'Unable to complete the assessment. No mark has been issued; no automatic retry was made.';
    } finally {
      if (!disposed && current === generation) { busy = false; pending = null; submit.disabled = false; form.removeAttribute('aria-busy'); }
    }
  }
  // Clear on session loss; defer Hub auth work outside Supabase's auth callback.
  let subscription;
  const auth = client.auth.onAuthStateChange?.(event => {
    if (event === 'SIGNED_OUT') { dispose(); lifecycle.setTimeout(() => onBack?.(),0); }
  });
  subscription = auth?.data?.subscription;
  if (disposed) subscription?.unsubscribe();
  form.addEventListener('submit',assess); back.addEventListener('click',goBack);
  clearButton.addEventListener('click',clear); practice.addEventListener('change',selectTask);
  lifecycle.addEventListener('pagehide',clear);
  return { dispose };
}
