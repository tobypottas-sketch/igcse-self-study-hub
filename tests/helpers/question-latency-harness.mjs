// Real-flow latency harness: runs the REAL Vocabulary app.js, views, data.js and attempt-persistence in headless
// Chromium against a fake Supabase client serving real Unit 1 content, with a controllable save server
// (latency, scripted failures, idempotency by attemptId, ordering). Modules are wrapped at the network layer
// (page.route) only to record a timeline; production source is not modified.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findChromium, loadPlaywright, serve } from './pathway-geometry-harness.mjs';

export const FAKE_SUPABASE = `
import unit from '/content/vocabulary/releases/unit-01.js';
import { applyPathwayAttempt, freshPathwayProgress } from '/src/vocabulary/pathway-progress.js';
const tl = (name, extra = {}) => window.__tl?.push({ name, t:performance.now(), ...extra });
const occurrences = unit.occurrences.map(o => ({ occurrence_id:o.occurrenceId, vocabulary_id:o.vocabularyId, unit_number:o.unitNumber, unit_title:o.unitTitle, set_number:o.setNumber, position_in_unit:o.positionInUnit, sense_id:o.senseId, status:'live' }));
const items = unit.items.map(i => ({ vocabulary_id:i.vocabularyId, term:i.term, part_of_speech:i.partOfSpeech, core_meaning:i.coreMeaning, senses:i.senses, word_family:i.wordFamily, collocations:i.collocations, status:'live' }));
const contexts = unit.contexts.map(c => ({ context_id:c.contextId, vocabulary_id:c.vocabularyId, occurrence_id:c.occurrenceId, sense_id:c.senseId, context_type:c.type, prompt_text:c.text, target_rewrite:c.targetRewrite ?? null, accepted_answers:c.acceptedAnswers, misconception_category:c.misconceptionCategory ?? null, status:'live' }));
const activities = unit.activities.map(a => ({ activity_content_id:a.activityContentId, unit_number:a.unitNumber, content_type:a.contentType, activity_data:a.activityData, status:'live' }));
const TABLES = { vocabulary_unit_occurrences:occurrences, vocabulary_items:items, vocabulary_contexts:contexts, vocabulary_unit_activities:activities };
function builder(table) {
  const q = { table };
  const proxy = new Proxy(q, { get(target, prop) {
    if (prop === 'then') return (resolve, reject) => Promise.resolve(run(target)).then(resolve, reject);
    if (prop === 'single') return () => proxy;
    return () => proxy;
  } });
  return proxy;
}
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
function fakeSets(table) {
  // Server-held Set progression for the browser tests: Set 1 of the placed pathway sits at the placed stage (default: Set 1 at Recognise).
  if (table !== 'vocabulary_pathway_sets') return null;
  const placement = window.__fakeStage; if (!placement) return [];
  return [{ pathway_id:placement.pathway, unit_number:1, set_number:1, stage:placement.stage, phase:'stage', status:'active', completed_stages:STAGES.slice(0, STAGES.indexOf(placement.stage)), weak_target_ids:[], advanced_with_support:[], support_flags:[], applied_mission_ids:[], history:[] }];
}
function fakeMastery(table) {
  // Optional: place every word at a pathway stage (window.__fakeStage = { pathway, stage }).
  const placement = window.__fakeStage; if (!placement) return null;
  if (table === 'vocabulary_global_mastery') return items.map(i => ({ vocabulary_id:i.vocabulary_id, status:'building', strand_evidence:{ meaning:3, recognition:3, context:3, paraphrasing:3 } }));
  if (table === 'vocabulary_unit_mastery') return occurrences.map(o => ({ occurrence_id:o.occurrence_id, status:'building', contextual_evidence:{ pathwayProgress:{ [placement.pathway]: freshPathwayProgress({ completedStages:STAGES.slice(0, STAGES.indexOf(placement.stage)) }) } } }));
  return null;
}
function run(q) {
  // Set membership is not modelled in this fake: an unreadable table is the documented 'unknown' path (the server still enforces membership).
  if (q.table === 'vocabulary_set_members') return { data:null, error:{ message:'membership not modelled by this fake' } };
  const sets = fakeSets(q.table); if (sets) return { data:sets, error:null };
  const mastery = fakeMastery(q.table); if (mastery) return { data:mastery, error:null };
  if (q.table === 'profiles') return { data:{ id:'u1', role:'student', display_name:'Sam', active:true }, error:null };
  return { data:TABLES[q.table] ?? [], error:null };
}
const server = window.__server = { latency:0, failures:[], committed:new Map(), order:[], progress:new Map(), forceCorrect:null };
window.__net = [];
async function invoke(name, { body }) {
  if (name !== 'vocabulary-attempt-action') return { data:{ ok:true }, error:null };
  const call = { attemptId:body.attemptId, type:body.questionType, start:performance.now(), end:null, ok:null };
  window.__net.push(call);
  tl('net:request', { id:body.attemptId });
  const latency = typeof server.latency === 'function' ? server.latency(call, window.__net.length) : server.latency;
  await new Promise(done => setTimeout(done, latency));
  const plan = server.failures.shift();
  if (plan === 'network') { call.end = performance.now(); call.ok = false; tl('net:error', { id:body.attemptId }); return { data:null, error:{ message:'Failed to fetch' } }; }
  const duplicate = server.committed.has(body.attemptId);
  if (!duplicate) { server.committed.set(body.attemptId, body); server.order.push(body.attemptId); }
  const local = window.__localMarks?.get(body.questionType + '|' + body.rawAnswer);
  const correct = server.forceCorrect ?? local ?? true;
  const result = { ok:true, duplicate, correct };
  if (body.pathwayId) {
    const key = body.occurrenceId + ':' + body.pathwayId;
    if (!server.progress.has(key)) server.progress.set(key, freshPathwayProgress());
    const id = body.activityContentId ?? body.contextId ?? body.occurrenceId;
    if (!duplicate) server.progress.set(key, applyPathwayAttempt(server.progress.get(key), { stageId:body.pathwayStage, servedStageId:body.servedPathwayStage, correct, firstAttempt:body.firstAttempt, retryUsed:body.retryUsed, supportLevel:body.supportLevel, contentId:id + ':' + body.questionType, contextId:body.contextId ?? body.activityContentId, promptKey:id + ':' + body.questionType, activityType:body.questionType, contextSensitive:false }));
    result.pathwayId = body.pathwayId; result.pathwayProgress = server.progress.get(key);
  }
  call.end = performance.now(); call.ok = true;
  tl('net:response', { id:body.attemptId, duplicate });
  return { data:result, error:null };
}
export async function getSupabaseClient() {
  return { auth:{ getUser:async () => ({ data:{ user:{ id:'u1' } }, error:null }) }, from:builder, functions:{ invoke } };
}
`;

const SEAM_HEAD = `const __tl = (name, extra = {}) => { (window.__tl ??= []).push({ name, t:performance.now(), ...extra }); };\n`;

async function wrapped(file, transform) { return transform(await readFile(file, 'utf8')); }

export function installRoutes(page, root) {
  const at = rel => path.join(root, rel);
  return Promise.all([
    page.route('**/src/supabase.js', route => route.fulfill({ body:FAKE_SUPABASE, contentType:'text/javascript' })),
    page.route('**/src/vocabulary/router.js', route => route.fulfill({ body:"import './app.js';", contentType:'text/javascript' })),
    // Timeline: wrap the persistence controller (enqueue/settled/retry/...), local marking and question rendering.
    page.route('**/src/vocabulary/attempt-persistence.js', async route => route.fulfill({ contentType:'text/javascript', body:await wrapped(at('src/vocabulary/attempt-persistence.js'), src => SEAM_HEAD + src.replace('export function createAttemptPersistence(', 'function __createAttemptPersistence(') + `
export function createAttemptPersistence(options) {
  const controller = __createAttemptPersistence(options);
  return new Proxy(controller, { get(target, prop) {
    const value = target[prop];
    if (typeof value !== 'function') return value;
    return (...args) => {
      __tl('persist:' + String(prop) + ':call', { pending:target.pending, blocked:target.blocked });
      const result = value.apply(target, args);
      if (result && typeof result.then === 'function') return result.then(out => { __tl('persist:' + String(prop) + ':resolve', { pending:target.pending, blocked:target.blocked }); return out; });
      return result;
    };
  } });
}
`) })),
    page.route('**/supabase/functions/_shared/vocabulary-engine.js', async route => route.fulfill({ contentType:'text/javascript', body:await wrapped(at('supabase/functions/_shared/vocabulary-engine.js'), src => SEAM_HEAD + src.replace('export function markCuratedAnswer(', 'function __markCuratedAnswer(') + `
export function markCuratedAnswer(args) {
  __tl('mark:start');
  const result = __markCuratedAnswer(args);
  (window.__localMarks ??= new Map()).set(args.questionType + '|' + args.rawAnswer, result.correct);
  __tl('mark:end', { correct:result.correct });
  return result;
}
`) })),
    page.route('**/src/vocabulary/views.js', async route => route.fulfill({ contentType:'text/javascript', body:await wrapped(at('src/vocabulary/views.js'), src => SEAM_HEAD + src
      .replace('export function renderVocabularyQuestion(', 'function __renderVocabularyQuestion(')
      .replace('export function renderSessionSummary(', 'function __renderSessionSummary(') + `
export function renderVocabularyQuestion(rootEl, options = {}) {
  __tl('render:question:start', { feedback:Boolean(options.feedback), retry:Boolean(options.retry) });
  window.__currentQuestion = options.question; window.__currentOptions = options;
  const out = __renderVocabularyQuestion(rootEl, options);
  __tl('render:question:end');
  return out;
}
export function renderSessionSummary(rootEl, options = {}) {
  __tl('render:summary:start');
  const out = __renderSessionSummary(rootEl, options);
  window.__summaryShown = true;
  __tl('render:summary:end');
  return out;
}
`) }))
  ]);
}

// In-page driver: answers whatever question is on screen.
const DRIVER = `
window.__driver = {
  norm: v => String(v ?? '').trim().toLowerCase(),
  answer(wantCorrect) {
    const q = window.__currentQuestion; const accepted = (q.markingReference?.acceptedAnswers ?? []).map(String); const wanted = accepted[0] ?? '';
    const rootEl = document.querySelector('#vocabularyApp'); const isOk = value => accepted.some(a => this.norm(a) === this.norm(value));
    window.__lastAnswerAt = performance.now();
    const choices = [...rootEl.querySelectorAll('[data-choice-answer],[data-evidence-answer]')];
    if (choices.length) {
      const pick = choices.find(btn => isOk(btn.dataset.choiceAnswer ?? btn.dataset.evidenceAnswer) === wantCorrect) ?? choices[0];
      pick.click(); return 'choice';
    }
    const form = rootEl.querySelector('[data-form="vocabulary-answer"]');
    const select = form?.querySelector('select[name="answer"]');
    if (select) {
      const options = [...select.options].map(o => o.value).filter(Boolean);
      const value = options.find(o => isOk(o) === wantCorrect) ?? options[0]; select.value = value; form.requestSubmit(); return 'select';
    }
    const tiles = [...rootEl.querySelectorAll('[data-tile-answer]')];
    if (tiles.length) {
      const parts = wantCorrect ? wanted.split(/\\s+/).filter(Boolean) : [tiles[0].dataset.tileAnswer];
      for (const part of parts) { const tile = tiles.find(t => !t.disabled && t.dataset.tileAnswer === part) ?? tiles.find(t => !t.disabled); tile?.click(); }
      form.requestSubmit(); return 'tiles';
    }
    const input = form?.querySelector('input[name="answer"]');
    if (input) { input.value = wantCorrect ? wanted : 'zzzz-wrong'; form.requestSubmit(); return 'input'; }
    return 'none';
  },
  state() {
    const rootEl = document.querySelector('#vocabularyApp');
    return {
      summary:Boolean(rootEl.querySelector('.vocab-summary-card,[data-study-completion]')),
      next:Boolean(rootEl.querySelector('[data-action="next-question"]')),
      form:Boolean(rootEl.querySelector('[data-form="vocabulary-answer"]')),
      feedback:rootEl.querySelector('.vocab-feedback')?.dataset?.studyFeedback ?? null
    };
  }
};
`;

export async function openMission({ root, width = 1280, pathway = 'meaning', server = {}, stage = null, reducedMotion = false, height = 900, beforeLoad = null }) {
  const playwright = loadPlaywright(); const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  const { server: http, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport:{ width, height }, reducedMotion:reducedMotion ? 'reduce' : 'no-preference' });
  page.on('pageerror', error => { (page.__errors ??= []).push(error.message); });
  await installRoutes(page, root);
  if (beforeLoad) await beforeLoad(page);
  await page.addInitScript(placement => { window.__tl = []; if (placement) window.__fakeStage = placement; }, stage ? { pathway, stage } : null);
  await page.goto(`${origin}/vocabulary.html`, { waitUntil:'load' });
  await page.waitForSelector('.vocab-unit-card');
  await page.evaluate(DRIVER);
  await page.evaluate(config => { Object.assign(window.__server, config); }, server);
  await page.click('.vocab-unit-card[data-unit="1"]');
  await page.waitForSelector(`.vocab-pathway-card[data-pathway="${pathway}"]:not([disabled])`);
  const api = {
    page,
    errors:() => page.__errors ?? [],
    close:async () => { await browser.close(); http.close(); },
    setServer:config => page.evaluate(cfg => Object.assign(window.__server, cfg), config),
    start:() => page.evaluate(() => { window.__tl.length = 0; }).then(() => page.click(`.vocab-pathway-card[data-pathway="${pathway}"]`)).then(() => page.click(`[data-action="start-recommended"][data-pathway="${pathway}"]`)).then(() => page.waitForFunction(() => window.__currentQuestion)),
    // Answers the current question and returns the in-page timestamps.
    answer:wantCorrect => page.evaluate(want => window.__driver.answer(want), wantCorrect),
    state:() => page.evaluate(() => window.__driver.state()),
    // Clicks Next and measures click -> new question (or summary) DOM, entirely in the page.
    clickNext:(limitMs = 20000) => page.evaluate(limitMs => new Promise(resolve => {
      const before = window.__currentQuestion; const rootEl = document.querySelector('#vocabularyApp');
      const t0 = performance.now(); (window.__tl ??= []).push({ name:'next:click', t:t0 });
      const finish = reason => { observer.disconnect(); clearTimeout(timer); resolve({ ms:Math.round((performance.now() - t0) * 10) / 10, reason, summary:Boolean(window.__summaryShown) }); };
      const check = () => { if (window.__currentQuestion !== before && rootEl.querySelector('[data-form="vocabulary-answer"]')) finish('question'); else if (rootEl.querySelector('.vocab-summary-card,[data-study-completion]')) finish('summary'); };
      const observer = new MutationObserver(check); observer.observe(rootEl, { childList:true, subtree:true });
      const timer = setTimeout(() => finish('timeout'), limitMs);
      rootEl.querySelector('[data-action="next-question"]').click();
    }), limitMs),
    timeline:() => page.evaluate(() => JSON.parse(JSON.stringify(window.__tl))),
    net:() => page.evaluate(() => JSON.parse(JSON.stringify(window.__net))),
    serverOrder:() => page.evaluate(() => [...window.__server.order]),
    serverCommitted:() => page.evaluate(() => window.__server.committed.size),
    syncWarning:() => page.evaluate(() => Boolean(document.querySelector('[data-vocab-sync-warning]'))),
    pending:() => page.evaluate(() => window.__tl.filter(e => e.name.startsWith('persist:')).at(-1)?.pending ?? null)
  };
  return api;
}

// Runs `count` questions answering correctly (or per `plan`), clicking Next each time. Returns per-step timings.
export async function runQuestions(api, { count = 10, plan = () => true, onStep = null } = {}) {
  const steps = [];
  await api.start();
  for (let n = 1; n <= count + 6; n += 1) {
    let st = await api.state();
    if (st.summary) break;
    const wantCorrect = plan(n);
    await api.answer(wantCorrect);
    st = await api.state();
    const step = { n, wantCorrect, feedback:st.feedback, next:st.next };
    if (onStep) await onStep(step, api);
    if (st.next) { step.nextMs = (await api.clickNext()); }
    steps.push(step);
  }
  return steps;
}
