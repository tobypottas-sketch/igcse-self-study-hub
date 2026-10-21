const STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });
const LEARNING_STAGE_ORDER = Object.freeze({ emerging:0, building:1, developing:2, secure:3, mastered:4 });

export const ACTIVITY_FAMILIES = Object.freeze(['recognition','retrieval','discrimination','manipulation','production']);

export const PRACTICE_MODES = Object.freeze([
  { id:'learn', label:'Learn the Vocabulary', description:'Build core meaning, context, paraphrase recognition and word-family control.' },
  { id:'context', label:'Understand in Context', description:'Work out precise meaning and usage from realistic sentences and short texts.' },
  { id:'question_text', label:'Question ↔ Text', description:'Connect differently worded questions with equivalent source-text evidence.' },
  { id:'phrase_paraphrase', label:'Phrase Paraphrasing', description:'Recognise, build and produce accurate equivalent phrases.' },
  { id:'idea_paraphrase', label:'Idea Paraphrasing', description:'Preserve the whole meaning while transforming clauses and sentences.' },
  { id:'writing', label:'Writing Vocabulary', description:'Strengthen lexical range, precision, word form and flexible expression.' },
  { id:'adaptive', label:'Adaptive 0511 Mix', description:'Mix the most useful next operations according to readiness and evidence.' }
]);

export const ACTIVITY_TYPES = Object.freeze([
  { id:'meaning_match', label:'Meaning Match', practiceModes:['learn'], responseMode:'choice', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['meaning'], evidenceStrength:'light', productive:false, skillFamily:'meaning' },
  { id:'definition_to_word', label:'Definition → Word', practiceModes:['learn'], responseMode:'choice', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['meaning','recognition'], evidenceStrength:'light', productive:false, skillFamily:'meaning' },
  { id:'word_definition_match', label:'Word ↔ Definition Match', practiceModes:['learn'], responseMode:'matching', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['meaning','recognition'], evidenceStrength:'light', productive:false, skillFamily:'meaning' },
  { id:'drag_word_definition', label:'Situation → Meaning', practiceModes:['learn'], responseMode:'choice', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['meaning','recognition'], evidenceStrength:'light', productive:false, skillFamily:'meaning' },
  { id:'drag_definition_word', label:'Situation → Word', practiceModes:['learn'], responseMode:'choice', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['meaning','recognition'], evidenceStrength:'light', productive:false, skillFamily:'meaning' },
  { id:'which_situation_fits', label:'Which Situation Fits?', practiceModes:['learn','context'], responseMode:'choice', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['meaning','context'], evidenceStrength:'medium', productive:false, skillFamily:'meaning' },
  { id:'type_word_from_definition', label:'Recall the Word', practiceModes:['learn'], responseMode:'text', minimumStage:'new', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['meaning','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'meaning' },

  { id:'gap_fill_bank', label:'Gap Fill — Word Bank', practiceModes:['learn','context'], responseMode:'choice', minimumStage:'building', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'drag_word_sentence', label:'Drag Word into Sentence', practiceModes:['learn','context'], responseMode:'drag_gap', minimumStage:'building', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'type_missing_word', label:'Type the Missing Word', practiceModes:['learn','context'], responseMode:'text', minimumStage:'building', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'spell_word', label:'Spell the Word', practiceModes:['learn'], responseMode:'spelling', minimumStage:'building', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['recognition','meaning'], evidenceStrength:'medium', productive:false, skillFamily:'spelling_recall' },
  { id:'spell_in_context', label:'Spell in Context', practiceModes:['learn'], responseMode:'spelling', minimumStage:'mastered', family:'retrieval', earliestStage:'mastered', preferredStages:['mastered'], supportSuitable:false, reviewSuitable:true, strands:['recognition','context'], evidenceStrength:'strong', productive:false, skillFamily:'spelling_recall' },
  { id:'choose_word_sentence', label:'Choose the Word for the Sentence', practiceModes:['learn','context'], responseMode:'choice', minimumStage:'building', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'context_sentence_match', label:'Sentence ↔ Word Match', practiceModes:['learn','context'], responseMode:'matching', minimumStage:'new', family:'discrimination', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'word_family_choice', label:'Word Family Choice', practiceModes:['learn','writing'], responseMode:'choice', minimumStage:'building', family:'retrieval', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'writing_vocabulary' },
  { id:'word_family_match', label:'Word Family Match', practiceModes:['learn','writing'], responseMode:'matching', minimumStage:'new', family:'discrimination', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'writing_vocabulary' },

  { id:'spelling_choice', label:'Choose the Correct Spelling', practiceModes:['learn'], responseMode:'choice', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['recognition'], evidenceStrength:'light', productive:false, skillFamily:'spelling_recall' },
  { id:'spelling_cue_match', label:'Spelling Cue Match', practiceModes:['learn'], responseMode:'matching', minimumStage:'new', family:'recognition', earliestStage:'emerging', preferredStages:['emerging','building'], supportSuitable:true, reviewSuitable:true, strands:['recognition','meaning'], evidenceStrength:'light', productive:false, skillFamily:'spelling_recall' },
  { id:'spelling_rebuild', label:'Rebuild the Spelling', practiceModes:['learn'], responseMode:'tiles', minimumStage:'new', family:'manipulation', earliestStage:'building', preferredStages:['building','developing'], supportSuitable:true, reviewSuitable:true, strands:['recognition'], evidenceStrength:'medium', productive:false, skillFamily:'spelling_recall' },
  { id:'precision_choice', label:'Choose the Precise Word', practiceModes:['writing'], responseMode:'choice', minimumStage:'new', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'writing_vocabulary' },
  { id:'precision_match', label:'Precision Match', practiceModes:['writing'], responseMode:'matching', minimumStage:'new', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'writing_vocabulary' },

  { id:'meaning_in_context', label:'Meaning in Context', practiceModes:['context','learn'], responseMode:'choice', minimumStage:'building', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['context','meaning'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'correct_usage', label:'Correct Usage', practiceModes:['learn','context','writing'], responseMode:'choice', minimumStage:'building', family:'discrimination', earliestStage:'developing', preferredStages:['developing'], supportSuitable:true, reviewSuitable:false, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context', retired:true },
  { id:'collocation_builder', label:'Collocation Builder', practiceModes:['learn','writing'], responseMode:'tiles', minimumStage:'building', family:'manipulation', earliestStage:'secure', preferredStages:['secure'], supportSuitable:false, reviewSuitable:false, strands:['recognition','production'], evidenceStrength:'strong', productive:true, skillFamily:'writing_vocabulary', retired:true },
  { id:'word_family_switch', label:'Word Family Switch', practiceModes:['learn','writing'], responseMode:'text', minimumStage:'building', family:'manipulation', earliestStage:'secure', preferredStages:['secure','mastered'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'writing_vocabulary' },
  { id:'question_text_bridge', label:'Question ↔ Text Bridge', practiceModes:['question_text','context'], responseMode:'choice', minimumStage:'building', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['context','paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'question_text' },
  { id:'find_evidence', label:'Find the Evidence', practiceModes:['question_text','context'], responseMode:'evidence', minimumStage:'building', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['context'], evidenceStrength:'medium', productive:false, skillFamily:'question_text' },
  { id:'phrase_match', label:'Phrase Match', practiceModes:['phrase_paraphrase','learn'], responseMode:'choice', minimumStage:'new', family:'discrimination', earliestStage:'developing', preferredStages:['developing'], supportSuitable:true, reviewSuitable:true, strands:['paraphrasing'], evidenceStrength:'light', productive:false, skillFamily:'phrase_paraphrasing' },
  { id:'build_paraphrase', label:'Build the Paraphrase', practiceModes:['phrase_paraphrase'], responseMode:'tiles', minimumStage:'building', family:'manipulation', earliestStage:'secure', preferredStages:['secure'], supportSuitable:true, reviewSuitable:true, strands:['paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'phrase_paraphrasing' },
  { id:'complete_paraphrase', label:'Complete the Paraphrase', practiceModes:['phrase_paraphrase'], responseMode:'text', minimumStage:'building', family:'manipulation', earliestStage:'secure', preferredStages:['secure'], supportSuitable:true, reviewSuitable:true, strands:['paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'phrase_paraphrasing' },
  { id:'rewrite_phrase', label:'Rewrite the Phrase', practiceModes:['phrase_paraphrase'], responseMode:'text', minimumStage:'secure', family:'production', earliestStage:'secure', preferredStages:['secure','mastered'], supportSuitable:false, reviewSuitable:true, strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true, skillFamily:'phrase_paraphrasing' },
  { id:'same_idea', label:'Same Idea', practiceModes:['idea_paraphrase'], responseMode:'choice', minimumStage:'building', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'idea_paraphrasing' },
  { id:'spot_meaning_change', label:'Spot the Meaning Change', practiceModes:['idea_paraphrase','question_text'], responseMode:'choice', minimumStage:'building', family:'discrimination', earliestStage:'developing', preferredStages:['developing','secure'], supportSuitable:true, reviewSuitable:true, strands:['paraphrasing','context'], evidenceStrength:'medium', productive:false, skillFamily:'idea_paraphrasing' },
  { id:'build_same_idea', label:'Build the Same Idea', practiceModes:['idea_paraphrase'], responseMode:'tiles', minimumStage:'secure', family:'manipulation', earliestStage:'secure', preferredStages:['secure'], supportSuitable:true, reviewSuitable:true, strands:['paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'idea_paraphrasing' },
  { id:'rewrite_idea', label:'Rewrite the Idea', practiceModes:['idea_paraphrase'], responseMode:'text', minimumStage:'secure', family:'production', earliestStage:'secure', preferredStages:['secure','mastered'], supportSuitable:false, reviewSuitable:true, strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true, skillFamily:'idea_paraphrasing' },
  { id:'improve_vocabulary', label:'Improve the Vocabulary', practiceModes:['writing'], responseMode:'text', minimumStage:'secure', family:'manipulation', earliestStage:'secure', preferredStages:['secure','mastered'], supportSuitable:true, reviewSuitable:true, strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'writing_vocabulary' },
  { id:'explain_another_way', label:'Explain It Another Way', practiceModes:['writing','idea_paraphrase'], responseMode:'text', minimumStage:'mastered', family:'production', earliestStage:'mastered', preferredStages:['mastered'], supportSuitable:false, reviewSuitable:true, strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true, skillFamily:'communication_repair' }
]);

const ACTIVITY_BY_ID = new Map(ACTIVITY_TYPES.map(activity => [activity.id, activity]));

export function activityDefinition(id) {
  return ACTIVITY_BY_ID.get(String(id ?? '')) ?? null;
}

export function isActivityLive(id) {
  const definition = ACTIVITY_BY_ID.get(String(id ?? ''));
  return Boolean(definition) && definition.retired !== true;
}

export function activitiesForMode(modeId) {
  const mode = String(modeId ?? '');
  if (!PRACTICE_MODES.some(candidate => candidate.id === mode)) return [];
  if (mode === 'adaptive') return ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id));
  return ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && activity.practiceModes.includes(mode));
}

export function activitiesForFamily(familyId) {
  const family = String(familyId ?? '');
  if (!ACTIVITY_FAMILIES.includes(family)) return [];
  return ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && activity.family === family);
}

export function activitiesForLearningStage(stageId) {
  const threshold = LEARNING_STAGE_ORDER[String(stageId ?? '')];
  if (threshold == null) return [];
  return ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && LEARNING_STAGE_ORDER[activity.earliestStage] <= threshold);
}

export function activitiesForStage(stage) {
  const threshold = STAGE_ORDER[String(stage ?? '')];
  if (threshold == null) return [];
  return ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && STAGE_ORDER[activity.minimumStage] <= threshold);
}
