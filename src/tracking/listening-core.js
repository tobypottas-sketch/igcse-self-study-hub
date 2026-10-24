const SECTION_SKILLS = {
  ex1: { key:'listening_short_extracts', label:'Short extracts' },
  ex2: { key:'listening_dialogues', label:'Dialogues' },
  ex3: { key:'listening_long_talk', label:'Long talk' },
  ex4: { key:'listening_speaker_matching', label:'Speaker matching' },
  ex5: { key:'listening_interview', label:'Interview' }
};

function sectionInfo(sectionId) {
  const info = SECTION_SKILLS[sectionId];
  if (!info) throw new Error('Invalid Listening section.');
  return info;
}

function questionActivityId(sectionId, questionNumber) {
  return `listening:${sectionId}:q${Number(questionNumber)}`;
}

export function buildListeningAttempt({ sectionId, questionNumber, mode='practice', attemptNumber=1, correct }) {
  const info = sectionInfo(sectionId);
  const hasResult = typeof correct === 'boolean';
  const payload = {
    app_key:'listening',
    event_type:mode === 'exam' && !hasResult ? 'question_answered' : 'question_attempt',
    activity_id:questionActivityId(sectionId, questionNumber),
    skill:info.label,
    set_id:sectionId,
    mode,
    metadata:{
      attempt_number:attemptNumber,
      question_type:info.key,
      section_id:sectionId
    }
  };

  if (hasResult) {
    payload.strong = correct;
    payload.score = correct ? 1 : 0;
    payload.max_score = 1;
    payload.metadata.outcome = correct ? 'correct' : 'try_again';
  }
  return payload;
}

export function buildListeningExamResult({ sectionId, questionNumber, correct }) {
  const info = sectionInfo(sectionId);
  return {
    app_key:'listening',
    event_type:'question_attempt',
    activity_id:`${questionActivityId(sectionId, questionNumber)}:final`,
    skill:info.label,
    set_id:sectionId,
    mode:'exam',
    strong:Boolean(correct),
    score:correct ? 1 : 0,
    max_score:1,
    metadata:{
      question_type:info.key,
      section_id:sectionId,
      result_type:'exam_reconciliation',
      outcome:correct ? 'correct' : 'try_again'
    }
  };
}

export function buildListeningSupportEvent({ sectionId, supportType='transcript', mode='practice' }) {
  sectionInfo(sectionId);
  return {
    app_key:'listening',
    event_type:'support_use',
    activity_id:`listening:${sectionId}:support:${supportType}`,
    set_id:sectionId,
    mode,
    metadata:{ section_id:sectionId, support_type:supportType }
  };
}

export function buildListeningSectionEvent({ sectionId, mode='practice' }) {
  const info = sectionInfo(sectionId);
  return {
    app_key:'listening',
    event_type:'section_use',
    activity_id:`listening:${sectionId}`,
    skill:info.label,
    set_id:sectionId,
    mode,
    metadata:{ section_id:sectionId }
  };
}

export function listeningSkillForSection(sectionId) {
  return sectionInfo(sectionId);
}
