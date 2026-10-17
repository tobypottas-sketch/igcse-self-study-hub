import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVocabularyEvent, trackVocabularyEvent } from '../src/vocabulary/tracking.js';

const redesignedActivities = [
  'meaning_match','which_situation_fits','meaning_in_context','correct_usage','collocation_builder','word_family_switch',
  'question_text_bridge','find_evidence','phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase',
  'same_idea','spot_meaning_change','build_same_idea','rewrite_idea','improve_vocabulary','explain_another_way'
];

test('vocabulary tracking uses shared sanitizer and strips answer text', () => {
  const event = buildVocabularyEvent({
    event_type:'question_attempt', skill:'production', mode:'practice',
    metadata:{ unit_number:1, strand:'production', question_type:'rewrite_phrase', outcome:'correct', answer_text:'secret', typed_answer:'secret' }
  });
  assert.equal(event.app_key, 'vocabulary_paraphrase');
  assert.equal('answer_text' in event.metadata, false);
  assert.equal('typed_answer' in event.metadata, false);
});

test('all 18 redesigned activity IDs survive privacy-safe tracking sanitization', () => {
  for (const questionType of redesignedActivities) {
    const event = buildVocabularyEvent({
      event_type:'question_attempt',
      skill:'paraphrasing',
      mode:'practice',
      metadata:{ question_type:questionType }
    });
    assert.equal(event.metadata.question_type, questionType);
  }
});

test('0511 skill metadata survives sanitization while private text is removed', () => {
  const event = buildVocabularyEvent({
    event_type:'question_attempt',
    skill:'paraphrasing',
    mode:'practice',
    metadata:{
      unit_number:1,
      strand:'paraphrasing',
      question_type:'rewrite_idea',
      skill_family:'idea_paraphrasing',
      evidence_strength:'very_strong',
      support_level:'none',
      practice_focus:'idea_paraphrase',
      answer_text:'PRIVATE ANSWER',
      typed_answer:'PRIVATE ANSWER',
      prompt:'PRIVATE PROMPT'
    }
  });
  assert.deepEqual(event.metadata, {
    unit_number:1,
    strand:'paraphrasing',
    question_type:'rewrite_idea',
    skill_family:'idea_paraphrasing',
    evidence_strength:'very_strong',
    support_level:'none',
    practice_focus:'idea_paraphrase'
  });
});

test('tracking writes only the sanitized event to activity_events', async () => {
  let inserted;
  const client = { from(name) { assert.equal(name,'activity_events'); return { async insert(value) { inserted=value; return { error:null }; } }; } };
  await trackVocabularyEvent(client, { event_type:'app_open', mode:'practice', metadata:{ answer_text:'secret' } });
  assert.equal(inserted.app_key, 'vocabulary_paraphrase');
  assert.deepEqual(inserted.metadata, {});
});
