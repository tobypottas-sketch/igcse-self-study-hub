import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { ACTIVITY_TYPES, activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { markCuratedAnswer, spotMeaningChangeMarking } from '../supabase/functions/_shared/vocabulary-engine.js';

const LIVE_TYPES = ACTIVITY_TYPES.filter(row => row.retired !== true).map(row => row.id);
const SENTENCE_CONTEXT_TYPES = new Set(['which_situation_fits','correct_usage']);

function masteryFor(type) {
  const stage = activityDefinition(type).minimumStage;
  const value = stage === 'new' ? 0 : stage === 'building' ? 2 : 8;
  return {
    status:stage,
    strandEvidence:{ meaning:value, recognition:value, context:value, paraphrasing:value, production:value },
    recentErrorCount:0,
    successfulProductions:stage === 'mastered' ? 2 : 0,
    productionContextIds:stage === 'mastered' ? ['ctx-a','ctx-b'] : [],
    productionActivityTypes:stage === 'mastered' ? ['rewrite_phrase','rewrite_idea'] : [],
    unscaffoldedProductions:stage === 'mastered' ? 1 : 0,
    reviewStage:0,
    reviewFailureCount:0
  };
}

function strings(value) {
  return Array.isArray(value) ? value.map(v => String(v ?? '').trim()).filter(Boolean) : [];
}

function authoritativeMarking(question) {
  const context = unit1.contexts.find(row => row.contextId === question.contentId);
  if (context) {
    return {
      contextId:context.contextId,
      activityContentId:null,
      acceptedAnswers:SENTENCE_CONTEXT_TYPES.has(question.type) ? [String(context.text ?? '').trim()].filter(Boolean) : strings(context.acceptedAnswers),
      distractors:[]
    };
  }

  const activity = unit1.activities.find(row => row.activityContentId === question.contentId);
  assert.ok(activity, `${question.type}: authoritative content not found for ${question.contentId}`);
  const data = activity.activityData ?? {};

  if (activity.contentType === 'phrase_set') {
    if (question.type === 'complete_paraphrase') {
      const chunks = strings(data.chunks);
      return {
        contextId:activity.activityContentId,
        activityContentId:activity.activityContentId,
        acceptedAnswers:chunks.length ? [chunks.at(-1)] : [String(data.equivalentPhrase ?? '')],
        distractors:[]
      };
    }
    return {
      contextId:activity.activityContentId,
      activityContentId:activity.activityContentId,
      acceptedAnswers:[String(data.equivalentPhrase ?? ''), ...strings(data.acceptedVariants)].filter(Boolean),
      distractors:strings(data.commonMeaningDistortions).map(text => ({ text, misconceptionCategory:'meaning_confusion' }))
    };
  }

  if (activity.contentType === 'idea_set') {
    if (question.type === 'spot_meaning_change') {
      const marking = spotMeaningChangeMarking(data, question.activityVariantId);
      return { contextId:activity.activityContentId, activityContentId:activity.activityContentId, ...marking };
    }
    return {
      contextId:activity.activityContentId,
      activityContentId:activity.activityContentId,
      acceptedAnswers:strings(data.accurateParaphrases),
      distractors:Array.isArray(data.distractors) ? data.distractors : []
    };
  }

  if (activity.contentType === 'question_text') {
    const index = Number(String(question.activityVariantId ?? '').slice(1));
    const selected = data.questions?.[index];
    assert.ok(selected, `${question.type}: authoritative question-text variant missing`);
    return {
      contextId:activity.activityContentId,
      activityContentId:activity.activityContentId,
      acceptedAnswers:question.type === 'question_text_bridge' ? [String(selected.question ?? '').trim()] : strings(selected.evidenceSpans),
      distractors:[]
    };
  }

  if (activity.contentType === 'writing_set') {
    return {
      contextId:activity.activityContentId,
      activityContentId:activity.activityContentId,
      acceptedAnswers:strings(data.acceptedAnswers),
      distractors:[]
    };
  }

  throw new Error(`${question.type}: unsupported authoritative content type ${activity.contentType}`);
}

function clientMarking(question) {
  const reference = question.markingReference ?? {};
  return {
    contextId:question.contentId,
    activityContentId:unit1.activities.some(row => row.activityContentId === question.contentId) ? question.contentId : null,
    acceptedAnswers:strings(reference.acceptedAnswers),
    distractors:Array.isArray(reference.distractors) ? reference.distractors : []
  };
}

function candidateAnswers(question, authoritative) {
  const candidates = new Set([
    ...strings(question.options),
    ...strings(question.evidenceOptions),
    ...strings(question.markingReference?.acceptedAnswers),
    ...strings(authoritative.acceptedAnswers),
    ...(authoritative.distractors ?? []).map(row => String(row?.text ?? '').trim()).filter(Boolean),
    '__definitely_not_a_curated_answer__'
  ]);
  if (Array.isArray(question.tiles) && question.tiles.length > 1) candidates.add([...question.tiles].reverse().join(' '));
  return [...candidates];
}

function buildOne(type) {
  const mastery = masteryFor(type);
  for (const occurrence of unit1.occurrences) {
    const item = unit1.items.find(row => row.vocabularyId === occurrence.vocabularyId);
    const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId);
    if (!item) continue;
    for (let seedIndex = 0; seedIndex < 6; seedIndex += 1) {
      try {
        return {
          occurrence,
          item,
          question:buildActivity({
            activityType:type,
            occurrence,
            item,
            contexts,
            unitActivities:unit1.activities,
            unitItems:unit1.items,
            unitContexts:unit1.contexts,
            unitOccurrences:unit1.occurrences,
            mastery,
            seed:`marking-parity:${type}:${occurrence.occurrenceId}:${seedIndex}`
          })
        };
      } catch {
        // Try another real Unit 1 target/seed; some activities are intentionally target-specific.
      }
    }
  }
  return null;
}

test('every live Unit 1 activity has identical browser/server marking for curated and forged answers', () => {
  const covered = new Set();

  for (const type of LIVE_TYPES) {
    const built = buildOne(type);
    assert.ok(built, `${type}: no real Unit 1 target could build this live activity`);
    const { occurrence, item, question } = built;
    const sense = item.senses?.find(row => row.senseId === occurrence.senseId);
    assert.ok(sense, `${type}: sense missing`);

    const client = clientMarking(question);
    const authoritative = authoritativeMarking(question);
    for (const rawAnswer of candidateAnswers(question, authoritative)) {
      const browserResult = markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:client, questionType:type, rawAnswer });
      const serverResult = markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:authoritative, questionType:type, rawAnswer });
      assert.equal(browserResult.correct, serverResult.correct, `${type}: correctness diverged for ${JSON.stringify(rawAnswer)}`);
      assert.equal(browserResult.misconceptionCategory, serverResult.misconceptionCategory, `${type}: diagnosis diverged for ${JSON.stringify(rawAnswer)}`);
    }
    covered.add(type);
  }

  assert.deepEqual([...covered].sort(), [...LIVE_TYPES].sort());
});
