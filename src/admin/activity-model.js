import { buildPathwayAnalytics } from '../vocabulary/analytics.js';
import { buildMeritStatus } from '../vocabulary/merits.js';
import { VOCABULARY_PATHWAYS } from '../vocabulary/pathway-model.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const INACTIVE_MS = WEEK_MS;

function time(value) {
  const ms = new Date(value ?? 0).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function byStudent(rows = [], id) {
  return rows.filter(row => (row.studentId ?? row.student_id ?? row.user_id) === id);
}

function unitCheckSummary(rows = []) {
  const sorted = [...rows].sort((a,b) => time(b.completedAt ?? b.completed_at) - time(a.completedAt ?? a.completed_at));
  if (!sorted.length) return { latestScore:null, bestScore:null, attemptsUsed:0, attemptsRemaining:3, rows:[] };
  return {
    latestScore:Number(sorted[0].score),
    bestScore:Math.max(...sorted.map(row => Number(row.score) || 0)),
    attemptsUsed:sorted.length,
    attemptsRemaining:Math.max(0,3 - sorted.length),
    rows:sorted
  };
}

function activityLabel(event = {}) {
  const meta = event.metadata ?? {};
  const pathway = meta.pathway_id ?? meta.pathwayId ?? null;
  const stage = meta.pathway_stage ?? meta.pathwayStage ?? null;
  if (pathway && stage) return `${pathway.replaceAll('_',' ')} · ${stage}`;
  if (pathway) return pathway.replaceAll('_',' ');
  return String(event.eventType ?? event.event_type ?? 'Activity').replaceAll('_',' ');
}

function safeActivity(event = {}) {
  return {
    occurredAt:event.occurredAt ?? event.occurred_at ?? null,
    appKey:event.appKey ?? event.app_key ?? null,
    eventType:event.eventType ?? event.event_type ?? null,
    label:activityLabel(event)
  };
}

function attentionFor({ hasStarted, lastActiveMs, nowMs, checks, activityCount, pathways }) {
  const flags = [];
  if (hasStarted && lastActiveMs && nowMs - lastActiveMs >= INACTIVE_MS) flags.push({ code:'inactive', label:'Inactive 7+ days' });
  if (checks.rows.filter(row => Number(row.score) < 5).length >= 2) flags.push({ code:'weak_unit_check', label:'Repeated low Unit Check scores' });
  const progressed = Object.values(pathways ?? {}).some(row => row?.currentStage && row.currentStage !== 'recognise');
  if (activityCount >= 5 && !progressed) flags.push({ code:'stalled', label:'Active but no recent progression' });
  return flags;
}

export function buildActivityDashboard({
  students = [], occurrences = [], globalMastery = [], unitMastery = [], activity = [], unitChecks = [], awards = [], now = new Date()
} = {}) {
  const nowMs = new Date(now).getTime();
  const pathwayAnalytics = buildPathwayAnalytics({ students, occurrences, globalMastery, unitMastery });
  const pathwayByStudent = new Map(pathwayAnalytics.studentRows.map(row => [row.studentId,row.pathways]));
  const merits = buildMeritStatus({ students, occurrences, unitMastery, globalMastery, awards });
  const meritByStudent = new Map(merits.map(row => [row.studentId,row]));

  const rows = students.map(student => {
    const events = byStudent(activity,student.id).sort((a,b) => time(b.occurredAt ?? b.occurred_at) - time(a.occurredAt ?? a.occurred_at));
    const checks = unitCheckSummary(byStudent(unitChecks,student.id));
    const studentUnitMastery = byStudent(unitMastery,student.id);
    const studentGlobalMastery = byStudent(globalMastery,student.id);
    const hasStarted = events.length > 0 || checks.rows.length > 0 || studentUnitMastery.length > 0 || studentGlobalMastery.length > 0;
    const pathways = hasStarted
      ? (pathwayByStudent.get(student.id) ?? Object.fromEntries(VOCABULARY_PATHWAYS.map(p => [p.id,{ currentStage:'recognise', available:true }])))
      : {};
    const lastActive = events[0]?.occurredAt ?? events[0]?.occurred_at ?? null;
    const lastActiveMs = time(lastActive);
    const activityThisWeek = events.filter(event => nowMs - time(event.occurredAt ?? event.occurred_at) <= WEEK_MS).length;
    const merit = meritByStudent.get(student.id) ?? { pendingNumbers:[] };
    const attention = attentionFor({ hasStarted, lastActiveMs, nowMs, checks, activityCount:events.length, pathways });
    return {
      studentId:student.id,
      displayName:student.displayName ?? student.display_name ?? student.id,
      classId:student.classId ?? student.class_id ?? null,
      className:student.className ?? student.class_name ?? '',
      hasStarted,
      lastActive,
      activityThisWeek,
      recentApp:events[0]?.appKey ?? events[0]?.app_key ?? null,
      recentPathway:events[0]?.metadata?.pathway_id ?? events[0]?.metadata?.pathwayId ?? null,
      pathways,
      unitCheck:checks,
      pendingMerits:merit.pendingNumbers?.length ?? 0,
      pendingMeritNumbers:[...(merit.pendingNumbers ?? [])],
      needsAttention:attention.length > 0,
      attention,
      recentActivity:events.slice(0,12).map(safeActivity)
    };
  });

  return {
    students:rows,
    pendingMerits:rows.reduce((sum,row) => sum + row.pendingMerits,0),
    needsAttention:rows.filter(row => row.needsAttention).length
  };
}
