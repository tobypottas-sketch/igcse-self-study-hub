import { buildTrackingEvent } from '../tracking/core.js';

export function buildVocabularyEvent(input = {}) {
  return buildTrackingEvent({ app_key:'vocabulary_paraphrase', ...input });
}

export async function trackVocabularyEvent(client, input = {}) {
  const event = buildVocabularyEvent(input);
  const { error } = await client.from('activity_events').insert(event);
  if (error) throw new Error('Unable to record vocabulary activity.');
  return event;
}
