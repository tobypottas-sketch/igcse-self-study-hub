import { getSupabaseClient } from '../supabase.js';
import { buildTrackingEvent, shouldCountActiveTime } from './core.js';
import {
  findReadingQuestion,
  buildReadingAttempt,
  buildReadingExamAnswer,
  buildReadingExamFinalAttempt,
  buildReadingNotesResult
} from './reading-core.js';

const FRAME_ID = 'practiceFrame';
const TICK_SECONDS = 30;
const FLUSH_SECONDS = 60;

let client = null;
let enabled = false;
let lastInteractionAt = Date.now();
let activeSeconds = 0;
let timer = null;
let trackedWindow = null;
let profile = null;
const attempts = new Map();
const lastNotesScores = new Map();
const examAnswered = new Set();
const reconciledExamPapers = new Set();

async function send(payload) {
  if (!enabled || !client) return;
  let event;
  try {
    event = buildTrackingEvent(payload);
  } catch (error) {
    console.warn('Self-Study event rejected:', error);
    return;
  }

  try {
    const { error } = await client.from('activity_events').insert(event);
    if (error) console.warn('Self-Study tracking write failed:', error.message || error);
  } catch (error) {
    console.warn('Self-Study tracking unavailable:', error);
  }
}

function track(payload) {
  void send(payload);
}

function nextAttempt(questionId) {
  const next = (attempts.get(questionId) || 0) + 1;
  attempts.set(questionId, next);
  return next;
}

function state(win) {
  try {
    return typeof win.getState === 'function' ? win.getState() : null;
  } catch {
    return null;
  }
}

function studyMode(win) {
  return state(win)?.studyMode === 'exam' ? 'exam' : 'practice';
}

function examSubmitted(win) {
  return Boolean(state(win)?.examSubmitted);
}

function wrapAfter(win, functionName, after) {
  const original = win[functionName];
  if (typeof original !== 'function') return false;
  win[functionName] = function wrappedSelfStudyFunction(...args) {
    const result = original.apply(this, args);
    try {
      after(args);
    } catch (error) {
      console.warn(`Self-Study tracking hook failed for ${functionName}:`, error);
    }
    return result;
  };
  return true;
}

function activePaper(win) {
  return typeof win.activePaper === 'function' ? win.activePaper() : null;
}

function currentAnswer(win, questionId) {
  return state(win)?.answers?.[questionId];
}

function hasAnswer(value) {
  if (Array.isArray(value)) return value.some(item => String(item || '').trim());
  return Boolean(String(value || '').trim());
}

function paperHasAnyAnswer(win) {
  const paper = activePaper(win);
  const st = state(win);
  if (!paper || !st?.answers) return false;
  for (const exercise of paper.exercises || []) {
    if (exercise.type === 'notes') {
      for (const section of exercise.noteSections || []) {
        for (const question of section.bullets || []) {
          if (hasAnswer(st.answers[question.id])) return true;
        }
      }
      continue;
    }
    for (const question of exercise.questions || []) {
      if (hasAnswer(st.answers[question.id])) return true;
    }
  }
  return false;
}

function trackNotesSnapshot(win, paper, exerciseIndex, mode = 'practice', resultType) {
  const exercise = paper?.exercises?.[exerciseIndex];
  if (!exercise || exercise.type !== 'notes' || typeof win.scoreGroupedItemsAnyOrder !== 'function') return;

  let score = 0;
  let maxScore = 0;
  let answered = false;
  for (const section of exercise.noteSections || []) {
    const bullets = section.bullets || [];
    maxScore += bullets.length;
    if (bullets.some(question => hasAnswer(currentAnswer(win, question.id)))) answered = true;
    score += Math.min(win.scoreGroupedItemsAnyOrder(bullets), bullets.length);
  }
  if (!answered) return;

  const key = `${mode}:${paper.id}:${exerciseIndex}`;
  const signature = `${score}/${maxScore}`;
  if (!resultType && lastNotesScores.get(key) === signature) return;
  lastNotesScores.set(key, signature);

  track(buildReadingNotesResult({ paper, exerciseIndex, score, maxScore, mode, resultType }));
}

function trackPracticeAnswer(win, paper, questionId, context) {
  const given = currentAnswer(win, questionId);
  let correct = false;
  if (context.exercise.type !== 'notes' && typeof win.isCorrect === 'function') {
    correct = Boolean(win.isCorrect(context.question, given));
  }

  track(buildReadingAttempt({
    paper,
    questionId,
    attemptNumber: nextAttempt(`${paper.id}:${questionId}`),
    correct
  }));

  if (context.exercise.type === 'notes') {
    trackNotesSnapshot(win, paper, context.exerciseIndex);
  }
}

function trackExamAnswer(win, paper, questionId) {
  if (examSubmitted(win)) return;
  const key = `${paper.id}:${questionId}`;
  if (examAnswered.has(key)) return;
  examAnswered.add(key);
  track(buildReadingExamAnswer({
    paper,
    questionId,
    attemptNumber: nextAttempt(`exam:${key}`)
  }));
}

function trackAnswer(win, questionId) {
  const paper = activePaper(win);
  if (!paper) return;
  const context = findReadingQuestion(paper, questionId);
  if (!context) return;

  if (studyMode(win) === 'exam') {
    trackExamAnswer(win, paper, questionId);
    return;
  }
  trackPracticeAnswer(win, paper, questionId, context);
}

function trackExamSubmission(win) {
  const paper = activePaper(win);
  if (!paper || studyMode(win) !== 'exam' || !examSubmitted(win)) return;
  if (reconciledExamPapers.has(paper.id)) return;
  reconciledExamPapers.add(paper.id);

  paper.exercises.forEach((exercise, exerciseIndex) => {
    if (exercise.type === 'notes') {
      trackNotesSnapshot(win, paper, exerciseIndex, 'exam', 'exam_reconciliation');
      return;
    }
    for (const question of exercise.questions || []) {
      const given = currentAnswer(win, question.id);
      if (!hasAnswer(given)) continue;
      const correct = typeof win.isCorrect === 'function' && Boolean(win.isCorrect(question, given));
      track(buildReadingExamFinalAttempt({ paper, questionId: question.id, correct }));
    }
  });
}

function resetExamTracking(win) {
  const paper = activePaper(win);
  if (!paper) return;
  reconciledExamPapers.delete(paper.id);
  for (const key of [...examAnswered]) {
    if (key.startsWith(`${paper.id}:`)) examAnswered.delete(key);
  }
}

function instrumentChecks(win) {
  if (win.__selfStudyReadingInstrumented) return false;
  win.__selfStudyReadingInstrumented = true;

  const normal = wrapAfter(win, 'saveAnswer', ([questionId]) => trackAnswer(win, questionId));
  const triple = wrapAfter(win, 'saveTripleAnswer', ([questionId]) => trackAnswer(win, questionId));
  const submitted = wrapAfter(win, 'submitExam', () => trackExamSubmission(win));
  wrapAfter(win, 'startNewExamAttempt', () => { if (!paperHasAnyAnswer(win)) resetExamTracking(win); });
  wrapAfter(win, 'setStudyMode', () => { if (!paperHasAnyAnswer(win)) resetExamTracking(win); });

  if (!normal && !triple) {
    win.__selfStudyReadingInstrumented = false;
    throw new Error('Reading answer functions were not found.');
  }
  if (typeof win.submitExam === 'function' && !submitted) {
    console.warn('Self-Study could not attach Reading exam submission tracking.');
  }
  return true;
}

function sendHubContext(win) {
  if (!profile) return;
  win.postMessage({
    type: 'self-study-hub-context',
    storageNamespace: `user-${profile.id}`,
    staffAccess: profile.role === 'teacher' || profile.role === 'admin'
  }, window.location.origin);
}

function seedReadingExamTracking(win) {
  const paper = activePaper(win);
  const st = state(win);
  if (!paper || st?.studyMode !== 'exam' || st?.examSubmitted) return;
  for (const questionId of Object.keys(st.answers || {})) {
    if (findReadingQuestion(paper, questionId) && hasAnswer(st.answers[questionId])) {
      examAnswered.add(`${paper.id}:${questionId}`);
    }
  }
}

function markInteraction() {
  lastInteractionAt = Date.now();
}

function flushActiveTime() {
  if (!enabled || activeSeconds <= 0) return;
  const seconds = Math.min(600, activeSeconds);
  activeSeconds = 0;
  track({
    app_key: 'reading',
    event_type: 'active_time',
    active_seconds: seconds,
    mode: trackedWindow ? studyMode(trackedWindow) : 'practice'
  });
}

function startActiveTime(win) {
  trackedWindow = win;
  if (timer) return;
  const doc = win.document;
  ['pointerdown', 'keydown', 'input', 'touchstart'].forEach(type => {
    doc.addEventListener(type, markInteraction, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') markInteraction();
    else flushActiveTime();
  });
  window.addEventListener('pagehide', flushActiveTime);

  timer = window.setInterval(() => {
    if (shouldCountActiveTime({
      visible: document.visibilityState === 'visible',
      lastInteractionAt,
      now: Date.now()
    })) {
      activeSeconds += TICK_SECONDS;
      if (activeSeconds >= FLUSH_SECONDS) flushActiveTime();
    }
  }, TICK_SECONDS * 1000);
}

function showFailure(message) {
  const status = document.getElementById('wrapperStatus');
  if (!status) return;
  status.hidden = false;
  status.textContent = message;
}

function attachToLoadedFrame(frame) {
  try {
    const win = frame.contentWindow;
    if (!win || win.location.origin !== window.location.origin) throw new Error('Practice app origin mismatch.');
    sendHubContext(win);
    const newlyInstrumented = instrumentChecks(win);
    if (!newlyInstrumented) return;
    trackedWindow = win;
    window.setTimeout(() => seedReadingExamTracking(win), 0);
    markInteraction();
    track({ app_key: 'reading', event_type: 'app_open', mode: studyMode(win) });
    startActiveTime(win);
  } catch (error) {
    showFailure('Reading opened, but activity tracking could not attach.');
    console.warn(error);
  }
}

async function initialise() {
  const frame = document.getElementById(FRAME_ID);
  if (!frame) return;

  frame.addEventListener('load', () => {
    if (enabled) attachToLoadedFrame(frame);
  });

  try {
    client = await getSupabaseClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData?.user) {
      window.location.replace('./');
      return;
    }

    const { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('id, role, active')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profileData?.active) {
      window.location.replace('./');
      return;
    }

    profile = profileData;
    enabled = true;

    try {
      if (frame.contentDocument?.readyState === 'complete') attachToLoadedFrame(frame);
    } catch {
      // If the frame is still navigating, its load event will attach tracking.
    }
  } catch (error) {
    showFailure('The Self-Study tracking service is unavailable. Return to the Hub and try again.');
    console.warn(error);
  }
}

void initialise();
