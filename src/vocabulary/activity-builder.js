  build_same_idea:buildSameIdea, rewrite_idea:rewriteIdea, improve_vocabulary:writingActivity,
  explain_another_way:explainAnotherWay
});

export function buildActivity({ activityType, occurrence, item, contexts = [], unitActivities = [], unitItems = [], unitContexts = [], unitOccurrences = [], mastery = {}, readinessStage = null, usedContentIds = [], seed = '' } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition(activityType);
  if (!definition) throw new Error('Invalid 0511 vocabulary activity type.');
  if (!isActivityLive(definition.id)) throw new Error(`${definition.label} is temporarily unavailable.`);
  assertReady(definition, mastery, readinessStage);
  const builder = BUILDERS[definition.id];
  if (!builder) throw new Error(`No builder exists for ${definition.id}.`);
  return builder({ activityType, occurrence, item, contexts, unitActivities, unitItems, unitContexts, unitOccurrences, mastery, usedContentIds, seed }, definition);
}
