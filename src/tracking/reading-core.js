export function findReadingQuestion(paper, questionId) {
  if (!paper || !Array.isArray(paper.exercises)) return null;
  for (let exerciseIndex = 0; exerciseIndex < paper.exercises.length; exerciseIndex += 1) {
    const exercise = paper.exercises[exerciseIndex];
    if (exercise.type === 'notes') {
      for (const section of exercise.noteSections || []) {
        for (const question of section.bullets || []) {
          if (question.id === questionId) return { exercise, exerciseIndex, question };
        }
      }
    } else {
      for (const question of exercise.questions || []) {
        if (question.id === questionId) return { exercise, exerciseIndex, question };
      }
    }
  }
  return null;
}

export function buildReadingAttempt({ paper, questionId, attemptNumber, correct }) {
  const context = findReadingQuestion(paper, questionId);
  if (!context) throw new Error('Unknown Reading question.');
  const { exercise, question } = context;
  const payload = {
    app_key: 'reading',
    event_type: 'question_attempt',
    activity_id: `${paper.id}:${question.id}`,
    skill: exercise.skill,
    set_id: paper.id,
    mode: 'practice',
    metadata: {
      attempt_number: attemptNumber,
      question_type: exercise.type
    }
  };

  if (exercise.type !== 'notes') {
    payload.strong = Boolean(correct);
    payload.score = correct ? 1 : 0;
    payload.max_score = 1;
    payload.metadata.outcome = correct ? 'correct' : 'try_again';
  }
  return payload;
}

export function buildReadingExamAnswer({ paper, questionId, attemptNumber }) {
  const context = findReadingQuestion(paper, questionId);
  if (!context) throw new Error('Unknown Reading question.');
  const { exercise, question } = context;
  return {
    app_key: 'reading',
    event_type: 'question_answered',
    activity_id: `${paper.id}:${question.id}`,
    skill: exercise.skill,
    set_id: paper.id,
    mode: 'exam',
    metadata: {
      attempt_number: attemptNumber,
      question_type: exercise.type
    }
  };
}

export function buildReadingExamFinalAttempt({ paper, questionId, correct }) {
  const context = findReadingQuestion(paper, questionId);
  if (!context) throw new Error('Unknown Reading question.');
  const { exercise, question } = context;
  if (exercise.type === 'notes') throw new Error('Reading notes use grouped scoring.');
  return {
    app_key: 'reading',
    event_type: 'question_attempt',
    activity_id: `${paper.id}:${question.id}`,
    skill: exercise.skill,
    set_id: paper.id,
    mode: 'exam',
    strong: Boolean(correct),
    score: correct ? 1 : 0,
    max_score: 1,
    metadata: {
      question_type: exercise.type,
      outcome: correct ? 'correct' : 'try_again',
      result_type: 'exam_reconciliation'
    }
  };
}

export function buildReadingNotesResult({ paper, exerciseIndex, score, maxScore, mode = 'practice', resultType }) {
  const exercise = paper?.exercises?.[exerciseIndex];
  if (!exercise || exercise.type !== 'notes') throw new Error('Invalid Reading notes exercise.');
  const metadata = { question_type: 'notes' };
  if (resultType) metadata.result_type = resultType;
  return {
    app_key: 'reading',
    event_type: 'exercise_result',
    activity_id: `${paper.id}:exercise${exerciseIndex + 1}`,
    skill: exercise.skill,
    set_id: paper.id,
    mode,
    strong: score === maxScore,
    score,
    max_score: maxScore,
    metadata
  };
}
