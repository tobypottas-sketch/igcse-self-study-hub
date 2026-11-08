import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../src/views/home.js';
import { SKILLS, APP_CATALOGUE, DEFAULT_REGISTRY, skillOf, skillSummaries, skillStyle } from '../src/views/app-registry.js';

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
  // vocabulary_paraphrase contains "paraphr" but must not fall into a broader rule.
  assert.equal(skillOf('vocabulary_paraphrase'), 'language');
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
  const registry = { skills: SKILLS, catalogue: [{ id: 'x', match: ['robot'], skill: 'robotics', badge: 'X' }, ...APP_CATALOGUE] };
  const html = render([...SEVEN, A('robot_lab', 'Robot Lab')], { registry });
  const robot = cards(html).find(c => c.key === 'robot_lab');
  assert.ok(robot && robot.skill === null && !robot.hidden);
});

test('mock future app: one catalogue entry places it in the right skill automatically and updates the count', () => {
  const registry = { skills: SKILLS, catalogue: [{ id: 'summary', match: ['summary'], skill: 'writing', badge: 'S' }, ...APP_CATALOGUE] };
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
  const registry = { skills: [...SKILLS, speaking], catalogue: [{ id: 'speak', match: ['speak'], skill: 'speaking', badge: 'S' }, ...APP_CATALOGUE] };
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
  assert.doesNotMatch(JSON.stringify(APP_CATALOGUE), /https?:|enabled|launch_url/);
});
