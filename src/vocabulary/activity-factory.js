import { buildActivity as buildLegacyActivity } from './activity-builder.js';
import { buildFoundationalActivity, FOUNDATIONAL_ACTIVITY_TYPES } from './foundational-activity-builder.js';
import { buildPathwayActivity, PATHWAY_ACTIVITY_TYPES } from './pathway-activity-builder.js';
import { buildSpellingChoiceActivity } from './spelling-choice-builder.js';
import { buildSpellInContextActivity } from './spelling-context-builder.js';
import { AnswerLeakError, findAnswerLeak } from './answer-leak-guard.js';

const PRECISION_ACTIVITY_TYPES = new Set(['precision_choice','precision_match','improve_vocabulary']);
const WORD_FAMILY_ACTIVITY_TYPES = new Set(['word_family_choice','word_family_match','word_family_switch']);

function withFreshWritingPrompt(args = {}) {
  const taskType = WORD_FAMILY_ACTIVITY_TYPES.has(args?.activityType) ? 'word_family' : PRECISION_ACTIVITY_TYPES.has(args?.activityType) ? 'improve_vocabulary' : null;
  if (!taskType) return args;
  const activities = Array.isArray(args.unitActivities) ? args.unitActivities : [];
  const used = new Set(Array.isArray(args.usedContentIds) ? args.usedContentIds.map(String) : []);
  const targetId = String(args?.item?.vocabularyId ?? '');
  const isTargetWritingRecord = activity => activity?.contentType === 'writing_set'
    && activity?.activityData?.taskType === taskType
    && Array.isArray(activity?.activityData?.linkedVocabularyIds)
    && activity.activityData.linkedVocabularyIds.includes(targetId);
  const matching = activities.filter(isTargetWritingRecord);
  if (!matching.length || matching.every(activity => used.has(String(activity.activityContentId ?? '')))) return args;
  return {
    ...args,
    unitActivities:activities.filter(activity => !isTargetWritingRecord(activity) || !used.has(String(activity.activityContentId ?? '')))
  };
}

function dispatchActivity(prepared) {
  if (prepared?.activityType === 'spelling_choice') return buildSpellingChoiceActivity(prepared);
  if (prepared?.activityType === 'spell_in_context') return buildSpellInContextActivity(prepared);
  if (PATHWAY_ACTIVITY_TYPES.has(prepared?.activityType)) return buildPathwayActivity(prepared);
  if (FOUNDATIONAL_ACTIVITY_TYPES.has(prepared?.activityType)) return buildFoundationalActivity(prepared);
  return buildLegacyActivity(prepared);
}

const MAX_LEAK_REGENERATIONS = 12;

// Single choke point for every live builder: a typed/free-response question is never served while the
// student-visible text shows an answer the marker would accept. A leaking prompt is regenerated from
// other curated content; when no clean prompt exists the build fails closed (the planner then skips the
// target for that activity instead of serving a self-answering question). Marking is untouched.
export function buildActivity(args = {}) {
  const prepared = withFreshWritingPrompt(args);
  const first = dispatchActivity(prepared);
  const context = { item:prepared.item, occurrence:prepared.occurrence };
  const firstLeak = findAnswerLeak(first,context);
  if (!firstLeak) return first;

  const excluded = [first.contentId].filter(Boolean);
  const sessionUsed = Array.isArray(args.usedContentIds) ? args.usedContentIds : [];
  // First prefer content the session has not used; then allow clean content it has already seen.
  for (const baseUsed of [sessionUsed,[]]) {
    for (let attempt = 1; attempt <= MAX_LEAK_REGENERATIONS; attempt += 1) {
      let candidate;
      try {
        candidate = dispatchActivity(withFreshWritingPrompt({ ...args, seed:`${args.seed}:leak-regen:${attempt}`, usedContentIds:[...baseUsed,...excluded] }));
      } catch { break; }
      if (!findAnswerLeak(candidate,context)) return candidate;
      if (!candidate.contentId || excluded.includes(candidate.contentId)) break;
      excluded.push(candidate.contentId);
    }
  }
  throw new AnswerLeakError(first.type ?? prepared.activityType,firstLeak);
}
