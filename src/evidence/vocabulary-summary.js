import { buildEvidenceSummary } from './contracts.js';
import { buildVocabularySkillProfile } from '../vocabulary/skill-profile.js';

const STRANDS = ['meaning','recognition','context','paraphrasing','production'];
const STATUS_ORDER = ['needs_attention','developing','secure','strong'];

function score(row, strand) { return Number(row?.strandEvidence?.[strand] ?? 0); }
function avg(values) { return values.length ? values.reduce((sum,value) => sum + value,0) / values.length : 0; }
function statusFromRows(rows) {
  if (!rows.length) return 'needs_attention';
  const mastered = rows.filter(row => row.status === 'mastered').length;
  const secure = rows.filter(row => row.status === 'secure' || row.status === 'mastered').length;
  const attention = rows.filter(row => row.status === 'building' || row.recentErrorPattern).length;
  if (mastered / rows.length >= .75) return 'strong';
  if (secure / rows.length >= .6) return 'secure';
  if (attention / rows.length >= .35) return 'needs_attention';
  return 'developing';
}
function strandScores(rows) { return Object.fromEntries(STRANDS.map(strand => [strand, Number(avg(rows.map(row => score(row,strand))).toFixed(2))])); }
function weakest(scores) { return STRANDS.slice().sort((a,b) => scores[a] - scores[b])[0] ?? null; }
function strongest(scores) { return STRANDS.slice().sort((a,b) => scores[b] - scores[a])[0] ?? null; }
function signalStrength(count) { return count >= 20 ? 'strong' : count >= 6 ? 'moderate' : 'weak'; }

export function buildVocabularyEvidenceSummary({ studentId, mastery = [], activity = [], evidenceWindowStart, evidenceWindowEnd } = {}) {
  const scores = strandScores(mastery);
  const persistentTargets = mastery.filter(row => row.status === 'building' || row.recentErrorPattern).map(row => row.vocabularyId);
  const provenance = [
    ...mastery.map(row => ({ source:'vocabulary_global_mastery', id:`${studentId}:${row.vocabularyId}` })),
    ...activity.filter(row => row.id).map(row => ({ source:'activity_events', id:row.id }))
  ];
  if (!provenance.length) provenance.push({ source:'vocabulary_summary', id:`${studentId}:${evidenceWindowEnd}` });
  const status = statusFromRows(mastery);
  const recentSecure = mastery.filter(row => ['secure','mastered'].includes(row.status)).length;
  const trend = mastery.length < 2 ? 'insufficient_evidence' : recentSecure ? 'improving' : 'stable';
  const skillProfile = buildVocabularySkillProfile(activity);
  return {
    ...buildEvidenceSummary({
      learningArea:'vocabulary_paraphrase', studentId, status, trend,
      signalStrength:signalStrength(mastery.length + activity.length),
      evidenceWindowStart, evidenceWindowEnd, provenance,
      strands:Object.fromEntries(STRANDS.map(strand => [strand, scores[strand]]))
    }),
    strongestArea:strongest(scores),
    developmentArea:weakest(scores),
    persistentTargetCount:persistentTargets.length,
    persistentTargetIds:persistentTargets,
    strandScores:scores,
    evidenceCount:mastery.length + activity.length,
    engagement:activity.length ? 'active' : 'no_recent_activity',
    skillProfile,
    strongestSkill:skillProfile.strongestSkill,
    developmentSkill:skillProfile.developmentSkill,
    misconceptionPatterns:skillProfile.misconceptions
  };
}

export function compareInterventionEvidence(before = {}, after = {}) {
  const beforeCount = Number(before.evidenceCount ?? 0);
  const afterCount = Number(after.evidenceCount ?? 0);
  if (afterCount <= beforeCount) return 'insufficient_follow_up_evidence';
  const beforeStatus = STATUS_ORDER.indexOf(before.status);
  const afterStatus = STATUS_ORDER.indexOf(after.status);
  const beforeTargets = Number(before.persistentTargetCount ?? 0);
  const afterTargets = Number(after.persistentTargetCount ?? 0);
  const beforeScores = before.strandScores ?? {};
  const afterScores = after.strandScores ?? {};
  const scoreDelta = STRANDS.reduce((sum,strand) => sum + (Number(afterScores[strand] ?? 0) - Number(beforeScores[strand] ?? 0)),0);
  if (afterStatus > beforeStatus || afterTargets <= beforeTargets - 2 || scoreDelta >= 4) return 'improved';
  if (afterTargets < beforeTargets || scoreDelta > 0) return 'partially_improved';
  return 'no_clear_change';
}
