export function promoteVocabularyUnit(unit, status = 'live') {
  if (!unit || !['approved','live'].includes(unit.status)) throw new Error('Only approved/live vocabulary units can be promoted.');
  if (status !== 'live') throw new Error('Vocabulary release promotion only supports live status.');
  return {
    ...unit,
    status:'live',
    items:(unit.items ?? []).map(item => ({ ...item, status:'live' })),
    occurrences:(unit.occurrences ?? []).map(occurrence => ({ ...occurrence, status:'live' })),
    contexts:(unit.contexts ?? []).map(context => ({ ...context, status:'live' }))
  };
}
