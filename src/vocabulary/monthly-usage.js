function validDate(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time) : null;
}

function localDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function dayLabel(date) {
  return date.toLocaleDateString('en', { month:'short', day:'numeric' });
}

export function buildMonthlyUsage({ students = [], activity = [], now = new Date() } = {}) {
  const current = now instanceof Date ? now : new Date(now);
  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
  const todayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const allowed = new Set(students.map(row => row.id));
  const byDay = new Map();
  const activeStudentIds = new Set();

  for (const event of activity) {
    if (event?.eventType !== 'question_attempt' || !allowed.has(event.studentId)) continue;
    const occurred = validDate(event.occurredAt);
    if (!occurred) continue;
    const eventDay = new Date(occurred.getFullYear(), occurred.getMonth(), occurred.getDate());
    if (eventDay < monthStart || eventDay > todayStart) continue;
    const key = localDayKey(eventDay);
    if (!byDay.has(key)) byDay.set(key, new Set());
    byDay.get(key).add(event.studentId);
    activeStudentIds.add(event.studentId);
  }

  const days = [];
  for (let date = new Date(monthStart); date <= todayStart; date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)) {
    const key = localDayKey(date);
    days.push({
      date:key,
      day:dayLabel(date),
      activeStudents:byDay.get(key)?.size ?? 0
    });
  }

  return {
    monthLabel:current.toLocaleDateString('en', { month:'long', year:'numeric' }),
    studentCount:students.length,
    activeStudents:activeStudentIds.size,
    activeDays:days.filter(row => row.activeStudents > 0).length,
    days
  };
}
