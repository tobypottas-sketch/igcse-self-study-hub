import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const WRAPPER = 'https://tobypottas-sketch.github.io/igcse-self-study-hub/listening.html';

test('seed routes Listening through tracked wrapper without changing other apps', () => {
  const seed = fs.readFileSync(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
  assert.match(seed, new RegExp(`\\('listening','Listening','${WRAPPER.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}',true\\)`));
  assert.match(seed, /igcse-self-study-hub\/paraphrasing\.html/);
  assert.match(seed, /igcse-self-study-hub\/reading\.html/);
  assert.match(seed, /igcse-essay-writing\//);
});

test('listening launch migration pins exact wrapper URL', () => {
  const path = new URL('../supabase/migrations/20261013133500_listening_tracked_launch.sql', import.meta.url);
  const sql = fs.readFileSync(path, 'utf8');
  assert.match(sql, /where app_key = 'listening'/i);
  assert.match(sql, /https:\/\/tobypottas-sketch\.github\.io\/igcse-self-study-hub\/listening\.html/);
});
