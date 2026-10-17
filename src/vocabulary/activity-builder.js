import { activityDefinition } from './activity-catalogue.js';

const STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });

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
  const options = stableShuffle(uniqueText([correct, ...answers.wrong]).slice(0,4), `${seed}:meaning-options`);
  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:`What does “${text(item.term)}” mean in this context?\n${text(context.text)}`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });
}
function whichSituationFits(args, definition) {
  const { item, occurrence, contexts, unitActivities, seed } = args;
  const context = chooseContext(contexts, ['paraphrase_context'], args.usedContentIds, seed);
  const term = text(item.term).toLocaleLowerCase('en');
  const correct = text(context.text);
  if (!correct || correct.toLocaleLowerCase('en').includes(term)) throw new Error('Which Situation Fits requires a target-free curated situation.');

  const alternatives = [];
  for (const activity of array(unitActivities)) {
    if (activity?.contentType !== 'idea_set') continue;
    const data = object(activity.activityData);
    alternatives.push(...array(data.accurateParaphrases));
    alternatives.push(...array(data.distractors).map(row => row?.text));
  }
  const sentenceAlternatives = uniqueText(alternatives).filter(candidate => {
    const lower = candidate.toLocaleLowerCase('en');
    return lower !== correct.toLocaleLowerCase('en') && !lower.includes(term) && candidate.split(/\s+/).length >= 5;
  });
  const wrong = stableShuffle(sentenceAlternatives, `${seed}:situations:wrong`).slice(0,3);
  if (wrong.length < 3) throw new Error('Which Situation Fits requires three full-sentence curated distractors.');
  const options = stableShuffle([correct, ...wrong], `${seed}:situations`);
  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:`Which situation best shows the meaning of “${text(item.term)}”?`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });
}
function meaningInContext(args, definition) {
  const { item, occurrence, contexts, seed } = args;
  const sense = senseFor(item, occurrence);
  const context = chooseContext(contexts, ['meaning_context','paraphrase_context'], args.usedContentIds, seed);
  const correct = text(context.acceptedAnswers?.[0] ?? sense.acceptedParaphrases?.[0] ?? sense.meaning);
  const options = stableShuffle(uniqueText([correct, ...array(sense.misleadingDistractors)]).slice(0,4), `${seed}:meaning-context`);
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
  const writing = array(args.unitActivities).find(activity => activity.contentType === 'writing_set' && linkedToTarget(activity, args.item.vocabularyId) && activity.activityData?.taskType === 'word_family');
  const family = uniqueText(array(args.item.wordFamily));
  if (!writing && family.length === 0) throw new Error('No curated word-family material is available for this target.');
  const data = object(writing?.activityData);
  const acceptedAnswers = uniqueText(array(data.acceptedAnswers).length ? data.acceptedAnswers : family);
  const prompt = writing ? `${text(data.prompt)}\n${text(data.sourceText)}` : `Use the correct form from the “${text(args.item.term)}” word family.`;
  return baseActivity({ definition, occurrence:args.occurrence, contentId:writing?.activityContentId ?? `word-family:${args.item.vocabularyId}`, prompt, markingReference:{ acceptedAnswers }, extra:{ sourceText:text(data.sourceText) || null } });
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
    const evidenceOptions = stableShuffle(uniqueText([
      ...evidenceAnswers,
      ...questions.filter((_,index) => index !== selected.index).flatMap(candidate => array(candidate.evidenceSpans))
    ]), `${args.seed}:${record.activityContentId}:evidence`);
    return baseActivity({
      definition, occurrence:args.occurrence, contentId:record.activityContentId,
      prompt:`${text(question.question)} Select the exact evidence from the text.`,
      markingReference:{ acceptedAnswers:evidenceAnswers, paraphraseLinks:array(question.paraphraseLinks) },
      extra:{ activityVariantId:`q${selected.index}`, sourceText:text(data.sourceText), questionText:text(question.question), evidenceOptions }
    });
  }

  const correctQuestion = text(question.question);
  const questionPool = [];
  for (const activity of array(args.unitActivities)) {
    if (activity?.contentType !== 'question_text') continue;
    for (const candidate of array(object(activity.activityData).questions)) questionPool.push(candidate?.question);
  }
  const distractors = stableShuffle(uniqueText(questionPool).filter(candidate => candidate !== correctQuestion), `${args.seed}:${record.activityContentId}:question-options`).slice(0,3);
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
  const options = stableShuffle(uniqueText([correct, ...array(data.commonMeaningDistortions)]).slice(0,4), `${args.seed}:${record.activityContentId}:phrase-match`);
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
  const options = stableShuffle(uniqueText([...acceptedAnswers, ...array(data.distractors).map(row => text(row?.text))]).slice(0,4), `${args.seed}:${record.activityContentId}:same-idea`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Which sentence expresses the same idea as this?\n${text(data.originalIdea)}`, markingReference:{ acceptedAnswers, meaningInvariants:array(data.meaningInvariants), distractors:array(data.distractors) }, extra:{ options, sourceIdea:text(data.originalIdea) } });
}
function spotMeaningChange(args, definition) {
  const record = ideaRecord(args), data = object(record.activityData);
  const inaccurate = array(data.distractors).map(row => text(row?.text)).filter(Boolean);
  const accurate = uniqueText(array(data.accurateParaphrases));
  const options = stableShuffle(uniqueText([...accurate, ...inaccurate]).slice(0,4), `${args.seed}:${record.activityContentId}:meaning-change`);
  return baseActivity({ definition, occurrence:args.occurrence, contentId:record.activityContentId, prompt:`Which rewrite changes the meaning of this idea?\n${text(data.originalIdea)}`, markingReference:{ acceptedAnswers:inaccurate, meaningInvariants:array(data.meaningInvariants), distractors:array(data.distractors) }, extra:{ options, sourceIdea:text(data.originalIdea) } });
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
  const record = chooseUnitActivity(args.unitActivities, 'writing_set', args.item.vocabularyId, args.usedContentIds, args.seed), data = object(record.activityData);
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

export function buildActivity({ activityType, occurrence, item, contexts = [], unitActivities = [], mastery = {}, readinessStage = null, usedContentIds = [], seed = '' } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition(activityType);
  if (!definition) throw new Error('Invalid 0511 vocabulary activity type.');
  assertReady(definition, mastery, readinessStage);
  const builder = BUILDERS[definition.id];
  if (!builder) throw new Error(`No builder exists for ${definition.id}.`);
  return builder({ activityType, occurrence, item, contexts, unitActivities, mastery, usedContentIds, seed }, definition);
}
