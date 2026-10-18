import { activityDefinition, isActivityLive } from './activity-catalogue.js';
import { isSpotMeaningChangeReady, spotMeaningChangeDistractorIndexes, spotMeaningChangeMarking, spotMeaningChangeSameMeaningRewrites } from '../../supabase/functions/_shared/vocabulary-engine.js';

const STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function words(value) { return text(value).split(/\s+/).filter(Boolean).length; }
function uniqueText(values) {
  const seen = new Set();
  const output = [];
  for (const value of values) {
    const candidate = text(value);
    const key = candidate.toLocaleLowerCase('en');
    if (!candidate || seen.has(key)) continue;
    seen.add(key);
    output.push(candidate);
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
function rankedByLength(values, reference, seed) {
  const targetWords = words(reference);
  return stableShuffle(uniqueText(values), seed).sort((a,b) => Math.abs(words(a) - targetWords) - Math.abs(words(b) - targetWords));
}
function senseFor(item, occurrence) { return array(item?.senses).find(sense => sense?.senseId === occurrence?.senseId) ?? array(item?.senses)[0] ?? {}; }
function stageOf(mastery) {
  const status = text(mastery?.status).toLocaleLowerCase('en');
  return STAGE_ORDER[status] == null ? 'new' : status;
}
function assertReady(definition, mastery, readinessStage = null) {
  const actual = stageOf(mastery);
  const stage = readinessStage && STAGE_ORDER[readinessStage] != null ? readinessStage : actual;
  if (STAGE_ORDER[stage] < STAGE_ORDER[definition.minimumStage]) throw new Error(`Learner is not ready for ${definition.label}; use a supported ${actual} activity first.`);
}
function linkedToTarget(activity, vocabularyId) {
  const linked = array(object(activity?.activityData).linkedVocabularyIds);
  return linked.length === 0 || linked.includes(vocabularyId);
}
function chooseUnitActivity(unitActivities, contentType, vocabularyId, usedContentIds, seed) {
  const used = new Set(array(usedContentIds));
  let candidates = array(unitActivities).filter(activity => activity?.contentType === contentType && linkedToTarget(activity, vocabularyId));
  if (!candidates.length) candidates = array(unitActivities).filter(activity => activity?.contentType === contentType);
  if (!candidates.length) throw new Error(`No curated ${contentType} content is available for this activity.`);
  const unused = candidates.filter(activity => !used.has(activity.activityContentId));
  if (unused.length) candidates = unused;
  return stableShuffle(candidates, `${seed}:${contentType}:${vocabularyId}`)[0];
}
function chooseWritingActivity(unitActivities, taskType, vocabularyId, usedContentIds, seed) {
  const used = new Set(array(usedContentIds));
  let candidates = array(unitActivities).filter(activity => {
    if (activity?.contentType !== 'writing_set' || activity?.activityData?.taskType !== taskType) return false;
    return array(activity.activityData?.linkedVocabularyIds).includes(vocabularyId);
  });
  if (!candidates.length) throw new Error(`No curated ${taskType} content is available for this target.`);
  const unused = candidates.filter(activity => !used.has(activity.activityContentId));
  if (unused.length) candidates = unused;
  return stableShuffle(candidates, `${seed}:writing_set:${taskType}:${vocabularyId}`)[0];
}
function chooseContext(contexts, preferredTypes, usedContentIds, seed) {
  const used = new Set(array(usedContentIds));
  let candidates = array(contexts).filter(context => preferredTypes.includes(context?.type));
  if (!candidates.length) candidates = array(contexts);
  if (!candidates.length) throw new Error('No curated vocabulary context is available for this activity.');
  const unused = candidates.filter(context => !used.has(context.contextId));
  if (unused.length) candidates = unused;
  return stableShuffle(candidates, `${seed}:context:${preferredTypes.join(',')}`)[0];
}
function meaningChoices(item, sense, accepted = []) {
  return { correct:uniqueText([...accepted, sense?.meaning, ...array(sense?.acceptedParaphrases)]), wrong:uniqueText(array(sense?.misleadingDistractors)) };
}
function unitMeaningDistractors(args, correct) {
  const currentPos = text(args.item?.partOfSpeech).toLocaleLowerCase('en');
  const samePos = [];
  const others = [];
  for (const candidate of array(args.unitItems)) {
    if (!candidate || candidate.vocabularyId === args.item.vocabularyId) continue;
    const bucket = text(candidate.partOfSpeech).toLocaleLowerCase('en') === currentPos ? samePos : others;
    for (const sense of array(candidate.senses)) bucket.push(...array(sense?.acceptedParaphrases));
    if (words(candidate.coreMeaning) <= 8) bucket.push(candidate.coreMeaning);
  }
  const fallback = array(senseFor(args.item, args.occurrence).misleadingDistractors);
  return rankedByLength([...samePos, ...others, ...fallback].filter(value => text(value).toLocaleLowerCase('en') !== text(correct).toLocaleLowerCase('en')), correct, `${args.seed}:meaning-pool`);
}
function occurrenceOwner(args, context) {
  const occurrence = array(args.unitOccurrences).find(row => row.occurrenceId === context?.occurrenceId);
  if (!occurrence) return null;
  return array(args.unitItems).find(row => row.vocabularyId === occurrence.vocabularyId) ?? null;
}
function unitSituationDistractors(args, correct) {
  const term = text(args.item.term).toLocaleLowerCase('en');
  const currentPos = text(args.item.partOfSpeech).toLocaleLowerCase('en');
  const samePos = [];
  const others = [];
  for (const context of array(args.unitContexts)) {
    if (!['paraphrase_context','production_context'].includes(context?.type)) continue;
    if (context.occurrenceId === args.occurrence.occurrenceId) continue;
    const candidate = text(context.text);
    const lower = candidate.toLocaleLowerCase('en');
    if (!candidate || words(candidate) < 6 || lower.includes(term) || lower === text(correct).toLocaleLowerCase('en')) continue;
    const owner = occurrenceOwner(args, context);
    const bucket = owner && text(owner.partOfSpeech).toLocaleLowerCase('en') === currentPos ? samePos : others;
    bucket.push(candidate);
  }
  return rankedByLength([...samePos, ...others], correct, `${args.seed}:situation-pool`);
}
function sourceFragments(sourceText) {
  const source = text(sourceText);
  const fragments = [];
  for (const sentence of source.split(/[.!?]+/).map(text).filter(Boolean)) {
    fragments.push(sentence);
    fragments.push(...sentence.split(/[,;:]/).map(text));
    fragments.push(...sentence.split(/\s+(?:but|and|although|because|so that|instead)\s+/i).map(text));
  }
  return uniqueText(fragments).filter(fragment => words(fragment) >= 3 && source.toLocaleLowerCase('en').includes(fragment.toLocaleLowerCase('en')));
}
function baseActivity({ definition, occurrence, contentId, prompt, markingReference = {}, extra = {} }) {
  return {
    activityId:`${occurrence?.occurrenceId ?? 'unit'}:${contentId}:${definition.id}`,
    type:definition.id, responseMode:definition.responseMode, skillFamily:definition.skillFamily,
    strands:[...definition.strands], evidenceStrength:definition.evidenceStrength, productive:definition.productive,
    vocabularyId:occurrence?.vocabularyId ?? null, occurrenceId:occurrence?.occurrenceId ?? null,
    contentId, prompt, markingReference, ...extra
  };
}

function meaningMatch(args, definition) {
  const { item, occurrence, contexts, seed } = args;
  const sense = senseFor(item, occurrence);
  const context = chooseContext(contexts, ['meaning_context'], args.usedContentIds, seed);
  const answers = meaningChoices(item, sense, context.acceptedAnswers);
  const correct = text(context.acceptedAnswers?.[0] ?? sense.acceptedParaphrases?.[0] ?? sense.meaning ?? item.coreMeaning);
  const unitDistractors = unitMeaningDistractors(args, correct);
  const wrong = unitDistractors.length >= 3 ? unitDistractors.slice(0,3) : rankedByLength([...unitDistractors, ...answers.wrong], correct, `${seed}:meaning-fallback`).slice(0,3);
  if (wrong.length < 3) throw new Error('Meaning Match requires three comparable curated distractors.');
  const options = stableShuffle([correct, ...wrong], `${seed}:meaning-options`);
  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:`What does “${text(item.term)}” mean in this context?\n${text(context.text)}`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });
}
function whichSituationFits(args, definition) {
  const { item, occurrence, contexts, unitActivities, seed } = args;
  const context = chooseContext(contexts, ['paraphrase_context','production_context'], args.usedContentIds, seed);
  const term = text(item.term).toLocaleLowerCase('en');
  const correct = text(context.text);
  if (!correct || correct.toLocaleLowerCase('en').includes(term)) throw new Error('Which Situation Fits requires a target-free curated situation.');

  let wrong = unitSituationDistractors(args, correct).slice(0,3);
  if (wrong.length < 3) {
    const alternatives = [];
    for (const activity of array(unitActivities)) {
      if (activity?.contentType !== 'idea_set') continue;
      const data = object(activity.activityData);
      alternatives.push(...array(data.accurateParaphrases));
      alternatives.push(...array(data.distractors).map(row => row?.text));
    }
    const fallback = rankedByLength(alternatives.filter(candidate => {
      const lower = text(candidate).toLocaleLowerCase('en');
      return lower !== correct.toLocaleLowerCase('en') && !lower.includes(term) && words(candidate) >= 6;
    }), correct, `${seed}:situations:fallback`);
    wrong = uniqueText([...wrong, ...fallback]).slice(0,3);
  }
  if (wrong.length < 3) throw new Error('Which Situation Fits requires three full-sentence curated distractors.');
  const options = stableShuffle([correct, ...wrong], `${seed}:situations`);
  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:`Which situation best shows the meaning of “${text(item.term)}”?`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });
}
function meaningInContext(args, definition) {
  const { item, occurrence, contexts, seed } = args;
  const sense = senseFor(item, occurrence);
  const context = chooseContext(contexts, ['meaning_context','paraphrase_context'], args.usedContentIds, seed);
  const correct = text(context.acceptedAnswers?.[0] ?? sense.acceptedParaphrases?.[0] ?? sense.meaning);
  const unitDistractors = unitMeaningDistractors(args, correct);
  const wrong = unitDistractors.length >= 3 ? unitDistractors.slice(0,3) : rankedByLength([...unitDistractors, ...array(sense.misleadingDistractors)], correct, `${seed}:meaning-context-fallback`).slice(0,3);
  if (wrong.length < 3) throw new Error('Meaning in Context requires three comparable curated distractors.');
  const options = stableShuffle([correct, ...wrong], `${seed}:meaning-context`);
  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:`In this sentence, which meaning best fits “${text(item.term)}”?\n${text(context.text)}`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });
}
function correctUsage(args, definition) {
  const { item, occurrence, contexts, unitActivities, seed } = args;
  const correctContext = chooseContext(contexts, ['meaning_context','production_context'], args.usedContentIds, seed);
  const linkedIdea = array(unitActivities).find(activity => activity.contentType === 'idea_set' && linkedToTarget(activity, item.vocabularyId));
  const distractors = linkedIdea ? array(linkedIdea.activityData?.distractors).map(row => row?.text) : [];
  const fallback = senseFor(item, occurrence).misleadingDistractors ?? [];
  const options = stableShuffle(uniqueText([correctContext.text, ...distractors, ...fallback]).slice(0,4), `${seed}:usage`);
  return baseActivity({ definition, occurrence, contentId:correctContext.contextId, prompt:`Which option uses “${text(item.term)}” accurately?`, markingReference:{ acceptedAnswers:[text(correctContext.text)] }, extra:{ options, contextId:correctContext.contextId } });
}
function collocationBuilder(args, definition) {
  const collocation = text(array(args.item.collocations)[0]);
  if (!collocation) throw new Error('No curated collocation is available for this target.');
  const tiles = stableShuffle(collocation.split(/\s+/).filter(Boolean), `${args.seed}:collocation`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:`collocation:${collocation}`, prompt:`Build a natural collocation with “${text(args.item.term)}”.`, markingReference:{ acceptedAnswers:[collocation] }, extra:{ tiles } });
}
function wordFamilySwitch(args, definition) {
  const writing = array(args.unitActivities).find(activity => activity.contentType === 'writing_set' && array(activity.activityData?.linkedVocabularyIds).includes(args.item.vocabularyId) && activity.activityData?.taskType === 'word_family');
  if (!writing) throw new Error('No curated word-family content is available for this target.');
  const data = object(writing.activityData);
  const acceptedAnswers = uniqueText(array(data.acceptedAnswers));
  if (!acceptedAnswers.length) throw new Error('No curated word-family answers are available for this target.');
  return baseActivity({ definition, occurrence:args.occurrence, contentId:writing.activityContentId, prompt:`${text(data.prompt)}\n${text(data.sourceText)}`, markingReference:{ acceptedAnswers }, extra:{ sourceText:text(data.sourceText) || null } });
}
function questionTextActivity(args, definition, findEvidence = false) {
  const record = chooseUnitActivity(args.unitActivities, 'question_text', args.item.vocabularyId, args.usedContentIds, args.seed);
  const data = object(record.activityData);
  const questions = array(data.questions);
  if (!questions.length) throw new Error('Question ↔ Text content has no curated questions.');
  const indexed = questions.map((question,index) => ({ question, index }));
  const selected = stableShuffle(indexed, `${args.seed}:${record.activityContentId}:question`)[0];
  const question = selected.question;
  const evidenceAnswers = uniqueText(array(question.evidenceSpans));
  if (!evidenceAnswers.length) throw new Error('Question ↔ Text content has no curated evidence span.');

  if (findEvidence) {
    const correct = evidenceAnswers[0];
    const rawCandidates = uniqueText([
      ...questions.filter((_,index) => index !== selected.index).flatMap(candidate => array(candidate.evidenceSpans)),
      ...sourceFragments(data.sourceText)
    ]).filter(candidate => {
      const lower = candidate.toLocaleLowerCase('en');
      const answer = correct.toLocaleLowerCase('en');
      return lower !== answer && !lower.includes(answer) && !answer.includes(lower);
    });
    const distractors = rankedByLength(rawCandidates, correct, `${args.seed}:${record.activityContentId}:evidence-pool`).slice(0,3);
    if (distractors.length < 3) throw new Error('Find Evidence requires four exact source-text choices.');
    const evidenceOptions = stableShuffle([correct, ...distractors], `${args.seed}:${record.activityContentId}:evidence`);
    return baseActivity({
      definition, occurrence:args.occurrence, contentId:record.activityContentId,
      prompt:`${text(question.question)} Select the exact evidence from the text.`,
      markingReference:{ acceptedAnswers:evidenceAnswers, paraphraseLinks:array(question.paraphraseLinks) },
      extra:{ activityVariantId:`q${selected.index}`, sourceText:text(data.sourceText), questionText:text(question.question), evidenceOptions }
    });
  }

  const correctQuestion = text(question.question);
  const questionWord = correctQuestion.split(/\s+/)[0]?.toLocaleLowerCase('en') ?? '';
  const sameQuestionWord = [];
  const otherQuestions = [];
  for (const activity of array(args.unitActivities)) {
    if (activity?.contentType !== 'question_text') continue;
    for (const candidate of array(object(activity.activityData).questions)) {
      const candidateText = text(candidate?.question);
      if (!candidateText || candidateText === correctQuestion) continue;
      const firstWord = candidateText.split(/\s+/)[0]?.toLocaleLowerCase('en') ?? '';
      (firstWord === questionWord ? sameQuestionWord : otherQuestions).push(candidateText);
    }
  }
  const distractors = rankedByLength([...sameQuestionWord, ...otherQuestions], correctQuestion, `${args.seed}:${record.activityContentId}:question-options`).slice(0,3);
  if (distractors.length < 3) throw new Error('Question ↔ Text Bridge requires four curated question options.');
  const options = stableShuffle([correctQuestion, ...distractors], `${args.seed}:${record.activityContentId}:bridge`);
  return baseActivity({
    definition, occurrence:args.occurrence, contentId:record.activityContentId,
    prompt:`Which question is asking about the same idea as this source wording?\n“${evidenceAnswers[0]}”`,
    markingReference:{ acceptedAnswers:[correctQuestion], paraphraseLinks:array(question.paraphraseLinks) },
    extra:{ activityVariantId:`q${selected.index}`, sourceText:text(data.sourceText), questionText:correctQuestion, options }
  });
}
function phraseRecord(args) { return chooseUnitActivity(args.unitActivities, 'phrase_set', args.item.vocabularyId, args.usedContentIds, args.seed); }
function phraseMatch(args, definition) {
  const record = phraseRecord(args), data = object(record.activityData);
  const correct = text(data.equivalentPhrase);
  const acceptedAnswers = uniqueText([correct, ...array(data.acceptedVariants)]);
  const ownWrong = uniqueText(array(data.commonMeaningDistortions));
  const pooledWrong = [];
  if (ownWrong.length < 3) {
    for (const activity of array(args.unitActivities)) {
      if (activity?.contentType !== 'phrase_set' || activity.activityContentId === record.activityContentId) continue;
      pooledWrong.push(...array(object(activity.activityData).commonMeaningDistortions));
    }
  }
  const wrong = rankedByLength([...ownWrong, ...pooledWrong].filter(candidate => !acceptedAnswers.includes(text(candidate))), correct, `${args.seed}:${record.activityContentId}:phrase-distractors`).slice(0,3);
  if (wrong.length < 3) throw new Error('Phrase Match requires three phrase-level distractors.');
  const options = stableShuffle([correct, ...wrong], `${args.seed}:${record.activityContentId}:phrase-match`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Which phrase keeps the meaning of “${text(data.originalPhrase)}”?`, markingReference:{ acceptedAnswers }, extra:{ options, sourcePhrase:text(data.originalPhrase) } });
}
function buildParaphrase(args, definition) {
  const record = phraseRecord(args), data = object(record.activityData);
  const acceptedAnswers = uniqueText([data.equivalentPhrase, ...array(data.acceptedVariants)]);
  const tiles = stableShuffle(array(data.chunks).map(text).filter(Boolean), `${args.seed}:${record.activityContentId}:tiles`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Build a paraphrase of “${text(data.originalPhrase)}”.`, markingReference:{ acceptedAnswers }, extra:{ tiles, sourcePhrase:text(data.originalPhrase) } });
}
function completeParaphrase(args, definition) {
  const record = phraseRecord(args), data = object(record.activityData);
  const chunks = array(data.chunks).map(text).filter(Boolean);
  const missing = chunks.at(-1) ?? text(data.equivalentPhrase);
  const stem = chunks.length > 1 ? `${chunks.slice(0,-1).join(' ')} ___` : '___';
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Complete the paraphrase of “${text(data.originalPhrase)}”: ${stem}`, markingReference:{ acceptedAnswers:[missing] }, extra:{ sourcePhrase:text(data.originalPhrase) } });
}
function rewritePhrase(args, definition) {
  const record = phraseRecord(args), data = object(record.activityData);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Rewrite this phrase without changing its meaning: “${text(data.originalPhrase)}”`, markingReference:{ acceptedAnswers:uniqueText([data.equivalentPhrase, ...array(data.acceptedVariants)]) }, extra:{ sourcePhrase:text(data.originalPhrase) } });
}
function ideaRecord(args) { return chooseUnitActivity(args.unitActivities, 'idea_set', args.item.vocabularyId, args.usedContentIds, args.seed); }
function sameIdea(args, definition) {
  const record = ideaRecord(args), data = object(record.activityData);
  const acceptedAnswers = uniqueText(array(data.accurateParaphrases));
  const ownWrong = array(data.distractors).map(row => text(row?.text)).filter(Boolean);
  const pooledWrong = [];
  if (ownWrong.length < 3) {
    for (const activity of array(args.unitActivities)) {
      if (activity?.contentType !== 'idea_set' || activity.activityContentId === record.activityContentId) continue;
      pooledWrong.push(...array(object(activity.activityData).distractors).map(row => row?.text));
    }
  }
  const reference = acceptedAnswers[0] ?? text(data.originalIdea);
  const wrong = rankedByLength([...ownWrong, ...pooledWrong].filter(candidate => !acceptedAnswers.includes(text(candidate))), reference, `${args.seed}:${record.activityContentId}:idea-distractors`).slice(0,3);
  if (wrong.length < 3) throw new Error('Same Idea requires three sentence-level meaning distractors.');
  const options = stableShuffle([reference, ...wrong], `${args.seed}:${record.activityContentId}:same-idea`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Which sentence expresses the same idea as this?\n${text(data.originalIdea)}`, markingReference:{ acceptedAnswers:[reference], meaningInvariants:array(data.meaningInvariants), distractors:array(data.distractors) }, extra:{ options, sourceIdea:text(data.originalIdea) } });
}
function spotMeaningChange(args, definition) {
  const ready = array(args.unitActivities).filter(activity => activity?.contentType === 'idea_set' && isSpotMeaningChangeReady(activity.activityData));
  if (!ready.length) throw new Error('Spot the Meaning Change requires three curated same-meaning rewrites and one curated meaning-change distractor.');
  const record = chooseUnitActivity(ready, 'idea_set', args.item.vocabularyId, args.usedContentIds, args.seed), data = object(record.activityData);
  const seedKey = `${args.seed}:${record.activityContentId}:meaning-change`;
  const [distractorIndex] = stableShuffle(spotMeaningChangeDistractorIndexes(data), `${seedKey}:distractor`);
  const activityVariantId = `q${distractorIndex}`;
  const marking = spotMeaningChangeMarking(data, activityVariantId);
  const sameMeaning = stableShuffle(spotMeaningChangeSameMeaningRewrites(data), `${seedKey}:same-meaning`).slice(0, 3);
  const options = stableShuffle([marking.acceptedAnswers[0], ...sameMeaning], seedKey);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Which rewrite changes the meaning of this idea?\n${text(data.originalIdea)}`, markingReference:{ ...marking, meaningInvariants:array(data.meaningInvariants) }, extra:{ options, activityVariantId, sourceIdea:text(data.originalIdea) } });
}
function buildSameIdea(args, definition) {
  const record = ideaRecord(args), data = object(record.activityData);
  const acceptedAnswers = uniqueText(array(data.accurateParaphrases));
  const target = acceptedAnswers[0];
  const curatedChunks = array(data.chunks).map(text).filter(Boolean);
  const chunks = curatedChunks.length >= 2 ? curatedChunks : target.split(/\s+/).filter(Boolean);
  const tiles = stableShuffle(chunks, `${args.seed}:${record.activityContentId}:idea-tiles`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Build a sentence that keeps the same meaning:\n${text(data.originalIdea)}`, markingReference:{ acceptedAnswers, meaningInvariants:array(data.meaningInvariants) }, extra:{ tiles, sourceIdea:text(data.originalIdea) } });
}
function rewriteIdea(args, definition) {
  const record = ideaRecord(args), data = object(record.activityData);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Rewrite this idea in your own words without changing its meaning:\n${text(data.originalIdea)}`, markingReference:{ acceptedAnswers:uniqueText(array(data.accurateParaphrases)), meaningInvariants:array(data.meaningInvariants), distractors:array(data.distractors) }, extra:{ sourceIdea:text(data.originalIdea) } });
}
function writingActivity(args, definition) {
  const record = chooseWritingActivity(args.unitActivities, 'improve_vocabulary', args.item.vocabularyId, args.usedContentIds, args.seed), data = object(record.activityData);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`${text(data.prompt)}\n${text(data.sourceText)}`, markingReference:{ acceptedAnswers:uniqueText(array(data.acceptedAnswers)) }, extra:{ sourceText:text(data.sourceText), taskType:text(data.taskType) } });
}
function explainAnotherWay(args, definition) {
  let record;
  try { record = phraseRecord(args); } catch { record = ideaRecord(args); }
  const data = object(record.activityData);
  if (record.contentType === 'phrase_set') return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Explain this another way without using exactly the same wording: “${text(data.originalPhrase)}”`, markingReference:{ acceptedAnswers:uniqueText([data.equivalentPhrase, ...array(data.acceptedVariants)]) }, extra:{ sourcePhrase:text(data.originalPhrase) } });
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Explain this idea another way:\n${text(data.originalIdea)}`, markingReference:{ acceptedAnswers:uniqueText(array(data.accurateParaphrases)), meaningInvariants:array(data.meaningInvariants) }, extra:{ sourceIdea:text(data.originalIdea) } });
}

const BUILDERS = Object.freeze({
  meaning_match:meaningMatch, which_situation_fits:whichSituationFits, meaning_in_context:meaningInContext,
  correct_usage:correctUsage, collocation_builder:collocationBuilder, word_family_switch:wordFamilySwitch,
  question_text_bridge:(args,definition) => questionTextActivity(args,definition,false),
  find_evidence:(args,definition) => questionTextActivity(args,definition,true),
  phrase_match:phraseMatch, build_paraphrase:buildParaphrase, complete_paraphrase:completeParaphrase,
  rewrite_phrase:rewritePhrase, same_idea:sameIdea, spot_meaning_change:spotMeaningChange,
  build_same_idea:buildSameIdea, rewrite_idea:rewriteIdea, improve_vocabulary:writingActivity,
  explain_another_way:explainAnotherWay
});

export function buildActivity({ activityType, occurrence, item, contexts = [], unitActivities = [], unitItems = [], unitContexts = [], unitOccurrences = [], mastery = {}, readinessStage = null, usedContentIds = [], seed = '' } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition(activityType);
  if (!definition) throw new Error('Invalid 0511 vocabulary activity type.');
  if (!isActivityLive(definition.id)) throw new Error(`${definition.label} is temporarily unavailable.`);
  assertReady(definition, mastery, readinessStage);
  const builder = BUILDERS[definition.id];
  if (!builder) throw new Error(`No builder exists for ${definition.id}.`);
  return builder({ activityType, occurrence, item, contexts, unitActivities, unitItems, unitContexts, unitOccurrences, mastery, usedContentIds, seed }, definition);
}
