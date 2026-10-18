import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';

const ideaSets = unit1.activities.filter(activity => activity.contentType === 'idea_set');

test('single-target Unit 1 idea sets name their authoritative primary evidence target', () => {
  assert.ok(ideaSets.length > 0, 'Unit 1 should contain curated idea sets.');
  for (const activity of ideaSets) {
    const linked = activity.activityData?.linkedVocabularyIds ?? [];
    assert.equal(linked.length, 1, `${activity.activityContentId} should remain single-target content`);
    assert.equal(
      activity.activityData?.primaryEvidenceTargetId,
      linked[0],
      `${activity.activityContentId} must credit mastery to its linked vocabulary target`
    );
  }
});
