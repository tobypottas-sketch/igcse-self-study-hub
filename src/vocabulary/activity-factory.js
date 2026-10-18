import { buildActivity as buildLegacyActivity } from './activity-builder.js';
import { buildFoundationalActivity, FOUNDATIONAL_ACTIVITY_TYPES } from './foundational-activity-builder.js';
import { buildPathwayActivity, PATHWAY_ACTIVITY_TYPES } from './pathway-activity-builder.js';
import { buildSpellingChoiceActivity } from './spelling-choice-builder.js';

export function buildActivity(args = {}) {
  if (args?.activityType === 'spelling_choice') return buildSpellingChoiceActivity(args);
  if (PATHWAY_ACTIVITY_TYPES.has(args?.activityType)) return buildPathwayActivity(args);
  if (FOUNDATIONAL_ACTIVITY_TYPES.has(args?.activityType)) return buildFoundationalActivity(args);
  return buildLegacyActivity(args);
}
