// eh-summary: the Vocabulary evidence summary for ONE student, derived from rows the caller has already read. Pure: no I/O, no clock
// (the caller passes `now`), no logging. The output is built field by field from a whitelist, so nothing else a row carries can leak.
//
// Inputs (rows exactly as stored; the Edge loader in H4 supplies them):
//   members, occurrences  see pathway-state.js (the student's units' Set membership and the occurrences it points at)
//   setRows               this student's vocabulary_pathway_sets rows
//   unitChecks            this student's vocabulary_unit_check_attempts rows (unit_number, attempt_number, score, max_score, completed_at)
//   merits                this student's vocabulary_merit_awards rows (awarded_at)
//   events                this student's activity_events rows, flattened: { event_type, occurred_at, pathway_id }
//   now, since            ISO time of the request; 'YYYY-MM-DD' start of the event window the caller loaded
// A missing or non-array input means "unknown": the matching field is omitted, never sent as 0 or empty. All dates are Asia/Shanghai.
import { derivePathwayStates } from './pathway-state.js';

export const REQUIRED_PAIRS = 2;
export const WINDOW_DAYS = 56;                                  // "last 8 weeks": today and the 55 days before it
const MAX_UNIT_CHECK_ATTEMPTS = 3;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;                  // no daylight saving in Asia/Shanghai
const DAY_MS = 24 * 60 * 60 * 1000;

function objects(list) { return (Array.isArray(list) ? list : []).filter(row => row && typeof row === 'object'); }
function whole(value) { const number = Number(value); return Number.isInteger(number) ? number : null; }

// ISO timestamp -> day number (days since 1970-01-01) in Asia/Shanghai, or null.
function dayNumber(timestamp) {
  const ms = typeof timestamp === 'string' || timestamp instanceof Date ? new Date(timestamp).getTime() : NaN;
  return Number.isFinite(ms) ? Math.floor((ms + SHANGHAI_OFFSET_MS) / DAY_MS) : null;
}
function isoDate(day) { return new Date(day * DAY_MS).toISOString().slice(0, 10); }
// 'YYYY-MM-DD' -> day number, or null (rejects impossible dates).
function dayOfIsoDate(text) {
  if (typeof text !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const ms = Date.parse(`${text}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === text ? Math.floor(ms / DAY_MS) : null;
}
function mondayOf(day) { return day - ((day + 3) % 7); }       // 1970-01-05 (day 4) is a Monday

function derivePairs(input) {
  const { units } = derivePathwayStates({ members: input.members, occurrences: input.occurrences, setRows: input.setRows });
  const rows = objects(input.setRows);
  const pairs = [];
  for (const unit of Object.keys(units).map(Number).sort((a, b) => a - b)) {
    for (const [pathway, info] of Object.entries(units[unit].pathways)) {
      if (info.state === 'none') continue;
      let latest = null;
      for (const row of rows) {
        if (whole(row.unit_number) !== unit || row.pathway_id !== pathway) continue;
        const day = dayNumber(row.updated_at);
        if (day !== null && (latest === null || day > latest)) latest = day;
      }
      const pair = { unit, pathway, state: info.state };
      if (latest !== null) pair.lastActivityOn = isoDate(latest);
      pairs.push(pair);
    }
  }
  return pairs;
}

function deriveUnitChecks(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const row of objects(list)) {
    const unit = whole(row.unit_number);
    const attempt = whole(row.attempt_number);
    const score = whole(row.score);
    const max = whole(row.max_score);
    const day = dayNumber(row.completed_at);
    if (unit === null || unit < 1 || attempt === null || attempt < 1 || attempt > MAX_UNIT_CHECK_ATTEMPTS) continue;
    if (score === null || max === null || max < 1 || score < 0 || score > max || day === null) continue;
    const key = `${unit}:${attempt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ unit, attempt, score, max, completedOn: isoDate(day) });
  }
  return out.sort((a, b) => a.unit - b.unit || a.attempt - b.attempt);
}

function deriveMerits(list) {
  if (!Array.isArray(list)) return null;
  const rows = objects(list);
  let latest = null;
  for (const row of rows) {
    const day = dayNumber(row.awarded_at);
    if (day !== null && (latest === null || day > latest)) latest = day;
  }
  const merits = { count: rows.length };
  if (latest !== null) merits.latestAwardedOn = isoDate(latest);
  return merits;
}

function pathwayEventDay(event) {
  if (event.event_type !== 'exercise_result') return null;
  const pathway = event.pathway_id ?? event.metadata?.pathway_id;
  return typeof pathway === 'string' && pathway !== '' ? dayNumber(event.occurred_at) : null;
}

// Active day = a pathway exercise_result OR a Unit Check completion. App open, active time, section use, support use, Games and
// practice without a pathway never count.
function deriveEngagement({ events, unitChecks, now, since }) {
  if (!Array.isArray(events)) return null;
  const today = dayNumber(now);
  const days = new Set();
  for (const event of objects(events)) {
    const day = pathwayEventDay(event);
    if (day !== null) days.add(day);
  }
  for (const check of unitChecks) days.add(dayNumber(`${check.completedOn}T00:00:00+08:00`));
  const counted = [...days].filter(day => today === null || day <= today);
  const engagement = {};
  if (counted.length) engagement.lastActiveOn = isoDate(Math.max(...counted));
  const windowStart = today === null ? null : today - (WINDOW_DAYS - 1);
  const sinceDay = dayOfIsoDate(since);
  if (windowStart !== null && sinceDay !== null && sinceDay <= windowStart) {   // the loaded events must cover the whole window
    const inWindow = counted.filter(day => day >= windowStart);
    engagement.activeDays8w = inWindow.length;
    engagement.activeWeeks8w = new Set(inWindow.map(mondayOf)).size;
  }
  return Object.keys(engagement).length ? engagement : null;
}

export function deriveSummary(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const pairs = derivePairs(source);
  const completed = pairs.filter(pair => pair.state === 'mastered').length;
  const summary = { activation: { requiredPairs: REQUIRED_PAIRS, completedPairs: completed, activated: completed >= REQUIRED_PAIRS }, pairs };
  const lastPathwayDays = pairs.map(pair => dayOfIsoDate(pair.lastActivityOn)).filter(day => day !== null);
  if (lastPathwayDays.length) summary.lastPathwayActivityOn = isoDate(Math.max(...lastPathwayDays));
  const unitChecks = deriveUnitChecks(source.unitChecks);
  if (unitChecks.length) summary.unitChecks = unitChecks;
  const engagement = deriveEngagement({ events: source.events, unitChecks, now: source.now, since: source.since });
  if (engagement) summary.engagement = engagement;
  const merits = deriveMerits(source.merits);
  if (merits) summary.merits = merits;
  return summary;
}
