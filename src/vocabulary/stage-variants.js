// Presentation-only stage variants. The question type and marking never change (so the server contract is untouched);
// only how the same kind of question is *presented* differs, so each stage feels like a different task:
//   Word Families  Recognise: choose a form   -> Apply: drag a form into the gap
//                  Recall: type it, with the related forms shown as a clue -> Mastery: type it, no clue
//   Context        Recall: type it, with a first-letter clue                 -> Mastery: type it, no clue
const array = value => Array.isArray(value) ? value : [];

function firstAnswer(question) {
  return String(array(question?.markingReference?.acceptedAnswers)[0] ?? '').trim();
}

function typedClue(answer) {
  const words = answer.split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  if (words.length > 1) return `Clue: ${words.length} words, starting with “${words[0][0]}”.`;
  return `Clue: starts with “${answer[0]}” · ${answer.length} letters.`;
}

export function applyStageVariant(question, { pathwayId, servedStage, item } = {}) {
  if (!question || typeof question !== 'object') return question;
  const type = question.type;
  if (pathwayId === 'word_families' && servedStage === 'apply' && type === 'word_family_choice' && array(question.options).length >= 2 && /_{2,}/.test(String(question.sourceText ?? ''))) {
    return { ...question, responseMode:'drag_gap', draggables:[...question.options], wordBank:[...question.options], prompt:'Drag the correct form into the gap.', stageVariant:'apply-drag' };
  }
  if (pathwayId === 'word_families' && servedStage === 'recall' && type === 'word_family_switch') {
    // Show the family's OTHER forms only: the form being asked for must never appear on screen.
    const accepted = new Set(array(question?.markingReference?.acceptedAnswers).map(form => String(form).trim().toLocaleLowerCase('en')));
    const others = [...new Set([item?.term, ...array(item?.wordFamily)].map(form => String(form ?? '').trim()).filter(form => form && !accepted.has(form.toLocaleLowerCase('en'))))];
    return others.length >= 1 ? { ...question, clue:`Related forms: ${others.join(' · ')}`, stageVariant:'recall-forms' } : question;
  }
  if (pathwayId === 'context' && servedStage === 'recall' && type === 'type_missing_word') {
    const clue = typedClue(firstAnswer(question));
    return clue ? { ...question, clue, stageVariant:'recall-clue' } : question;
  }
  if ((pathwayId === 'word_families' && servedStage === 'mastery' && type === 'word_family_switch') || (pathwayId === 'context' && servedStage === 'mastery' && type === 'type_missing_word')) {
    return { ...question, stageVariant:'mastery-no-clue' };
  }
  return question;
}
