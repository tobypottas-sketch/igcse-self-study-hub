import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');

test('live vocabulary page loads the reward-loop stylesheet after the study-app theme', () => {
  assert.match(html,/vocabulary-study-app\.css[\s\S]*vocabulary-reward-loop\.css/);
});

test('reward-loop stylesheet styles all three completion levels and pathway guidance', () => {
  const url = new URL('../vocabulary-reward-loop.css', import.meta.url);
  assert.equal(fs.existsSync(url),true);
  const css = fs.readFileSync(url,'utf8');
  for (const selector of [
    '.vocab-summary-card--session',
    '.vocab-summary-card--stage',
    '.vocab-summary-card--mastered',
    '.vocab-session-stars',
    '.vocab-session-evidence',
    '.vocab-completion-ladder',
    '.vocab-pathway-card__stage-count',
    '.vocab-pathway-card__session-guide'
  ]) assert.match(css,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('completion motion respects reduced-motion preferences', () => {
  const css = fs.readFileSync(new URL('../vocabulary-reward-loop.css', import.meta.url),'utf8');
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css,/animation\s*:\s*none/);
});
