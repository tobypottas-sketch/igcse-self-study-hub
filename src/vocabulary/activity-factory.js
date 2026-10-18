import { buildActivity as buildLegacyActivity } from './activity-builder.js';
import { buildFoundationalActivity, FOUNDATIONAL_ACTIVITY_TYPES } from './foundational-activity-builder.js';
import { buildPathwayActivity, PATHWAY_ACTIVITY_TYPES } from './pathway-activity-builder.js';
import { buildSpellingChoiceActivity } from './spelling-choice-builder.js';
import { buildSpellInContextActivity } from './spelling-context-builder.js';

const WORD_FAMILY_ACTIVITY_TYPES = new Set(['word_family_choice','word_family_match','word_family_switch']);

function withFreshWordFamilyPrompt(args = {}) {
  if (!WORD_FAMILY_ACTIVITY_TYPES.has(args?.activityType)) return args;
  const activities = Array.isArray(args.unitActivities) ? args.unitActivities : [];
  const used = new Set(Array.isArray(args.usedContentIds) ? args.usedContentIds.map(String) : []);
  const targetId = String(args?.item?.vocabularyId ?? '');
  const isTargetFamilyRecord = activity => activity?.contentType === 'writing_set'
    && activity?.activityData?.taskType === 'word_family'
    && Array.isArray(activity?.activityData?.linkedVocabularyIds)
    && activity.activityData.linkedVocabularyIds.includes(targetId);
  const matching = activities.filter(isTargetFamilyRecord);
  if (!matching.length || matching.every(activity => used.has(String(activity.activityContentId ?? '')))) return args;
  return {
    ...args,
    unitActivities:activities.filter(activity => !isTargetFamilyRecord(activity) || !used.has(String(activity.activityContentId ?? '')))
  };
}

export function buildActivity(args = {}) {
  const prepared = withFreshWordFamilyPrompt(args);
  if (prepared?.activityType === 'spelling_choice') return buildSpellingChoiceActivity(prepared);
  if (prepared?.activityType === 'spell_in_context') return buildSpellInContextActivity(prepared);
  if (PATHWAY_ACTIVITY_TYPES.has(prepared?.activityType)) return buildPathwayActivity(prepared);
  if (FOUNDATIONAL_ACTIVITY_TYPES.has(prepared?.activityType)) return buildFoundationalActivity(prepared);
  return buildLegacyActivity(prepared);
}
