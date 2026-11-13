import { skillLabel } from './skill-profile.js';

// Content-neutral follow-up: use only actual non-secure mastery/error signals.
// A class skill trend is NOT automatically treated as evidence that each listed word failed that skill.
export function buildFollowUpPlan({ classData, currentStudent = null, currentDrilldown = null, currentInsights = null } = {}) {
  if (!classData) return null;
  const studentById = new Map((classData.students ?? []).map(s => [s.id, s]));
  const wordById = new Map((classData.targets ?? []).map(w => [w.vocabularyId, w.term]));
  const allowed = currentStudent ? new Set([currentStudent.studentId])
    : currentDrilldown ? new Set((currentDrilldown.affectedStudents ?? []).map(s => s.studentId)) : null;
  const groups = new Map();
  for (const row of classData.mastery ?? []) {
    if (!studentById.has(row.studentId) || (allowed && !allowed.has(row.studentId))) continue;
    if (row.status !== 'building' && !row.recentErrorPattern) continue;
    if (!groups.has(row.studentId)) groups.set(row.studentId, []);
    groups.get(row.studentId).push({ term:wordById.get(row.vocabularyId) ?? null, hasPattern:Boolean(row.recentErrorPattern) });
  }
  const students = [...groups].map(([id, targets]) => ({
    id, name:studentById.get(id).displayName ?? 'Student',
    words:[...new Set(targets.map(x => x.term).filter(Boolean))].slice(0,4),
    totalTargets:targets.length,
    patternCount:targets.filter(x => x.hasPattern).length
  })).sort((a,b) => b.patternCount-a.patternCount || b.totalTargets-a.totalTargets || a.name.localeCompare(b.name));
  const focusId = currentStudent?.developmentSkill ?? currentStudent?.developmentArea
    ?? currentDrilldown?.skillId ?? currentDrilldown?.strand
    ?? currentInsights?.mainWeakness?.skillId ?? currentInsights?.mainWeakness?.strand ?? null;
  const focus = focusId ? (skillLabel(focusId) || String(focusId).replaceAll('_',' ')) : 'Vocabulary in context';
  const kind = String(focusId ?? '');
  const activity = /paraphras/i.test(kind)
    ? 'Show students a short sentence and three possible paraphrases. Ask them to select the one that keeps the meaning unchanged, explain why, then write their own paraphrase.'
    : /spelling|recall/i.test(kind)
    ? 'Give a short meaning cue. Students spell the target word from memory, check it against the original, then write one accurate sentence.'
    : /word.famil|production|precision/i.test(kind)
    ? 'Ask students to use the target word accurately in a sentence, explain their choice, then improve or change its form where appropriate.'
    : 'Use a short sentence with the target word. Students explain its meaning in context and choose or write an accurate alternative.';
  return {
    className:classData.className ?? '',
    students,
    focus,
    focusSource:currentStudent ? 'Individual profile' : currentDrilldown ? 'Selected problem area' : 'Class-level learning trend',
    activity,
    limitation:'Based on current developing-word records and recorded error patterns. These are practice priorities, not proof of a particular misconception or that every word failed the suggested skill.'
  };
}

export function teamsFollowUpMessage(plan) {
  if (!plan?.students?.length) return '';
  return [
    'Vocabulary follow-up practice',
    `Focus: ${plan.focus}`,
    '1. Open the iGCSE Self-Study Hub and review the vocabulary words you are still developing.',
    '2. For each word, write its meaning and one accurate example sentence.',
    '3. Check your examples, correct any errors, and try the words again without looking.',
    'Please complete a short Hub practice session after this so we can check your progress.'
  ].join('\n');
}
