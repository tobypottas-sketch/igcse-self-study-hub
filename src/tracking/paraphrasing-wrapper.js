import { getSupabaseClient } from '../supabase.js';
import {
  buildTrackingEvent,
  shouldCountActiveTime,
  parseExercise3Feedback,
  parseExercise4Feedback
} from './core.js';

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

function currentMode(win) {
  try {
    return typeof win.getMode === 'function' ? win.getMode() : undefined;
  } catch {
    return undefined;
  }
}

function latestRecord(win, skill) {
  try {
    if (typeof win.getState !== 'function') return null;
    const records = win.getState()?.records || [];
    for (let i = records.length - 1; i >= 0; i -= 1) {
      if (!skill || records[i]?.skill === skill) return records[i];
    }
  } catch {
    return null;
  }
  return null;
}

function recordCount(win) {
  try { return win.getState?.()?.records?.length || 0; } catch { return 0; }
}

function wrapAfter(win, functionName, after) {
  const original = win[functionName];
  if (typeof original !== 'function') return false;
  win[functionName] = function wrappedSelfStudyFunction(...args) {
    const beforeCount = recordCount(win);
    const result = original.apply(this, args);
    const afterCount = recordCount(win);
    try {
      after(args, { beforeCount, afterCount });
    } catch (error) {
      console.warn(`Self-Study tracking hook failed for ${functionName}:`, error);
    }
    return result;
  };
  return true;
}

function instrumentChecks(win) {
  if (win.__selfStudyParaphrasingInstrumented) return false;
  win.__selfStudyParaphrasingInstrumented = true;

  wrapAfter(win, 'checkStarterChoice', ([prefix, idx, _optIdx, btn], counts) => {
    const skill = prefix === 'pm' ? 'phrase_match' : 'sentence_match';
    const mode = currentMode(win);
    if (mode === 'exam' && counts.afterCount <= counts.beforeCount) return;
    const record = mode === 'exam' ? latestRecord(win, skill) : null;
    const strong = mode === 'exam' ? Boolean(record?.strong) : Boolean(btn?.classList?.contains('correct'));
    track({
      event_type: 'question_attempt',
      activity_id: `starter:${skill}:${idx}`,
      skill,
      set_id: 'starter',
      mode,
      strong,
      score: strong ? 1 : 0,
      max_score: 1,
      metadata: { outcome: strong ? 'correct' : 'try_again', question_type: skill }
    });
  });

  wrapAfter(win, 'checkStarterWrite', ([prefix, idx], counts) => {
    const skill = prefix === 'ws' ? 'synonym_write' : 'paraphrase_write';
    const mode = currentMode(win);
    if (mode === 'exam' && counts.afterCount <= counts.beforeCount) return;
    const record = latestRecord(win, skill);
    const input = win.document.getElementById(`${prefix}_${idx}`);
    const attemptNumber = Number(input?.dataset?.attempts || 1);
    const strong = Boolean(record?.strong);
    track({
      event_type: 'question_attempt',
      activity_id: `starter:${skill}:${idx}`,
      skill,
      set_id: 'starter',
      mode: currentMode(win),
      strong,
      score: strong ? 1 : 0,
      max_score: 1,
      metadata: {
        attempt_number: Number.isInteger(attemptNumber) && attemptNumber > 0 ? attemptNumber : 1,
        outcome: strong ? 'correct' : 'try_again',
        question_type: skill
      }
    });
  });

  wrapAfter(win, 'checkSetChoice', ([setIndex, exerciseType, idx, _optIdx, btn], counts) => {
    const skill = exerciseType === 'ex1' ? 'ex1' : 'ex2';
    const mode = currentMode(win);
    if (mode === 'exam' && counts.afterCount <= counts.beforeCount) return;
    const record = mode === 'exam' ? latestRecord(win, skill) : null;
    const strong = mode === 'exam' ? Boolean(record?.strong) : Boolean(btn?.classList?.contains('correct'));
    track({
      event_type: 'question_attempt',
      activity_id: `set${setIndex + 1}:${skill}:${idx}`,
      skill,
      set_id: `set${setIndex + 1}`,
      mode: currentMode(win),
      strong,
      score: strong ? 1 : 0,
      max_score: 1,
      metadata: { outcome: strong ? 'correct' : 'try_again', question_type: skill }
    });
  });

  wrapAfter(win, 'checkExercise3', ([setIndex], counts) => {
    const setId = `set${setIndex + 1}`;
    const mode = currentMode(win);
    const record = latestRecord(win, 'ex3');
    if (mode === 'exam') {
      if (counts.afterCount <= counts.beforeCount) return;
      const strong = Boolean(record?.strong);
      track({ event_type:'exercise_result', activity_id:`${setId}:ex3`, skill:'ex3', set_id:setId, mode, strong, score:strong?1:0, max_score:1, metadata:{question_type:'ex3'} });
      return;
    }
    const feedback = win.document.getElementById(`${setId}_ex3_feedback`)?.textContent || '';
    const parsed = parseExercise3Feedback(feedback);
    if (!parsed) return;
    track({
      event_type: 'exercise_result',
      activity_id: `${setId}:ex3`,
      skill: 'ex3',
      set_id: setId,
      mode: currentMode(win),
      strong: Boolean(record?.strong),
      score: parsed.score,
      max_score: parsed.maxScore,
      metadata: { question_type: 'ex3' }
    });
  });

  wrapAfter(win, 'checkExercise4', ([setIndex], counts) => {
    const setId = `set${setIndex + 1}`;
    const mode = currentMode(win);
    const record = latestRecord(win, 'ex4');
    if (mode === 'exam') {
      if (counts.afterCount <= counts.beforeCount) return;
      const strong = Boolean(record?.strong);
      track({ event_type:'exercise_result', activity_id:`${setId}:ex4`, skill:'ex4', set_id:setId, mode, strong, score:strong?1:0, max_score:1, metadata:{question_type:'ex4'} });
      return;
    }
    const feedback = win.document.getElementById(`${setId}_ex4_feedback`)?.textContent || '';
    const parsed = parseExercise4Feedback(feedback);
    if (!parsed) return;
    track({
      event_type: 'exercise_result',
      activity_id: `${setId}:ex4`,
      skill: 'ex4',
      set_id: setId,
      mode: currentMode(win),
      strong: Boolean(record?.strong),
      score: parsed.score,
      metadata: { word_count: parsed.wordCount, question_type: 'ex4' }
    });
  });

  return true;
}

function sendHubContext(win) {
  if (!profile) return;
  win.postMessage({ type:'self-study-hub-context', storageNamespace:`user-${profile.id}` }, window.location.origin);
}

function markInteraction() {
  lastInteractionAt = Date.now();
}

function flushActiveTime() {
  if (!enabled || activeSeconds <= 0) return;
  const seconds = Math.min(600, activeSeconds);
  activeSeconds = 0;
  track({
    event_type: 'active_time',
    active_seconds: seconds,
    mode: trackedWindow ? currentMode(trackedWindow) : undefined
  });
}

function startActiveTime(win) {
  trackedWindow = win;
  const doc = win.document;
  ['pointerdown', 'keydown', 'input', 'touchstart'].forEach(type => {
    doc.addEventListener(type, markInteraction, { passive: true });
  });
  if (timer) return;

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
    trackedWindow = win;
    sendHubContext(win);
    const newlyInstrumented = instrumentChecks(win);
    if (!newlyInstrumented) return;
    markInteraction();
    track({ event_type: 'app_open', mode: currentMode(win) });
    startActiveTime(win);
  } catch (error) {
    showFailure('Paraphrasing opened, but activity tracking could not attach.');
    console.warn(error);
  }
}

async function initialise() {
  const frame = document.getElementById(FRAME_ID);
  if (!frame) return;

  const onFrameLoad = () => {
    if (enabled) attachToLoadedFrame(frame);
  };
  frame.addEventListener('load', onFrameLoad);

  try {
    client = await getSupabaseClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData?.user) {
      window.location.replace('./');
      return;
    }

    const { data: profileData, error: profileError } = await client
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
      // If the frame is still navigating, its load event will attach tracking.
    }
  } catch (error) {
    showFailure('The Self-Study tracking service is unavailable. Return to the Hub and try again.');
    console.warn(error);
  }
}

void initialise();
