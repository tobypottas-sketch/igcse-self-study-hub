// Pure timing core. Call transitions at the actual boundary, not only on heartbeats.
// Monotonic clock measures elapsed time; wall clock is used for interval attribution.
export function createActiveLearningClock({
  now = () => performance.now(), wallNow = () => Date.now(),
  idleMs = 120000, maxGapMs = 30000
} = {}) {
  if (!Number.isFinite(idleMs) || idleMs <= 0 || !Number.isFinite(maxGapMs) || maxGapMs <= 0) throw new Error('Invalid clock settings');
  let context = null, visible = false, focused = false, playing = false;
  let lastInteraction = -Infinity, last = now(), wall = wallNow();
  let pending = [];
  function advance() {
    const next = now(), nextWall = wallNow();
    const elapsed = next - last;
    // Never credit sleep, suspended timers, or wall-clock jumps.
    if (context && visible && focused && elapsed > 0 && elapsed <= maxGapMs &&
        Math.abs(nextWall - wall - elapsed) <= 2000) {
      const end = playing ? next : Math.min(next, lastInteraction + idleMs);
      const ms = Math.max(0, end - last);
      const startMs = Math.ceil(wall), endMs = Math.floor(wall + ms);
      if (endMs > startMs) pending.push({ context, startMs, endMs });
    }
    last = next; wall = nextWall;
  }
  return {
    enter(value) {
      if (!value || typeof value.module !== 'string' || !value.module || typeof value.activity !== 'string' || !value.activity) throw new Error('Learning context required');
      const next = Object.freeze({ module:value.module, unit:value.unit ?? null, pathway:value.pathway ?? null, activity:value.activity, mode:value.mode ?? null });
      advance(); context = next; playing = false; lastInteraction = -Infinity;
    },
    leave() { advance(); context = null; playing = false; lastInteraction = -Infinity; },
    visibility(value) { advance(); visible = value === true; if (!visible) { lastInteraction = -Infinity; playing = false; } },
    focus(value) { advance(); focused = value === true; if (!focused) { lastInteraction = -Infinity; playing = false; } },
    interaction() { advance(); if (context && visible && focused) lastInteraction = last; },
    playback(value) { advance(); playing = Boolean(value === true && context?.module === 'listening' && visible && focused); },
    tick() { advance(); },
    drain() { advance(); const result = pending; pending = []; return result; }
  };
}

// Serial, retryable in-memory outbox. Transport must persist idempotently by batch ID.
// Caller must retain this outbox across retry attempts; durability is a separate adapter.
export function createTimingOutbox({ send, id }) {
  if (typeof send !== 'function' || typeof id !== 'function') throw new Error('Transport and ID factory required');
  const queue = []; let running = null;
  return {
    enqueue(intervals) {
      if (intervals.length) queue.push({ id:id(), intervals:intervals.map(x => ({ ...x, context:{ ...x.context } })) });
    },
    size() { return queue.length; },
    flush() {
      if (running) return running;
      running = Promise.resolve().then(async () => {
        while (queue.length) {
          await send(queue[0]);
          queue.shift();
        }
      }).finally(() => { running = null; });
      return running;
    }
  };
}
