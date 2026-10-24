function text(value) {
  return String(value ?? '').trim();
}

function slug(value) {
  return text(value)
    .toLocaleLowerCase('en')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function context({ contextId, vocabularyId, occurrenceId, senseId, type, text: contextText, targetRewrite = null, acceptedAnswers, status, grammarPattern = null }) {
  return {
    contextId,
    vocabularyId,
    occurrenceId,
    senseId,
    type,
    text:text(contextText),
    ...(targetRewrite ? { targetRewrite:text(targetRewrite) } : {}),
    ...(grammarPattern ? { grammarPattern:text(grammarPattern) } : {}),
    acceptedAnswers:array(acceptedAnswers).map(text).filter(Boolean),
    status
  };
}

function buildableActivity(activity) {
  const data = activity?.activityData && typeof activity.activityData === 'object' ? activity.activityData : {};
  if (activity?.contentType === 'idea_set') {
    const linkedVocabularyIds = array(data.linkedVocabularyIds).map(text).filter(Boolean);
    if (linkedVocabularyIds.length === 1 && !text(data.primaryEvidenceTargetId)) {
      return { ...activity, activityData:{ ...data, primaryEvidenceTargetId:linkedVocabularyIds[0] } };
    }
    return activity;
  }
  if (activity?.contentType !== 'phrase_set') return activity;
  const chunks = array(data.chunks).map(text).filter(Boolean);
  if (chunks.length >= 2) return activity;

  const originalPhrase = text(data.originalPhrase);
  const equivalentPhrase = text(data.equivalentPhrase);
  const sourceChunks = originalPhrase.split(/\s+/).map(text).filter(Boolean);
  if (sourceChunks.length < 2 || !equivalentPhrase) return activity;

  return {
    ...activity,
    activityData:{ ...data, originalPhrase:equivalentPhrase, equivalentPhrase:originalPhrase, chunks:sourceChunks }
  };
}

// Entries without hand-written gap-fill records get one derived from the teacher-approved meaning sentence, so a blank is
// only ever cut from a real sentence in which the target already appears (answer = the exact form used in that sentence).
function deriveRetrievalContexts({ term, grammarForms = {}, meaningSentence }) {
  const sentence = text(meaningSentence);
  if (!sentence) return [];
  const forms = [...new Set([...Object.values(object(grammarForms)).map(text), text(term)].filter(Boolean))]
    .sort((a,b) => b.length - a.length);
  for (const form of forms) {
    const escaped = form.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const match = new RegExp(`(^|[^A-Za-z])(${escaped})(?=$|[^A-Za-z])`,'i').exec(sentence);
    if (match) return [{ id:'meaning_sentence', text:sentence, target:match[2], grammarPattern:'' }];
  }
  return [];
}

// Reviewed gap-fill options are authored per entry as { id, answer, wrong } where id is the id of one of the entry's gap sentences.
// They are published on the sense keyed by the sentence's stable context id, and an id that matches no sentence is an authoring error.
function reviewedGapRows(entry, occurrenceId, gapContextIds) {
  return array(entry.gapDistractors).map(row => {
    const contextId = `${occurrenceId}_gap_${slug(row?.id)}`;
    if (!gapContextIds.has(contextId)) throw new Error(`${entry.term}: reviewed gap distractors reference "${row?.id}", which is not one of its gap-fill sentences.`);
    return { contextId, answer:text(row?.answer), wrong:array(row?.wrong).map(text) };
  });
}

// `lexicalSpelling` maps vocabularyId -> reviewed misspellings. Spelling belongs to the lexical item, so every unit that contains
// the word draws on the same list instead of keeping its own copy.
export function buildCuratedUnit({ unitNumber, unitTitle, status = 'draft', source = '', entries = [], activities = [], lexicalSpelling = {} } = {}) {
  const title = text(unitTitle);
  const unit = {
    unitNumber:Number(unitNumber), unitTitle:title, status, source:text(source),
    items:[], occurrences:[], contexts:[], activities:array(activities).map(buildableActivity)
  };

  entries.forEach((entry, index) => {
    const position = index + 1;
    const term = text(entry.term);
    const key = slug(entry.idKey ?? term); // idKey keeps stable ids when a display term is reworded (e.g. leisure -> leisure time)
    const vocabularyId = `vocab_${key}`;
    const senseId = `${key}_1`;
    const occurrenceId = `u${unitNumber}_${String(position).padStart(2, '0')}_${key}`;
    const meaningId = `${occurrenceId}_meaning`;
    const paraphraseId = `${occurrenceId}_paraphrase`;
    const productionId = `${occurrenceId}_production`;
    const paraphrases = array(entry.paraphrases).map(text).filter(Boolean);
    const distractors = array(entry.distractors).map(text).filter(Boolean);
    const grammarForms = object(entry.grammarForms);
    const grammarPatterns = array(entry.grammarPatterns).map(text).filter(Boolean);
    const handWritten = array(entry.retrievalContexts);
    const retrievalContexts = [
      ...(handWritten.length ? handWritten : deriveRetrievalContexts({ term, grammarForms, meaningSentence:entry.meaningSentence })),
      ...array(entry.extraRetrievalContexts)
    ];
    const masteryContexts = array(entry.masteryContexts).slice(0,2).map((record,index) => ({
      contextId:index === 0 ? meaningId : paraphraseId,
      text:text(record?.text),
      meaning:text(record?.meaning),
      ...(array(record?.wrongMeanings).length ? { wrongMeanings:array(record.wrongMeanings).map(text).filter(Boolean) } : {})
    })).filter(record => record.text && record.meaning);
    const gapContextIds = new Set(retrievalContexts.map((record,retrievalIndex) => `${occurrenceId}_gap_${slug(record?.id || String(retrievalIndex + 1))}`));
    const gapRows = reviewedGapRows(entry, occurrenceId, gapContextIds);
    const situationDistractors = array(entry.situationDistractors).map(text);
    const spellingErrors = array(object(lexicalSpelling)[vocabularyId]).map(text).filter(Boolean);
    // Word Families Mastery data (Job 8): authored per-form facts, passed through untouched. NEVER derived from `wordFamily` strings.
    // Context Mastery passages (Job 9): each authored passage is bound to one of the occurrence's own live gap-fill context rows (in order),
    // which is the row an attempt on that passage points at. The passage text itself lives on the sense, like Meaning Mastery contexts.
    const passageContextIds = [...gapContextIds];
    const masteryPassages = array(entry.masteryPassages).map((record,index) => ({
      passageId:`${occurrenceId}_passage_${index + 1}`,
      contextId:passageContextIds[index] ?? '',
      text:text(record?.text),
      answer:text(record?.answer)
    })).filter(record => record.text && record.answer && record.contextId);
    const wordFamilyForms = array(entry.wordFamilyForms).map(row => ({
      form:text(row?.form), partOfSpeech:text(row?.partOfSpeech), example:text(row?.example), pedagogicallyUseful:row?.pedagogicallyUseful === true,
      ...(text(row?.note) ? { note:text(row.note) } : {})
    })).filter(row => row.form);
    const sense = {
      senseId,
      meaning:text(entry.meaning),
      acceptedParaphrases:paraphrases,
      ...(masteryContexts.length ? { masteryContexts } : {}),
      ...(situationDistractors.length ? { situationDistractors } : {}),
      ...(gapRows.length ? { gapDistractors:gapRows } : {}),
      ...(spellingErrors.length ? { spellingErrors } : {}),
      ...(wordFamilyForms.length ? { wordFamilyForms } : {}),
      ...(masteryPassages.length ? { masteryPassages } : {}),
      contextDependentParaphrases:array(entry.contextDependentParaphrases),
      ...(array(entry.wrongParaphrases).length ? { wrongParaphrases:array(entry.wrongParaphrases).map(text).filter(Boolean) } : {}),
      misleadingDistractors:distractors,
      ...(Object.keys(grammarForms).length ? { grammarForms:{ ...grammarForms } } : {}),
      ...(grammarPatterns.length ? { grammarPatterns } : {}),
      ...(entry.teacherNote ? { teacherNote:text(entry.teacherNote) } : {})
    };

    unit.items.push({
      vocabularyId,
      term,
      partOfSpeech:text(entry.partOfSpeech),
      coreMeaning:text(entry.meaning),
      senses:[sense],
      wordFamily:array(entry.wordFamily).map(text).filter(Boolean),
      collocations:array(entry.collocations).map(text).filter(Boolean),
      ...(Object.keys(object(entry.languageBank)).length ? { languageBank:object(entry.languageBank) } : {}),
      status
    });

    const extraContexts = retrievalContexts.map((record,retrievalIndex) => {
      const target = text(record?.target);
      return context({
        contextId:`${occurrenceId}_gap_${slug(record?.id || String(retrievalIndex + 1))}`,
        vocabularyId,
        occurrenceId,
        senseId,
        type:'gap_fill',
        text:record?.text,
        targetRewrite:target,
        acceptedAnswers:[target],
        grammarPattern:record?.grammarPattern,
        status
      });
    });

    unit.occurrences.push({
      occurrenceId,
      vocabularyId,
      unitNumber:Number(unitNumber),
      unitTitle:title,
      setNumber:Math.floor(index / 10) + 1,
      positionInUnit:position,
      senseId,
      contextIds:[meaningId, paraphraseId, productionId, ...extraContexts.map(record => record.contextId)],
      status
    });

    unit.contexts.push(
      context({ contextId:meaningId, vocabularyId, occurrenceId, senseId, type:'meaning_context', text:entry.meaningSentence, acceptedAnswers:[paraphrases[0]], status }),
      context({ contextId:paraphraseId, vocabularyId, occurrenceId, senseId, type:'paraphrase_context', text:entry.paraphrase?.sentence, targetRewrite:entry.paraphrase?.source, acceptedAnswers:[term], status }),
      context({ contextId:productionId, vocabularyId, occurrenceId, senseId, type:'production_context', text:entry.production?.sentence, targetRewrite:entry.production?.source, acceptedAnswers:[term], status }),
      ...extraContexts
    );
  });

  return unit;
}
