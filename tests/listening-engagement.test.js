import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldCountListeningTime, capListeningFlush } from '../src/tracking/listening-engagement.js';

test('visible playing audio counts even when pointer input is stale', () => {
  assert.equal(shouldCountListeningTime({ visible:true, audioPlaying:true, recentlyInteractive:false }), true);
});

test('paused or ended audio does not count without recent interaction', () => {
  assert.equal(shouldCountListeningTime({ visible:true, audioPlaying:false, recentlyInteractive:false }), false);
});

test('hidden page never counts even if audio reports playing', () => {
  assert.equal(shouldCountListeningTime({ visible:false, audioPlaying:true, recentlyInteractive:true }), false);
});

test('recent visible interaction can count when audio is not playing', () => {
  assert.equal(shouldCountListeningTime({ visible:true, audioPlaying:false, recentlyInteractive:true }), true);
});

test('active-time flush remains capped at 600 seconds', () => {
  assert.equal(capListeningFlush(750), 600);
  assert.equal(capListeningFlush(90), 90);
  assert.equal(capListeningFlush(0), 0);
});
