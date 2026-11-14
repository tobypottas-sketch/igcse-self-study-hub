import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createPreviewModel, renderPreview, statusInfo, constructLabel, classifyPreviewError, reviewSummary, reviewLabel
} from '../src/vocabulary/diagnostic-teacher-preview.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const KEY = 'correct' + 'OptionId';

// Synthetic placeholder bank; never diagnostic content.
function fakeBank(count = 23, { failDetailAt = -1, deny = false } = {}) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const items = Array.from({ length: count }, (_, i) => ({
    id: `diag-synthetic-${String(i + 1).padStart(3, '0')}`, version: 1, lemma: `word${i + 1}`,
    level: levels[i % 5], status: ['draft', 'language_reviewed', 'pilot', 'approved'][i % 4], construct: 'meaning_in_context'
  }));
  const calls = [];
  const invoke = async (action, payload) => {
    calls.push([action, payload]);
    if (deny) throw new Error('review access denied');
    if (action === 'list') {
      const pool = payload.level ? items.filter(x => x.level === payload.level) : items;
      return { total: pool.length, items: pool.slice(payload.page * 10, payload.page * 10 + 10) };
    }
    if (action === 'detail') {
      const n = items.findIndex(x => x.id === payload.itemId);
      if (n === failDetailAt) throw new Error('service error');
      const base = items[n];
      return {
        item: { ...base, sense: 'synthetic sense', stem: `Synthetic stem ${n + 1}?`, [KEY]: 'B',
          options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `option ${id} ${n + 1}`, rationale: `why ${id}` })) },
        reviews: n === 0 ? [
          { stage: 'language', decision: 'approve', notes: 'language fine', createdAt: '2026-11-14T00:00:00Z' },
          { stage: 'flag', decision: 'flag', notes: 'distractor C too weak', createdAt: '2026-11-14T01:00:00Z' }
        ] : []
      };
    }
    throw new Error('unexpected action ' + action);
  };
  return { invoke, calls };
}

test('model loads the queue and details only through review list/detail', async () => {
  const { invoke, calls } = fakeBank();
  const m = createPreviewModel(invoke);
  await m.load();
  assert.equal(m.state.phase, 'ready');
  assert.equal(m.state.total, 23);
  assert.equal(m.state.item.id, 'diag-synthetic-001');
  assert.deepEqual([...new Set(calls.map(c => c[0]))].sort(), ['detail', 'list']);
  assert.deepEqual(calls.find(c => c[0] === 'detail')[1], { itemId: 'diag-synthetic-001', version: 1 });
});

test('navigation crosses list pages, clamps at both ends and resets the answer', async () => {
  const { invoke, calls } = fakeBank();
  const m = createPreviewModel(invoke, { index: 9 });
  await m.load();
  m.select('A');
  await m.next();
  assert.equal(m.state.index, 10);
  assert.equal(m.state.item.id, 'diag-synthetic-011');
  assert.equal(m.state.selected, null);
  assert.ok(calls.some(c => c[0] === 'list' && c[1].page === 1));
  await m.previous(); assert.equal(m.state.index, 9);
  const end = createPreviewModel(invoke, { index: 99 });
  await end.load(); assert.equal(end.state.index, 22);
  await end.next(); assert.equal(end.state.index, 22);
});

test('level filter is passed to the API and an empty level shows an empty state', async () => {
  const { invoke, calls } = fakeBank(3);
  const m = createPreviewModel(invoke);
  await m.setLevel('B2');
  assert.equal(m.state.phase, 'empty');
  assert.ok(calls.some(c => c[0] === 'list' && c[1].level === 'B2'));
  assert.match(renderPreview(m.state), /No questions at this level/);
  await m.setLevel('nonsense');
  assert.equal(m.state.level, 'all');
});

test('API errors and unauthorised access become distinct states with no item data', async () => {
  const failing = fakeBank(5, { failDetailAt: 0 });
  const m = createPreviewModel(failing.invoke);
  await m.load();
  assert.equal(m.state.phase, 'error');
  assert.match(renderPreview(m.state), /Couldn’t load this question[\s\S]*data-preview="retry"/);
  const denied = createPreviewModel(fakeBank(5, { deny: true }).invoke);
  await denied.load();
  assert.equal(denied.state.phase, 'denied');
  const html = renderPreview(denied.state);
  assert.match(html, /Staff access only/);
  assert.doesNotMatch(html, /data-preview="select"/);
  assert.equal(classifyPreviewError(new Error('auth required')), 'denied');
  assert.equal(classifyPreviewError(new Error('service error')), 'error');
});

test('retry after a failed navigation retries the failed question, not the previous one', async () => {
  const { invoke } = fakeBank(5, { failDetailAt: 1 });
  const m = createPreviewModel(invoke);
  await m.load();
  assert.equal(m.state.item.id, 'diag-synthetic-001');
  await m.next();
  assert.equal(m.state.phase, 'error');
  const calls = [];
  const spy = createPreviewModel(async (a, p) => { calls.push(p); return invoke(a, p); });
  await spy.load(); await spy.next(); calls.length = 0;
  await spy.load();
  assert.ok(calls.some(p => p.itemId === 'diag-synthetic-002'), 'retry requested the failed item');
  assert.ok(!calls.some(p => p.itemId === 'diag-synthetic-001'), 'retry did not reload the previous item');
});

test('loading state is announced and navigation is disabled', () => {
  const html = renderPreview({ level: 'all', index: 0, total: null, phase: 'loading', reviews: [] });
  assert.match(html, /role="status"[^>]*>[\s\S]*Loading question/);
  assert.match(html, /data-preview="next" disabled/);
  assert.match(html, /data-preview="review" disabled/);
});

test('question card shows stem, four options and metadata; key only after Show answer', async () => {
  const { invoke } = fakeBank();
  const m = createPreviewModel(invoke);
  await m.load();
  let html = renderPreview(m.state);
  assert.match(html, /Synthetic stem 1\?/);
  assert.equal((html.match(/data-preview="select"/g) || []).length, 4);
  assert.match(html, /class="dp-level"[^>]*>A1<small>provisional/);
  assert.match(html, /<strong>word1<\/strong><small>Meaning in context/);
  assert.match(html, /dp-status--draft">Draft/);
  assert.doesNotMatch(html, /is-key|>Correct<|why B/);
  m.select('A'); m.toggleKey();
  html = renderPreview(m.state);
  assert.match(html, /class="dp-option is-key"[^>]*data-option="B"[\s\S]*?>Correct</);
  assert.match(html, /is-selected is-miss"[^>]*data-option="A"/);
  assert.match(html, /why B/);
  assert.match(html, /Key is B/);
  await m.next();
  assert.equal(m.state.showKey, true, 'answer-key toggle persists while browsing');
});

test('review decisions, concerns and auto-checks are summarised', async () => {
  const { invoke } = fakeBank();
  const m = createPreviewModel(invoke);
  await m.load();
  const html = renderPreview(m.state);
  assert.match(html, /class="is-done"><span aria-hidden="true">✓<\/span>Language/);
  assert.match(html, /<li class=""><span aria-hidden="true">–<\/span>Assessment/);
  assert.match(html, /Flagged<\/strong> distractor C too weak/);
  assert.match(html, /Language approved<\/strong>/);
  assert.match(html, /Review history \(2\)/);
  assert.equal(reviewLabel({ stage: 'cefr', decision: 'verify' }), 'CEFR reference verified');
  assert.deepEqual(reviewSummary([{ stage: 'cefr', decision: 'verify' }]), { language: false, assessment: false, cefr: true, concerns: [] });
});

test('every review status has a distinct, labelled tone', () => {
  assert.deepEqual(['draft', 'language_reviewed', 'assessment_reviewed', 'pilot', 'approved', 'retired'].map(s => statusInfo(s).tone),
    ['draft', 'reviewed', 'reviewed', 'pilot', 'approved', 'retired']);
  assert.equal(statusInfo('assessment_reviewed').label, 'Assessment reviewed');
  assert.equal(constructLabel('collocation_sense'), 'Collocation');
});

test('item text is escaped', async () => {
  const invoke = async action => action === 'list' ? { total: 1, items: [{ id: 'diag-synthetic-001', version: 1 }] }
    : { item: { id: 'diag-synthetic-001', version: 1, level: 'A1', lemma: '<b>x</b>', status: 'draft', stem: '<img src=x onerror=alert(1)>',
        options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `<script>${id}</script>` })) }, reviews: [{ stage: 'flag', decision: 'flag', notes: '<i>n</i>' }] };
  const m = createPreviewModel(invoke); await m.load();
  const html = renderPreview(m.state);
  assert.doesNotMatch(html, /<img|<script|<b>x|<i>n/);
  assert.match(html, /&lt;img src=x/);
});

test('preview has no public-file, storage or logging path', () => {
  const src = read('src/vocabulary/diagnostic-teacher-preview.js');
  assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|import\(|\.json['"`]|editorial|supabase\/diagnostic/);
  assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|console\./);
  assert.match(src, /invoke\('list'/);
  assert.match(src, /invoke\('detail'/);
});

test('review page wires the preview to the authenticated review invoke and stays off student pages', () => {
  const ui = read('src/vocabulary/diagnostic-review.js');
  const html = read('vocabulary-diagnostic-review.html');
  assert.match(ui, /createTeacherPreview\(\{root,invoke,/);
  assert.match(ui, /body:\{action:'review-'\+action,payload\}/);
  assert.match(ui, /\['teacher','admin'\]\.includes\(profile\.role\)/, 'page checks staff role before loading anything');
  assert.match(html, /diagnostic-review\.js\?v=teacher-preview-v2/);
  assert.match(html, /vocabulary-diagnostic-review\.css\?v=teacher-preview-v2/);
  for (const p of ['vocabulary.html', 'src/vocabulary/router.js', 'src/vocabulary/app.js'])
    assert.doesNotMatch(read(p), /diagnostic-teacher-preview|diagnostic-review\.js/, p);
});

test('server side: review-detail is staff-only and student delivery never includes the key', () => {
  const edge = read('supabase/functions/vocabulary-diagnostic/index.ts');
  const reviewSql = read('supabase/diagnostic/review_api.sql');
  const pilotSql = read('supabase/diagnostic/pilot_api.sql');
  assert.match(edge, /REVIEW_ACTIONS=new Set\(\['review-list','review-detail','review-decision'\]\)/);
  assert.match(edge, /'REVIEW_ACCESS_DENIED'\]\.includes\(code\)\?403/);
  assert.match(reviewSql, /where id=p_actor and active;\s*if v_role not in \('teacher','admin'\) or v_role is null\s*then raise exception 'REVIEW_ACCESS_DENIED'/);
  const safe = pilotSql.slice(pilotSql.indexOf('function private.vocabulary_diagnostic_safe_question'), pilotSql.indexOf('$$;', pilotSql.indexOf('function private.vocabulary_diagnostic_safe_question')));
  assert.match(safe, /jsonb_build_object\('id',o\.option->>'id','text',o\.option->>'text'\)/);
  assert.doesNotMatch(safe, /correct_option_id|rationale/);
});
