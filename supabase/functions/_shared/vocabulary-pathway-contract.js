export const PATHWAY_STAGE_IDS = Object.freeze(['recognise','match','apply','recall','mastery']);

// STAGE_CONTRACT v2 (Job 8). One activity family per stage, response-mode rank never decreasing, Recall productive,
// Mastery typed transfer with no options or bank. This map is ALSO the Edge Function allow-list.
// Retired from the ladder (not reachable here, so the server refuses them for pathway attempts): drag_word_definition and
// drag_definition_word (Meaning), spelling_cue_match (Spelling), explain_another_way (Paraphrasing), the MCQ meaning_in_context
// as Meaning *Mastery* (it remains the Meaning *Apply* task), and the old Precision single-type ladder.
export const PATHWAY_ACTIVITY_MAP = Object.freeze({
  meaning:Object.freeze({
    recognise:Object.freeze(['definition_to_word','meaning_match']),
    match:Object.freeze(['word_definition_match']),
    apply:Object.freeze(['which_situation_fits','meaning_in_context']),
    recall:Object.freeze(['type_word_from_definition']),
    mastery:Object.freeze(['gloss_in_context_type'])
  }),
  context:Object.freeze({
    recognise:Object.freeze(['choose_word_sentence']),
    match:Object.freeze(['context_sentence_match']),
    apply:Object.freeze(['gap_fill_bank','drag_word_sentence']),
    recall:Object.freeze(['type_missing_word']),
    mastery:Object.freeze(['type_in_passage'])
  }),
  word_families:Object.freeze({
    recognise:Object.freeze(['word_family_identify']),
    match:Object.freeze(['word_family_match']),
    apply:Object.freeze(['word_family_choice']),
    recall:Object.freeze(['word_family_switch']),
    mastery:Object.freeze(['family_multi_form'])
  }),
  paraphrasing:Object.freeze({
    recognise:Object.freeze(['same_idea']),
    match:Object.freeze(['phrase_match']),
    apply:Object.freeze(['build_paraphrase','build_same_idea']),
    recall:Object.freeze(['complete_paraphrase']),
    mastery:Object.freeze(['rewrite_phrase','rewrite_idea'])
  }),
  precision_use:Object.freeze({
    recognise:Object.freeze(['precision_choice']),
    match:Object.freeze(['precision_match']),
    apply:Object.freeze(['improve_vocabulary']),
    recall:Object.freeze(['precision_type_cued']),
    mastery:Object.freeze(['upgrade_passage'])
  }),
  spelling_recall:Object.freeze({
    recognise:Object.freeze(['spelling_choice']),
    match:Object.freeze(['spot_the_error']),
    apply:Object.freeze(['spelling_rebuild']),
    recall:Object.freeze(['spell_word']),
    mastery:Object.freeze(['spell_in_context'])
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
