const STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });

export const PRACTICE_MODES = Object.freeze([
  { id:'learn', label:'Learn the Vocabulary', description:'Build core meaning, usage, collocation and word-family control.' },
  { id:'context', label:'Understand in Context', description:'Work out precise meaning and usage from realistic sentences and short texts.' },
  { id:'question_text', label:'Question ↔ Text', description:'Connect differently worded questions with equivalent source-text evidence.' },
  { id:'phrase_paraphrase', label:'Phrase Paraphrasing', description:'Recognise, build and produce accurate equivalent phrases.' },
  { id:'idea_paraphrase', label:'Idea Paraphrasing', description:'Preserve the whole meaning while transforming clauses and sentences.' },
  { id:'writing', label:'Writing Vocabulary', description:'Improve lexical range, precision, form, collocation and register.' },
  { id:'adaptive', label:'Adaptive 0511 Mix', description:'Mix the most useful next operations according to readiness and evidence.' }
]);

export const ACTIVITY_TYPES = Object.freeze([
  { id:'meaning_match', label:'Meaning Match', practiceModes:['learn'], responseMode:'choice', minimumStage:'new', strands:['meaning'], evidenceStrength:'light', productive:false, skillFamily:'meaning' },
  { id:'which_situation_fits', label:'Which Situation Fits?', practiceModes:['learn','context'], responseMode:'choice', minimumStage:'new', strands:['meaning','context'], evidenceStrength:'medium', productive:false, skillFamily:'meaning' },
  { id:'meaning_in_context', label:'Meaning in Context', practiceModes:['context','learn'], responseMode:'choice', minimumStage:'building', strands:['context','meaning'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  { id:'correct_usage', label:'Correct Usage', practiceModes:['learn','context','writing'], responseMode:'choice', minimumStage:'building', strands:['context','recognition'], evidenceStrength:'medium', productive:false, skillFamily:'context' },
  // Retired from live use: legacy tile task only shuffles collocations[0] (every tile is part of the answer, no curated
  // distractors). Kept so historical attempts still resolve; rebuild as curated collocation_set before re-enabling.
  { id:'collocation_builder', label:'Collocation Builder', practiceModes:['learn','writing'], responseMode:'tiles', minimumStage:'building', strands:['recognition','production'], evidenceStrength:'strong', productive:true, skillFamily:'writing_vocabulary', retired:true },
  { id:'word_family_switch', label:'Word Family Switch', practiceModes:['learn','writing'], responseMode:'text', minimumStage:'building', strands:['production'], evidenceStrength:'strong', productive:true, skillFamily:'writing_vocabulary' },
  { id:'question_text_bridge', label:'Question ↔ Text Bridge', practiceModes:['question_text','context'], responseMode:'choice', minimumStage:'building', strands:['context','paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'question_text' },
  { id:'find_evidence', label:'Find the Evidence', practiceModes:['question_text','context'], responseMode:'evidence', minimumStage:'building', strands:['context'], evidenceStrength:'medium', productive:false, skillFamily:'question_text' },
  { id:'phrase_match', label:'Phrase Match', practiceModes:['phrase_paraphrase','learn'], responseMode:'choice', minimumStage:'new', strands:['paraphrasing'], evidenceStrength:'light', productive:false, skillFamily:'phrase_paraphrasing' },
  { id:'build_paraphrase', label:'Build the Paraphrase', practiceModes:['phrase_paraphrase'], responseMode:'tiles', minimumStage:'building', strands:['paraphrasing'], evidenceStrength:'strong', productive:true, skillFamily:'phrase_paraphrasing' },
  { id:'complete_paraphrase', label:'Complete the Paraphrase', practiceModes:['phrase_paraphrase'], responseMode:'text', minimumStage:'building', strands:['paraphrasing','production'], evidenceStrength:'strong', productive:true, skillFamily:'phrase_paraphrasing' },
  { id:'rewrite_phrase', label:'Rewrite the Phrase', practiceModes:['phrase_paraphrase'], responseMode:'text', minimumStage:'secure', strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true, skillFamily:'phrase_paraphrasing' },
  { id:'same_idea', label:'Same Idea', practiceModes:['idea_paraphrase'], responseMode:'choice', minimumStage:'building', strands:['paraphrasing'], evidenceStrength:'medium', productive:false, skillFamily:'idea_paraphrasing' },
  { id:'spot_meaning_change', label:'Spot the Meaning Change', practiceModes:['idea_paraphrase','question_text'], responseMode:'choice', minimumStage:'building', strands:['paraphrasing','context'], evidenceStrength:'strong', productive:false, skillFamily:'idea_paraphrasing' },
  { id:'build_same_idea', label:'Build the Same Idea', practiceModes:['idea_paraphrase'], responseMode:'tiles', minimumStage:'secure', strands:['paraphrasing','production'], evidenceStrength:'strong', productive:true, skillFamily:'idea_paraphrasing' },
  { id:'rewrite_idea', label:'Rewrite the Idea', practiceModes:['idea_paraphrase'], responseMode:'text', minimumStage:'secure', strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true, skillFamily:'idea_paraphrasing' },
  { id:'improve_vocabulary', label:'Improve the Vocabulary', practiceModes:['writing'], responseMode:'text', minimumStage:'secure', strands:['production'], evidenceStrength:'very_strong', productive:true, skillFamily:'writing_vocabulary' },
  { id:'explain_another_way', label:'Explain It Another Way', practiceModes:['writing','idea_paraphrase'], responseMode:'text', minimumStage:'mastered', strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true, skillFamily:'communication_repair' }
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

export function activitiesForStage(stage) {
  const threshold = STAGE_ORDER[String(stage ?? '')];
  if (threshold == null) return [];
  return ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id) && STAGE_ORDER[activity.minimumStage] <= threshold);
}