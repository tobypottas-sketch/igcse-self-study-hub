// Ordered, idempotent, recoverable persistence of vocabulary attempts.
//
// The server stays authoritative for marking, evidence, mastery and pathway progression. This module
// only decides *when and how often* the client asks the server to record an answer:
//   - every answer gets ONE attemptId, assigned when it is first enqueued and re-sent unchanged on every
//     retry, so the server's idempotency (`duplicate:true` with the persisted state) makes retrying safe
//     even if the first request actually committed and only its response was lost;
//   - attempts are submitted strictly in answer order; a failed head attempt keeps its place and later
//     answers wait behind it;
//   - transient failures are retried a bounded number of times automatically; if they persist the queue
//     is "blocked" (never discarded) and `retry()` resumes from the same head attempt;
//   - the client never advances progression itself: `apply` is only called with a server result.

const DEFAULT_AUTO_RETRIES = 2;
const DEFAULT_BACKOFF_MS = 400;

function defaultWait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function defaultNewId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createAttemptPersistence({
  submit,
  apply = () => {},
  onBlocked = () => {},
  onRecovered = () => {},
  onMismatch = () => {},
  autoRetries = DEFAULT_AUTO_RETRIES,
  backoffMs = DEFAULT_BACKOFF_MS,
  wait = defaultWait,
  newId = defaultNewId
} = {}) {
  if (typeof submit !== 'function') throw new TypeError('createAttemptPersistence requires a submit function.');
  let queue = [];
  let blocked = false;
  let draining = null;
  let generation = 0;

  async function submitWithRetries(entry) {
    let lastError = null;
    for (let attempt = 0; attempt <= autoRetries; attempt += 1) {
      if (attempt > 0) await wait(backoffMs * attempt);
      try { return await submit({ ...entry.payload, attemptId:entry.attemptId }); }
      catch (error) { lastError = error instanceof Error ? error : new Error(String(error)); }
    }
    throw lastError;
  }

  async function drain() {
    const mine = generation;
    while (queue.length && generation === mine) {
      const entry = queue[0];
      let result;
      try { result = await submitWithRetries(entry); }
      catch (error) {
        if (generation !== mine) return;
        blocked = true;
        onBlocked(error);
        return;
      }
      if (generation !== mine) return;
      queue.shift();
      // The server has saved this attempt. Whatever it says about correctness is authoritative, so a
      // disagreement with the local mark is reported but must never trap the student.
      if (entry.localCorrect != null && result?.correct !== entry.localCorrect) onMismatch(entry, result);
      apply(entry, result);
    }
  }

  function run() {
    if (blocked) return Promise.resolve();
    if (!draining) {
      const running = drain().finally(() => { if (draining === running) draining = null; });
      draining = running;
    }
    return draining;
  }

  return {
    get blocked() { return blocked; },
    get pending() { return queue.length; },
    // Adds one answer and (unless blocked) starts submitting. Resolves when the queue is drained or blocked.
    enqueue({ payload, localCorrect = null, context = null }) {
      queue.push({ attemptId:payload?.attemptId ?? newId(), payload, localCorrect, context });
      return run();
    },
    // Resolves once everything queued so far is saved or the queue is blocked. Never waits on state that
    // cannot arrive.
    async settled() {
      while (draining) await draining;
      return !blocked && queue.length === 0;
    },
    // Resume from the failed head attempt with its original attemptId. Resolves true when fully saved.
    async retry() {
      if (!queue.length) { blocked = false; return true; }
      const wasBlocked = blocked;
      blocked = false;
      await run();
      while (draining) await draining;
      if (!blocked && queue.length === 0) { if (wasBlocked) onRecovered(); return true; }
      return false;
    },
    // Unsaved attempts are never discarded by accident: reset() is a no-op (returns false) while anything is
    // queued, in flight or blocked. Only an explicit { force:true } (abandoning the whole session on purpose)
    // may drop them.
    reset({ force = false } = {}) {
      if (!force && (queue.length || blocked || draining)) return false;
      generation += 1; queue = []; blocked = false; draining = null;
      return true;
    }
  };
}
