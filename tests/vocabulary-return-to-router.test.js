import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { redirectToHubSignIn, getSessionStorage } from '../src/return-target.js';

const source = fs.readFileSync(new URL('../src/vocabulary/router.js', import.meta.url), 'utf8');

function block(startNeedle) {
  const start = source.indexOf(startNeedle);
  assert.ok(start > -1, startNeedle);
  const open = source.indexOf('{', start);
  const close = source.indexOf('}', open);
  return source.slice(open, close + 1);
}

test('router imports the redirect helper', () => {
  assert.match(source, /import \{[^}]*redirectToHubSignIn[^}]*\} from '\.\.\/return-target\.js'/);
});

test('router stores the target only in the no-session branch', () => {
  assert.match(block('if (userError || !userData?.user)'), /redirectToHubSignIn\(/);
  assert.doesNotMatch(block('if (profileError || !profile?.active)'), /redirectToHubSignIn\(/);
  assert.equal((source.match(/redirectToHubSignIn\(/g) ?? []).length, 1);
});

test('router never builds the target from the url', () => {
  assert.match(source, /redirectToHubSignIn\(getSessionStorage\(\), window\.location\)/);
  assert.doesNotMatch(source, /window\.sessionStorage/);
  assert.doesNotMatch(source, /storeVocabularyReturnTarget/);
});

test('role routing and preview handling are unchanged', () => {
  assert.match(source, /URLSearchParams[\s\S]*\.get\(['"]preview['"]\)/);
  assert.match(source, /profile\.role === ['"]teacher['"]|profile\.role === ['"]admin['"]/);
  assert.match(source, /initialiseVocabularyTeacher/);
  assert.match(source, /profile\.role === 'student'/);
});

test('redirect still happens when storage throws', () => {
  const blocked = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const replaced = [];
  redirectToHubSignIn(blocked, { replace: target => replaced.push(target) });
  assert.deepEqual(replaced, ['./']);
});

test('a signed-in teacher is not given a stored target', () => {
  const noSessionBranch = block('if (userError || !userData?.user)');
  const outside = source.replace(noSessionBranch, '');
  assert.doesNotMatch(outside, /redirectToHubSignIn\(|storeVocabularyReturnTarget/);
});

test('reading a blocked sessionStorage property does not throw and yields null', () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try {
    assert.equal(getSessionStorage(), null);
    const replaced = [];
    redirectToHubSignIn(getSessionStorage(), { replace: target => replaced.push(target) });
    assert.deepEqual(replaced, ['./']);
  } finally {
    if (saved) Object.defineProperty(globalThis, 'sessionStorage', saved); else delete globalThis.sessionStorage;
  }
});
