import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHomeModel, renderHome } from '../src/views/home.js';

const apps = [
  { app_key:'reading', display_name:'Reading', launch_url:'https://example.com/r', enabled:true },
  { app_key:'listening', display_name:'Listening', launch_url:'https://example.com/l', enabled:true },
  { app_key:'paraphrasing', display_name:'Paraphrasing', launch_url:'https://example.com/p', enabled:true },
  { app_key:'essay_writing', display_name:'Essay Writing', launch_url:'https://example.com/e', enabled:true },
  { app_key:'vocabulary_paraphrase', display_name:'Vocabulary & Paraphrase Builder', launch_url:'https://example.com/v', enabled:true }
];

test('hub model accepts vocabulary as the fifth enabled learning area', () => {
  const model = buildHomeModel({ display_name:'Student', role:'student' }, apps);
  assert.equal(model.apps.length, 5);
  assert.ok(model.apps.some(app => app.app_key === 'vocabulary_paraphrase'));
});

test('vocabulary card uses a V visual marker', () => {
  const root = { innerHTML:'' };
  renderHome(root, { display_name:'Student', role:'student' }, apps);
  const vocabularyCard = root.innerHTML.match(/<a class="app-card"[^>]+data-app="vocabulary_paraphrase"[\s\S]*?<\/a>/)?.[0] ?? '';
  assert.match(vocabularyCard, /app-card__icon[^>]*>V</);
});
