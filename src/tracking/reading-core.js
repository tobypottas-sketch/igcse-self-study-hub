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

export function buildReadingNotesResult({ paper, exerciseIndex, score, maxScore }) {
  const exercise = paper?.exercises?.[exerciseIndex];
  if (!exercise || exercise.type !== 'notes') throw new Error('Invalid Reading notes exercise.');
  return {
    app_key: 'reading',
    event_type: 'exercise_result',
    activity_id: `${paper.id}:exercise${exerciseIndex + 1}`,
    skill: exercise.skill,
    set_id: paper.id,
    mode: 'practice',
    strong: score === maxScore,
    score,
    max_score: maxScore,
    metadata: { question_type: 'notes' }
  };
}
