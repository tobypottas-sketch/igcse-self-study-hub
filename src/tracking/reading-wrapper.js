import { getSupabaseClient } from '../supabase.js';
import { buildTrackingEvent, shouldCountActiveTime } from './core.js';
import {
  findReadingQuestion,
  buildReadingAttempt,
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
const attempts = new Map();
const lastNotesScores = new Map();

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
  try {
    const state = typeof win.getState === 'function' ? win.getState() : null;
    return state?.answers?.[questionId];
  } catch {
    return undefined;
  }
}

function trackNotesSnapshot(win, paper, exerciseIndex) {
  const exercise = paper?.exercises?.[exerciseIndex];
  if (!exercise || exercise.type !== 'notes' || typeof win.scoreGroupedItemsAnyOrder !== 'function') return;

  let score = 0;
  let maxScore = 0;
  for (const section of exercise.noteSections || []) {
    const bullets = section.bullets || [];
    maxScore += bullets.length;
    score += Math.min(win.scoreGroupedItemsAnyOrder(bullets), bullets.length);
  }

  const key = `${paper.id}:${exerciseIndex}`;
  const signature = `${score}/${maxScore}`;
  if (lastNotesScores.get(key) === signature) return;
  lastNotesScores.set(key, signature);

  track(buildReadingNotesResult({ paper, exerciseIndex, score, maxScore }));
}

function trackAnswer(win, questionId) {
  const paper = activePaper(win);
  if (!paper) return;
  const context = findReadingQuestion(paper, questionId);
  if (!context) return;

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

function instrumentChecks(win) {
  if (win.__selfStudyReadingInstrumented) return false;
  win.__selfStudyReadingInstrumented = true;

  const normal = wrapAfter(win, 'saveAnswer', ([questionId]) => trackAnswer(win, questionId));
  const triple = wrapAfter(win, 'saveTripleAnswer', ([questionId]) => trackAnswer(win, questionId));
  if (!normal && !triple) {
    win.__selfStudyReadingInstrumented = false;
    throw new Error('Reading answer functions were not found.');
  }
  return true;
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
    mode: 'practice'
  });
}

function startActiveTime(win) {
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
    const newlyInstrumented = instrumentChecks(win);
    if (!newlyInstrumented) return;
    markInteraction();
    track({ app_key: 'reading', event_type: 'app_open', mode: 'practice' });
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

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, active')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile?.active) {
      window.location.replace('./');
      return;
    }

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
