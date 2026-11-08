import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { renderHome } from '../src/views/home.js';

const profile = { id: 'u1', role: 'student', display_name: 'Synthetic', active: true, must_change_password: false };
const apps = [
  { app_key: 'essay_writing', display_name: 'Essay Writing', launch_url: 'https://example.invalid/essay-writing.html', enabled: true },
  { app_key: 'review_writing', display_name: 'Review Writing', launch_url: 'https://tobypottas-sketch.github.io/igcse-self-study-hub/review-writing.html', enabled: true }
];

test('Review Writing renders as a standard Hub card linking to review-writing.html', () => {
  const root = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null, addEventListener() {} };
  try { renderHome(root, profile, apps); } catch { /* DOM wiring is not needed for the markup */ }
  const card = root.innerHTML.match(/<a class="app-card"[^>]*data-app="review_writing"[\s\S]*?<\/a>/);
  assert.ok(card, 'review_writing card rendered');
  assert.match(card[0], /href="https:\/\/tobypottas-sketch\.github\.io\/igcse-self-study-hub\/review-writing\.html"/);
  assert.match(card[0], /app-card__title">Review Writing</);
  assert.match(card[0], /app-card__icon" aria-hidden="true">R</);
});

test('registration migration targets the existing page and only the apps table', () => {
  const sql = readFileSync('supabase/migrations/20261108130000_register_review_writing_app.sql', 'utf8');
  assert.ok(existsSync('review-writing.html'));
  assert.match(sql, /'review_writing'/);
  assert.match(sql, /igcse-self-study-hub\/review-writing\.html/);
  assert.equal((sql.match(/\binsert into\b/gi) || []).length, 1);
  assert.doesNotMatch(sql, /feedback_|quota|drop |delete /i);
});
