import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../vocabulary-refresh.css', import.meta.url), 'utf8');

const meaningRecognise = String.raw`\.vocab-question-card:has\(\.vocab-pathway-session-progress\[data-pathway-session-progress="meaning"\]\[data-pathway-stage="recognise"\]\)`;

test('Meaning Recognise owns a fixed desktop quiz canvas without horizontal overflow', () => {
  assert.match(css, new RegExp(`@media\\(min-width:801px\\)[\\s\\S]*${meaningRecognise}\\{[^}]*height:`));
  assert.match(css, new RegExp(`${meaningRecognise}\\{[^}]*display:flex[^}]*flex-direction:column[^}]*overflow-x:hidden`, 's'));
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-response-stage[^}]*margin-top:auto`, 's'));
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-choice-grid[^}]*grid-template-columns:repeat\\(2,minmax\\(0,1fr\\)\\)`, 's'));
});

test('Meaning Recognise text wraps internally instead of creating horizontal scrolling', () => {
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-question-prompt[^}]*overflow-wrap:anywhere`, 's'));
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-choice[^}]*overflow-wrap:anywhere`, 's'));
  assert.match(css, /\.vocab-shell--session\{[^}]*min-width:0/s);
});

test('Meaning Recognise keeps a two-column answer grid on tablets where it still fits', () => {
  assert.match(css, new RegExp(`@media\\(min-width:521px\\) and \\(max-width:800px\\)[\\s\\S]*${meaningRecognise} \\.vocab-choice-grid\\{[^}]*grid-template-columns:repeat\\(2,minmax\\(0,1fr\\)\\)`));
});

test('narrow mobile Meaning Recognise falls back to natural height and one-column answers', () => {
  assert.match(css, new RegExp(`@media\\(max-width:520px\\)[\\s\\S]*${meaningRecognise}\\{[^}]*height:auto[^}]*min-height:0`, 's'));
  assert.match(css, new RegExp(`@media\\(max-width:520px\\)[\\s\\S]*${meaningRecognise} \\.vocab-choice-grid\\{[^}]*grid-template-columns:1fr`, 's'));
});
