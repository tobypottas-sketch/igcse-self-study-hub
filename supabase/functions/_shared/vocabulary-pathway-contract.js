export const PATHWAY_STAGE_IDS = Object.freeze(['recognise','match','apply','recall','mastery']);

export const PATHWAY_ACTIVITY_MAP = Object.freeze({
  meaning:Object.freeze({
    recognise:Object.freeze(['meaning_match','definition_to_word']),
    match:Object.freeze(['word_definition_match']),
    apply:Object.freeze(['drag_word_definition','drag_definition_word','which_situation_fits']),
    recall:Object.freeze(['type_word_from_definition']),
    mastery:Object.freeze(['meaning_in_context'])
  }),
  context:Object.freeze({
    recognise:Object.freeze(['choose_word_sentence']),
    match:Object.freeze(['context_sentence_match']),
    apply:Object.freeze(['gap_fill_bank','drag_word_sentence']),
    recall:Object.freeze(['type_missing_word']),
    mastery:Object.freeze(['type_missing_word'])
  }),
  word_families:Object.freeze({
    recognise:Object.freeze(['word_family_choice']),
    match:Object.freeze(['word_family_match']),
    apply:Object.freeze(['word_family_choice']),
    recall:Object.freeze(['word_family_switch']),
    mastery:Object.freeze(['word_family_switch'])
  }),
  paraphrasing:Object.freeze({
    recognise:Object.freeze(['phrase_match','same_idea']),
    match:Object.freeze(['phrase_match']),
    apply:Object.freeze(['build_paraphrase','build_same_idea']),
    recall:Object.freeze(['complete_paraphrase']),
    mastery:Object.freeze(['rewrite_phrase','rewrite_idea','explain_another_way'])
  }),
  precision_use:Object.freeze({
    recognise:Object.freeze(['precision_choice']),
    match:Object.freeze(['precision_match']),
    apply:Object.freeze(['improve_vocabulary']),
    recall:Object.freeze(['improve_vocabulary']),
    mastery:Object.freeze(['explain_another_way'])
  }),
  spelling_recall:Object.freeze({
    recognise:Object.freeze(['spelling_choice']),
    match:Object.freeze(['spelling_cue_match']),
    apply:Object.freeze(['spelling_rebuild']),
    recall:Object.freeze(['spell_word']),
    mastery:Object.freeze(['spell_word'])
  })
});

export const PATHWAY_IDS = Object.freeze(Object.keys(PATHWAY_ACTIVITY_MAP));

export function pathwayStageActivities(pathwayId, stageId) {
  const pathway = PATHWAY_ACTIVITY_MAP[String(pathwayId ?? '')];
  const activities = pathway?.[String(stageId ?? '')];
  return Array.isArray(activities) ? [...activities] : [];
}

export function pathwayStageIndex(stageId) {
  return PATHWAY_STAGE_IDS.indexOf(String(stageId ?? ''));
}

export function isPathwayQuestionAllowed(pathwayId, stageId, questionType) {
  return pathwayStageActivities(pathwayId,stageId).includes(String(questionType ?? ''));
}
