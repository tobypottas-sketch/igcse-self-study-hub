import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

const appSource = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

function render(question, support = null, retry = false) {
  const root = { innerHTML:'' };
  renderVocabularyQuestion(root, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    question,
    term:'minimum',
    sessionLabel:'1 / 10 activities',
    support,
    retry
  });
  return root.innerHTML;
}

test('tile activity offers a clear-answer control before submission', () => {
  const html = render({
    type:'build_paraphrase', responseMode:'tiles', prompt:'Build it.', tiles:['sessions','of three','a minimum']
  });
  assert.match(html, /data-action="clear-tile-answer"/);
  assert.match(html, />Clear answer</);
});

test('supported tile retry exposes the fixed chunk so clearing preserves it', () => {
  const html = render(
    { type:'build_paraphrase', responseMode:'tiles', prompt:'Build it.', tiles:['sessions','of three','a minimum'] },
    { action:'retry', kind:'partial_build', supportLevel:'light', fixedChunks:['a minimum'], remainingTiles:['sessions','of three'] },
    true
  );
  assert.match(html, /data-fixed-answer="a minimum"/);
  assert.match(html, /data-action="clear-tile-answer"/);
});

test('live click handler clears the current tile build without submitting evidence', () => {
  assert.match(appSource, /action === 'clear-tile-answer'/);
  assert.match(appSource, /querySelectorAll\?\.\('\.vocab-tile'\)/);
  assert.match(appSource, /tile\.disabled = false/);
  assert.match(appSource, /input\.value = fixed/);
});
