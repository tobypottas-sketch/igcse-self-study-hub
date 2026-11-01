import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { bootApp } from '../src/app.js';
import { RETURN_TARGET_KEY, RETURN_TARGET_TTL_MS, storeVocabularyReturnTarget } from '../src/return-target.js';

function memoryStorage() {
  const data = new Map();
  return {
    raw: key => data.get(key),
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: key => { data.delete(key); }
  };
}

function makeClient({ profile, session, failSignIn = false, failUpdate = false }) {
  const builder = (table) => {
    const target = {
      select: () => proxy, eq: () => proxy, order: () => proxy, in: () => proxy, limit: () => proxy,
      single: async () => ({ data: profile, error: null }),
      update: (values) => { if (table === 'profiles') Object.assign(profile, values); return proxy; },
      then: (resolve) => resolve({ data: [], error: null })
    };
    const proxy = new Proxy(target, { get: (t, key) => (key in t ? t[key] : () => proxy) });
    return proxy;
  };
  return {
    auth: {
      getUser: async () => (session.signedIn ? { data: { user: { id: profile.id } }, error: null } : { data: { user: null }, error: null }),
      signInWithPassword: async () => {
        if (failSignIn) return { data: null, error: new Error('bad') };
        session.signedIn = true;
        return { data: { user: { id: profile.id }, session: {} }, error: null };
      },
      updateUser: async () => (failUpdate ? { data: null, error: new Error('fail') } : { data: { user: { id: profile.id } }, error: null }),
      signOut: async () => { session.signedIn = false; return { error: null }; }
    },
    from: builder
  };
}

async function harness({ role = 'teacher', must = false, active = true, signedIn = false, stored = 'fresh', raw = null, failSignIn = false, failUpdate = false } = {}) {
  const handlers = {};
  const root = { innerHTML: '', addEventListener(type, handler) { (handlers[type] ||= []).push(handler); }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const storage = memoryStorage();
  const replaced = [];
  const saved = { document: global.document, sessionStorage: global.sessionStorage, location: global.location, FormData: global.FormData };
  global.document = { getElementById: id => (id === 'app' ? root : null), querySelector: () => null, querySelectorAll: () => [] };
  global.sessionStorage = storage;
  global.location = { replace: target => replaced.push(target) };
  global.FormData = class { constructor(form) { this.fields = form.fields; } get(key) { return this.fields[key]; } };
  const profile = { id: 'u1', role, display_name: 'U', school_email: 'u@example.com', active, must_change_password: must };
  const session = { signedIn };
  if (raw !== null) storage.setItem(RETURN_TARGET_KEY, raw);
  else if (stored === 'fresh') storeVocabularyReturnTarget(storage);
  else if (stored === 'expired') storeVocabularyReturnTarget(storage, Date.now() - RETURN_TARGET_TTL_MS - 5000);
  const client = makeClient({ profile, session, failSignIn, failUpdate });
  await bootApp(client);
  const submit = async (kind, fields = {}) => {
    const form = { dataset: { form: kind }, fields, querySelector: () => null };
    for (const handler of handlers.submit ?? []) await handler({ target: form, preventDefault() {} });
  };
  const click = async (action) => {
    const el = { dataset: { action } };
    for (const handler of handlers.click ?? []) await handler({ target: { closest: () => el, dataset: {} }, preventDefault() {} });
  };
  const restore = () => { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete global[k]; else global[k] = v; } };
  return { submit, click, replaced, storage, root, profile, restore };
}

async function withHarness(options, body) {
  const h = await harness(options);
  try { await body(h); } finally { h.restore(); }
}

const LOGIN = { email: 't@example.com', password: 'Secret123!' };
const hasKey = h => h.storage.raw(RETURN_TARGET_KEY) !== undefined;

test('teacher sign-in with a stored target lands on vocabulary.html once', () => withHarness({}, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, ['vocabulary.html']);
  assert.equal(hasKey(h), false);
}));

test('target is consumed only once', () => withHarness({}, async h => {
  await h.submit('login', LOGIN);
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, ['vocabulary.html']);
}));

test('admin sign-in with a stored target also returns', () => withHarness({ role: 'admin' }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, ['vocabulary.html']);
}));

test('teacher sign-in without a stored target stays on the Hub home', () => withHarness({ stored: 'none' }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, []);
  assert.ok(h.root.innerHTML.length > 0);
}));

test('student sign-in discards the target and stays on the Hub home', () => withHarness({ role: 'student' }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), false);
}));

test('inactive profile never follows a target', () => withHarness({ active: false }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, []);
}));

test('failed sign-in does not consume or follow the target', () => withHarness({ failSignIn: true }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), true);
}));

test('target survives the change-password view', () => withHarness({ must: true }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), true);
}));

test('mismatched passwords do not consume the target', () => withHarness({ must: true }, async h => {
  await h.submit('login', LOGIN);
  await h.submit('change-password', { password: 'NewSecure123!', confirmPassword: 'Different123!' });
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), true);
}));

test('password change then return happens once', () => withHarness({ must: true }, async h => {
  await h.submit('login', LOGIN);
  await h.submit('change-password', { password: 'NewSecure123!', confirmPassword: 'NewSecure123!' });
  assert.deepEqual(h.replaced, ['vocabulary.html']);
  assert.equal(hasKey(h), false);
}));

test('failed password change does not consume the target', () => withHarness({ must: true, failUpdate: true }, async h => {
  await h.submit('login', LOGIN);
  await h.submit('change-password', { password: 'NewSecure123!', confirmPassword: 'NewSecure123!' });
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), true);
}));

test('hub opened already signed in discards a stale target', () => withHarness({ signedIn: true }, async h => {
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), false);
}));

test('hub opened signed out keeps the target for the sign-in', () => withHarness({}, async h => {
  assert.deepEqual(h.replaced, []);
  assert.equal(hasKey(h), true);
}));

test('expired target falls back to normal Hub behaviour', () => withHarness({ stored: 'expired' }, async h => {
  await h.submit('login', LOGIN);
  assert.deepEqual(h.replaced, []);
}));

test('logout clears the target', () => withHarness({ signedIn: true, stored: 'none' }, async h => {
  storeVocabularyReturnTarget(h.storage);
  await h.click('logout');
  assert.equal(hasKey(h), false);
}));

test('hostile stored values never navigate', async () => {
  const hostile = [
    '{"target":"https://evil.example/","storedAt":' + Date.now() + '}',
    '{"target":"vocabulary.html?preview=1","storedAt":' + Date.now() + '}',
    '{"target":"vocabulary","storedAt":' + Date.now() + ',"path":"vocabulary.html?preview=1"}'
  ];
  for (const raw of hostile) {
    await withHarness({ raw }, async h => {
      await h.submit('login', LOGIN);
      assert.deepEqual(h.replaced, [], raw);
    });
  }
});

test('no code path can navigate to preview', async () => {
  const scenarios = [{}, { role: 'admin' }, { must: true }, { role: 'student' }, { stored: 'expired' }];
  for (const options of scenarios) {
    await withHarness(options, async h => {
      await h.submit('login', LOGIN);
      if (options.must) await h.submit('change-password', { password: 'NewSecure123!', confirmPassword: 'NewSecure123!' });
      for (const target of h.replaced) assert.ok(!/preview|\?/.test(target), target);
    });
  }
});

test('password recovery module is untouched', () => {
  const source = fs.readFileSync(new URL('../src/password-recovery.js', import.meta.url));
  const text = source.toString('utf8');
  assert.doesNotMatch(text, /return-target|takeReturnPath|clearReturnTarget/);
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), PASSWORD_RECOVERY_SHA256);
});

test('normal logins are unchanged', async () => {
  for (const role of ['student', 'teacher', 'admin']) {
    await withHarness({ role, stored: 'none' }, async h => {
      await h.submit('login', LOGIN);
      assert.deepEqual(h.replaced, [], role);
      assert.ok(h.root.innerHTML.length > 0, role);
    });
  }
  await withHarness({ role: 'teacher', must: true, stored: 'none' }, async h => {
    await h.submit('login', LOGIN);
    assert.match(h.root.innerHTML, /password/i);
    assert.deepEqual(h.replaced, []);
  });
});

const PASSWORD_RECOVERY_SHA256 = '5fefbfe9d1812bc24c6b425420aa3fcd4a91f91ab1d6fd6a047a9172ba81ab0a';
