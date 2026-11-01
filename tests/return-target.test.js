import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  RETURN_TARGET_KEY,
  RETURN_TARGET_TTL_MS,
  storeVocabularyReturnTarget,
  takeReturnPath,
  clearReturnTarget,
  redirectToHubSignIn
} from '../src/return-target.js';

function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    raw: key => data.get(key),
    getItem(key) { calls.push(['getItem', key]); return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { calls.push(['setItem', key]); data.set(key, String(value)); },
    removeItem(key) { calls.push(['removeItem', key]); data.delete(key); }
  };
}

const throwingStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
  removeItem() { throw new Error('blocked'); }
};

test('stores a fixed token, not a url', () => {
  const storage = fakeStorage();
  assert.equal(storeVocabularyReturnTarget(storage, 1000), true);
  const raw = storage.raw(RETURN_TARGET_KEY);
  assert.deepEqual(JSON.parse(raw), { target: 'vocabulary', storedAt: 1000 });
  assert.ok(!/[/?]|\.html|http/.test(JSON.parse(raw).target));
});

test('take returns the fixed path once and removes the key', () => {
  const storage = fakeStorage();
  storeVocabularyReturnTarget(storage, 1000);
  assert.equal(takeReturnPath(storage, 2000), 'vocabulary.html');
  assert.equal(takeReturnPath(storage, 2000), null);
  assert.equal(storage.raw(RETURN_TARGET_KEY), undefined);
});

test('returned path can never carry a query, fragment or preview', () => {
  const storage = fakeStorage();
  storeVocabularyReturnTarget(storage, 1000);
  const path = takeReturnPath(storage, 1000);
  assert.equal(path, 'vocabulary.html');
  assert.ok(!/[?#]|preview/.test(path));
});

test('take discards expired targets', () => {
  const expired = fakeStorage();
  storeVocabularyReturnTarget(expired, 1000);
  assert.equal(takeReturnPath(expired, 1000 + RETURN_TARGET_TTL_MS + 1), null);
  assert.equal(expired.raw(RETURN_TARGET_KEY), undefined);
  const fresh = fakeStorage();
  storeVocabularyReturnTarget(fresh, 1000);
  assert.equal(takeReturnPath(fresh, 1000 + RETURN_TARGET_TTL_MS), 'vocabulary.html');
});

test('take discards a target stamped in the future', () => {
  const storage = fakeStorage();
  storeVocabularyReturnTarget(storage, 5000);
  assert.equal(takeReturnPath(storage, 1000), null);
  assert.equal(storage.raw(RETURN_TARGET_KEY), undefined);
});

test('take rejects malformed and hostile values and removes them', () => {
  const hostile = [
    'not json', 'null', '"vocabulary"', '{}', '[]',
    '{"target":"https://evil.example/","storedAt":1000}',
    '{"target":"vocabulary.html?preview=1","storedAt":1000}',
    '{"target":"vocabulary","storedAt":"1000"}',
    '{"target":"vocabulary","storedAt":1000,"path":"admin.html"}',
    '{"target":"Vocabulary","storedAt":1000}',
    '[{"target":"vocabulary","storedAt":1000}]'
  ];
  for (const value of hostile) {
    const storage = fakeStorage({ [RETURN_TARGET_KEY]: value });
    assert.equal(takeReturnPath(storage, 1000), null, value);
    assert.equal(storage.raw(RETURN_TARGET_KEY), undefined, value);
  }
});

test('an extra field never changes the returned path', () => {
  const storage = fakeStorage({ [RETURN_TARGET_KEY]: '{"target":"vocabulary","storedAt":1000,"path":"admin.html"}' });
  assert.notEqual(takeReturnPath(storage, 1000), 'admin.html');
});

test('helpers never throw when storage throws', () => {
  assert.equal(storeVocabularyReturnTarget(throwingStorage, 1), false);
  assert.equal(takeReturnPath(throwingStorage, 1), null);
  assert.doesNotThrow(() => clearReturnTarget(throwingStorage));
});

test('helpers never throw when storage is missing', () => {
  for (const missing of [undefined, null]) {
    assert.equal(storeVocabularyReturnTarget(missing, 1), false);
    assert.equal(takeReturnPath(missing, 1), null);
    assert.doesNotThrow(() => clearReturnTarget(missing));
  }
});

test('redirectToHubSignIn stores then replaces with ./', () => {
  const storage = fakeStorage();
  const order = [];
  const location = { replace(target) { order.push(['replace', target]); } };
  const original = storage.setItem.bind(storage);
  storage.setItem = (k, v) => { order.push(['setItem']); original(k, v); };
  redirectToHubSignIn(storage, location, 1000);
  assert.deepEqual(order, [['setItem'], ['replace', './']]);
});

test('redirectToHubSignIn still replaces when storage throws', () => {
  const replaced = [];
  redirectToHubSignIn(throwingStorage, { replace: target => replaced.push(target) }, 1000);
  assert.deepEqual(replaced, ['./']);
});

test('module source contains no reference to location.search, location.hash, referrer or preview', () => {
  const source = fs.readFileSync(new URL('../src/return-target.js', import.meta.url), 'utf8');
  for (const word of ['search', 'hash', 'referrer', 'preview']) assert.ok(!source.includes(word), word);
});
