import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHome } from '../src/views/home.js';

const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const FILES = { essay_writing: 'essay-writing', listening: 'listening', paraphrasing: 'paraphrasing', reading: 'reading', vocabulary_paraphrase: 'vocabulary' };
const NAMES = { essay_writing: 'Essay Writing', listening: 'Listening', paraphrasing: 'Paraphrasing', reading: 'Reading', vocabulary_paraphrase: 'Vocabulary & Paraphrase Builder' };
const apps = [...Object.keys(FILES), 'mystery_tool'].map(k => ({ app_key: k, display_name: NAMES[k] ?? 'Mystery', enabled: true, launch_url: `https://example.test/${k}` }));
const root = { innerHTML: '' };
renderHome(root, { role: 'student', display_name: 'Fake Student' }, apps);
const card = key => root.innerHTML.match(new RegExp(`<a class="app-card"[^>]+data-app="${key}"[\\s\\S]*?</a>`))?.[0] ?? '';

test('each study app card gets its own decorative local SVG', () => {
  for (const [key, file] of Object.entries(FILES)) {
    const html = card(key);
    assert.match(html, new RegExp(`<img class="app-card__art" src="\\./assets/launcher/${file}\\.svg" alt="" [^>]*aria-hidden="true"`), key);
    assert.match(html, /loading="lazy"/);
  }
  assert.doesNotMatch(card('mystery_tool'), /app-card__art/, 'unknown apps get no artwork');
});

test('existing card content is unchanged: badge, arrow, title, description and CTA', () => {
  const badges = { essay_writing: 'E', listening: 'L', paraphrasing: 'P', reading: 'R', vocabulary_paraphrase: 'V' };
  for (const key of Object.keys(FILES)) {
    const html = card(key);
    assert.match(html, new RegExp(`app-card__icon" aria-hidden="true">${badges[key]}<`));
    assert.match(html, /app-card__arrow" aria-hidden="true">→</);
    assert.match(html, new RegExp(`app-card__title">${NAMES[key].replace('&', '&amp;')}<`));
    assert.match(html, /app-card__description"><span class="app-card__line">Independent iGCSE<\/span><span class="app-card__line">practice<\/span><\/span>/);
    assert.match(html, /app-card__meta">Open practice →</);
    assert.match(html, new RegExp(`href="https://example.test/${key}"`));
  }
  assert.equal((root.innerHTML.match(/class="app-card"/g) || []).length, 6, 'no cards added or removed');
});

test('the SVG files are small, self-contained, transparent and scalable', async () => {
  for (const file of Object.values(FILES)) {
    const svg = await readFile(new URL(`../assets/launcher/${file}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /^<svg [^>]*viewBox="0 0 300 200"/);
    assert.ok(svg.length < 4000, `${file} is lightweight`);
    assert.doesNotMatch(svg, /<image|data:|href=|<script|<style|<foreignObject|url\((?!#)/i, `${file} is self-contained`);
    assert.doesNotMatch(svg, /<rect[^>]*width="240"[^>]*height="180"/, `${file} has no opaque background rect`);
  }
});

test('artwork CSS is decorative only: absolute, non-interactive, scaled down on narrow screens', () => {
  const art = css.match(/\.app-card__art\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(art, /position:\s*absolute/);
  assert.match(art, /pointer-events:\s*none/);
  assert.match(art, /width:\s*min\(100%,\s*320px\)/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.app-card__art\s*\{[^}]*min\(72%/);
  assert.match(css, /\.app-card__topline, \.app-card__content, \.app-card__meta\s*\{[^}]*z-index:\s*1/);
  assert.match(css, /\.app-card\s*\{[^}]*min-height:\s*230px/, 'card size unchanged');
});

test('subtitle is a deliberate two-line block layout owned by one shared rule', () => {
  for (const key of Object.keys(FILES)) {
    const lines = [...card(key).matchAll(/app-card__line">([^<]+)</g)].map(m => m[1]);
    assert.deepEqual(lines, ['Independent iGCSE', 'practice'], key);
  }
  assert.match(css, /\.app-card__line\s*\{[^}]*display:\s*block[^}]*white-space:\s*nowrap/);
  assert.equal((css.match(/\.app-card__line\b/g) || []).length, 1, 'no per-card or per-breakpoint overrides');
});
