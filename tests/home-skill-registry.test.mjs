import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../src/views/home.js';
import { SKILLS, APP_CATALOGUE, DEFAULT_REGISTRY, orderApps, skillOf, skillSummaries, skillStyle } from '../src/views/app-registry.js';

const A = (key, name = key, extra = {}) => ({ app_key: key, display_name: name, enabled: true, launch_url: `https://example.test/${key}`, ...extra });
const SEVEN = [A('essay_writing', 'Essay Writing'), A('email_writing', 'Informal Email Writing'), A('review_writing', 'Review Writing'), A('reading', 'Reading'),
  A('listening', 'Listening'), A('paraphrasing', 'Paraphrasing'), A('vocabulary_paraphrase', 'Vocabulary & Paraphrase Builder')];
const render = (apps, options) => { const root = { innerHTML: '' }; renderHome(root, { role: 'student', display_name: 'Fake Student', active: true }, apps, null, options); return root.innerHTML; };
const cards = html => [...html.matchAll(/<a class="app-card" href="([^"]*)" data-app="([^"]+)"([^>]*)>/g)].map(m => ({ href: m[1], key: m[2], attrs: m[3], hidden: /\shidden\b/.test(m[3]), skill: m[3].match(/data-skill="([^"]+)"/)?.[1] ?? null }));

test('the four launch skills exist in order with a colour identity and an icon each', () => {
  assert.deepEqual(SKILLS.map(s => s.id), ['writing', 'reading', 'listening', 'language']);
  assert.deepEqual(SKILLS.map(s => s.name), ['Writing', 'Reading', 'Listening', 'Language Skills']);
  assert.deepEqual(SKILLS.map(s => s.icon), ['pen', 'book', 'headphones', 'letters']);
  assert.equal(new Set(SKILLS.map(s => s.color.accent)).size, 4);
  for (const s of SKILLS) assert.match(skillStyle(s), /--sk:#[0-9a-f]{6};--sk-ink:#[0-9a-f]{6};--sk-tint:#[0-9a-f]{6};--sk-line:#[0-9a-f]{6}/);
});

test('every existing app is classified under the right skill', () => {
  const expected = { essay_writing: 'writing', email_writing: 'writing', review_writing: 'writing', reading: 'reading', listening: 'listening', paraphrasing: 'language', vocabulary_paraphrase: 'language' };
  for (const [key, skill] of Object.entries(expected)) assert.equal(skillOf(key), skill, key);
});

// The exact app_key values in production public.apps (read-only check of the live table on 2026-11-08: 7 rows, all enabled).
const PRODUCTION = [
  ['email_writing', 'Informal Email Writing', 'writing'], ['essay_writing', 'Essay Writing', 'writing'], ['listening', 'Listening', 'listening'],
  ['paraphrasing', 'Paraphrasing', 'language'], ['reading', 'Reading', 'reading'], ['review_writing', 'Review Writing', 'writing'],
  ['vocabulary_paraphrase', 'Vocabulary & Paraphrase Builder', 'language']
];

test('the seven production app_key values each map to their skill by exact key', () => {
  for (const [key, , skill] of PRODUCTION) assert.equal(skillOf(key), skill, key);
  const apps = PRODUCTION.map(([key, name]) => A(key, name));
  assert.deepEqual(Object.fromEntries(cards(render(apps)).map(c => [c.key, c.skill])), Object.fromEntries(PRODUCTION.map(([key, , skill]) => [key, skill])));
  assert.deepEqual(skillSummaries(apps).map(s => [s.id, s.count]), [['writing', 3], ['reading', 1], ['listening', 1], ['language', 2]]);
  // Every catalogue key is an exact production key: nothing speculative is registered.
  assert.deepEqual(APP_CATALOGUE.flatMap(entry => entry.keys).sort(), PRODUCTION.map(([key]) => key).sort());
});

test('classification is exact: look-alike future keys are not guessed into a skill and stay under All apps', () => {
  for (const key of ['reading_club', 'listening_extra', 'essay_planner', 'email', 'writing', 'review', 'vocabulary', 'paraphrase', 'paraphrasing_2', 'vocabulary_paraphrase_v2', 'speak_read']) {
    assert.equal(skillOf(key), null, key);
  }
  assert.equal(skillOf('READING'), 'reading', 'case-insensitive exact match');
  const html = render([...SEVEN, A('reading_club', 'Reading Club'), A('essay_planner', 'Essay Planner')]);
  for (const key of ['reading_club', 'essay_planner']) { const c = cards(html).find(x => x.key === key); assert.ok(c && c.skill === null && !c.hidden, key); }
  assert.deepEqual(skillSummaries([...SEVEN, A('reading_club'), A('essay_planner')]).map(s => s.count), [3, 1, 1, 2]);
});

test('skill counts are calculated from the apps the student can see, not hard-coded', () => {
  assert.deepEqual(skillSummaries(SEVEN).map(s => [s.id, s.count]), [['writing', 3], ['reading', 1], ['listening', 1], ['language', 2]]);
  const withoutEmail = SEVEN.filter(a => a.app_key !== 'email_writing');
  assert.equal(skillSummaries(withoutEmail).find(s => s.id === 'writing').count, 2);
  // A skill with no visible apps is not shown at all (restricted/disabled apps never leave empty categories).
  const noListening = SEVEN.filter(a => a.app_key !== 'listening');
  assert.deepEqual(skillSummaries(noListening).map(s => s.id), ['writing', 'reading', 'language']);
  const html = render(SEVEN);
  assert.deepEqual([...html.matchAll(/data-skill-choice="(\w+)"[^>]*>\s*<span class="skill-card__icon"[\s\S]*?skill-card__count">(\d+) apps?</g)].map(m => [m[1], +m[2]]), [['writing', 3], ['reading', 1], ['listening', 1], ['language', 2]]);
  assert.match(html, /skill-all__count">7</);
});

test('the home page renders all seven apps, each tagged with its skill, in the original order with unchanged links', () => {
  const rendered = cards(render(SEVEN));
  assert.deepEqual(rendered.map(c => c.key), SEVEN.map(a => a.app_key));
  assert.deepEqual(rendered.map(c => c.href), SEVEN.map(a => a.launch_url));
  assert.deepEqual(rendered.map(c => c.skill), ['writing', 'writing', 'writing', 'reading', 'listening', 'language', 'language']);
  assert.ok(rendered.every(c => !c.hidden), 'All apps is the default view');
});

test('apps the student cannot see (disabled rows) never appear in a skill or in All apps', () => {
  const html = render([...SEVEN, A('hidden_tool', 'Hidden', { enabled: false }), A('listening_extra', 'Listening Extra', { enabled: false })]);
  assert.deepEqual(cards(html).map(c => c.key), SEVEN.map(a => a.app_key));
  assert.match(html, /skill-all__count">7</);
});

test('an app with no recognised skill stays reachable under All apps and is not counted in any skill', () => {
  const html = render([...SEVEN, A('mystery_tool', 'Mystery')]);
  const mystery = cards(html).find(c => c.key === 'mystery_tool');
  assert.ok(mystery && !mystery.hidden && mystery.skill === null);
  assert.deepEqual(skillSummaries([...SEVEN, A('mystery_tool')]).map(s => s.count), [3, 1, 1, 2]);
  assert.match(html, /skill-all__count">8</);
});

test('a catalogue entry naming an unknown skill is treated as unclassified, not lost', () => {
  const registry = { skills: SKILLS, catalogue: [{ id: 'x', keys: ['robot_lab'], skill: 'robotics', badge: 'X' }, ...APP_CATALOGUE] };
  const html = render([...SEVEN, A('robot_lab', 'Robot Lab')], { registry });
  const robot = cards(html).find(c => c.key === 'robot_lab');
  assert.ok(robot && robot.skill === null && !robot.hidden);
});

test('mock future app: one catalogue entry places it in the right skill automatically and updates the count', () => {
  const registry = { skills: SKILLS, catalogue: [{ id: 'summary', keys: ['summary_writing'], skill: 'writing', badge: 'S' }, ...APP_CATALOGUE] };
  const apps = [...SEVEN, A('summary_writing', 'Summary Writing')];
  assert.equal(skillOf('summary_writing', registry), 'writing');
  assert.equal(skillSummaries(apps, registry).find(s => s.id === 'writing').count, 4);
  const html = render(apps, { registry });
  assert.equal(cards(html).find(c => c.key === 'summary_writing').skill, 'writing');
  assert.match(html, /skill-card__count">4 apps</);
  assert.match(html, /skill-all__count">8</);
});

test('mock new skill (Speaking): added to the registry only, it appears as a fifth card with its own colours and no homepage change', () => {
  const speaking = { id: 'speaking', name: 'Speaking', description: 'Practise speaking.', icon: 'headphones', color: { accent: '#0b7a3b', ink: '#095c2d', tint: '#e9f7ee', line: '#a9d8bb' } };
  const registry = { skills: [...SKILLS, speaking], catalogue: [{ id: 'speak', keys: ['speaking_practice'], skill: 'speaking', badge: 'S' }, ...APP_CATALOGUE] };
  // No speaking app yet: no empty card.
  assert.ok(!skillSummaries(SEVEN, registry).some(s => s.id === 'speaking'));
  const apps = [...SEVEN, A('speaking_practice', 'Speaking Practice')];
  const html = render(apps, { registry });
  assert.deepEqual([...html.matchAll(/class="skill-card" data-skill-choice="(\w+)"/g)].map(m => m[1]), ['writing', 'reading', 'listening', 'language', 'speaking']);
  assert.match(html, /data-skill-choice="speaking"[^>]*style="--sk:#0b7a3b;--sk-ink:#095c2d;--sk-tint:#e9f7ee;--sk-line:#a9d8bb"/);
  assert.equal(cards(html).find(c => c.key === 'speaking_practice').skill, 'speaking');
  assert.match(html, /skill-all__count">8</);
});

test('skill cards are real buttons with a pressed state and the app grid is labelled', () => {
  const html = render(SEVEN);
  assert.equal((html.match(/<button type="button" class="skill-card"/g) || []).length, 4);
  assert.match(html, /role="group" aria-label="Skills"/);
  assert.match(html, /data-skill-choice="all" aria-pressed="true"/);
  assert.equal((html.match(/class="skill-card"[^>]*aria-pressed="false"/g) || []).length, 4);
  assert.match(html, /<div class="app-grid" aria-labelledby="app-results-title">/);
  assert.match(html, /role="status" aria-live="polite"/);
});

test('the registry holds presentation only: no URLs, no access rules, and the default registry is frozen', () => {
  assert.ok(Object.isFrozen(SKILLS) && Object.isFrozen(APP_CATALOGUE) && Object.isFrozen(DEFAULT_REGISTRY));
  assert.doesNotMatch(JSON.stringify(APP_CATALOGUE), /https?:|enabled|launch_url|match/);
});

// ---- All apps ordering: skills in registry order, apps inside a skill by their registry `order`, unclassified last ----
const REQUIRED = ['essay_writing', 'email_writing', 'review_writing', 'reading', 'listening', 'paraphrasing', 'vocabulary_paraphrase'];
const keysOf = html => cards(html).map(c => c.key);
const shuffles = [[...SEVEN].reverse(), [SEVEN[6], SEVEN[0], SEVEN[4], SEVEN[2], SEVEN[5], SEVEN[1], SEVEN[3]], [SEVEN[3], SEVEN[6], SEVEN[5], SEVEN[4], SEVEN[2], SEVEN[1], SEVEN[0]]];

test('All apps shows the seven apps as Writing > Reading > Listening > Language Skills in the required order', () => {
  assert.deepEqual(keysOf(render(SEVEN)), REQUIRED);
  assert.deepEqual(orderApps(SEVEN).map(a => a.app_key), REQUIRED);
});

test('the order does not depend on the order Supabase returns the rows in', () => {
  for (const shuffled of shuffles) {
    assert.deepEqual(orderApps(shuffled).map(a => a.app_key), REQUIRED);
    assert.deepEqual(keysOf(render(shuffled)), REQUIRED);
  }
});

test('each individual skill lists its apps in the required order (same grid, same ordering rule)', () => {
  const expected = { writing: ['essay_writing', 'email_writing', 'review_writing'], reading: ['reading'], listening: ['listening'], language: ['paraphrasing', 'vocabulary_paraphrase'] };
  for (const shuffled of shuffles) {
    const rendered = cards(render(shuffled));
    for (const [skill, keys] of Object.entries(expected)) assert.deepEqual(rendered.filter(c => c.skill === skill).map(c => c.key), keys, skill);
  }
});

test('the ordering is stable, loses nothing and does not modify its input', () => {
  const input = [...SEVEN].reverse();
  const copy = [...input];
  const out = orderApps(input);
  assert.deepEqual(input, copy);
  assert.equal(out.length, input.length);
  assert.deepEqual([...out].sort((a, b) => a.app_key.localeCompare(b.app_key)), [...input].sort((a, b) => a.app_key.localeCompare(b.app_key)));
  assert.deepEqual(orderApps([]), []);
});

test('a future app joins its assigned skill group at its registry position', () => {
  const registry = { skills: SKILLS, catalogue: [
    { id: 'summary', keys: ['summary_writing'], skill: 'writing', order: 2.5, badge: 'S' },
    { id: 'quiz', keys: ['listening_quiz'], skill: 'listening', order: 2, badge: 'Q' },
    ...APP_CATALOGUE] };
  const apps = [A('vocabulary_paraphrase'), A('listening_quiz'), A('summary_writing'), A('reading'), A('review_writing'), A('listening'), A('essay_writing'), A('email_writing'), A('paraphrasing')];
  assert.deepEqual(orderApps(apps, registry).map(a => a.app_key), ['essay_writing', 'email_writing', 'summary_writing', 'review_writing', 'reading', 'listening', 'listening_quiz', 'paraphrasing', 'vocabulary_paraphrase']);
  assert.deepEqual(keysOf(render(apps, { registry })), orderApps(apps, registry).map(a => a.app_key));
});

test('a future app with no explicit order follows the ordered apps in its skill, in Supabase order', () => {
  const registry = { skills: SKILLS, catalogue: [
    { id: 'b', keys: ['writing_b'], skill: 'writing', badge: 'B' }, { id: 'a', keys: ['writing_a'], skill: 'writing', badge: 'A' }, ...APP_CATALOGUE] };
  const apps = [A('writing_b'), A('review_writing'), A('writing_a'), A('essay_writing'), A('reading')];
  assert.deepEqual(orderApps(apps, registry).map(a => a.app_key), ['essay_writing', 'review_writing', 'writing_b', 'writing_a', 'reading']);
});

test('a future skill is placed by its position in the skills registry', () => {
  const speaking = { id: 'speaking', name: 'Speaking', description: 'Practise speaking.', icon: 'headphones', color: { accent: '#0b7a3b', ink: '#095c2d', tint: '#e9f7ee', line: '#a9d8bb' } };
  const catalogue = [{ id: 'speak', keys: ['speaking_practice'], skill: 'speaking', order: 1, badge: 'S' }, ...APP_CATALOGUE];
  const apps = [...SEVEN, A('speaking_practice')];
  // Added last: appears after Language Skills.
  assert.equal(orderApps(apps, { skills: [...SKILLS, speaking], catalogue }).at(-1).app_key, 'speaking_practice');
  // Inserted between Listening and Language Skills: its app moves there, nothing else changes.
  const middle = { skills: [SKILLS[0], SKILLS[1], SKILLS[2], speaking, SKILLS[3]], catalogue };
  assert.deepEqual(orderApps([...apps].reverse(), middle).map(a => a.app_key), ['essay_writing', 'email_writing', 'review_writing', 'reading', 'listening', 'speaking_practice', 'paraphrasing', 'vocabulary_paraphrase']);
});

test('unclassified apps always come last in All apps, in Supabase order, and never disappear', () => {
  const apps = [A('zeta_tool'), A('reading'), A('mystery_tool'), A('essay_writing'), A('reading_club')];
  assert.deepEqual(orderApps(apps).map(a => a.app_key), ['essay_writing', 'reading', 'zeta_tool', 'mystery_tool', 'reading_club']);
  const html = render([...shuffles[0], A('mystery_tool')]);
  assert.deepEqual(keysOf(html), [...REQUIRED, 'mystery_tool']);
  // An entry naming a skill that does not exist counts as unclassified too.
  const registry = { skills: SKILLS, catalogue: [{ id: 'x', keys: ['robot_lab'], skill: 'robotics', order: 1, badge: 'X' }, ...APP_CATALOGUE] };
  assert.deepEqual(orderApps([A('robot_lab'), A('listening')], registry).map(a => a.app_key), ['listening', 'robot_lab']);
});

test('ordering leaves visibility, counts and links untouched', () => {
  const apps = [...shuffles[1], A('hidden_tool', 'Hidden', { enabled: false })];
  const html = render(apps);
  assert.deepEqual(keysOf(html), REQUIRED);
  assert.deepEqual(cards(html).map(c => c.href), REQUIRED.map(k => `https://example.test/${k}`));
  assert.match(html, /skill-all__count">7</);
  assert.deepEqual(skillSummaries(apps).map(s => [s.id, s.count]), [['writing', 3], ['reading', 1], ['listening', 1], ['language', 2]]);
});

test('every production catalogue entry has an explicit order and the home renderer holds no app list of its own', async () => {
  for (const entry of APP_CATALOGUE) assert.ok(Number.isFinite(entry.order), entry.id);
  const { readFile } = await import('node:fs/promises');
  const home = await readFile(new URL('../src/views/home.js', import.meta.url), 'utf8');
  assert.doesNotMatch(home, /essay_writing|email_writing|review_writing|vocabulary_paraphrase|paraphrasing/);
  assert.match(home, /orderApps\(model\.apps, registry\)/);
});
