import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApps } from '../src/api.js';
import { loadAppState, bootApp } from '../src/app.js';

function appsClient() {
  return {
    from: () => ({ select: () => ({ order: async () => ({ data: [{ app_key:'reading', enabled:true }], error:null }) }) })
  };
}

test('loadApps returns enabled app records from backend', async () => {
  const data = await loadApps(appsClient());
  assert.equal(data[0].app_key, 'reading');
});

test('loadAppState sends unauthenticated users to login', async () => {
  const client = { auth: { getUser: async () => ({ data:{ user:null }, error:null }) } };
  const state = await loadAppState(client);
  assert.equal(state.view, 'login');
});

test('bootApp delegates form submission at the persistent app root', async () => {
  const listeners = [];
  const root = {
    innerHTML: '',
    addEventListener(type, handler) { listeners.push({ type, handler }); },
    querySelector() { return null; }
  };
  const previousDocument = global.document;
  global.document = { getElementById(id) { return id === 'app' ? root : null; } };

  const profile = { id: 'user-1', role: 'student', display_name: 'Student', school_email: 's@example.com', active: true, must_change_password: true };
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
    from(name) {
      assert.equal(name, 'profiles');
      return {
        select() { return this; },
        eq() { return this; },
        async single() { return { data: profile, error: null }; }
      };
    }
  };

  try {
    await bootApp(client);
    assert.equal(listeners.filter(x => x.type === 'submit').length, 1);
  } finally {
    global.document = previousDocument;
  }
});
