import { signIn, changePassword, getCurrentProfile } from './auth.js';
import {
  loadApps,
  loadActivityClasses,
  loadClassActivity,
  loadStudentActivitySummary,
  loadStudentRecentActivity
} from './api.js';
import { createStudentAccount } from './admin/accounts.js';
import { createClass } from './admin/classes.js';
import { getSupabaseClient } from './supabase.js';
import { renderLogin } from './views/login.js';
import { renderChangePassword } from './views/change-password.js';
import { renderHome } from './views/home.js';
import { renderAdminAccounts, canAccessAdmin } from './views/admin.js';
import { renderActivityOverview, renderStudentActivity } from './views/activity.js';
import { buildClassActivityModel, buildStudentActivityModel, periodToSince } from './views/activity-model.js';
import { escapeHtml } from './views/html.js';

export function routeForProfile(profile) {
  if (!profile) return 'login';
  if (profile.must_change_password) return 'change-password';
  return 'home';
}

export function canAccessActivity(profile) {
  return profile?.role === 'admin' || profile?.role === 'teacher';
}

export async function loadActivityOverviewData(client, profile, state = {}, loaders = {}, now = new Date()) {
  if (!canAccessActivity(profile)) throw new Error('Activity is available to staff only.');
  const loadClasses = loaders.loadClasses || loadActivityClasses;
  const loadClass = loaders.loadClass || loadClassActivity;
  const classes = await loadClasses(client);
  const available = new Set(classes.map(item => item.class_id));
  const classId = available.has(state.classId) ? state.classId : (classes[0]?.class_id || '');
  const period = ['7d','30d','all'].includes(state.period) ? state.period : '7d';
  const since = periodToSince(period, now);
  const rows = classId ? await loadClass(client, classId, since) : [];
  return { classes, classId, period, since, rows };
}

export async function loadAppState(client) {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return { view: 'login' };
  try {
    const profile = await getCurrentProfile(client);
    if (profile.must_change_password) return { view: 'change-password', profile };
    const apps = await loadApps(client);
    return { view: 'home', profile, apps };
  } catch (error) {
    return { view: 'error', error };
  }
}

function renderError(root, message) {
  root.innerHTML = `<section class="auth-shell"><div class="auth-card"><p class="eyebrow">iGCSE Self-Study</p><h1>Unable to continue</h1><div class="notice" role="alert">${escapeHtml(message)}</div><button class="button" data-action="retry">Try again</button></div></section>`;
}

function renderActivityError(root, message) {
  root.innerHTML = `<section class="auth-shell"><div class="auth-card"><p class="eyebrow">iGCSE Self-Study</p><h1>Unable to load Activity</h1><div class="notice" role="alert">${escapeHtml(message)}</div><div class="button-row"><button class="button" data-action="activity-retry">Retry</button><button class="button button--ghost" data-action="activity-home">Home</button><button class="button button--ghost" data-action="logout">Log out</button></div></div></section>`;
}

export async function bootApp(clientOverride = null) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('app');
  if (!root) return;
  root.innerHTML = '<div class="loading">Loading Self-Study Hub…</div>';

  let client;
  try { client = clientOverride ?? await getSupabaseClient(); }
  catch { renderError(root, 'The Self-Study service is unavailable right now.'); return; }

  let currentState = { view: 'login' };
  let activityState = { classId: '', period: '7d', classes: [], profile: null };

  const renderCurrentState = async () => {
    currentState = await loadAppState(client);
    if (currentState.view === 'login') return renderLogin(root);
    if (currentState.view === 'change-password') return renderChangePassword(root, currentState.profile);
    if (currentState.view === 'home') return renderHome(root, currentState.profile, currentState.apps);
    renderError(root, currentState.error instanceof Error ? currentState.error.message : 'Unable to load your account.');
  };

  const renderAdminState = async (feedback = {}) => {
    if (!canAccessAdmin(currentState.profile)) return renderHome(root, currentState.profile, currentState.apps);
    try {
      const classes = await loadActivityClasses(client);
      renderAdminAccounts(root, currentState.profile, classes, feedback);
    } catch {
      renderAdminAccounts(root, currentState.profile, [], { message: 'Unable to load classes right now.', tone: 'error' });
    }
  };

  const renderActivityOverviewState = async () => {
    const profile = currentState.profile || activityState.profile;
    try {
      const data = await loadActivityOverviewData(client, profile, activityState);
      activityState = { ...activityState, ...data, profile };
      renderActivityOverview(root, profile, data.classes, buildClassActivityModel(data.rows, { period: data.period }), activityState);
    } catch (error) {
      renderActivityError(root, error instanceof Error ? error.message : 'Unable to load activity.');
    }
  };

  root.addEventListener('submit', async (event) => {
    const form = event.target;
    const kind = form?.dataset?.form;

    if (kind === 'admin-create-class' || kind === 'admin-create-student') {
      event.preventDefault();
      if (!canAccessAdmin(currentState.profile)) return renderHome(root, currentState.profile, currentState.apps);
      const data = new FormData(form);
      try {
        if (kind === 'admin-create-class') {
          await createClass(client, String(data.get('className') ?? '').trim());
          await renderAdminState({ message: 'Class created.', tone: 'success' });
        } else {
          await createStudentAccount(client, {
            displayName: String(data.get('displayName') ?? '').trim(),
            email: String(data.get('email') ?? '').trim(),
            temporaryPassword: String(data.get('temporaryPassword') ?? ''),
            classId: String(data.get('classId') ?? '')
          });
          await renderAdminState({ message: 'Student account created.', tone: 'success' });
        }
      } catch {
        await renderAdminState({
          message: kind === 'admin-create-class' ? 'Unable to create class.' : 'Unable to create student account.',
          tone: 'error'
        });
      }
      return;
    }

    if (kind !== 'login' && kind !== 'change-password') return;
    event.preventDefault();
    const data = new FormData(form);
    if (kind === 'login') {
      try { await signIn(client, String(data.get('email') ?? '').trim(), String(data.get('password') ?? '')); await renderCurrentState(); }
      catch (error) { renderLogin(root, error instanceof Error ? error.message : 'Unable to sign in.'); }
      return;
    }
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');
    if (password !== confirm) return renderChangePassword(root, currentState.profile, 'The two passwords do not match.');
    try { await changePassword(client, password); await renderCurrentState(); }
    catch (error) { renderChangePassword(root, currentState.profile, error instanceof Error ? error.message : 'Unable to change password.'); }
  });

  root.addEventListener('change', async (event) => {
    const action = event.target?.dataset?.action;
    if (action === 'activity-class') { activityState.classId = event.target.value; await renderActivityOverviewState(); }
    else if (action === 'activity-period') { activityState.period = event.target.value; await renderActivityOverviewState(); }
  });

  root.addEventListener('click', async (event) => {
    const target = event.target?.closest?.('[data-action]') ?? event.target;
    const action = target?.dataset?.action;
    if (action === 'logout') { await client.auth.signOut(); await renderCurrentState(); }
    else if (action === 'retry') { await renderCurrentState(); }
    else if (action === 'admin') { await renderAdminState(); }
    else if (action === 'admin-home') { renderHome(root, currentState.profile, currentState.apps); }
    else if (action === 'activity') {
      if (!canAccessActivity(currentState.profile)) return renderHome(root, currentState.profile, currentState.apps);
      activityState = { classId:'', period:'7d', classes:[], profile:currentState.profile };
      await renderActivityOverviewState();
    } else if (action === 'activity-home') {
      renderHome(root, currentState.profile, currentState.apps);
    } else if (action === 'activity-retry' || action === 'activity-back') {
      await renderActivityOverviewState();
    } else if (action === 'activity-student') {
      if (!canAccessActivity(currentState.profile)) return renderHome(root, currentState.profile, currentState.apps);
      const studentId = target.dataset.studentId;
      try {
        const since = periodToSince(activityState.period);
        const [summary, recent] = await Promise.all([
          loadStudentActivitySummary(client, studentId, since),
          loadStudentRecentActivity(client, studentId, since)
        ]);
        if (!summary) throw new Error('Student activity is not available.');
        renderStudentActivity(root, currentState.profile, buildStudentActivityModel(summary, recent, { period: activityState.period }), activityState);
      } catch (error) {
        renderActivityError(root, error instanceof Error ? error.message : 'Unable to load student activity.');
      }
    }
  });

  await renderCurrentState();
}

if (typeof document !== 'undefined') bootApp();
