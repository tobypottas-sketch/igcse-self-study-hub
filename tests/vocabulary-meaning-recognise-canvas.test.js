import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const canvasUrl = new URL('../vocabulary-meaning-canvas.css', import.meta.url);
const css = fs.existsSync(canvasUrl) ? fs.readFileSync(canvasUrl, 'utf8') : '';
const html = fs.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
const meaningRecognise = String.raw`\.vocab-question-card:has\(\.vocab-pathway-session-progress\[data-pathway-session-progress="meaning"\]\[data-pathway-stage="recognise"\]\)`;

test('vocabulary page loads the Meaning Recognise canvas stylesheet', () => {
  assert.match(html, /<link rel="stylesheet" href="vocabulary-meaning-canvas\.css">/);
});

test('Meaning Recognise grows naturally on desktop instead of clipping to the retired 560px canvas', () => {
  assert.match(css, new RegExp(`${meaningRecognise}\\{[^}]*display:flex[^}]*flex-direction:column[^}]*height:auto[^}]*min-height:0[^}]*max-height:none[^}]*overflow-x:hidden`, 's'));
  assert.match(css, new RegExp(`@media\\(min-width:801px\\)[\\s\\S]*${meaningRecognise}\\{[^}]*height:auto[^}]*min-height:0[^}]*max-height:none`, 's'));
  assert.doesNotMatch(css, /height:\s*560px/);
  assert.doesNotMatch(css, /max-height:\s*560px/);
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-response-stage[^}]*margin-top:0`, 's'));
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-retry-stage[^}]*margin-top:0`, 's'));
});

test('Meaning Recognise text wraps internally instead of creating horizontal scrolling', () => {
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-question-prompt[^}]*overflow-wrap:break-word`, 's'));
  assert.match(css, new RegExp(`${meaningRecognise} \\.vocab-choice[^}]*overflow-wrap:break-word`, 's'));
  assert.match(css, /\.vocab-shell--session\{[^}]*min-width:0[^}]*overflow-x:clip/s);
});

test('tablet Meaning Recognise also uses natural height so every answer remains reachable', () => {
  assert.match(css, new RegExp(`@media\\(min-width:521px\\) and \\(max-width:800px\\)[\\s\\S]*${meaningRecognise}\\{[^}]*height:auto[^}]*min-height:0[^}]*max-height:none`, 's'));
  assert.doesNotMatch(css, new RegExp(`@media\\(min-width:521px\\) and \\(max-width:800px\\)[\\s\\S]*${meaningRecognise}\\{[^}]*height:560px`, 's'));
});

test('narrow mobile Meaning Recognise keeps natural height and one-column answers', () => {
  assert.match(css, new RegExp(`@media\\(max-width:520px\\)[\\s\\S]*${meaningRecognise}\\{[^}]*height:auto[^}]*min-height:0[^}]*max-height:none`, 's'));
  assert.match(css, new RegExp(`@media\\(max-width:520px\\)[\\s\\S]*${meaningRecognise} \\.vocab-choice-grid\\{[^}]*grid-template-columns:1fr`, 's'));
});
