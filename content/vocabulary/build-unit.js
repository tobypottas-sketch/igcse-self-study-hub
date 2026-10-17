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

function context({ contextId, vocabularyId, occurrenceId, senseId, type, text: contextText, targetRewrite = null, acceptedAnswers, status }) {
  return {
    contextId,
    vocabularyId,
    occurrenceId,
    senseId,
    type,
    text:text(contextText),
    ...(targetRewrite ? { targetRewrite:text(targetRewrite) } : {}),
    acceptedAnswers:array(acceptedAnswers).map(text).filter(Boolean),
    status
  };
}

export function buildCuratedUnit({ unitNumber, unitTitle, status = 'draft', source = '', entries = [], activities = [] } = {}) {
  const title = text(unitTitle);
  const unit = {
    unitNumber:Number(unitNumber),
    unitTitle:title,
    status,
    source:text(source),
    items:[],
    occurrences:[],
    contexts:[],
    activities:[...array(activities)]
  };

  entries.forEach((entry, index) => {
    const position = index + 1;
    const term = text(entry.term);
    const key = slug(term);
    const vocabularyId = `vocab_${key}`;
    const senseId = `${key}_1`;
    const occurrenceId = `u${unitNumber}_${String(position).padStart(2, '0')}_${key}`;
    const meaningId = `${occurrenceId}_meaning`;
    const paraphraseId = `${occurrenceId}_paraphrase`;
    const productionId = `${occurrenceId}_production`;
    const paraphrases = array(entry.paraphrases).map(text).filter(Boolean);
    const distractors = array(entry.distractors).map(text).filter(Boolean);
    const sense = {
      senseId,
      meaning:text(entry.meaning),
      acceptedParaphrases:paraphrases,
      contextDependentParaphrases:array(entry.contextDependentParaphrases),
      misleadingDistractors:distractors,
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
      status
    });

    unit.occurrences.push({
      occurrenceId,
      vocabularyId,
      unitNumber:Number(unitNumber),
      unitTitle:title,
      setNumber:Math.floor(index / 10) + 1,
      positionInUnit:position,
      senseId,
      contextIds:[meaningId, paraphraseId, productionId],
      status
    });

    unit.contexts.push(
      context({
        contextId:meaningId,
        vocabularyId,
        occurrenceId,
        senseId,
        type:'meaning_context',
        text:entry.meaningSentence,
        acceptedAnswers:[paraphrases[0]],
        status
      }),
      context({
        contextId:paraphraseId,
        vocabularyId,
        occurrenceId,
        senseId,
        type:'paraphrase_context',
        text:entry.paraphrase?.sentence,
        targetRewrite:entry.paraphrase?.source,
        acceptedAnswers:[term],
        status
      }),
      context({
        contextId:productionId,
        vocabularyId,
        occurrenceId,
        senseId,
        type:'production_context',
        text:entry.production?.sentence,
        targetRewrite:entry.production?.source,
        acceptedAnswers:[term],
        status
      })
    );
  });

  return unit;
}
