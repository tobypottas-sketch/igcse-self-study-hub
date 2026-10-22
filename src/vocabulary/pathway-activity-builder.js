import { shuffleAnswerOptions } from './answer-option-shuffle.js';
import { unsolvedTileOrder } from './tile-order.js';
import { activityDefinition, isActivityLive } from './activity-catalogue.js';
import { grammaticalBlankCandidates, blankDistractors } from './foundational-activity-builder.js';
import { languageBankContextForItem, languageBankForItem } from './language-bank.js';
import { pickSpellingErrors } from './spelling-errors.js';

export const PATHWAY_ACTIVITY_TYPES = Object.freeze(new Set([
  'type_word_from_definition','context_sentence_match','word_family_match',
  'precision_choice','precision_match','spelling_choice','spelling_cue_match','spelling_rebuild','spell_in_context'
]));

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function uniqueText(values) {
  const seen = new Set(); const output = [];
  for (const value of values) {
    const candidate = text(typeof value === 'object' ? value?.text ?? value?.value ?? value?.answer : value);
    const key = candidate.toLocaleLowerCase('en');
    if (!candidate || seen.has(key)) continue;
    seen.add(key); output.push(candidate);
  }
  return output;
}
function hashSeed(seed) { let hash=2166136261; for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash=Math.imul(hash,16777619)>>>0; } return hash>>>0; }
function shuffle(values, seed) {
  const output=[...values]; let state=hashSeed(seed)||1;
  for (let i=output.length-1;i>0;i-=1) { state=(Math.imul(state,1664525)+1013904223)>>>0; const j=state%(i+1); [output[i],output[j]]=[output[j],output[i]]; }
  return output;
}
function senseFor(item, occurrence={}) { return array(item?.senses).find(s=>s?.senseId===occurrence?.senseId) ?? array(item?.senses)[0] ?? {}; }
function definitionFor(item, occurrence={}) { const sense=senseFor(item,occurrence); return text(sense.meaning)||text(item?.coreMeaning)||text(array(sense.acceptedParaphrases)[0]); }
function itemContentId(args) { return `item:${args.item.vocabularyId}:${args.occurrence?.senseId ?? senseFor(args.item,args.occurrence)?.senseId ?? 'sense'}`; }
function base({ definition, occurrence, contentId, contentSource, prompt, markingReference, extra={} }) {
  return {
    activityId:`${occurrence?.occurrenceId ?? 'unit'}:${contentId}:${definition.id}`,
    type:definition.id,responseMode:definition.responseMode,skillFamily:definition.skillFamily,family:definition.family,
    strands:[...definition.strands],evidenceStrength:definition.evidenceStrength,productive:definition.productive,
    vocabularyId:occurrence?.vocabularyId ?? null,occurrenceId:occurrence?.occurrenceId ?? null,
    contentId,contentSource,prompt,markingReference,...extra
  };
}
function samePosTerms(args, count=3) {
  const pos=text(args.item?.partOfSpeech).toLocaleLowerCase('en');
  const values=uniqueText(array(args.unitItems).filter(candidate=>candidate?.vocabularyId!==args.item?.vocabularyId && text(candidate?.partOfSpeech).toLocaleLowerCase('en')===pos).map(candidate=>candidate?.term));
  if (values.length<count) throw new Error(`Activity requires ${count} plausible same-part-of-speech alternatives.`);
  return shuffle(values,`${args.seed}:same-pos`).slice(0,count);
}
function typeWordFromDefinition(args, definition) {
  const meaning=definitionFor(args.item,args.occurrence), term=text(args.item?.term);
  if (!meaning||!term) throw new Error('Meaning Recall requires a curated definition and target word.');
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Type the word that means “${meaning}”.`,markingReference:{acceptedAnswers:[term]},extra:{primaryEvidenceTargetId:args.item.vocabularyId}});
}
function blankableContext(args) {
  const used=new Set(array(args.usedContentIds).map(String));
  const candidates=grammaticalBlankCandidates({ item:args.item, occurrence:args.occurrence, contexts:args.contexts })
    .filter(candidate=>candidate.formKey || candidate.surface.toLocaleLowerCase('en')===text(args.item?.term).toLocaleLowerCase('en'));
  if (!candidates.length) throw new Error('No curated context is available for this pathway activity.');
  const unused=candidates.filter(candidate=>!used.has(String(candidate.context.contextId)));
  return shuffle(unused.length?unused:candidates,`${args.seed}:context`)[0];
}
function contextSentenceMatch(args, definition) {
  let bankContext=languageBankContextForItem(args.item,args.usedContentIds,args.seed,args.unitActivities ?? []);
  let legacyContext=null;
  if (bankContext && array(args.usedContentIds).includes(`language-bank:${bankContext.id}`)) {
    try {
      const candidate=blankableContext(args);
      if (!array(args.usedContentIds).includes(candidate.context.contextId)) { legacyContext=candidate; bankContext=null; }
    } catch { /* A published bank prompt remains eligible if no legacy cue can be built. */ }
  }
  if (bankContext) {
    const accepted=text(bankContext.answer);
    const wrong=array(bankContext.distractors).map(row=>text(row?.text)).filter(Boolean);
    if (!accepted||wrong.length!==3||!text(bankContext.text).includes('____')) throw new Error('Language-bank Context Match record is incomplete.');
    const options=shuffle([accepted,...wrong],`${args.seed}:${bankContext.id}:context-match`);
    const source=text(bankContext.text);
    const pairs=options.map((option,index)=>({vocabularyId:option===accepted?args.item.vocabularyId:`alt-${index}`,term:option===accepted?source:'',definition:option}));
    return base({definition,occurrence:args.occurrence,contentId:`language-bank:${bankContext.id}`,contentSource:'language_bank',prompt:'Match the sentence to the word or phrase that completes it.',markingReference:{acceptedAnswers:[accepted]},extra:{pairs,sourceText:source,languageBankContextId:bankContext.id,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:source,matchOptions:options,matchPresentation:'context_gap_to_word'}});
  }
  const picked=legacyContext ?? blankableContext(args), context=picked.context, term=picked.surface, alternatives=blankDistractors(args,picked,3);
  const source=picked.sourceText;
  const options=shuffle([term,...alternatives],`${args.seed}:context-match`);
  const pairs=options.map((option,index)=>({vocabularyId:option===term?args.item.vocabularyId:`alt-${index}`,term:option===term?source:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:context.contextId,contentSource:'context',prompt:'Match the sentence to the word that completes it.',markingReference:{acceptedAnswers:[term]},extra:{pairs,sourceText:source,contextId:context.contextId,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:source,matchOptions:options,matchPresentation:'context_gap_to_word'}});
}
function linkedWriting(args, taskType) {
  const records=array(args.unitActivities).filter(activity=>activity?.contentType==='writing_set' && activity?.activityData?.taskType===taskType && array(activity.activityData?.linkedVocabularyIds).includes(args.item.vocabularyId));
  if (!records.length) throw new Error(`No curated ${taskType.replaceAll('_',' ')} content is available for this target.`);
  return shuffle(records,`${args.seed}:${taskType}`)[0];
}
function wordFamilyMatch(args, definition) {
  const record=linkedWriting(args,'word_family'), data=object(record.activityData);
  const accepted=uniqueText(array(data.acceptedAnswers));
  if (!accepted.length) throw new Error('Word Family Match requires a curated answer.');
  const acceptedKey=accepted[0].toLocaleLowerCase('en');
  const targetFamily=uniqueText([args.item?.term,...array(args.item.wordFamily)]);
  const alternatives=targetFamily.filter(v=>v.toLocaleLowerCase('en')!==acceptedKey);
  if (alternatives.length<2) throw new Error('Word Family Match requires at least two competing forms from the same lexical family.');
  const options=shuffle([accepted[0],...shuffle(alternatives,`${args.seed}:family-wrong`).slice(0,3)],`${args.seed}:family-match`);
  const cue=text(data.sourceText)||text(data.prompt)||`Choose the correct form of “${text(args.item.term)}”.`;
  const pairs=options.map((option,index)=>({vocabularyId:index===0?args.item.vocabularyId:`alt-${index}`,term:index===0?cue:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:record.activityContentId,contentSource:'unit_activity',prompt:'Match the word-family cue to the correct form.',markingReference:{acceptedAnswers:accepted},extra:{pairs,sourceText:text(data.sourceText)||null,activityContentId:record.activityContentId,taskType:'word_family',primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId,matchCue:cue,matchOptions:options,matchPresentation:'word_family_form'}});
}
function precisionMaterial(args) {
  const record=linkedWriting(args,'improve_vocabulary'), data=object(record.activityData), accepted=uniqueText(array(data.acceptedAnswers));
  if (!accepted.length) throw new Error('Precision activity requires a curated answer.');
  const acceptedKeys=new Set(accepted.map(v=>v.toLocaleLowerCase('en')));
  const sense=senseFor(args.item,args.occurrence);
  const samePos=array(args.unitItems)
    .filter(candidate=>candidate?.vocabularyId!==args.item?.vocabularyId && text(candidate?.partOfSpeech).toLocaleLowerCase('en')===text(args.item?.partOfSpeech).toLocaleLowerCase('en'))
    .map(candidate=>candidate?.term);
  const distractors=uniqueText([
    ...array(data.distractors),...array(data.alternatives),...array(data.commonMistakes),...array(data.weakAlternatives),
    ...array(sense?.misleadingDistractors),...samePos
  ]).filter(v=>!acceptedKeys.has(v.toLocaleLowerCase('en')));
  if (distractors.length<3) throw new Error('Precision activity requires three curated or unit-grounded close alternatives.');
  return {record,data,accepted,distractors};
}
function precisionChoice(args, definition) {
  const {record,data,accepted,distractors}=precisionMaterial(args);
  const options=shuffleAnswerOptions([accepted[0],...distractors.slice(0,3)],`${args.seed}:precision-choice`,args.optionNonce);
  return base({definition,occurrence:args.occurrence,contentId:record.activityContentId,contentSource:'unit_activity',prompt:text(data.prompt)||'Which word is the most precise choice?',markingReference:{acceptedAnswers:accepted},extra:{options,sourceText:text(data.sourceText),activityContentId:record.activityContentId,taskType:'improve_vocabulary',primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId}});
}
function precisionMatch(args, definition) {
  const {record,data,accepted,distractors}=precisionMaterial(args), cue=text(data.sourceText)||text(data.prompt);
  const options=shuffle([accepted[0],...distractors.slice(0,3)],`${args.seed}:precision-match`);
  const pairs=options.map((option,index)=>({vocabularyId:index===0?args.item.vocabularyId:`alt-${index}`,term:index===0?cue:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:record.activityContentId,contentSource:'unit_activity',prompt:'Match the weak wording to the most precise replacement.',markingReference:{acceptedAnswers:accepted},extra:{pairs,sourceText:cue,activityContentId:record.activityContentId,taskType:'improve_vocabulary',primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId,matchCue:cue,matchOptions:options,matchPresentation:'precision_replacement'}});
}
function reviewedSpellingErrors(args, count=3) {
  return pickSpellingErrors(args.item,text(args.item.term),count,args.seed);
}
function spellingChoice(args, definition) {
  const term=text(args.item.term), meaning=definitionFor(args.item,args.occurrence), wrong=reviewedSpellingErrors(args,3);
  if (!term||!meaning||wrong.length<3) throw new Error('Spelling recognition requires three plausible spelling alternatives.');
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Which is the correct spelling of the word meaning “${meaning}”?`,markingReference:{acceptedAnswers:[term]},extra:{options:shuffleAnswerOptions([term,...wrong],`${args.seed}:spelling-choice`,args.optionNonce),primaryEvidenceTargetId:args.item.vocabularyId}});
}
function spellingCueMatch(args, definition) {
  const term=text(args.item.term), meaning=definitionFor(args.item,args.occurrence), wrong=reviewedSpellingErrors(args,3);
  if (!term||!meaning||wrong.length<3) throw new Error('Spelling Match requires three plausible alternatives.');
  const options=shuffle([term,...wrong],`${args.seed}:spelling-match`);
  const pairs=options.map((option,index)=>({vocabularyId:index===0?args.item.vocabularyId:`alt-${index}`,term:index===0?meaning:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:'Match the meaning cue to the correctly spelled word.',markingReference:{acceptedAnswers:[term]},extra:{pairs,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:meaning,matchOptions:options,matchPresentation:'spelling_visual_discrimination'}});
}
function spellingRebuild(args, definition) {
  const term=text(args.item.term), meaning=definitionFor(args.item,args.occurrence);
  if (!term||!meaning) throw new Error('Spelling rebuild requires a target word and meaning.');
  const letters=Array.from(term); const spaced=letters.join(' ');
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Rebuild the word meaning “${meaning}”.`,markingReference:{acceptedAnswers:[term,spaced]},extra:{tiles:unsolvedTileOrder(letters,term,`${args.seed}:spelling-tiles`),primaryEvidenceTargetId:args.item.vocabularyId}});
}
function spellInContext(args, definition) {
  const context=blankableContext(args), term=text(args.item.term), rewrite=text(context.targetRewrite);
  if (!term||!rewrite) throw new Error('Spelling Mastery requires a curated sentence cue.');
  const source=text(context.text).replace(new RegExp(rewrite.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'____');
  return base({definition,occurrence:args.occurrence,contentId:context.contextId,contentSource:'context',prompt:'Complete the sentence by spelling the missing word.',markingReference:{acceptedAnswers:[term]},extra:{sourceText:source,contextId:context.contextId,primaryEvidenceTargetId:args.item.vocabularyId}});
}

const BUILDERS=Object.freeze({
  type_word_from_definition:typeWordFromDefinition,
  context_sentence_match:contextSentenceMatch,
  word_family_match:wordFamilyMatch,
  precision_choice:precisionChoice,
  precision_match:precisionMatch,
  spelling_choice:spellingChoice,
  spelling_cue_match:spellingCueMatch,
  spelling_rebuild:spellingRebuild,
  spell_in_context:spellInContext
});

export function buildPathwayActivity({activityType,occurrence,item,contexts=[],unitActivities=[],unitItems=[],unitContexts=[],unitOccurrences=[],mastery={},readinessStage=null,usedContentIds=[],seed='',optionNonce=''}={}) {
  if (!PATHWAY_ACTIVITY_TYPES.has(activityType)) throw new Error('Not a fixed-pathway activity type.');
  if (!occurrence||!item) throw new Error('Vocabulary occurrence and item are required.');
  const definition=activityDefinition(activityType);
  if (!definition||!isActivityLive(definition.id)) throw new Error('Fixed-pathway activity is unavailable.');
  const builder=BUILDERS[definition.id];
  if (!builder) throw new Error(`No fixed-pathway builder exists for ${definition.id}.`);
  return builder({activityType,occurrence,item,contexts,unitActivities,unitItems,unitContexts,unitOccurrences,mastery,readinessStage,usedContentIds,seed,optionNonce},definition);
}
