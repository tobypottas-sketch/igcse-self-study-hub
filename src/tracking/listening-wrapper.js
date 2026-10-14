import { getSupabaseClient } from '../supabase.js';
import { buildTrackingEvent, shouldCountActiveTime } from './core.js';
import {
  buildListeningAttempt,
  buildListeningExamResult,
  buildListeningSupportEvent,
  buildListeningSectionEvent
} from './listening-core.js';
import { shouldCountListeningTime, capListeningFlush } from './listening-engagement.js';

const FRAME_ID = 'practiceFrame';
const TICK_SECONDS = 30;
const FLUSH_SECONDS = 60;
const IDLE_MS = 120000;

let client = null;
let enabled = false;
let currentSectionId = 'ex1';
let lastInteractionAt = Date.now();
let activeSeconds = 0;
let timer = null;
let profile = null;
const attempts = new Map();
const questionSections = new Map();
const reconciledQuestions = new Set();
const examAnswered = new Set();
const sectionGate = createOncePerKeyGate();
const supportGate = createOncePerKeyGate();

export function createOncePerKeyGate() {
  const seen = new Set();
  return key => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

export function safeWrapAfter(target, functionName, after, warn = console.warn) {
  const original = target?.[functionName];
  if (typeof original !== 'function') return false;
  target[functionName] = function wrappedSelfStudyFunction(...args) {
    const result = original.apply(this, args);
    try {
      after(args, result);
    } catch (error) {
      try { warn(`Self-Study tracking hook failed for ${functionName}:`, error); } catch {}
    }
    return result;
  };
  return true;
}

export function buildAnswerEventFromState({ state, sectionId, questionNumber, attemptNumber }) {
  const answer = state?.answers?.[questionNumber];
  const mode = state?.mode === 'exam' ? 'exam' : 'practice';
  const mayExposeCorrectness = mode === 'practice' || Boolean(state?.examSubmitted);
  return buildListeningAttempt({
    sectionId,
    questionNumber,
    mode,
    attemptNumber,
    correct: mayExposeCorrectness && typeof answer?.correct === 'boolean' ? answer.correct : undefined
  });
}

export function buildExamReconciliationEvents(state, sectionMap) {
  if (state?.mode !== 'exam' || !state?.examSubmitted) return [];
  const events = [];
  for (const [rawQuestion, answer] of Object.entries(state.answers || {})) {
    const questionNumber = Number(rawQuestion);
    const sectionId = sectionMap.get(questionNumber);
    if (!sectionId || typeof answer?.correct !== 'boolean') continue;
    events.push(buildListeningExamResult({ sectionId, questionNumber, correct: answer.correct }));
  }
  return events;
}

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

function getListeningState(win) {
  try {
    return typeof win.getState === 'function' ? win.getState() : null;
  } catch {
    return null;
  }
}

function sectionForQuestion(questionNumber) {
  const n = Number(questionNumber);
  if (n >= 1 && n <= 8) return 'ex1';
  if (n <= 18) return 'ex2';
  if (n <= 26) return 'ex3';
  if (n <= 32) return 'ex4';
  if (n <= 40) return 'ex5';
  return null;
}

function seedListeningTracking(win) {
  for (let n=1; n<=40; n+=1) {
    const sectionId=sectionForQuestion(n);
    if (sectionId) questionSections.set(n, sectionId);
  }
  const st=getListeningState(win);
  if (st?.mode === 'exam' && !st?.examSubmitted) {
    for (const rawQuestion of Object.keys(st.answers || {})) examAnswered.add(Number(rawQuestion));
  }
}

function resetExamTracking() {
  examAnswered.clear();
  reconciledQuestions.clear();
}

function nextAttempt(questionNumber) {
  const key = Number(questionNumber);
  const next = (attempts.get(key) || 0) + 1;
  attempts.set(key, next);
  return next;
}

function trackSection(sectionId, mode='practice') {
  if (!sectionGate(`section:${sectionId}`)) return;
  track(buildListeningSectionEvent({ sectionId, mode }));
}

function trackTranscript(sectionId, mode='practice') {
  if (mode !== 'practice') return;
  if (!supportGate(`transcript:${sectionId}`)) return;
  track(buildListeningSupportEvent({ sectionId, supportType:'transcript', mode }));
}

function reconcileExam(win) {
  const state = getListeningState(win);
  const events = buildExamReconciliationEvents(state, questionSections);
  for (const event of events) {
    const key = event.activity_id;
    if (reconciledQuestions.has(key)) continue;
    reconciledQuestions.add(key);
    track(event);
  }
}

function instrumentFunctions(win) {
  if (win.__selfStudyListeningInstrumented) return false;
  win.__selfStudyListeningInstrumented = true;

  const answerWrapped = safeWrapAfter(win, 'answerQuestion', ([questionNumber]) => {
    const n = Number(questionNumber);
    questionSections.set(n, currentSectionId);
    const state = getListeningState(win);
    if (!state) return;
    if (state.mode === 'exam' && !state.examSubmitted) {
      if (examAnswered.has(n)) return;
      examAnswered.add(n);
    }
    track(buildAnswerEventFromState({
      state,
      sectionId:currentSectionId,
      questionNumber:n,
      attemptNumber:nextAttempt(n)
    }));
  });

  const sectionWrapped = safeWrapAfter(win, 'openSection', ([sectionId]) => {
    if (!/^ex[1-5]$/.test(String(sectionId))) return;
    currentSectionId = String(sectionId);
    const mode = getListeningState(win)?.mode === 'exam' ? 'exam' : 'practice';
    trackSection(currentSectionId, mode);
    markInteraction();
  });

  const transcriptWrapped = safeWrapAfter(win, 'openTranscriptDrawer', () => {
    const state = getListeningState(win);
    trackTranscript(currentSectionId, state?.mode === 'exam' ? 'exam' : 'practice');
  });

  const finishWrapped = safeWrapAfter(win, 'finishExam', () => reconcileExam(win));
  safeWrapAfter(win, 'setMode', () => resetExamTracking());
  safeWrapAfter(win, 'resetAllAnswers', () => resetExamTracking());

  if (!answerWrapped || !sectionWrapped || !transcriptWrapped || !finishWrapped) {
    win.__selfStudyListeningInstrumented = false;
    throw new Error('Listening functions were not found.');
  }
  return true;
}

function sendHubContext(win) {
  if (!profile) return;
  win.postMessage({ type:'self-study-hub-context', storageNamespace:`user-${profile.id}` }, window.location.origin);
}

function markInteraction() {
  lastInteractionAt = Date.now();
}

function currentMode(win) {
  return getListeningState(win)?.mode === 'exam' ? 'exam' : 'practice';
}

function flushActiveTime(win) {
  if (!enabled || activeSeconds <= 0) return;
  const seconds = capListeningFlush(activeSeconds);
  activeSeconds = 0;
  if (seconds <= 0) return;
  track({
    app_key:'listening',
    event_type:'active_time',
    active_seconds:seconds,
    mode:currentMode(win),
    set_id:currentSectionId
  });
}

function startActiveTime(win) {
  if (timer) return;
  const doc = win.document;
  ['pointerdown', 'keydown', 'input', 'touchstart'].forEach(type => {
    doc.addEventListener(type, markInteraction, { passive:true });
  });

  const audio = doc.getElementById('mainAudio');
  if (audio) {
    audio.addEventListener('play', () => {
      const mode = currentMode(win);
      trackSection(currentSectionId, mode);
      markInteraction();
    });
    audio.addEventListener('pause', () => flushActiveTime(win));
    audio.addEventListener('ended', () => flushActiveTime(win));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') markInteraction();
    else flushActiveTime(win);
  });
  window.addEventListener('pagehide', () => flushActiveTime(win));

  timer = window.setInterval(() => {
    const now = Date.now();
    const media = doc.getElementById('mainAudio');
    const audioPlaying = Boolean(media && !media.paused && !media.ended);
    const recentlyInteractive = shouldCountActiveTime({
      visible:true,
      lastInteractionAt,
      now,
      idleMs:IDLE_MS
    });
    if (shouldCountListeningTime({
      visible:document.visibilityState === 'visible',
      audioPlaying,
      recentlyInteractive
    })) {
      activeSeconds += TICK_SECONDS;
      if (activeSeconds >= FLUSH_SECONDS) flushActiveTime(win);
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
    const newlyInstrumented = instrumentFunctions(win);
    if (!newlyInstrumented) return;
    window.setTimeout(() => seedListeningTracking(win), 0);
    markInteraction();
    track({ app_key:'listening', event_type:'app_open', mode:currentMode(win) });
    trackSection(currentSectionId, currentMode(win));
    startActiveTime(win);
  } catch (error) {
    showFailure('Listening opened, but activity tracking could not attach.');
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
    const { data:userData, error:userError } = await client.auth.getUser();
    if (userError || !userData?.user) {
      window.location.replace('./');
      return;
    }

    const { data:profileData, error:profileError } = await client
      .from('profiles')
      .select('id, active')
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
      // Frame load event will attach when ready.
    }
  } catch (error) {
    showFailure('The Self-Study tracking service is unavailable. Return to the Hub and try again.');
    console.warn(error);
  }
}

if (typeof document !== 'undefined') void initialise();
