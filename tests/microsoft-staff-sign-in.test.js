import test from 'node:test';
import assert from 'node:assert/strict';
import { startMicrosoftSignIn } from '../src/auth.js';
import { bootMicrosoftPilot, finishMicrosoftStaffSignIn, MICROSOFT_PILOT_CALLBACK } from '../src/microsoft-sign-in.js';

const expected = { id: 'existing-admin', email: 'admin@example.test' };
const azure = { provider: 'azure', identity_data: { email: expected.email, email_verified: true } };

function fixture({ userOverrides, profileOverrides, missingProfile = false } = {}) {
  const user = { ...expected, email_confirmed_at: 'confirmed', identities: [azure], ...userOverrides };
  const profile = { id: expected.id, role: 'admin', active: true, must_change_password: false,
    school_email: expected.email, ...profileOverrides };
  const signOuts = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user } }),
      exchangeCodeForSession: async code => {
        assert.equal(code, 'mock');
        return { data: { session: { user } } };
      },
      signOut: async options => { signOuts.push(options); }
    },
    from: table => {
      assert.equal(table, 'profiles');
      return { select: () => ({ eq: (field, value) => {
        assert.deepEqual([field, value], ['id', user.id]);
        return { single: async () => ({ data: missingProfile ? null : profile }) };
      } }) };
    }
  };
  return { client, signOuts };
}

function page(href = MICROSOFT_PILOT_CALLBACK, pending = null) {
  const status = { textContent: '' };
  const button = { hidden: true, addEventListener(type, action) { this.click = action; } };
  const replaced = [];
  const browser = {
    location: { href },
    sessionStorage: {
      getItem: () => pending,
      removeItem: () => { pending = null; },
      setItem: (key, value) => { pending = value; }
    },
    history: { replaceState: (...args) => replaced.push(args.at(-1)) }
  };
  return { status, button, browser, replaced, pending: () => pending,
    root: { querySelector: selector => selector.includes('status') ? status : button } };
}

test('requests Azure with the email scope, fixed callback and account picker', async () => {
  await startMicrosoftSignIn({ auth: { signInWithOAuth: async options => {
    assert.deepEqual(options, { provider: 'azure', options: {
      scopes: 'email', redirectTo: MICROSOFT_PILOT_CALLBACK, queryParams: { prompt: 'select_account' }
    } });
    return {};
  } } }, MICROSOFT_PILOT_CALLBACK);
});

test('disabled pilot and arbitrary query markers do not initialize auth', async () => {
  const view = page(MICROSOFT_PILOT_CALLBACK + '?microsoft-return=1');
  await bootMicrosoftPilot(view.root, { browser: view.browser, getClient: () => assert.fail() });
  assert.equal(view.button.hidden, true);
  assert.match(view.status.textContent, /not open/);
});

test('successful callback consumes the original UUID and clears the callback code', async () => {
  const href = MICROSOFT_PILOT_CALLBACK + '?code=mock';
  const view = page(href, JSON.stringify({ ...expected, startedAt: Date.now() }));
  await bootMicrosoftPilot(view.root, { browser: view.browser, enabled: true, getClient: () => fixture().client });
  assert.match(view.status.textContent, /verified against your existing/);
  assert.equal(view.pending(), null);
  assert.deepEqual(view.replaced, [MICROSOFT_PILOT_CALLBACK]);
});

test('cancellation, stale attempts and callbacks without a pending attempt do not initialize auth', async () => {
  const callback = '?code=mock';
  for (const view of [
    page(MICROSOFT_PILOT_CALLBACK + '?error=access_denied'),
    page(MICROSOFT_PILOT_CALLBACK + callback),
    page(MICROSOFT_PILOT_CALLBACK + callback, JSON.stringify({ ...expected, startedAt: 0 }))
  ]) {
    await bootMicrosoftPilot(view.root, { browser: view.browser, enabled: true, getClient: () => assert.fail() });
    assert.equal(view.button.hidden, true);
    assert.deepEqual(view.replaced, [MICROSOFT_PILOT_CALLBACK]);
  }
});

test('OAuth launch failure clears the pending attempt and restores the button', async () => {
  const view = page();
  const { client } = fixture();
  client.auth.signInWithOAuth = async () => ({ error: new Error('mock provider failure') });
  await bootMicrosoftPilot(view.root, { browser: view.browser, enabled: true, getClient: () => client });
  assert.equal(view.button.hidden, false);
  await view.button.click();
  assert.equal(view.pending(), null);
  assert.equal(view.button.disabled, false);
  assert.match(view.status.textContent, /could not start/);
});

test('denied callbacks sign out locally without changing the existing profile', async () => {
  for (const options of [
    { userOverrides: { id: 'different-auth-uuid' } },
    { userOverrides: { email: '' } },
    { userOverrides: { email_confirmed_at: null } },
    { userOverrides: { identities: [] } },
    { userOverrides: { identities: [azure, azure] } },
    { userOverrides: { identities: [{ ...azure, identity_data: { email: expected.email, email_verified: false } }] } },
    { userOverrides: { identities: [{ ...azure, identity_data: { email: 'other@example.test', email_verified: true } }] } },
    { missingProfile: true },
    { profileOverrides: { role: 'student' } },
    { profileOverrides: { role: 'teacher' } },
    { profileOverrides: { active: false } },
    { profileOverrides: { must_change_password: true } }
  ]) {
    const { client, signOuts } = fixture(options);
    assert.equal(await finishMicrosoftStaffSignIn(client, expected), false);
    assert.deepEqual(signOuts, [{ scope: 'local' }]);
  }
});
