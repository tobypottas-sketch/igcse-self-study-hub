// Teacher-facing practice habits (engagement Phase 3). Pure and derived: it reads factual mission rows and the safe,
// already-loaded attempt flags. It never reads answers, scores-as-mastery or evidence, and nothing here feeds
// progression, mastery, merits or interventions.
import { WEEKLY_GOAL } from './engagement-model.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const QUIET_AFTER_DAYS = 14;
export const MIN_ATTEMPTS_FOR_RATE = 20;
const RATE_WINDOW_DAYS = 28;

function startOfWeek(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}
function dayKey(date) { return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; }
function stamp(value) { const time = Date.parse(value); return Number.isFinite(time) ? time : null; }

export function buildStudentHabits({ student, missions = [], activity = [], now = new Date() } = {}) {
  const weekStart = startOfWeek(now).getTime();
  const mine = missions.map(row => ({ at:stamp(row.completedAt ?? row.completed_at) })).filter(row => row.at != null);
  const thisWeek = mine.filter(row => row.at >= weekStart && row.at <= now.getTime());
  const perWeek = new Map();
  for (const row of mine) {
    const key = dayKey(startOfWeek(new Date(row.at)));
    perWeek.set(key, (perWeek.get(key) ?? 0) + 1);
  }
  const last = mine.reduce((max, row) => Math.max(max, row.at), 0);
  const attempts = activity.filter(event => event.eventType === 'question_attempt' && stamp(event.occurredAt) != null && now.getTime() - stamp(event.occurredAt) <= RATE_WINDOW_DAYS * DAY_MS);
  const first = attempts.filter(event => Number(event.metadata?.attempt_number) === 1).length;
  const second = attempts.filter(event => Number(event.metadata?.attempt_number) === 2).length;
  const activeDays = new Set(attempts.filter(event => stamp(event.occurredAt) >= weekStart).map(event => dayKey(new Date(stamp(event.occurredAt)))));
  return {
    studentId:student?.id ?? null,
    displayName:student?.displayName ?? 'Student',
    missionsThisWeek:thisWeek.length,
    goal:WEEKLY_GOAL,
    goalMet:thisWeek.length >= WEEKLY_GOAL,
    weeksMet:[...perWeek.values()].filter(count => count >= WEEKLY_GOAL).length,
    totalMissions:mine.length,
    lastMissionAt:last ? new Date(last).toISOString() : null,
    daysSinceMission:last ? Math.max(0, Math.floor((now.getTime() - last) / DAY_MS)) : null,
    activeDaysThisWeek:activeDays.size,
    secondTryPercent:first >= MIN_ATTEMPTS_FOR_RATE ? Math.round((second / first) * 100) : null
  };
}

export function buildPracticeHabits({ students = [], missions = [], activity = [], now = new Date() } = {}) {
  const rows = students.map(student => buildStudentHabits({
    student,
    missions:missions.filter(row => (row.studentId ?? row.student_id) === student.id),
    activity:activity.filter(event => event.studentId === student.id),
    now
  }));
  const quiet = rows.filter(row => row.daysSinceMission == null || row.daysSinceMission >= QUIET_AFTER_DAYS)
    .sort((a, b) => (b.daysSinceMission ?? Infinity) - (a.daysSinceMission ?? Infinity) || a.displayName.localeCompare(b.displayName));
  const rated = rows.filter(row => row.secondTryPercent != null);
  return {
    studentCount:rows.length,
    goal:WEEKLY_GOAL,
    missionsThisWeek:rows.reduce((sum, row) => sum + row.missionsThisWeek, 0),
    studentsMetGoal:rows.filter(row => row.goalMet).length,
    studentsActiveThisWeek:rows.filter(row => row.missionsThisWeek > 0).length,
    quiet,
    quietAfterDays:QUIET_AFTER_DAYS,
    classSecondTryPercent:rated.length ? Math.round(rated.reduce((sum, row) => sum + row.secondTryPercent, 0) / rated.length) : null,
    rows
  };
}

export function habitsLastPractice(habit) {
  if (habit.daysSinceMission == null) return 'No mission yet';
  if (habit.daysSinceMission === 0) return 'Today';
  if (habit.daysSinceMission === 1) return 'Yesterday';
  return `${habit.daysSinceMission} days ago`;
}
