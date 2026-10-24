import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderEngagementHome, renderAchievementsSheet, renderEngagementStrip } from '../src/vocabulary/views.js';
import { achievements, computeXp, describeEngagement, evaluateMission, meritProgress, weeklyGoal } from '../src/vocabulary/engagement-model.js';
import { loadSeenAchievements, markAchievementsSeen, newAchievements } from '../src/vocabulary/achievements-seen.js';

function fakeStorage() { const map = new Map(); return { getItem:key => map.has(key) ? map.get(key) : null, setItem:(key, value) => map.set(key, value) }; }
const level = computeXp({ missions:[], snapshot:null });

test('home strip shows Level N, XP, weekly goal text, merit progress phrasing and the achievements button', () => {
  const html = renderEngagementHome({ level:{ ...level, level:3, xp:320, next:450, progressPercent:60 }, weekly:weeklyGoal([]), merit:meritProgress(4, 1), achievementsUnlocked:5, achievementsTotal:14, newCount:2 });
  assert.match(html, /Level 3/);
  assert.match(html, /320 \/ 450 XP/);
  assert.match(html, /0 of 4 missions this week/);
  assert.match(html, /6 more passed stages toward your next teacher-awarded merit/);
  assert.match(html, /data-action="open-achievements"/);
  assert.match(html, /Achievements 5 \/ 14/);
  assert.match(html, /2 new/);
  assert.doesNotMatch(html, /Explorer|Builder|Skilled|Advanced/);
});

test('home strip is absent when there is no engagement data (preview)', () => {
  assert.equal(renderEngagementHome(null), '');
});

test('achievements sheet lists all 14 with written locked/unlocked state, no dates, and a focusable close button', () => {
  const list = achievements({ missions:[], snapshot:null }).map((item, index) => ({ ...item, unlocked:index < 2 }));
  const html = renderAchievementsSheet(list);
  assert.equal((html.match(/data-achievement="/g) ?? []).length, 14);
  assert.equal((html.match(/is-unlocked/g) ?? []).length, 2);
  assert.match(html, /Unlocked/);
  assert.match(html, /Locked/);
  assert.match(html, /role="dialog" aria-modal="true"/);
  assert.match(html, /data-action="close-achievements"[^>]*data-autofocus/);
  assert.doesNotMatch(html, /Personal Best|20\d\d|unlocked on/i);
});

test('finish strip shows XP, level-up and at most two achievements with a +N more', () => {
  const rows = [{ mission_id:'a', unit_number:1, mission_kind:'pathway', pathway_id:'meaning', pathway_stage:'recognise', practice_family:'recommended', mission_size:10, score:6, stars:1, best_streak:3, completed_at:'2026-10-01T00:00:00Z' }];
  const info = describeEngagement(evaluateMission(rows, 'a'), null, { xpGained:35, level:4, levelUp:true, unlocked:[{ name:'Hot Streak' }, { name:'Comeback' }, { name:'Stage Climber' }] });
  const html = renderEngagementStrip(info);
  assert.match(html, /\+35 XP/);
  assert.match(html, /Level up: Level 4/);
  assert.match(html, /Achievement unlocked: Hot Streak, Comeback \(\+1 more\)/);
  assert.match(info.spoken, /35 XP earned\. Level 4\. Achievement unlocked/);
});

test('"seen" flag is cosmetic: first visit announces nothing already earned; later unlocks are announced once', () => {
  const storage = fakeStorage();
  const first = achievements({ missions:[{ mission_id:'a', score:6, best_streak:3, completed_at:'2026-10-01T00:00:00Z', mission_kind:'pathway', pathway_id:'meaning' }], snapshot:null });
  assert.deepEqual(newAchievements(first, 'u1', storage), []);
  assert.ok(loadSeenAchievements('u1', storage).has('first_steps'));
  const later = achievements({ missions:[{ mission_id:'a', score:10, best_streak:10, completed_at:'2026-10-01T00:00:00Z', mission_kind:'pathway', pathway_id:'meaning' }], snapshot:null });
  assert.deepEqual(newAchievements(later, 'u1', storage).map(item => item.id).sort(), ['hot_streak', 'perfect_ten']);
  markAchievementsSeen(later, 'u1', storage);
  assert.deepEqual(newAchievements(later, 'u1', storage), []);
  assert.equal(loadSeenAchievements('u2', storage), null);
});

test('wiring: sheet closes on Escape and returns focus; nothing engagement-related writes to the database', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(app, /event\.key === 'Escape' && root\.querySelector\?\.\('\[data-achievements-backdrop\]'\)/);
  assert.match(app, /state\.achievementsReturn\?\.focus\?\.\(\)/);
  const data = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(data, /vocabulary_merit_awards['"]\)\s*\.(insert|update|upsert|delete)/);
  const model = fs.readFileSync(new URL('../src/vocabulary/engagement-model.js', import.meta.url), 'utf8');
  assert.doesNotMatch(model, /\.from\(|\.rpc\(|fetch\(/);
});
