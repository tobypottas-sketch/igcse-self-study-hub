import { PATHWAY_IDS, PATHWAY_STAGE_IDS, isPathwayQuestionAllowed, pathwayStageIndex } from '../_shared/vocabulary-pathway-contract.js';

const ID_RE = /^[a-z0-9_:-]{1,160}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VARIANT_RE = /^q\d{1,3}$/;
const QUESTION_TYPES = new Set([
  'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check',
  'which_situation_fits','meaning_in_context','correct_usage','collocation_builder','word_family_switch',
  'find_evidence','phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','same_idea',
  'spot_meaning_change','build_same_idea','rewrite_idea','improve_vocabulary','explain_another_way',
  'definition_to_word','word_definition_match','drag_word_definition','drag_definition_word',
  'gap_fill_bank','drag_word_sentence','type_missing_word','spell_word','choose_word_sentence','word_family_choice',
  'type_word_from_definition','context_sentence_match','word_family_match','precision_choice','precision_match',
  'spelling_choice','spelling_cue_match','spelling_rebuild','spell_in_context'
]);
const RETIRED_QUESTION_TYPES = new Set(['correct_usage','collocation_builder']);
const STRANDS = new Set(['meaning','recognition','context','paraphrasing','production']);
const MISCONCEPTIONS = new Set([
  'related_but_inaccurate','wrong_form','meaning_confusion','retrieval_failure','context_mismatch',
  'quantity_change','degree_change','time_change','cause_effect_change','contrast_change','added_information',
  'omitted_information','unnatural_collocation','too_vague','register_mismatch'
]);
const EVIDENCE_STRENGTHS = new Set(['light','medium','strong','very_strong']);
const SUPPORT_LEVELS = new Set(['none','light','major']);
const CONTENT_SOURCES = new Set(['context','unit_activity','item']);
const ITEM_QUESTION_TYPES = new Set([
  'definition_to_word','word_definition_match','drag_word_definition','drag_definition_word','spell_word',
  'type_word_from_definition','spelling_choice','spelling_cue_match','spelling_rebuild'
]);
const LANGUAGE_BANK_CONTEXT_QUESTION_TYPES = [
  'gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence','context_sentence_match'
];
const WRITING_TASK_FOR_QUESTION = Object.freeze({
  word_family_switch:'word_family', word_family_choice:'word_family', word_family_match:'word_family',
  improve_vocabulary:'improve_vocabulary', precision_choice:'improve_vocabulary', precision_match:'improve_vocabulary',
  ...Object.fromEntries(LANGUAGE_BANK_CONTEXT_QUESTION_TYPES.map(questionType => [questionType,'language_bank_context']))
});
const UNIT_ACTIVITY_QUESTION_TYPES = Object.freeze({
  phrase_set:new Set(['phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','explain_another_way']),
  idea_set:new Set(['same_idea','spot_meaning_change','build_same_idea','rewrite_idea','explain_another_way']),
  question_text:new Set(['question_text_bridge','find_evidence']),
  writing_set:new Set(['word_family_switch','word_family_choice','word_family_match','improve_vocabulary','precision_choice','precision_match',...LANGUAGE_BANK_CONTEXT_QUESTION_TYPES])
});
const RETRIEVAL_CONTEXT_TYPES = ['gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence','context_sentence_match','spell_in_context','spelling_choice'];
const CONTEXT_QUESTION_TYPES = Object.freeze({
  meaning_context:new Set(['meaning_match','meaning_in_context']),
  paraphrase_context:new Set(['meaning_in_context','which_situation_fits',...RETRIEVAL_CONTEXT_TYPES]),
  production_context:new Set(['which_situation_fits',...RETRIEVAL_CONTEXT_TYPES]),
  // Curated gap-fill sentences are written with the exact target form and store that form as the accepted answer.
  gap_fill:new Set(RETRIEVAL_CONTEXT_TYPES)
});

function id(value,label){const text=String(value??'').trim();if(!ID_RE.test(text))throw new Error(`${label} is invalid.`);return text;}
function optionalUuid(value,label){if(value==null||value==='')return null;const text=String(value).trim();if(!UUID_RE.test(text))throw new Error(`${label} is invalid.`);return text.toLowerCase();}
function optionalId(value,label){if(value==null||value==='')return null;return id(value,label);}
function optionalVariant(value){if(value==null||value==='')return null;const variant=String(value).trim();if(!VARIANT_RE.test(variant))throw new Error('Activity variant ID is invalid.');return variant;}
function validateStrands(value){if(value==null)return[];if(!Array.isArray(value)||value.length===0)throw new Error('Vocabulary strands are invalid.');const strands=[...new Set(value.map(item=>String(item??'').trim()))];if(strands.some(strand=>!STRANDS.has(strand)))throw new Error('Vocabulary strand is invalid.');return strands;}
function optionalPathwayValue(value){if(value==null||value==='')return null;return String(value).trim();}

export function assertPathwayQuestionMatchesStage(pathwayId,stageId,questionType){if(!isPathwayQuestionAllowed(pathwayId,stageId,questionType))throw new Error('Vocabulary question type does not match pathway stage.');return true;}
function validatePathwayCoordinates(value){
  const pathwayId=optionalPathwayValue(value.pathwayId), pathwayStage=optionalPathwayValue(value.pathwayStage), servedPathwayStage=optionalPathwayValue(value.servedPathwayStage);
  const present=[pathwayId,pathwayStage,servedPathwayStage].filter(Boolean).length;
  if(present===0)return{pathwayId:null,pathwayStage:null,servedPathwayStage:null};
  if(present!==3)throw new Error('Pathway metadata is incomplete.');
  if(!PATHWAY_IDS.includes(pathwayId))throw new Error('Vocabulary pathway is invalid.');
  if(!PATHWAY_STAGE_IDS.includes(pathwayStage)||!PATHWAY_STAGE_IDS.includes(servedPathwayStage))throw new Error('Vocabulary pathway stage is invalid.');
  const learnerIndex=pathwayStageIndex(pathwayStage),servedIndex=pathwayStageIndex(servedPathwayStage);
  if(servedIndex!==learnerIndex&&servedIndex!==learnerIndex-1)throw new Error('Served pathway stage is invalid.');
  if(servedIndex===learnerIndex-1&&!(value.retryUsed===true||value.firstAttempt===false||['light','major'].includes(value.supportLevel)))throw new Error('Served pathway stage requires support.');
  assertPathwayQuestionMatchesStage(pathwayId,servedPathwayStage,value.questionType);
  return{pathwayId,pathwayStage,servedPathwayStage};
}

export function validateVocabularyAttempt(value={}){
  const rawAnswer=String(value.rawAnswer??'');if(!rawAnswer.trim()||rawAnswer.length>500)throw new Error('Answer must contain 1–500 characters.');
  if(!QUESTION_TYPES.has(value.questionType))throw new Error('Question type is invalid.');
  if(RETIRED_QUESTION_TYPES.has(value.questionType))throw new Error('Question type is no longer available.');
  const contextId=optionalId(value.contextId,'Context ID'),activityContentId=optionalId(value.activityContentId,'Activity content ID'),activityVariantId=optionalVariant(value.activityVariantId);
  const inferredSource=value.contentSource??(activityContentId?'unit_activity':(contextId?'context':(ITEM_QUESTION_TYPES.has(value.questionType)?'item':'context')));
  if(!CONTENT_SOURCES.has(inferredSource))throw new Error('Content source is invalid.');
  if(inferredSource==='context'&&!contextId)throw new Error('Context ID is required for context content.');
  if(inferredSource==='unit_activity'&&!activityContentId)throw new Error('Activity content ID is required for unit activity content.');
  if(inferredSource==='item'){if(!ITEM_QUESTION_TYPES.has(value.questionType))throw new Error('Question type is invalid for item content.');if(contextId||activityContentId)throw new Error('Item content cannot include context or activity content IDs.');}
  if(activityVariantId&&inferredSource!=='unit_activity')throw new Error('Activity variant ID requires unit activity content.');
  if(value.evidenceStrength!=null&&!EVIDENCE_STRENGTHS.has(value.evidenceStrength))throw new Error('Evidence strength is invalid.');
  if(value.supportLevel!=null&&!SUPPORT_LEVELS.has(value.supportLevel))throw new Error('Support level is invalid.');
  const pathway=validatePathwayCoordinates(value);
  return{attemptId:optionalUuid(value.attemptId,'Attempt ID'),occurrenceId:id(value.occurrenceId,'Occurrence ID'),contextId,activityContentId,activityVariantId,contentSource:inferredSource,primaryEvidenceTargetId:optionalId(value.primaryEvidenceTargetId,'Primary evidence target ID'),questionType:value.questionType,rawAnswer,strands:validateStrands(value.strands),evidenceStrength:value.evidenceStrength??null,supportLevel:value.supportLevel??null,productive:value.productive===true,repeatedGuess:value.repeatedGuess===true,firstAttempt:value.firstAttempt!==false,retryUsed:value.retryUsed===true,recoveredLater:value.recoveredLater===true,review:value.review===true,preview:value.preview===true,...pathway};
}

export function assertUnitActivityQuestionMatchesContentType(contentType,questionType){const allowed=UNIT_ACTIVITY_QUESTION_TYPES[String(contentType??'')];if(!allowed?.has(String(questionType??'')))throw new Error('Vocabulary unit activity content type does not match question type.');return true;}
export function assertContextQuestionMatchesContextType(contextType,questionType){const allowed=CONTEXT_QUESTION_TYPES[String(contextType??'')];if(!allowed?.has(String(questionType??'')))throw new Error('Vocabulary context type does not match question type.');return true;}
export function assertWritingTaskMatchesQuestionType(taskType,questionType){const expected=WRITING_TASK_FOR_QUESTION[String(questionType??'')];if(!expected||String(taskType??'')!==expected)throw new Error('Writing activity does not match question type.');return true;}
export function strandForQuestionType(questionType){
  if(['produce_paraphrase','use_target','replace_phrase','rewrite_phrase','rewrite_idea','explain_another_way','collocation_builder'].includes(questionType))return'production';
  if(['build_paraphrase','complete_paraphrase','build_same_idea','same_idea','spot_meaning_change','phrase_match'].includes(questionType))return'paraphrasing';
  if(['context_inference','question_text_bridge','context_gap_fill','mini_mixed_check','find_evidence','meaning_in_context','correct_usage','which_situation_fits','word_family_switch','word_family_choice','word_family_match','improve_vocabulary','precision_choice','precision_match','gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence','context_sentence_match'].includes(questionType))return'context';
  if(questionType==='paraphrase_match')return'paraphrasing';
  if(['meaning_match','definition_to_word','word_definition_match','drag_word_definition','drag_definition_word','type_word_from_definition'].includes(questionType))return'meaning';
  return'recognition';
}

// The ONLY place the evidence support level is decided. `input` must be the output of validateVocabularyAttempt,
// so a lower served stage has already been proven legitimate (it was declared AND the pathway allows it).
//   - repeated guess                          -> major
//   - same-question retry / not first attempt -> light (major only if declared major)
//   - validated lower-stage support question  -> light (major only if declared major)
//   - everything else, including an ordinary same-stage question that merely claims support -> none
export function authoritativeSupportLevel(input={}){
  if(input.repeatedGuess)return'major';
  const declaredMajor=input.supportLevel==='major';
  if(input.retryUsed||input.firstAttempt===false)return declaredMajor?'major':'light';
  const lowerStageServed=Boolean(input.pathwayId&&input.pathwayStage&&input.servedPathwayStage&&input.servedPathwayStage!==input.pathwayStage);
  if(lowerStageServed)return declaredMajor?'major':'light';
  return'none';
}

export function buildStoredAttemptMetadata(value={}){
  const strand=STRANDS.has(value.strand)?value.strand:strandForQuestionType(value.questionType);
  const output={unit_number:Number(value.unitNumber),strand,question_type:value.questionType,attempt_number:value.firstAttempt===false?2:1,outcome:value.correct?'correct':'try_again',retry_used:value.retryUsed===true,recovery:value.recoveredLater===true,target_id:id(value.vocabularyId,'Vocabulary ID'),occurrence_id:id(value.occurrenceId,'Occurrence ID')};
  if(value.pathwayId&&value.pathwayStage&&value.servedPathwayStage){output.pathway_id=String(value.pathwayId);output.pathway_stage=String(value.pathwayStage);output.served_pathway_stage=String(value.servedPathwayStage);}
  if(MISCONCEPTIONS.has(value.misconceptionCategory))output.misconception=value.misconceptionCategory;
  if(EVIDENCE_STRENGTHS.has(value.evidenceStrength))output.evidence_strength=value.evidenceStrength;
  if(SUPPORT_LEVELS.has(value.supportLevel))output.support_level=value.supportLevel;
  return output;
}
