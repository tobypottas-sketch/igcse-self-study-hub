// Presentation-only stage variants. The question type and marking never change (so the server contract is untouched).
// Stage Contract v2: Mastery tasks are their own activity types (gloss_in_context_type, type_in_passage, family_multi_form,
// upgrade_passage), so no Mastery variant is needed here. What remains:
//   Word Families  Apply: drag a form into the gap       Recall: type it, first letter and length only
//   Context        Recall: type it, first letter and length only
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
    // Recall help is capped at the first letter and the length (Stage Contract v2). The form being asked for is never shown.
    const clue = typedClue(firstAnswer(question));
    return clue ? { ...question, clue, stageVariant:'recall-clue' } : question;
  }
  if (pathwayId === 'context' && servedStage === 'recall' && type === 'type_missing_word') {
    const clue = typedClue(firstAnswer(question));
    return clue ? { ...question, clue, stageVariant:'recall-clue' } : question;
  }
  return question;
}
