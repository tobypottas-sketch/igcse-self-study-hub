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
  const frequencies = new Map();
  for (const student of students) for (const term of student.words) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
  const wordBank = [...frequencies].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0,6).map(([term]) => term);
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
  const studentTask = /paraphras/i.test(kind)
    ? 'Choose two words from the list. Write one accurate sentence with each word, then rewrite each sentence in different words without changing its meaning. Explain which meaning you preserved.'
    : /spelling|recall/i.test(kind)
    ? 'Study three words from the list for one minute. Cover them, spell them from memory, then check and correct them. Use each correctly in a sentence.'
    : /word.famil|production|precision/i.test(kind)
    ? 'Choose three words from the list. Write an accurate example sentence for each. Where a natural related word form exists, write another sentence using that form.'
    : 'Choose three words from the list. Write a short sentence for each that shows its meaning, then explain the meaning in your own words.';
  return {
    className:classData.className ?? '',
    students,
    wordBank,
    focus,
    focusSource:currentStudent ? 'Individual profile' : currentDrilldown ? 'Selected problem area' : 'Class-level learning trend',
    activity,
    studentTask,
    limitation:'Based on current developing-word records and recorded error patterns. These are practice priorities, not proof of a particular misconception or that every word failed the suggested skill.'
  };
}

export function teamsFollowUpMessage(plan) {
  if (!plan?.students?.length) return '';
  const sample = (plan.wordBank ?? []).length ? `Suggested practice words: ${plan.wordBank.join(', ')}.` : '';
  return [
    'Vocabulary follow-up | 10 minutes',
    `Focus: ${plan.focus}`,
    sample,
    `1. ${plan.studentTask}`,
    '2. Check your answers using the vocabulary definitions and correct any errors.',
    '3. Try one new example independently without looking at your earlier answer.',
    'Then complete a short session in the iGCSE Self-Study Hub to practise again.'
  ].filter(Boolean).join('\n');
}
