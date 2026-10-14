import { getSupabaseClient } from '../supabase.js';
import { buildTrackingEvent, shouldCountActiveTime } from './core.js';

const FRAME_ID = 'practiceFrame';
const TICK_SECONDS = 30;
const FLUSH_SECONDS = 60;

let client = null;
let enabled = false;
let lastInteractionAt = Date.now();
let activeSeconds = 0;
let timer = null;
let profile = null;

async function send(payload) {
  if (!enabled || !client) return;
  let event;
  try {
    event = buildTrackingEvent({ app_key: 'essay_writing', ...payload });
  } catch (error) {
    console.warn('Self-Study Essay event rejected:', error);
    return;
  }

  try {
    const { error } = await client.from('activity_events').insert(event);
    if (error) console.warn('Self-Study Essay tracking write failed:', error.message || error);
  } catch (error) {
    console.warn('Self-Study Essay tracking unavailable:', error);
  }
}

function track(payload) {
  void send(payload);
}

function safeWordCount(win) {
  const number = Number.parseInt(win.document.getElementById('wcTotal')?.textContent || '0', 10);
  return Number.isInteger(number) && number >= 0 ? Math.min(number, 1000) : 0;
}

function wrapAfter(win, functionName, after) {
  const original = win[functionName];
  if (typeof original !== 'function') return false;
  win[functionName] = function wrappedSelfStudyEssayFunction(...args) {
    const result = original.apply(this, args);
    try {
      after(args);
    } catch (error) {
      console.warn(`Self-Study Essay hook failed for ${functionName}:`, error);
    }
    return result;
  };
  return true;
}

function instrumentEssay(win) {
  if (win.__selfStudyEssayInstrumented) return false;
  win.__selfStudyEssayInstrumented = true;

  const visitedStages = new Set();
  wrapAfter(win, 'switchTab', ([tab]) => {
    const stage = String(tab || '').trim();
    if (!stage || visitedStages.has(stage)) return;
    visitedStages.add(stage);
    track({
      event_type: 'section_use',
      activity_id: `stage:${stage}`,
      skill: `essay_${stage}`,
      metadata: { word_count: safeWordCount(win) }
    });
  });

  wrapAfter(win, 'saveDraft', () => {
    track({
      event_type: 'section_use',
      activity_id: 'draft_saved',
      skill: 'essay_draft_management',
      metadata: { word_count: safeWordCount(win) }
    });
  });

  const role = profile?.role;
  const isStaff = role === 'teacher' || profile.role === 'admin';
  if (typeof win.setHubStaffAccess === 'function') win.setHubStaffAccess(isStaff);

  return true;
}

function markInteraction() {
  lastInteractionAt = Date.now();
}

function flushActiveTime() {
  if (!enabled || activeSeconds <= 0) return;
  const seconds = Math.min(600, activeSeconds);
  activeSeconds = 0;
  track({ event_type: 'active_time', active_seconds: seconds });
}

function startActiveTime(win) {
  if (timer) return;
  ['pointerdown', 'keydown', 'input', 'touchstart'].forEach(type => {
    win.document.addEventListener(type, markInteraction, { passive: true });
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
    if (!win || win.location.origin !== window.location.origin) throw new Error('Essay app origin mismatch.');
    const newlyInstrumented = instrumentEssay(win);
    if (!newlyInstrumented) return;
    markInteraction();
    track({ event_type: 'app_open' });
    track({ event_type: 'section_use', activity_id: 'stage:task', skill: 'essay_task', metadata: { word_count: safeWordCount(win) } });
    startActiveTime(win);
  } catch (error) {
    showFailure('Essay Writing opened, but activity tracking could not attach.');
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
      // The load event will attach once the iframe finishes navigating.
    }
  } catch (error) {
    showFailure('The Self-Study tracking service is unavailable. Return to the Hub and try again.');
    console.warn(error);
  }
}

void initialise();
