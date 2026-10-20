import { shuffleAnswerOptions } from './answer-option-shuffle.js';
import { activityDefinition, isActivityLive } from './activity-catalogue.js';
import { languageBankContextForItem } from './language-bank.js';

const STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });
export const FOUNDATIONAL_ACTIVITY_TYPES = Object.freeze(new Set([
  'definition_to_word','word_definition_match','drag_word_definition','drag_definition_word',
  'gap_fill_bank','drag_word_sentence','type_missing_word','spell_word','choose_word_sentence','word_family_choice'
]));

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function uniqueText(values) {
  const seen = new Set();
  const output = [];
  for (const value of values) {
    const candidate = text(value);
    const key = candidate.toLocaleLowerCase('en');
    if (!candidate || seen.has(key)) continue;
    seen.add(key); output.push(candidate);
  }
  return output;
}
function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619) >>> 0; }
  return hash >>> 0;
}
function stableShuffle(values, seed) {
  const output = [...values];
  let state = hashSeed(seed) || 1;
  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}
function senseFor(item, occurrence = {}) {
  return array(item?.senses).find(sense => sense?.senseId === occurrence?.senseId) ?? array(item?.senses)[0] ?? {};
}
function definitionFor(item, occurrence = {}) {
  const sense = senseFor(item, occurrence);
  return text(sense.meaning) || text(item?.coreMeaning) || text(array(sense.acceptedParaphrases)[0]);
}
function grammarFormsFor(item, occurrence = {}) {
  return object(senseFor(item, occurrence)?.grammarForms);
}
function formEntries(item, occurrence = {}) {
  const forms = grammarFormsFor(item, occurrence);
  return ['thirdPerson','past','pastParticiple','ing','base']
    .map(key => [key,text(forms[key])])
    .filter(([,value]) => value)
    .sort((a,b) => b[1].length - a[1].length);
}
function wholeWordIndex(source, candidate) {
  const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const match = new RegExp(`(^|[^A-Za-z])(${escaped})(?=$|[^A-Za-z])`,'i').exec(source);
  if (!match) return -1;
  return match.index + match[1].length;
}
function surfaceFormInContext(context, item, occurrence = {}) {
  const source = text(context?.text);
  if (!source) return null;

  const rewrite = text(context?.targetRewrite);
  const accepted = array(context?.acceptedAnswers).map(text).filter(Boolean);
  const lemma = text(item?.term);
  const forms = formEntries(item,occurrence);

  if (context?.type === 'gap_fill' && rewrite && wholeWordIndex(source,rewrite) >= 0) {
    const answer = accepted[0] || rewrite;
    const matched = forms.find(([,value]) => value.toLocaleLowerCase('en') === answer.toLocaleLowerCase('en'));
    return { surface:rewrite, answer, formKey:matched?.[0] ?? (answer.toLocaleLowerCase('en') === lemma.toLocaleLowerCase('en') ? 'base' : null) };
  }

  if (context?.type === 'meaning_context') {
    for (const [formKey,value] of forms) {
      if (wholeWordIndex(source,value) >= 0) return { surface:value, answer:value, formKey };
    }
    if (lemma && wholeWordIndex(source,lemma) >= 0) return { surface:lemma, answer:lemma, formKey:'base' };
  }

  if (rewrite && wholeWordIndex(source,rewrite) >= 0 && accepted.length) {
    const answer = accepted[0];
    const matched = forms.find(([,value]) => value.toLocaleLowerCase('en') === answer.toLocaleLowerCase('en'));
    return { surface:rewrite, answer, formKey:matched?.[0] ?? (answer.toLocaleLowerCase('en') === lemma.toLocaleLowerCase('en') ? 'base' : null) };
  }
  return null;
}
function stageOf(mastery = {}) {
  const status = text(mastery?.status).toLocaleLowerCase('en');
  return STAGE_ORDER[status] == null ? 'new' : status;
}
function assertReady(definition, mastery, readinessStage = null) {
  const actual = stageOf(mastery);
  const stage = readinessStage && STAGE_ORDER[readinessStage] != null ? readinessStage : actual;
  if (STAGE_ORDER[stage] < STAGE_ORDER[definition.minimumStage]) throw new Error(`Learner is not ready for ${definition.label}; use a supported ${actual} activity first.`);
}
function baseActivity({ definition, occurrence, contentId, contentSource, prompt, markingReference, extra = {} }) {
  return {
    activityId:`${occurrence?.occurrenceId ?? 'unit'}:${contentId}:${definition.id}`,
    type:definition.id,
    responseMode:definition.responseMode,
    skillFamily:definition.skillFamily,
    family:definition.family,
    strands:[...definition.strands],
    evidenceStrength:definition.evidenceStrength,
    productive:definition.productive,
    vocabularyId:occurrence?.vocabularyId ?? null,
    occurrenceId:occurrence?.occurrenceId ?? null,
    contentId,
    contentSource,
    prompt,
    markingReference,
    ...extra
  };
}
function samePosCandidates(args) {
  const targetPos = text(args.item?.partOfSpeech).toLocaleLowerCase('en');
  return array(args.unitItems).filter(candidate => candidate?.vocabularyId !== args.item?.vocabularyId && text(candidate?.partOfSpeech).toLocaleLowerCase('en') === targetPos);
}
function authoredDistractors(args) {
  return uniqueText(array(senseFor(args.item,args.occurrence)?.misleadingDistractors));
}
function plausibleTermDistractors(args, count = 3) {
  const authored = authoredDistractors(args);
  const fallback = samePosCandidates(args).map(candidate => text(candidate.term)).filter(Boolean);
  const pool = uniqueText([...authored, ...fallback]);
  if (pool.length < count) throw new Error(`Activity requires ${count} plausible same-part-of-speech alternatives.`);
  if (authored.length >= count) return stableShuffle(authored, `${args.seed}:authored-term-distractors`).slice(0,count);
  return stableShuffle(pool, `${args.seed}:term-distractors`).slice(0,count);
}
function semanticSurfaceDistractors(args, formKey) {
  const authored = new Set(authoredDistractors(args).map(value => value.toLocaleLowerCase('en')));
  return samePosCandidates(args)
    .filter(candidate => authored.has(text(candidate.term).toLocaleLowerCase('en')))
    .map(candidate => text(grammarFormsFor(candidate)[formKey]))
    .filter(Boolean);
}
function targetFormNearMisses(args, accepted, formKey) {
  if (!formKey || formKey === 'base') return [];
  return formEntries(args.item,args.occurrence)
    .filter(([key,value]) => key !== formKey && value.toLocaleLowerCase('en') !== text(accepted).toLocaleLowerCase('en'))
    .map(([,value]) => value);
}
function surfaceDistractors(args, formKey, count = 3) {
  if (!formKey || formKey === 'base') return plausibleTermDistractors(args,count);
  const accepted = text(grammarFormsFor(args.item,args.occurrence)[formKey]) || text(args.item?.term);
  const semantic = stableShuffle(uniqueText(semanticSurfaceDistractors(args,formKey)), `${args.seed}:${formKey}:semantic`);
  const sameFormFallback = stableShuffle(uniqueText(samePosCandidates(args)
    .map(candidate => text(grammarFormsFor(candidate)[formKey]))
    .filter(Boolean)), `${args.seed}:${formKey}:fallback`);
  const nearMisses = stableShuffle(uniqueText(targetFormNearMisses(args,accepted,formKey)), `${args.seed}:${formKey}:near-misses`);
  const preferred = uniqueText([...semantic, ...sameFormFallback, ...nearMisses]);
  if (preferred.length < count) throw new Error(`Activity requires ${count} plausible ${formKey} alternatives.`);
  return preferred.slice(0,count);
}
function definitionPairs(args, count = 4) {
  const targetDefinition = definitionFor(args.item, args.occurrence);
  if (!text(args.item?.term) || !targetDefinition) throw new Error('Matching requires a target word and curated definition.');
  const candidates = samePosCandidates(args)
    .map(candidate => ({ vocabularyId:candidate.vocabularyId, term:text(candidate.term), definition:definitionFor(candidate, {}) }))
    .filter(pair => pair.term && pair.definition);
  if (candidates.length < count - 1) throw new Error(`Matching requires at least ${count - 1} plausible unit alternatives.`);
  const others = stableShuffle(candidates, `${args.seed}:pairs`).slice(0,count - 1);
  return stableShuffle([{ vocabularyId:args.item.vocabularyId, term:text(args.item.term), definition:targetDefinition }, ...others], `${args.seed}:pair-order`);
}
function itemContentId(args) {
  return `item:${args.item.vocabularyId}:${args.occurrence?.senseId ?? senseFor(args.item,args.occurrence)?.senseId ?? 'sense'}`;
}
function definitionToWord(args, definition) {
  const targetDefinition = definitionFor(args.item, args.occurrence);
  if (!targetDefinition || !text(args.item.term)) throw new Error('Definition → Word requires a curated definition and term.');
  const orderOptions = args.matchingPresentation ? stableShuffle : shuffleAnswerOptions;
  const options = orderOptions([text(args.item.term), ...plausibleTermDistractors(args,3)], `${args.seed}:definition-word-options`, args.optionNonce);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:itemContentId(args), contentSource:'item', prompt:`Which word means “${targetDefinition}”?`, markingReference:{ acceptedAnswers:[text(args.item.term)] }, extra:{ options, primaryEvidenceTargetId:args.item.vocabularyId } });
}
function matchingActivity(args, definition) {
  const pairs = definitionPairs(args,4);
  const target = pairs.find(pair => pair.vocabularyId === args.item.vocabularyId);
  const answer = definition.id === 'drag_definition_word' ? target.term : target.definition;
  const prompt = definition.id === 'word_definition_match' ? 'Match each word with its definition.' : definition.id === 'drag_definition_word' ? 'Drag each definition to the correct word.' : 'Drag each word to the correct definition.';
  const matchExtra = definition.id === 'word_definition_match' ? { matchCue:target.term, matchOptions:pairs.map(pair => pair.definition), matchPresentation:'meaning_word_to_definition' } : {};
  return baseActivity({ definition, occurrence:args.occurrence, contentId:itemContentId(args), contentSource:'item', prompt, markingReference:{ acceptedAnswers:[answer] }, extra:{ pairs, primaryEvidenceTargetId:args.item.vocabularyId, ...matchExtra } });
}
function replaceFirstIgnoreCase(source, needle, replacement) {
  const index = wholeWordIndex(source,needle);
  if (index < 0) return null;
  return `${source.slice(0,index)}${replacement}${source.slice(index + needle.length)}`;
}
function blankableContext(args) {
  const candidates = array(args.contexts).flatMap(context => {
    if (!['meaning_context','paraphrase_context','production_context','gap_fill'].includes(context?.type)) return [];
    const target = surfaceFormInContext(context,args.item,args.occurrence);
    if (!target?.surface || !target?.answer) return [];
    const sourceText = replaceFirstIgnoreCase(text(context.text),target.surface,'____');
    return sourceText?.includes('____') ? [{ context, sourceText, ...target }] : [];
  });
  if (!candidates.length) throw new Error('No curated context can form an accurate target-word blank for this activity.');
  const unused = candidates.filter(candidate => !array(args.usedContentIds).includes(candidate.context.contextId));
  return stableShuffle(unused.length ? unused : candidates, `${args.seed}:blank-context`)[0];
}
function bankRetrievalActivity(args, definition) {
  const record = languageBankContextForItem(args.item,args.usedContentIds,args.seed,args.unitActivities ?? []);
  if (!record) return null;
  const accepted = text(record.answer);
  const wrong = array(record.distractors).map(row => text(row?.text)).filter(Boolean);
  if (!accepted || wrong.length !== 3 || !text(record.text).includes('____')) throw new Error('Language-bank retrieval context is incomplete.');
  const contentId = `language-bank:${record.id}`;
  let prompt = 'Complete the sentence with the target word.';
  const extra = {
    sourceText:text(record.text),
    languageBankContextId:record.id,
    primaryEvidenceTargetId:args.item.vocabularyId,
    answerForm:'reviewed_surface'
  };
  if (definition.id === 'gap_fill_bank') {
    prompt = 'Choose the word that completes the sentence.';
    extra.options = shuffleAnswerOptions([accepted,...wrong], `${args.seed}:${record.id}:gap-bank`, args.optionNonce);
    extra.wordBank = [...extra.options];
  } else if (definition.id === 'drag_word_sentence') {
    prompt = 'Drag the correct word into the gap.';
    extra.draggables = stableShuffle([accepted,...wrong], `${args.seed}:${record.id}:drag-gap`);
    extra.wordBank = [...extra.draggables];
  } else if (definition.id === 'choose_word_sentence') {
    prompt = 'Which word best completes this sentence?';
    extra.options = shuffleAnswerOptions([accepted,...wrong], `${args.seed}:${record.id}:sentence-choice`, args.optionNonce);
  } else if (definition.id === 'type_missing_word') {
    prompt = 'Type the word or phrase that completes this sentence.';
  }
  return baseActivity({ definition, occurrence:args.occurrence, contentId, contentSource:'language_bank', prompt, markingReference:{ acceptedAnswers:[accepted] }, extra });
}
function retrievalActivity(args, definition) {
  const bankActivity = bankRetrievalActivity(args,definition);
  if (bankActivity) return bankActivity;
  const { context, sourceText, answer, formKey } = blankableContext(args);
  const accepted = answer;
  let prompt = 'Complete the sentence with the target word.';
  const extra = { sourceText, contextId:context.contextId, primaryEvidenceTargetId:args.item.vocabularyId, answerForm:formKey ?? 'exact' };
  if (definition.id === 'gap_fill_bank') {
    prompt = 'Choose the word that completes the sentence.';
    extra.options = shuffleAnswerOptions([accepted, ...surfaceDistractors(args,formKey,3)], `${args.seed}:gap-bank`, args.optionNonce);
    extra.wordBank = [...extra.options];
  } else if (definition.id === 'drag_word_sentence') {
    prompt = 'Drag the correct word into the gap.';
    extra.draggables = stableShuffle([accepted, ...surfaceDistractors(args,formKey,3)], `${args.seed}:drag-gap`);
    extra.wordBank = [...extra.draggables];
  } else if (definition.id === 'choose_word_sentence') {
    prompt = 'Which word best completes this sentence?';
    extra.options = shuffleAnswerOptions([accepted, ...surfaceDistractors(args,formKey,3)], `${args.seed}:sentence-choice`, args.optionNonce);
  } else if (definition.id === 'type_missing_word') {
    prompt = 'Type the word that completes this sentence.';
  }
  return baseActivity({ definition, occurrence:args.occurrence, contentId:context.contextId, contentSource:'context', prompt, markingReference:{ acceptedAnswers:[accepted] }, extra });
}
function spellingActivity(args, definition) {
  const term = text(args.item.term);
  const targetDefinition = definitionFor(args.item,args.occurrence);
  if (!term || !targetDefinition) throw new Error('Spelling activity requires a target word and curated definition.');
  const visible = Array.from(term).map((char,index) => /[A-Za-z]/.test(char) ? (index === 0 ? char : '_') : char).join(' ');
  return baseActivity({ definition, occurrence:args.occurrence, contentId:itemContentId(args), contentSource:'item', prompt:`Type the word that means “${targetDefinition}”.`, markingReference:{ acceptedAnswers:[term] }, extra:{ spellingPattern:visible, primaryEvidenceTargetId:args.item.vocabularyId } });
}
function wordFamilyChoice(args, definition) {
  const record = array(args.unitActivities).find(activity => activity?.contentType === 'writing_set' && activity?.activityData?.taskType === 'word_family' && array(activity.activityData?.linkedVocabularyIds).includes(args.item.vocabularyId));
  if (!record) throw new Error('No curated word-family content is available for this target.');
  const data = object(record.activityData);
  const acceptedAnswers = uniqueText(array(data.acceptedAnswers));
  if (!acceptedAnswers.length) throw new Error('No curated word-family answers are available for this target.');
  const acceptedKeys = new Set(acceptedAnswers.map(value => value.toLocaleLowerCase('en')));
  const pool = uniqueText([...array(args.item.wordFamily), ...array(args.unitItems).flatMap(candidate => array(candidate?.wordFamily))]).filter(value => !acceptedKeys.has(value.toLocaleLowerCase('en')));
  if (pool.length < 2) throw new Error('Word Family Choice requires at least two plausible word-family alternatives.');
  const wrong = stableShuffle(pool, `${args.seed}:family-alternatives`).slice(0,3);
  const options = shuffleAnswerOptions([acceptedAnswers[0], ...wrong], `${args.seed}:family-options`, args.optionNonce);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, contentSource:'unit_activity', prompt:text(data.prompt) || 'Choose the correct word-family form.', markingReference:{ acceptedAnswers }, extra:{ options, sourceText:text(data.sourceText) || null, activityContentId:record.activityContentId, taskType:'word_family', primaryEvidenceTargetId:data.primaryEvidenceTargetId ?? args.item.vocabularyId } });
}

const BUILDERS = Object.freeze({ definition_to_word:definitionToWord, word_definition_match:matchingActivity, drag_word_definition:matchingActivity, drag_definition_word:matchingActivity, gap_fill_bank:retrievalActivity, drag_word_sentence:retrievalActivity, type_missing_word:retrievalActivity, spell_word:spellingActivity, choose_word_sentence:retrievalActivity, word_family_choice:wordFamilyChoice });

export function buildFoundationalActivity({ activityType, occurrence, item, contexts = [], unitActivities = [], unitItems = [], unitContexts = [], unitOccurrences = [], mastery = {}, readinessStage = null, usedContentIds = [], seed = '', optionNonce = '', matchingPresentation = false } = {}) {
  if (!FOUNDATIONAL_ACTIVITY_TYPES.has(activityType)) throw new Error('Not a foundational vocabulary activity type.');
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition(activityType);
  if (!definition || !isActivityLive(definition.id)) throw new Error('Foundational vocabulary activity is unavailable.');
  assertReady(definition, mastery, readinessStage);
  const builder = BUILDERS[definition.id];
  if (!builder) throw new Error(`No foundational builder exists for ${definition.id}.`);
  return builder({ activityType, occurrence, item, contexts, unitActivities, unitItems, unitContexts, unitOccurrences, mastery, usedContentIds, seed, optionNonce, matchingPresentation }, definition);
}
