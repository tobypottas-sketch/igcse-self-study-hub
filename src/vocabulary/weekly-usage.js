// Read-only weekly engagement derived from the same vocabulary attempts used by Monthly usage.
// A student counts at most once per day; no mastery or progression data is changed.
const DAY = 86400000;
const monday = date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};
const key = d => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
const dayLabel = d => d.toLocaleDateString('en', { weekday:'short' });
const dateLabel = d => d.toLocaleDateString('en', { month:'short', day:'numeric' });
export const MAX_WEEKS_BACK = 12; // The teacher data source loads the latest 90 days.

export function buildWeeklyUsage({ students = [], activity = [], now = new Date(), weeksAgo = 0 } = {}) {
  const current = now instanceof Date ? now : new Date(now);
  const offset = Math.max(0, Math.min(MAX_WEEKS_BACK, Number.isFinite(Number(weeksAgo)) ? Math.trunc(Number(weeksAgo)) : 0));
  const start = monday(current);
  start.setDate(start.getDate() - offset * 7);
  const finish = new Date(start);
  finish.setDate(start.getDate() + 6);
  const today = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const allowed = new Set(students.map(s => s.id));
  const byDay = new Map();
  const all = new Set();
  for (const event of activity) {
    if (event?.eventType !== 'question_attempt' || !allowed.has(event.studentId)) continue;
    const timestamp = Date.parse(event.occurredAt);
    if (!Number.isFinite(timestamp) || timestamp > current.getTime()) continue;
    const d = new Date(timestamp);
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (local < start || local > finish || local > today) continue;
    const k = key(local);
    if (!byDay.has(k)) byDay.set(k, new Set());
    byDay.get(k).add(event.studentId);
    all.add(event.studentId);
  }
  const days = Array.from({length:7}, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { day:dayLabel(date), date:dateLabel(date), activeStudents:byDay.get(key(date))?.size ?? 0, future:date > today };
  });
  const peak = Math.max(...days.map(d => d.activeStudents));
  const busiestDay = peak ? days.find(d => d.activeStudents === peak).day : 'None';
  return {
    weeksAgo:offset, canPrevious:offset < MAX_WEEKS_BACK, canNext:offset > 0,
    range:`${dateLabel(start)} – ${dateLabel(finish)}, ${finish.getFullYear()}`,
    studentCount:students.length, activeStudents:all.size, busiestDay,
    dailyAverage:Math.round(days.reduce((sum, d) => sum + d.activeStudents, 0) / Math.max(1, days.filter(d => !d.future).length) * 10) / 10,
    days
  };
}
