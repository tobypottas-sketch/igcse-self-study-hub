import { getSupabaseClient } from '../supabase.js';
import { buildTrackingEvent, shouldCountActiveTime } from './core.js';

const FRAME_ID = 'practiceFrame';
const TICK_SECONDS = 30;
const FLUSH_SECONDS = 60;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let client = null;
let enabled = false;
let lastInteractionAt = Date.now();
let activeSeconds = 0;
let timer = null;
let profile = null;
let controlledTask = null;

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

function isStaffProfile() {
  const role = profile?.role;
  return role === 'teacher' || profile?.role === 'admin';
}

function safeWordCount(win) {
  const number = Number.parseInt(win.document.getElementById('wcTotal')?.textContent || '0', 10);
  return Number.isInteger(number) && number >= 0 ? Math.min(number, 1000) : 0;
}

function wrapAfter(win, functionName, after) {
  const original = win[functionName];
  if (typeof original !== 'function') return false;
  win[functionName] = function wrappedSelfStudyEssayFunction(...args) {
    const context = {
      activeTab: win.document.querySelector('.tab-btn.active')?.dataset?.tab || '',
      studyMode: typeof win.isPracticeMode === 'function' && !win.isPracticeMode() ? 'exam' : 'practice'
    };
    const result = original.apply(this, args);
    try {
      after(args, context, result);
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
    const activeTab = win.document.querySelector('.tab-btn.active')?.dataset?.tab || '';
    if (!stage || activeTab !== stage || visitedStages.has(stage)) return;
    visitedStages.add(stage);
    track({
      event_type: 'section_use',
      activity_id: `stage:${stage}`,
      skill: `essay_${stage}`,
      metadata: { word_count: safeWordCount(win) }
    });
  });

  wrapAfter(win, 'saveDraft', (_args, context, saveResult) => {
    if (context.studyMode === 'exam' || saveResult !== true) return;
    track({
      event_type: 'section_use',
      activity_id: 'draft_saved',
      skill: 'essay_draft_management',
      metadata: { word_count: safeWordCount(win) }
    });
  });

  return true;
}

function sendHubContext(win) {
  if (!profile) return;
  win.postMessage({
    type: 'essay-hub-context',
    storageNamespace: `user-${profile.id}`,
    staffAccess: isStaffProfile(),
    controlledTask
  }, window.location.origin);
}

function controlledTaskIdFromUrl() {
  try {
    const value = new URLSearchParams(window.location.search).get('ctask') || '';
    return UUID_RE.test(value) ? value : null;
  } catch {
    return null;
  }
}

async function fetchControlledTask(taskId) {
  if (!taskId) return null;
  const { data, error } = await client.functions.invoke('essay-task-action', {
    body: { action: 'fetch', taskId }
  });
  if (error || !data?.task) throw new Error(data?.error || error?.message || 'Controlled Essay task could not be loaded.');
  return data.task;
}

function buildControlledTaskUrl(taskId) {
  const url = new URL('./essay-writing.html', window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('ctask', taskId);
  return url.toString();
}

async function handleChildMessage(frame, event) {
  if (!enabled || !profile || !client) return;
  if (event.source !== frame.contentWindow) return;
  if (event.origin !== window.location.origin) return;
  const data = event.data;
  if (!data || data.type !== 'essay-create-controlled-task') return;

  if (!isStaffProfile()) {
    frame.contentWindow?.postMessage({
      type: 'essay-controlled-task-error',
      message: 'Teacher or admin access is required.'
    }, window.location.origin);
    return;
  }

  try {
    const { data: result, error } = await client.functions.invoke('essay-task-action', {
      body: {
        action: 'create',
        studyMode: data.studyMode === 'practice' ? 'practice' : 'exam',
        settings: data.settings
      }
    });
    if (error || !result?.task?.id) throw new Error(result?.error || error?.message || 'Controlled task could not be created.');
    frame.contentWindow?.postMessage({
      type: 'essay-controlled-task-created',
      url: buildControlledTaskUrl(result.task.id)
    }, window.location.origin);
  } catch (error) {
    frame.contentWindow?.postMessage({
      type: 'essay-controlled-task-error',
      message: error instanceof Error ? error.message : 'Controlled task could not be created.'
    }, window.location.origin);
  }
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
  ['pointerdown', 'keydown', 'input', 'touchstart'].forEach(type => {
    win.document.addEventListener(type, markInteraction, { passive: true });
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
    if (!win || win.location.origin !== window.location.origin) throw new Error('Essay app origin mismatch.');
    sendHubContext(win);
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
  window.addEventListener('message', event => {
    void handleChildMessage(frame, event);
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
    const taskId = controlledTaskIdFromUrl();
    if (new URLSearchParams(window.location.search).has('ctask') && !taskId) {
      showFailure('This controlled Essay task link is invalid.');
      return;
    }
    if (taskId) {
      try {
        controlledTask = await fetchControlledTask(taskId);
      } catch (error) {
        showFailure(error instanceof Error ? error.message : 'Controlled Essay task could not be loaded.');
        return;
      }
    }

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
