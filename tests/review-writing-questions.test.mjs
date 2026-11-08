import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('review-writing.html', 'utf8');
const script = html.slice(html.indexOf("const CATEGORY_NAMES"), html.indexOf('const FIELD_MAP')) + html.slice(html.indexOf('const DRAFT_HELP'), html.indexOf('function updateWritingGuidance'));
const sandbox = {};
vm.runInNewContext(script + ';this.Q = QUESTIONS; this.N = CATEGORY_NAMES; this.PG = PLAN_GUIDANCE; this.DH = DRAFT_HELP;', sandbox);
const { Q, N, PG, DH } = sandbox;
const categories = ['restaurant', 'film', 'book', 'experience'];
const all = categories.flatMap(c => Q[c]);
const PLAN_IDS = ['planSubject', 'planOpening', 'planDetails', 'planExample', 'planPositive', 'planImprovement', 'planAudience'];
const DRAFT_KEYS = ['intro', 'description', 'opinion', 'recommendation'];

test('four categories hold five questions each, twenty in total', () => {
  assert.deepEqual(Object.keys(Q), categories);
  for (const c of categories) { assert.equal(Q[c].length, 5, c); assert.ok(N[c], c + ' has a display name'); }
  assert.equal(all.length, 20);
});

test('ids and titles are unique, short and numbered by category', () => {
  assert.equal(new Set(all.map(q => q.id)).size, 20);
  assert.equal(new Set(all.map(q => q.title)).size, 20);
  for (const c of categories) Q[c].forEach((q, i) => { assert.equal(q.id, c + '-' + (i + 1)); assert.ok(q.title.length >= 12 && q.title.length <= 52, q.title); });
});

test('the four original tasks are kept word for word as question 1 of each category', () => {
  assert.match(Q.restaurant[0].prompt, /^Your school magazine is preparing a feature about places to eat\./);
  assert.match(Q.film[0].prompt, /^Your school magazine is publishing film recommendations for teenagers\./);
  assert.match(Q.book[0].prompt, /^Your school newsletter is collecting book reviews/);
  assert.match(Q.experience[0].prompt, /^A youth website wants reviews of activities/);
});

test('every prompt names a publication context, asks for a review and gives three content requirements', () => {
  for (const q of all) {
    assert.match(q.prompt, /\b(magazine|newsletter|website|blog|newspaper|leaflet|page|library|department|club|council|site)\b/i, q.id + ' context');
    assert.match(q.prompt, /\bWrite a review\b/, q.id + ' asks for a review');
    const requirements = q.prompt.split(/\bWrite a review\b/)[1].split(/[.;,]/).map(x => x.trim()).filter(Boolean);
    assert.ok(requirements.length >= 3, q.id + ' has three requirements, found ' + requirements.length);
    assert.match(q.prompt, /\b(recommend|worth|encourage|should|suggest|second chance|use the service again|read it)\b/i, q.id + ' asks for a recommendation or judgement');
    assert.ok(q.prompt.length >= 250 && q.prompt.length <= 520, q.id + ' length ' + q.prompt.length);
    assert.doesNotMatch(q.prompt, /Cambridge|Paper \d|0511|\d+\s*(?:–|-|to)\s*\d+\s*words/i, q.id + ' is original and leaves the word target to the app');
  }
});

test('no two prompts in a category are near-duplicates', () => {
  const tokens = text => new Set(text.toLowerCase().match(/[a-z]{4,}/g));
  for (const c of categories) for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
    const a = tokens(Q[c][i].prompt), b = tokens(Q[c][j].prompt);
    const overlap = [...a].filter(w => b.has(w)).length / Math.min(a.size, b.size);
    assert.ok(overlap < 0.62, `${Q[c][i].id} and ${Q[c][j].id} overlap ${overlap.toFixed(2)}`);
  }
});

test('per-question guidance overrides only use real planning fields and draft sections, as [label, hint] pairs', () => {
  for (const q of all) {
    for (const [k, v] of Object.entries(q.plan || {})) { assert.ok(PLAN_IDS.includes(k), q.id + ' ' + k); assert.equal(v.length, 2); assert.ok(v.every(x => typeof x === 'string' && x.length > 8)); }
    for (const [k, v] of Object.entries(q.draft || {})) { assert.ok(DRAFT_KEYS.includes(k), q.id + ' ' + k); assert.equal(v.length, 2); }
  }
  for (const c of categories) { assert.deepEqual(Object.keys(PG[c]).sort(), [...PLAN_IDS].sort()); assert.deepEqual(Object.keys(DH[c]).sort(), [...DRAFT_KEYS].sort()); }
  assert.ok(all.slice(1).filter(q => q.plan).length >= 15 - 4, 'new tasks carry their own planning wording');
});

test('the page keeps the four category buttons, adds one compact select, and keeps the Teacher override', () => {
  assert.equal((html.match(/<button class="topic" data-topic="/g) || []).length, 4);
  assert.match(html, /<select id="questionSelect"/);
  assert.equal((html.match(/id="questionSelect"/g) || []).length, 1);
  assert.match(html, /id="customPrompt"/);
  assert.match(html, /const prompt=currentPrompt\(\)/);
  assert.match(html, /function currentPrompt\(\)\{return state\.customPrompt\.trim\(\)\|\|currentQuestion\(\)\.prompt;\}/);
});

test('the AI feedback task is the active prompt, and stale feedback is cleared when it changes', () => {
  assert.match(html, /window\.reviewWritingFeedbackSource=\(\)=>\(\{task:currentPrompt\(\)/);
  assert.match(html, /new Event\('review-feedback-reset'\)/);
  assert.match(readFileSync('src/assessor/review-feedback.js', 'utf8'), /review-feedback-reset', \(\) => feedback\.clear\(\)/);
});

test('changing category or question never rewrites the plan or the draft', () => {
  const handlers = html.slice(html.indexOf("document.querySelectorAll('[data-topic]').forEach(button=>"), html.indexOf("$('customPrompt').addEventListener"));
  assert.doesNotMatch(handlers, /state\.(plan|draft)\s*=|\.value\s*=\s*''|state\.draft\[[^\]]+\]\s*=/);
  assert.match(html, /have been kept/);
});

test('a task mismatch warning is present on every tab that shows the writing, with both escape actions', () => {
  assert.equal((html.match(/<div class="task-change-note[^>]*data-task-note/g) || []).length, 5, 'Task, Plan, Write, Review and Preview');
  for (const view of ['view-plan', 'view-write', 'view-review', 'view-preview']) {
    const from = html.indexOf('id="' + view + '"');
    const next = html.indexOf('<section', from + 10);
    assert.match(html.slice(from, next < 0 ? undefined : next), /data-task-note/, view);
  }
  assert.match(html, /Go back to /);
  assert.match(html, /This writing is for the new task/);
  assert.match(html, /before you ask for feedback, copy or submit it/);
});
