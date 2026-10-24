import { pathwayOverride } from '../../content/vocabulary/unit-registry.js';

// A pathway withheld on purpose for one unit lives in the unit registry (content/vocabulary/unit-registry.js).
export function pathwayLivePolicy(unitNumber, pathwayId) {
  return pathwayOverride(unitNumber, pathwayId);
}
