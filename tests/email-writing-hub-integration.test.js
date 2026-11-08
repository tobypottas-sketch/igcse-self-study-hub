import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../email-writing-app.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../email-writing-hub-polish.css', import.meta.url), 'utf8');

test('email writer keeps the full student navigation and practice modes', () => {
  for (const tab of ['task','examples','plan','draft','dashboard','preview','export','drafts']) {
    assert.match(html, new RegExp('data-tab="'+tab+'"'));
  }
  assert.match(html, /id="examModeToggle"/);
  assert.match(html, /id="writingHelpDock"/);
  assert.match(html, /id="tabTeacher"/);
});

test('hub styling is loaded after the legacy stylesheet and supplies its own responsive rules', () => {
  const legacy = html.indexOf('</style>');
  const polish = html.indexOf('email-writing-hub-polish.css');
  assert.ok(legacy >= 0 && polish > legacy);
  assert.match(css, /\.app-header\s*\{/);
  assert.match(css, /\.tab-bar\s*\{/);
  assert.match(css, /@media\s*\(max-width:720px\)/);
  assert.match(html, /Cambridge IGCSE 0511 Informal Email Writing/);
  assert.match(html, /Back to Hub/);
});

test('email writer requires an authenticated active hub profile before exposing its UI', () => {
  assert.match(html, /getCurrentProfile\(client\)/);
  assert.match(html, /email-auth-ready/);
  assert.match(html, /__emailWriterAccountId=profile\.id/);
  assert.match(html, /event==='SIGNED_OUT'/);
});

test('draft storage remains local but is namespaced to the signed-in user', () => {
  assert.match(html, /function emailStoragePrefix\(\)/);
  assert.match(html, /'email-writer:'\+window\.__emailWriterAccountId/);
  assert.match(html, /localStorage\.setItem\(emailScopedKey\(key\)/);
  assert.match(html, /localStorage\.getItem\(emailScopedKey\(key\)/);
  assert.match(html, /localStorage\.removeItem\(emailScopedKey\(key\)/);
});

test('main embedded classic JavaScript remains parseable', () => {
  const scripts = [...html.matchAll(/<script(?![^>]*type="module")[^>]*>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length > 0, 'expected an inline application script');
  for (const script of scripts) new Script(script[1], { filename:'email-writing-app.inline.js' });
});

test('draft workspace keeps the current task visible without changing student writing IDs', () => {
  for (const id of ['draftTaskQuestion','draftTaskBP1','draftTaskBP2','draftTaskBP3','draftTaskAudience','draftTaskTarget','draftWordCountBadge']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  for (const id of ['draftOpening','draftBP1','draftBP2','draftBP3','draftClosing','draftSignoff']) {
    assert.equal((html.match(new RegExp('id="' + id + '"','g')) ?? []).length, 1);
  }
  assert.match(html, /function updateDraftTaskRail\(\)/);
  assert.match(html, /if \(tabId === 'draft'\)/);
  assert.match(html, /badge\.textContent = total/);
});

test('optional trainers are collapsed while remaining accessible', () => {
  assert.match(html, /<details class="dev-trainer-launch draft-practice-tools">/);
  assert.match(html, /id="devOpen"/);
  assert.match(html, /id="errorOpen"/);
  assert.match(html, /email-writing-hub-polish\.css\?v=13/);
});

test('writing assistance stays in a collapsed sidebar control instead of floating over the editor', () => {
  assert.equal((html.match(/id="writingHelpDock"/g) ?? []).length, 1);
  assert.match(html, /<details class="writing-help-menu">/);
  assert.match(html, /data-help-open="cards"/);
  assert.match(html, /data-help-open="task"/);
  assert.match(html, /id="hideAllHelp"/);
  assert.ok(html.indexOf('id="writingHelpDock"') < html.indexOf('</aside>', html.indexOf('class="draft-task-rail"')));
  assert.match(html, /email-writing-hub-polish\.css\?v=13/);
});

test('detailed progress is optional and an empty draft never shows equal bullet segments', () => {
  assert.match(html, /<details class="draft-progress-details">/);
  assert.match(html, /class="balance-bar is-empty" id="balanceBar"/);
  assert.match(html, /if \(total === 0\) \{\s*bar\.classList\.add\('is-empty'\)/);
  assert.match(html, /bar\.replaceChildren\(\)/);
  assert.match(html, /bar\.classList\.remove\('is-empty'\)/);
  assert.match(html, /email-writing-hub-polish\.css\?v=13/);
  assert.equal((html.match(/id="draftWordCountBadge"/g) ?? []).length, 1);
});

test('review screen presents three focused steps with an empty-draft state', () => {
  assert.match(html, /class="tab-panel review-workspace" id="panel-dashboard"/);
  assert.match(html, /id="reviewEmpty" hidden/);
  assert.match(html, /class="review-step-layout"/);
  assert.match(html, /class="card review-section review-content"/);
  assert.match(html, /class="card review-section review-language"/);
  assert.match(html, /class="card review-section review-improve"/);
  assert.match(html, /dashboard\.classList\.toggle\('review-has-no-draft', count === 0\)/);
  assert.match(html, /className = 'review-bullet-prompt'/);
  for (const id of ['reviewFacts','reviewBullets','reviewContentGoal','reviewLanguageGoal','reviewDone']) {
    assert.equal((html.match(new RegExp('id="' + id + '"','g')) ?? []).length, 1);
  }
});

test('plan screen retains all saved fields in concise task-led layout', () => {
  for (const id of ['planWho','planReason','planBP1','planBP1Dev','planBP2','planBP2Dev','planBP3','planBP3Dev','planTone','planClosing']) {
    assert.equal((html.match(new RegExp('id="' + id + '"','g')) ?? []).length, 1);
  }
  assert.match(html, /id="planTaskQuestion"/);
  assert.match(html, /function updatePlanTaskReference\(\)/);
  assert.match(html, /if \(tabId === 'plan'\) updatePlanTaskReference\(\)/);
  assert.match(html, /class="plan-points"/);
  assert.match(html, /<details class="plan-finishing">/);
  assert.match(html, /email-writing-hub-polish\.css\?v=13/);
});

test('header groups the exam details and return navigation without a standalone top row', () => {
  assert.match(html, /<nav class="email-header-toolbar"/);
  assert.match(html, /class="email-header-exam"/);
  assert.match(html, /class="email-header-back" href="\.\/"/);
  assert.doesNotMatch(html, /<nav class="hub-topbar"/);
  assert.doesNotMatch(html, /class="header-qual"/);
  assert.match(html, /email-writing-hub-polish\.css\?v=13/);
  assert.match(css, /\.email-header-toolbar\s*\{/);
});

test('practice task select uses a bounded responsive control group', () => {
  assert.match(html, /class="task-select-controls"/);
  assert.match(html, /id="examTaskSelect"/);
  assert.match(html, /id="examTaskLoadButton"/);
  assert.match(html, /email-writing-hub-polish\.css\?v=13/);
  assert.match(css, /#panel-task \.task-select-controls/);
  assert.match(css, /max-width:690px/);
});

test('practice task picker is a bounded listbox over the unchanged native select', () => {
  assert.match(html, /function enhanceTaskSelect\(select\)/);
  assert.match(html, /enhanceTaskSelect\(select\);/);
  assert.match(html, /role', 'listbox'/);
  assert.match(html, /select\.dispatchEvent\(new Event\('change'/);
  assert.match(css, /\.task-combo__list\{[^}]*overflow-y:auto/);
  assert.match(html, /id="examTaskSelect"/);
  assert.match(html, /id="examTaskLoadButton"/);
});
