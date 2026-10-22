import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSeenContent, saveSeenContent, mergeSeen, SEEN_PER_WORD } from '../src/vocabulary/seen-content.js';

function memoryStorage() { const m = new Map(); return { getItem:k => m.has(k) ? m.get(k) : null, setItem:(k, v) => m.set(k, v), removeItem:k => m.delete(k) }; }

test('seen content persists per student and word, newest last, capped', () => {
  const storage = memoryStorage();
  saveSeenContent('stu-a', 'occ1', ['c1', 'c2'], storage);
  saveSeenContent('stu-a', 'occ1', ['c1'], storage);
  saveSeenContent('stu-b', 'occ1', ['other'], storage);
  assert.deepEqual(loadSeenContent('stu-a', storage).get('occ1'), ['c2', 'c1'], 're-seen item moves to the end');
  assert.deepEqual(loadSeenContent('stu-b', storage).get('occ1'), ['other'], 'students are separate');
  const many = Array.from({ length:SEEN_PER_WORD + 5 }, (_, i) => `x${i}`);
  assert.equal(mergeSeen([], many).length, SEEN_PER_WORD);
  assert.equal(mergeSeen([], many).at(-1), `x${SEEN_PER_WORD + 4}`);
});

test('unavailable or corrupt storage never throws', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(loadSeenContent('x', broken).size, 0);
  assert.doesNotThrow(() => saveSeenContent('x', 'o', ['a'], broken));
  assert.equal(loadSeenContent('x', { getItem:() => '{not json' }).size, 0);
});
