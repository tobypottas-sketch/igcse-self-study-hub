import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVocabularyEvent, trackVocabularyEvent } from '../src/vocabulary/tracking.js';

test('vocabulary tracking uses shared sanitizer and strips answer text', () => {
  const event = buildVocabularyEvent({
    event_type:'question_attempt', skill:'production', mode:'practice',
    metadata:{ unit_number:1, strand:'production', question_type:'produce_paraphrase', outcome:'correct', answer_text:'secret', typed_answer:'secret' }
  });
  assert.equal(event.app_key, 'vocabulary_paraphrase');
  assert.equal('answer_text' in event.metadata, false);
  assert.equal('typed_answer' in event.metadata, false);
});

test('tracking writes only the sanitized event to activity_events', async () => {
  let inserted;
  const client = { from(name) { assert.equal(name,'activity_events'); return { async insert(value) { inserted=value; return { error:null }; } }; } };
  await trackVocabularyEvent(client, { event_type:'app_open', mode:'practice', metadata:{ answer_text:'secret' } });
  assert.equal(inserted.app_key, 'vocabulary_paraphrase');
  assert.deepEqual(inserted.metadata, {});
});
