import { signIn, changePassword, getCurrentProfile } from './auth.js';
import { loadApps } from './api.js';
import { getSupabaseClient } from './supabase.js';
import { renderLogin } from './views/login.js';
import { renderChangePassword } from './views/change-password.js';
import { renderHome } from './views/home.js';
import { escapeHtml } from './views/html.js';

export function routeForProfile(profile) {
  if (!profile) return 'login';
  if (profile.must_change_password) return 'change-password';
  return 'home';
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

export async function bootApp(clientOverride = null) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = '<div class="loading">Loading Self-Study Hub…</div>';

  let client;
  try {
    client = clientOverride ?? await getSupabaseClient();
  } catch {
    renderError(root, 'The Self-Study service is unavailable right now.');
    return;
  }

  let currentState = { view: 'login' };

  const renderCurrentState = async () => {
    currentState = await loadAppState(client);

    if (currentState.view === 'login') {
      renderLogin(root);
      return;
    }
    if (currentState.view === 'change-password') {
      renderChangePassword(root, currentState.profile);
      return;
    }
    if (currentState.view === 'home') {
      renderHome(root, currentState.profile, currentState.apps);
      return;
    }

    renderError(root, currentState.error instanceof Error ? currentState.error.message : 'Unable to load your account.');
  };

  root.addEventListener('submit', async (event) => {
    const form = event.target;
    const kind = form?.dataset?.form;
    if (kind !== 'login' && kind !== 'change-password') return;
    event.preventDefault();
    const data = new FormData(form);

    if (kind === 'login') {
      try {
        await signIn(client, String(data.get('email') ?? '').trim(), String(data.get('password') ?? ''));
        await renderCurrentState();
      } catch (error) {
        renderLogin(root, error instanceof Error ? error.message : 'Unable to sign in.');
      }
      return;
    }

    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');
    if (password !== confirm) {
      renderChangePassword(root, currentState.profile, 'The two passwords do not match.');
      return;
    }

    try {
      await changePassword(client, password);
      await renderCurrentState();
    } catch (error) {
      renderChangePassword(root, currentState.profile, error instanceof Error ? error.message : 'Unable to change password.');
    }
  });

  root.addEventListener('click', async (event) => {
    const target = event.target?.closest?.('[data-action]') ?? event.target;
    const action = target?.dataset?.action;
    if (action === 'logout') {
      await client.auth.signOut();
      await renderCurrentState();
    } else if (action === 'retry') {
      await renderCurrentState();
    }
  });

  await renderCurrentState();
}

if (typeof document !== 'undefined') {
  bootApp();
}
