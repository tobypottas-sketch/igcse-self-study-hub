import { timestampOf } from './periods.js';

// Pass the authorised pilot windows and credited segment results for one
// student. Keep coverage separate from the duration shown to the teacher.
export function activeLearningV2Coverage({ module, period, windows, segments, failed = false }) {
  if (module !== 'vocabulary_paraphrase') return 'outside_module_scope';
  if (failed || !Array.isArray(windows) || !Array.isArray(segments)) return 'query_failed';
  const start = period.start;
  const end = Math.min(period.end, period.asOf);
  const spans = windows.map(window => [
    timestampOf(window.starts_at), window.ends_at === null ? Infinity : timestampOf(window.ends_at)
  ]).sort(([a], [b]) => a - b);
  if (spans.some(([from, to]) => !Number.isFinite(from) || !(to > from))) return 'query_failed';
  if (end <= start) return 'not_enabled';
  if (spans.length && end <= spans[0][0]) return 'before_activation';

  let cursor = start;
  let covered = false;
  for (const [from, to] of spans) {
    if (to <= start || from >= end) continue;
    covered = true;
    if (from > cursor) return 'partial';
    cursor = Math.max(cursor, to);
    if (cursor >= end) return segments.length ? 'recorded' : 'enabled_no_recorded_time';
  }
  return covered ? 'partial' : 'not_enabled';
}
