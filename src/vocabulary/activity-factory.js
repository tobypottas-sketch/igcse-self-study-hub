import { buildActivity as buildLegacyActivity } from './activity-builder.js';
import { buildFoundationalActivity, FOUNDATIONAL_ACTIVITY_TYPES } from './foundational-activity-builder.js';

export function buildActivity(args = {}) {
  return FOUNDATIONAL_ACTIVITY_TYPES.has(args?.activityType)
    ? buildFoundationalActivity(args)
    : buildLegacyActivity(args);
}
