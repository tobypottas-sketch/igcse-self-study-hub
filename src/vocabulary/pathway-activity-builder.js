import { shuffleAnswerOptions } from './answer-option-shuffle.js';
import { unsolvedTileOrder } from './tile-order.js';
import { activityDefinition, isActivityLive } from './activity-catalogue.js';
import { grammaticalBlankCandidates, blankDistractorsDetailed, reviewedGapIndex } from './foundational-activity-builder.js';
import { languageBankContextForItem } from './language-bank.js';
import { DISTRACTOR_SOURCE, UnreviewedContentError, reviewedSpellingErrors } from './reviewed-content.js';
import { pickSpellingErrorsDetailed } from './spelling-errors.js';
import { glossBlank, passagePair, blankableGapContexts, improveGapSentence, improveRecordsFor, weakPhraseOf, encodeSlotAnswer } from '../../supabase/functions/_shared/vocabulary-typed-forms.js';
import { evaluateFamilyEligibility, eligibleSlotForms, familyMasks, familySlotsForMask, familyVariantId, FAMILY_STATUS } from '../../supabase/functions/_shared/vocabulary-word-family.js';

export const PATHWAY_ACTIVITY_TYPES = Object.freeze(new Set([
  'type_word_from_definition','context_sentence_match','word_family_match',
  'precision_choice','precision_match','spelling_choice','spelling_cue_match','spelling_rebuild','spell_in_context',
  // Stage Contract v2 (Job 8)
  'gloss_in_context_type','type_in_passage','word_family_identify','family_multi_form','precision_type_cued','upgrade_passage','spot_the_error'
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
// Presentation order only: seeded by the content seed AND the presentation nonce, never part of question identity or grading.
function present(values, label, args) { return shuffleAnswerOptions(values,`${args.seed}:${label}`,args.optionNonce); }
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
function blankableContext(args, needsReviewedOptions=false) {
  const used=new Set(array(args.usedContentIds).map(String));
  let candidates=grammaticalBlankCandidates({ item:args.item, occurrence:args.occurrence, contexts:args.contexts })
    .filter(candidate=>candidate.formKey || candidate.surface.toLocaleLowerCase('en')===text(args.item?.term).toLocaleLowerCase('en'));
  if (!candidates.length) throw new Error('No curated context is available for this pathway activity.');
  if (needsReviewedOptions) {
    const index=reviewedGapIndex(args);
    if (index.problems.length) throw new UnreviewedContentError('gap-fill', index.problems.map(row=>`${row.contextId ?? 'row'}: ${row.problem}`).join(' | '));
    candidates=candidates.filter(candidate=>index.byContextId.has(String(candidate.context.contextId)));
    if (!candidates.length) throw new UnreviewedContentError('gap-fill','no blankable sentence has reviewed options');
  }
  const unused=candidates.filter(candidate=>!used.has(String(candidate.context.contextId)));
  return shuffle(unused.length?unused:candidates,`${args.seed}:context`)[0];
}
function contextSentenceMatch(args, definition) {
  let bankContext=languageBankContextForItem(args.item,args.usedContentIds,args.seed,args.unitActivities ?? []);
  let legacyContext=null;
  if (bankContext && array(args.usedContentIds).includes(`language-bank:${bankContext.id}`)) {
    try {
      const candidate=blankableContext(args, args.requireReviewed===true);
      if (!array(args.usedContentIds).includes(candidate.context.contextId)) { legacyContext=candidate; bankContext=null; }
    } catch { /* A published bank prompt remains eligible if no legacy cue can be built. */ }
  }
  if (bankContext) {
    const accepted=text(bankContext.answer);
    const wrong=array(bankContext.distractors).map(row=>text(row?.text)).filter(Boolean);
    if (!accepted||wrong.length!==3||!text(bankContext.text).includes('____')) throw new Error('Language-bank Context Match record is incomplete.');
    const options=present([accepted,...wrong],`${bankContext.id}:context-match`,args);
    const source=text(bankContext.text);
    const pairs=options.map((option,index)=>({vocabularyId:option===accepted?args.item.vocabularyId:`alt-${index}`,term:option===accepted?source:'',definition:option}));
    return base({definition,occurrence:args.occurrence,contentId:`language-bank:${bankContext.id}`,contentSource:'language_bank',prompt:'Match the sentence to the word or phrase that completes it.',markingReference:{acceptedAnswers:[accepted]},extra:{pairs,sourceText:source,languageBankContextId:bankContext.id,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:source,matchOptions:options,matchPresentation:'context_gap_to_word',distractorSource:DISTRACTOR_SOURCE.REVIEWED}});
  }
  const picked=legacyContext ?? blankableContext(args, args.requireReviewed===true), context=picked.context, term=picked.surface, gap=blankDistractorsDetailed(args,picked,3), alternatives=gap.options;
  const source=picked.sourceText;
  const options=present([term,...alternatives],'context-match',args);
  const pairs=options.map((option,index)=>({vocabularyId:option===term?args.item.vocabularyId:`alt-${index}`,term:option===term?source:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:context.contextId,contentSource:'context',prompt:'Match the sentence to the word that completes it.',markingReference:{acceptedAnswers:[term]},extra:{pairs,sourceText:source,contextId:context.contextId,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:source,matchOptions:options,matchPresentation:'context_gap_to_word',distractorSource:gap.source}});
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
  const ownAlternatives=targetFamily.filter(v=>v.toLocaleLowerCase('en')!==acceptedKey);
  if (!ownAlternatives.length) throw new Error('Word Family Match requires at least one competing form from the same lexical family.');
  // A word with very few genuine forms (e.g. incredible / incredibly) borrows wrong forms from other Unit 1 families
  // rather than listing unnatural or different-meaning forms in its own family.
  let alternatives=ownAlternatives;
  if (alternatives.length<2) {
    const taken=new Set([acceptedKey,...targetFamily.map(v=>v.toLocaleLowerCase('en'))]);
    const cross=uniqueText(array(args.unitItems).filter(candidate=>candidate?.vocabularyId!==args.item?.vocabularyId).flatMap(candidate=>array(candidate?.wordFamily))).filter(v=>!taken.has(v.toLocaleLowerCase('en')));
    alternatives=[...ownAlternatives,...shuffle(cross,`${args.seed}:family-cross`).slice(0,2)];
    if (alternatives.length<2) throw new Error('Word Family Match requires at least two competing forms.');
  }
  const options=present([accepted[0],...shuffle(alternatives,`${args.seed}:family-wrong`).slice(0,3)],'family-match',args);
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
  const options=present([accepted[0],...distractors.slice(0,3)],'precision-match',args);
  const pairs=options.map((option,index)=>({vocabularyId:index===0?args.item.vocabularyId:`alt-${index}`,term:index===0?cue:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:record.activityContentId,contentSource:'unit_activity',prompt:'Match the weak wording to the most precise replacement.',markingReference:{acceptedAnswers:accepted},extra:{pairs,sourceText:cue,activityContentId:record.activityContentId,taskType:'improve_vocabulary',primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId,matchCue:cue,matchOptions:options,matchPresentation:'precision_replacement'}});
}
function spellingOptions(args, count=3) {
  return pickSpellingErrorsDetailed(args.item,text(args.item.term),count,args.seed);
}
function spellingChoice(args, definition) {
  const term=text(args.item.term), meaning=definitionFor(args.item,args.occurrence), spelled=spellingOptions(args,3), wrong=spelled.errors;
  if (!term||!meaning||wrong.length<3) throw new Error('Spelling recognition requires three plausible spelling alternatives.');
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Which is the correct spelling of the word meaning “${meaning}”?`,markingReference:{acceptedAnswers:[term]},extra:{options:shuffleAnswerOptions([term,...wrong],`${args.seed}:spelling-choice`,args.optionNonce),primaryEvidenceTargetId:args.item.vocabularyId,distractorSource:spelled.source}});
}
function spellingCueMatch(args, definition) {
  const term=text(args.item.term), meaning=definitionFor(args.item,args.occurrence), spelled=spellingOptions(args,3), wrong=spelled.errors;
  if (!term||!meaning||wrong.length<3) throw new Error('Spelling Match requires three plausible alternatives.');
  const options=present([term,...wrong],'spelling-match',args);
  const pairs=options.map((option,index)=>({vocabularyId:index===0?args.item.vocabularyId:`alt-${index}`,term:index===0?meaning:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:'Match the meaning cue to the correctly spelled word.',markingReference:{acceptedAnswers:[term]},extra:{pairs,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:meaning,matchOptions:options,matchPresentation:'spelling_visual_discrimination',distractorSource:spelled.source}});
}
// Tile order is presentation: nonce-driven, never the solved word, and (where the caller knows it) never the order the learner saw last time.
function spellingTiles(letters, term, args) {
  const avoid=new Set(array(args.avoidTileOrders).map(String));
  let tiles=null;
  for (let attempt=0; attempt<12; attempt+=1) {
    tiles=unsolvedTileOrder(letters,term,`${args.seed}:spelling-tiles:${args.optionNonce}:${attempt}`);
    if (!avoid.has(tiles.join(''))) return tiles;
  }
  return tiles;
}
function spellingRebuild(args, definition) {
  const term=text(args.item.term), meaning=definitionFor(args.item,args.occurrence);
  if (!term||!meaning) throw new Error('Spelling rebuild requires a target word and meaning.');
  const letters=Array.from(term).filter(char=>!/\s/.test(char)); const spaced=Array.from(term).join(' ');
  const answers=[term,spaced];
  // Missing-letter variant (Apply, supported): a single word of five or more letters is shown with its inner letters missing and the
  // learner fills the gaps from a small bank of letters. The answer and marking are identical to the full rebuild.
  if (letters.length>=5 && letters.length===term.length && hashSeed(`${args.seed}:spelling-variant`)%2===1) {
    const innerCount=letters.length>=8?3:2;
    const candidates=letters.map((_,index)=>index).filter(index=>index>0&&index<letters.length-1);
    const hidden=shuffle(candidates,`${args.seed}:missing-positions`).slice(0,innerCount).sort((a,b)=>a-b);
    const template=letters.map((letter,index)=>hidden.includes(index)?null:letter);
    const missing=hidden.map(index=>letters[index]);
    const decoyPool='etaoinsrlcdhumpgbyfwkvx'.split('').filter(letter=>!missing.includes(letter)&&!letters.includes(letter));
    const decoys=shuffle(decoyPool,`${args.seed}:missing-decoys`).slice(0,2);
    const tiles=shuffle([...missing,...decoys],`${args.seed}:missing-tiles:${args.optionNonce}`);
    return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Fill in the missing letters of the word meaning “${meaning}”.`,markingReference:{acceptedAnswers:answers},extra:{tiles,missingTemplate:template,spellingPattern:template.map(letter=>letter??'_').join(' '),stageVariant:'missing-letters',primaryEvidenceTargetId:args.item.vocabularyId}});
  }
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Rebuild the word meaning “${meaning}”.`,markingReference:{acceptedAnswers:answers},extra:{tiles:spellingTiles(letters,term,args),primaryEvidenceTargetId:args.item.vocabularyId}});
}
function spellInContext(args, definition) {
  const context=blankableContext(args), term=text(args.item.term), rewrite=text(context.targetRewrite);
  if (!term||!rewrite) throw new Error('Spelling Mastery requires a curated sentence cue.');
  const source=text(context.text).replace(new RegExp(rewrite.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'____');
  return base({definition,occurrence:args.occurrence,contentId:context.contextId,contentSource:'context',prompt:'Complete the sentence by spelling the missing word.',markingReference:{acceptedAnswers:[term]},extra:{sourceText:source,contextId:context.contextId,primaryEvidenceTargetId:args.item.vocabularyId}});
}

// ======================= Stage Contract v2 builders (Job 8) =======================
function clueFor(answer) {
  const words = text(answer).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return words.length > 1 ? `Clue: ${words.length} words, starting with “${words[0][0]}”.` : `Clue: starts with “${words[0][0]}” · ${words[0].length} letters.`;
}

// Meaning · Mastery. One authored mastery sentence for the sense with the target blanked, plus the authored contextual gloss. The
// learner types the word or phrase: no options, no bank, no letters shown. The gloss is refused if it exposes the word.
function glossInContextType(args, definition) {
  const sense=senseFor(args.item,args.occurrence), used=new Set(array(args.usedContentIds).map(String));
  const candidates=array(sense.masteryContexts).map(masteryContext=>glossBlank({item:args.item,sense,masteryContext})).filter(Boolean);
  // Per-word Mastery completes only after two DISTINCT prompts (pathway-progress rule, unchanged), so a word needs two usable authored sentences.
  if (candidates.length<2) throw new Error('Meaning Mastery needs two mastery sentences whose glosses do not show the word.');
  const unused=candidates.filter(row=>!used.has(row.contextId));
  const pick=shuffle(unused.length?unused:candidates,`${args.seed}:gloss-in-context`)[0];
  return base({definition,occurrence:args.occurrence,contentId:pick.contextId,contentSource:'context',prompt:`Type the word or phrase that completes the sentence and means “${pick.gloss}”.`,markingReference:{acceptedAnswers:[pick.answer]},extra:{sourceText:pick.sourceText,contextId:pick.contextId,gloss:pick.gloss,primaryEvidenceTargetId:args.item.vocabularyId,answerForm:'surface_form'}});
}

// Context · Mastery. Two authored gap sentences for the same target, completed together. No bank, no letters, no options. Each gap
// needs the form its own sentence requires, so grammar in context matters. The pair is a pure function of the first context id.
function typeInPassage(args, definition) {
  const sense=senseFor(args.item,args.occurrence), used=new Set(array(args.usedContentIds).map(String));
  const list=blankableGapContexts(args.contexts,args.item,sense);
  if (list.length<2) throw new Error('Context Mastery needs two curated gap sentences for this word.');
  const unused=list.filter(row=>!used.has(row.contextId));
  const first=shuffle(unused.length?unused:list,`${args.seed}:passage-first`)[0];
  const pair=passagePair(args.contexts,args.item,sense,first.contextId);
  const answers=pair.map(row=>row.answer);
  return base({definition,occurrence:args.occurrence,contentId:pair[0].contextId,contentSource:'context',prompt:'Complete each sentence with the word or phrase that fits. Each gap may need a different form.',markingReference:{acceptedAnswers:answers,slotAnswers:answers.map(answer=>[answer])},extra:{sourceText:pair.map(row=>row.sourceText).join(' '),contextId:pair[0].contextId,slots:pair.map((row,index)=>({label:`Gap ${index+1}`,sourceText:row.sourceText})),primaryEvidenceTargetId:args.item.vocabularyId,answerForm:'surface_form'}});
}

// Word Families · Recognise. Which word belongs to the same family as the target? Built only from the stored family strings.
function wordFamilyIdentify(args, definition) {
  const term=text(args.item.term), members=uniqueText(array(args.item.wordFamily)).filter(v=>v.toLocaleLowerCase('en')!==term.toLocaleLowerCase('en'));
  if (!term||!members.length) throw new Error('Word Family identification needs at least one stored family member.');
  const member=shuffle(members,`${args.seed}:family-identify`)[0];
  const familyKeys=new Set([term,...array(args.item.wordFamily)].map(v=>text(v).toLocaleLowerCase('en')));
  const stem=(value)=>text(value).toLocaleLowerCase('en').slice(0,4);
  const pool=uniqueText(array(args.unitItems).filter(c=>c?.vocabularyId!==args.item.vocabularyId).flatMap(c=>[c?.term,...array(c?.wordFamily)])).filter(v=>!familyKeys.has(v.toLocaleLowerCase('en'))&&stem(v)!==stem(term)&&!/\s/.test(v)===!/\s/.test(member));
  const near=pool.filter(v=>Math.abs(v.length-member.length)<=3);
  const distractors=shuffle(near.length>=3?near:pool,`${args.seed}:family-identify-wrong`).slice(0,3);
  if (distractors.length<3) throw new Error('Word Family identification needs three words from other families.');
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:`Which word belongs to the same word family as “${term}”?`,markingReference:{acceptedAnswers:[member]},extra:{options:present([member,...distractors],'family-identify',args),primaryEvidenceTargetId:args.item.vocabularyId}});
}

// Word Families · Mastery. One base family, several authored sentences, the learner supplies the correct form in each gap. No bank,
// no options. Offered ONLY for a family that passes the locked eligibility rule; nothing is inferred or generated.
function familyMultiForm(args, definition) {
  const sense=senseFor(args.item,args.occurrence), verdict=evaluateFamilyEligibility(args.item,sense);
  if (verdict.status!==FAMILY_STATUS.ELIGIBLE) throw new Error(`Word Families Mastery is not offered for this word: ${verdict.reason}.`);
  const masks=familyMasks(args.item,sense);
  if (!masks.length) throw new Error('Word Families Mastery has no valid set of forms for this word.');
  const mask=shuffle(masks,`${args.seed}:family-mask`)[0], slots=familySlotsForMask(args.item,sense,mask);
  // Order the sentences by seed so the same family does not always ask its forms in the same order (presentation only).
  const ordered=shuffle(slots,`${args.seed}:family-slot-order:${args.optionNonce}`);
  // Marking is in the AUTHORED order the server derives from the mask; the boxes are shown in the shuffled order and mapped back.
  const answers=slots.map(slot=>slot.form), slotCanonicalIndex=ordered.map(slot=>slots.indexOf(slot));
  return base({definition,occurrence:args.occurrence,contentId:`item:${args.item.vocabularyId}:${senseFor(args.item,args.occurrence)?.senseId ?? 'sense'}:family:${mask}`,contentSource:'item',prompt:`Complete each sentence with the correct form from the “${text(args.item.term)}” word family.`,markingReference:{acceptedAnswers:answers,slotAnswers:answers.map(answer=>[answer])},extra:{sourceText:ordered.map(slot=>slot.sourceText).join(' '),slots:ordered.map((slot,index)=>({label:`Sentence ${index+1}`,sourceText:slot.sourceText})),activityVariantId:familyVariantId(mask),slotCanonicalIndex,primaryEvidenceTargetId:args.item.vocabularyId}});
}

function improveRecords(args) {
  return improveRecordsFor(args.unitActivities,args.item.vocabularyId);
}
function accepted(data) { return uniqueText(array(data.acceptedAnswers)); }

// Precision & Use · Apply. The weak wording is replaced by a gap and the learner taps the best replacement from a visible bank.
function improveVocabularyApply(args, definition) {
  const records=improveRecords(args).filter(row=>improveGapSentence(row.data)&&accepted(row.data).length);
  if (!records.length) throw new Error('Precision Apply needs a curated sentence whose weak wording can be replaced by a gap.');
  const used=new Set(array(args.usedContentIds).map(String)), unused=records.filter(row=>!used.has(row.id));
  const record=shuffle(unused.length?unused:records,`${args.seed}:precision-apply`)[0], data=record.data, gap=improveGapSentence(data), answers=accepted(data);
  const acceptedKeys=new Set(answers.map(v=>v.toLocaleLowerCase('en')));
  const samePos=array(args.unitItems).filter(c=>c?.vocabularyId!==args.item?.vocabularyId&&text(c?.partOfSpeech).toLocaleLowerCase('en')===text(args.item?.partOfSpeech).toLocaleLowerCase('en')).map(c=>c?.term);
  const wrong=uniqueText([...array(data.distractors).map(d=>typeof d==='object'?d?.text:d),...array(senseFor(args.item,args.occurrence)?.misleadingDistractors),...samePos]).filter(v=>!acceptedKeys.has(v.toLocaleLowerCase('en'))).slice(0,3);
  if (wrong.length<3) throw new Error('Precision Apply requires three close alternatives.');
  const bank=present([answers[0],...wrong],`${record.id}:precision-apply`,args);
  return base({definition,occurrence:args.occurrence,contentId:record.id,contentSource:'unit_activity',prompt:`Replace “${gap.weak}” with the most precise word or phrase.`,markingReference:{acceptedAnswers:answers},extra:{responseMode:'drag_gap',sourceText:gap.sourceText,draggables:[...bank],wordBank:[...bank],options:[...bank],activityContentId:record.id,taskType:'improve_vocabulary',primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId,distractorSource:DISTRACTOR_SOURCE.REVIEWED}});
}

// Precision & Use · Recall. The weak sentence stays visible; the learner types the precise word from that contextual cue with at most
// the first letter and the length as help.
function precisionTypeCued(args, definition) {
  const records=improveRecords(args).filter(row=>accepted(row.data).length);
  if (!records.length) throw new Error('Precision Recall needs a curated weak-wording sentence.');
  const used=new Set(array(args.usedContentIds).map(String)), unused=records.filter(row=>!used.has(row.id));
  const record=shuffle(unused.length?unused:records,`${args.seed}:precision-recall`)[0], data=record.data, answers=accepted(data);
  return base({definition,occurrence:args.occurrence,contentId:record.id,contentSource:'unit_activity',prompt:text(data.prompt)||'Type a more precise word or phrase.',markingReference:{acceptedAnswers:answers},extra:{sourceText:text(data.sourceText),clue:clueFor(answers[0]),activityContentId:record.id,taskType:'improve_vocabulary',primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId}});
}

function weakLabel(data, index) {
  const weak=weakPhraseOf(data);
  return weak ? `Replace “${weak.phrase}”` : `Sentence ${index+1}: upgrade the weak wording`;
}
// Precision & Use · Mastery. A short passage of two curated weak-wording sentences for the same target. The learner upgrades the weak
// wording in EACH sentence by typing: no bank, no clue. Every slot must be right for the item to be right.
function upgradePassage(args, definition) {
  const all=improveRecords(args), usable=all.map((row,index)=>({...row,index})).filter(row=>accepted(row.data).length&&text(row.data.sourceText));
  if (usable.length<2) throw new Error('Precision Mastery needs two curated weak-wording sentences for this word.');
  const used=new Set(array(args.usedContentIds).map(String)), unused=usable.filter(row=>!used.has(row.id));
  const first=shuffle(unused.length?unused:usable,`${args.seed}:upgrade-first`)[0];
  const others=usable.filter(row=>row.id!==first.id), second=shuffle(others,`${args.seed}:upgrade-second`)[0];
  const pair=[first,second], answers=pair.map(row=>accepted(row.data));
  return base({definition,occurrence:args.occurrence,contentId:first.id,contentSource:'unit_activity',prompt:'Upgrade the weak wording in each sentence with a precise word or phrase.',markingReference:{acceptedAnswers:answers.flat(),slotAnswers:answers},extra:{sourceText:pair.map(row=>text(row.data.sourceText)).join(' '),slots:pair.map((row,index)=>({label:weakLabel(row.data,index),sourceText:text(row.data.sourceText)})),activityContentId:first.id,activityVariantId:`q${second.index}`,taskType:'improve_vocabulary',primaryEvidenceTargetId:first.data.primaryEvidenceTargetId ?? args.item.vocabularyId}});
}

// Spelling & Recall · Match. A visible set of four words in which exactly one is misspelled; the learner spots it. The three correct
// words are other Unit 1 words of the same length class, so the odd one out is a spelling difference, not a length or shape clue.
function spotTheError(args, definition) {
  const term=text(args.item.term);
  // ONLY an authored misspelling may be the wrong card: the server marks the answer against sense.spellingErrors, so a rule-generated one could never be verified.
  const authored=reviewedSpellingErrors(args.item).filter(v=>text(v).toLocaleLowerCase('en')!==term.toLocaleLowerCase('en'));
  const wrong=text(authored.length?shuffle(authored,`${args.seed}:spot-wrong`)[0]:'');
  if (!term||!wrong) throw new Error('Spot the Error requires an authored plausible misspelling.');
  const wordCount=term.split(/\s+/).length;
  const familyOwn=new Set([term,...array(args.item.wordFamily),...array(args.item.collocations)].map(v=>text(v).toLocaleLowerCase('en')));
  // Correct words of the same word count: other Unit 1 headwords, their authored collocations and stored family forms (never this word's own).
  const pool=uniqueText(array(args.unitItems).filter(c=>c?.vocabularyId!==args.item.vocabularyId).flatMap(c=>[c?.term,...array(c?.collocations),...array(c?.wordFamily)])).filter(v=>v.split(/\s+/).length===wordCount&&!familyOwn.has(v.toLocaleLowerCase('en')));
  const near=pool.filter(v=>Math.abs(v.length-wrong.length)<=2);
  const others=shuffle(near.length>=3?near:pool,`${args.seed}:spot-others`).slice(0,3);
  if (others.length<3) throw new Error('Spot the Error needs three other correctly spelled words.');
  const options=present([wrong,...others],'spot-error',args), cue='Three of these spellings are correct. Which one has a spelling mistake?';
  const pairs=options.map((option,index)=>({vocabularyId:option===wrong?args.item.vocabularyId:`alt-${index}`,term:option===wrong?cue:'',definition:option}));
  return base({definition,occurrence:args.occurrence,contentId:itemContentId(args),contentSource:'item',prompt:cue,markingReference:{acceptedAnswers:[wrong]},extra:{pairs,primaryEvidenceTargetId:args.item.vocabularyId,matchCue:cue,matchOptions:options,matchPresentation:'spelling_spot_error',distractorSource:DISTRACTOR_SOURCE.REVIEWED}});
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
  spell_in_context:spellInContext,
  gloss_in_context_type:glossInContextType,
  type_in_passage:typeInPassage,
  word_family_identify:wordFamilyIdentify,
  family_multi_form:familyMultiForm,
  precision_type_cued:precisionTypeCued,
  upgrade_passage:upgradePassage,
  spot_the_error:spotTheError
});

// improve_vocabulary is the Precision & Use APPLY task only inside that pathway (a bank-supported replacement). Elsewhere it stays the
// legacy typed task, so non-pathway practice is unchanged.
export function buildPrecisionApply(args) {
  const definition=activityDefinition('improve_vocabulary');
  if (!args?.occurrence||!args?.item) throw new Error('Vocabulary occurrence and item are required.');
  return improveVocabularyApply(args,definition);
}

export function buildPathwayActivity({activityType,occurrence,item,contexts=[],unitActivities=[],unitItems=[],unitContexts=[],unitOccurrences=[],mastery={},readinessStage=null,usedContentIds=[],seed='',optionNonce='',avoidTileOrders=[],requireReviewed=false}={}) {
  if (!PATHWAY_ACTIVITY_TYPES.has(activityType)) throw new Error('Not a fixed-pathway activity type.');
  if (!occurrence||!item) throw new Error('Vocabulary occurrence and item are required.');
  const definition=activityDefinition(activityType);
  if (!definition||!isActivityLive(definition.id)) throw new Error('Fixed-pathway activity is unavailable.');
  const builder=BUILDERS[definition.id];
  if (!builder) throw new Error(`No fixed-pathway builder exists for ${definition.id}.`);
  return builder({activityType,occurrence,item,contexts,unitActivities,unitItems,unitContexts,unitOccurrences,mastery,readinessStage,usedContentIds,seed,optionNonce,avoidTileOrders,requireReviewed},definition);
}
