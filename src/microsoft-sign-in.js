import { getCurrentProfile, startMicrosoftSignIn } from './auth.js';
import { getMicrosoftPilotSupabaseClient } from './supabase.js';

// Enable only after the Entra assignment and Supabase signup safeguards are verified.
export const MICROSOFT_STAFF_PILOT_ENABLED = true;
export const MICROSOFT_STANDALONE_ADMIN_ENABLED = true;
export const MICROSOFT_PILOT_CALLBACK = 'https://tobypottas-sketch.github.io/igcse-self-study-hub/microsoft-sign-in.html';
const pendingKey = 'hub-microsoft-pilot-attempt';
const attemptLifetime = 10 * 60 * 1000;

const normalizedEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

export async function getPilotAccount(client, { allowStudents = false } = {}) {
  const profile = await getCurrentProfile(client);
  const email = normalizedEmail(profile.school_email);
  const permittedRole = profile.role === 'admin' ||
    (allowStudents && profile.role === 'student' && /^[^@\s]+@nkcswx[.]cn$/.test(email));
  if (!permittedRole || profile.must_change_password !== false || !email) {
    throw new Error('An active approved Hub account with completed password setup is required.');
  }
  return { id: profile.id, email: normalizedEmail(profile.school_email) };
}

export async function finishMicrosoftStaffSignIn(client, expected, { allowStudents = false } = {}) {
  try {
    const { data, error } = await client.auth.getUser();
    const user = data?.user;
    if (error || !expected?.id || !expected.email || user?.id !== expected.id ||
        !user.email_confirmed_at || normalizedEmail(user.email) !== expected.email) {
      throw new Error('Unexpected Hub account');
    }
    const identities = user.identities?.filter(identity => identity.provider === 'azure') ?? [];
    if (identities.length !== 1 || normalizedEmail(identities[0].identity_data?.email) !== expected.email ||
        identities[0].identity_data?.email_verified !== true) {
      throw new Error('Matching verified Microsoft identity required');
    }
    const profile = await getPilotAccount(client, { allowStudents });
    if (profile.id !== expected.id || profile.email !== expected.email) throw new Error('Unexpected Hub profile');
    return true;
  } catch {
    await client.auth.signOut({ scope: 'local' });
    return false;
  }
}

// The production signup hook and UUID allowlist enforce the approved-account
// boundary before OAuth completes. These checks additionally validate the session.
export async function finishStandaloneMicrosoftSignIn(client, expected = null) {
  try {
    const account = await getPilotAccount(client, { allowStudents: true });
    if (expected?.id && (account.id !== expected.id || account.email !== expected.email)) throw new Error('Unexpected Hub account');
    return await finishMicrosoftStaffSignIn(client, account, { allowStudents: true });
  } catch {
    await client.auth.signOut({ scope: 'local' });
    return false;
  }
}

export async function bootMicrosoftPilot(root, {
  enabled = MICROSOFT_STAFF_PILOT_ENABLED,
  standaloneEnabled = MICROSOFT_STANDALONE_ADMIN_ENABLED,
  getClient = getMicrosoftPilotSupabaseClient,
  browser = root.ownerDocument.defaultView
} = {}) {
  const button = root.querySelector('[data-microsoft-sign-in]');
  const status = root.querySelector('[data-pilot-status]');
  const url = new URL(browser.location.href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const failed = url.searchParams.has('error') || fragment.has('error');
  const code = url.searchParams.get('code');

  if (failed || url.searchParams.has('code') || fragment.has('access_token')) {
    const cleanUrl = new URL(url.pathname, url.origin).href;
    browser.history.replaceState(null, '', cleanUrl);
    let expected;
    try {
      const pending = browser.sessionStorage.getItem(pendingKey);
      browser.sessionStorage.removeItem(pendingKey);
      expected = JSON.parse(pending);
      if (!Number.isFinite(expected?.startedAt) || Date.now() - expected.startedAt > attemptLifetime ||
          expected.startedAt > Date.now()) expected = null;
    } catch {
      expected = null;
    }

    try {
      if (enabled && code && !failed && expected) {
        status.textContent = 'Checking your existing Hub account…';
        const client = await getClient();
        const { data, error } = await client.auth.exchangeCodeForSession(code);
        const standalone = expected.mode === 'standalone';
        const verified = !error && data?.session && (standalone
          ? standaloneEnabled && await finishStandaloneMicrosoftSignIn(client, expected)
          : await finishMicrosoftStaffSignIn(client, expected));
        if (verified) {
          status.textContent = 'Microsoft sign-in verified against your existing Hub account.';
          if (standalone) browser.location.replace(new URL('./', MICROSOFT_PILOT_CALLBACK).href);
          return;
        }
        if (standalone && data?.session) await client.auth.signOut({ scope: 'local' });
      }
      status.textContent = failed
        ? 'Microsoft sign-in was cancelled or unavailable. Open the pilot again to retry.'
        : 'The Microsoft sign-in could not be verified. Return to Hub sign-in.';
    } catch {
      status.textContent = 'The Microsoft sign-in could not be verified. Return to Hub sign-in.';
    }
    return;
  }

  if (!enabled) {
    status.textContent = 'The staff pilot is not open yet. Use your existing Hub sign-in.';
    return;
  }

  try {
    const client = await getClient();
    const standalone = standaloneEnabled && url.searchParams.get('mode') === 'standalone';
    if (standalone) {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data?.session) { await getPilotAccount(client, { allowStudents: true }); }
    } else await getPilotAccount(client);
    status.textContent = 'Click the button below to sign in with your school Microsoft 365 account.';
    button.hidden = false;
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      status.textContent = 'Opening Microsoft sign-in…';
      try {
        let account;
        if (standalone) {
          const { data, error } = await client.auth.getSession();
          if (error) throw error;
          // Preserve the original UUID check if a session already exists.
          account = { ...(data?.session ? await getPilotAccount(client, { allowStudents: true }) : {}), mode: 'standalone' };
        } else account = await getPilotAccount(client);
        browser.sessionStorage.setItem(pendingKey, JSON.stringify({ ...account, startedAt: Date.now() }));
        await startMicrosoftSignIn(client, MICROSOFT_PILOT_CALLBACK);
      } catch {
        browser.sessionStorage.removeItem(pendingKey);
        status.textContent = 'Microsoft sign-in could not start. Try again or use your existing Hub sign-in.';
        button.disabled = false;
      }
    });
  } catch {
    status.textContent = 'Microsoft sign-in is available only to approved pilot accounts. Return to Hub sign-in to use your password.';
  }
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('microsoft-sign-in');
  if (root) void bootMicrosoftPilot(root);
}
