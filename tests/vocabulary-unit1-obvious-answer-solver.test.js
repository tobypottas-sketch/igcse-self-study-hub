import test from 'node:test';
import assert from 'node:assert/strict';
import bank from '../content/vocabulary/units/unit-01-language-bank.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildFoundationalActivity } from '../src/vocabulary/foundational-activity-builder.js';
import { buildPathwayActivity } from '../src/vocabulary/pathway-activity-builder.js';

const entries = Object.entries(bank);
const words = s => String(s).toLowerCase().match(/[a-z’']+/g) ?? [];
const stop = new Set(['the','a','an','to','of','and','in','on','for','that','it','is','was','be','are','she','he','they','we','i','you','her','his','their','our','my','at','by','with','but','so','as','not','can','will','could','would','may','this','from']);
const content = s => words(s).filter(w => !stop.has(w));
const options = c => [c.answer, ...c.distractors.map(d => d.text)];

// Knowledge-free cues: a solver that knows no vocabulary tries each cue; each must stay near chance (25%).
const cues = {
  longest: (c, o) => { const m = Math.max(...o.map(x => x.length)); const t = o.filter(x => x.length === m); return t.length === 1 ? t[0] : null; },
  shortest: (c, o) => { const m = Math.min(...o.map(x => x.length)); const t = o.filter(x => x.length === m); return t.length === 1 ? t[0] : null; },
  stemOverlap: (c, o) => {
    const stem = new Set(content(c.text));
    const scored = o.map(x => [x, content(x).filter(w => stem.has(w)).length]).sort((a, b) => b[1] - a[1]);
    return scored[0][1] > scored[1][1] ? scored[0][0] : null; // no unique cue: the solver must guess
  },
  oddOneOut: (c, o) => {
    const len = x => x.split(/\s+/).length;
    const odd = o.filter(x => o.filter(y => len(y) === len(x)).length === 1);
    return odd.length === 1 ? odd[0] : null;
  }
};

test('every banked word keeps the canonical depth', () => {
  for (const [term, e] of entries) {
    assert.ok(e.contexts.length >= 6, `${term}: contexts`);
    assert.ok(e.definitionDistractors.length >= 6, `${term}: definition distractors`);
    assert.ok(e.spellingErrors.length >= 6, `${term}: spelling errors`);
    assert.ok(e.misuseSentences.length >= 1 && e.patterns.length >= 1 && e.collocations.length >= 1 && e.contrasts.length >= 1, `${term}: misuse/patterns/collocations/contrasts`);
  }
});

test('contexts are well formed, sentence-specific and fully diagnosed', () => {
  for (const [term, e] of entries) {
    const ids = new Set();
    const openings = new Set();
    for (const c of e.contexts) {
      assert.ok(!ids.has(c.id) && c.id.startsWith(`${term}_ctx_`), `${term}: id ${c.id}`);
      ids.add(c.id);
      assert.equal(c.text.split('____').length, 2, `${c.id}: exactly one blank`);
      assert.ok(c.distractors.length >= 3, `${c.id}: three distractors`);
      const o = options(c).map(x => x.toLowerCase());
      assert.equal(new Set(o).size, o.length, `${c.id}: duplicate options`);
      for (const d of c.distractors) {
        assert.ok(d.reason && d.reason.length > 25, `${c.id}/${d.text}: useful diagnostic reason`);
        assert.notEqual(d.text.toLowerCase(), c.answer.toLowerCase(), `${c.id}: distractor equals answer`);
      }
      const opening = words(c.text).slice(0, 3).join(' ');
      assert.ok(!openings.has(opening), `${term}: repeated sentence frame "${opening}"`);
      openings.add(opening);
    }
    const sets = e.contexts.map(c => c.distractors.map(d => d.text).sort().join('|'));
    assert.equal(new Set(sets).size, sets.length, `${term}: distractor sets must differ per sentence`);
  }
});

test('definition distractors and misuse sentences are usable', () => {
  for (const [term, e] of entries) {
    assert.equal(new Set(e.definitionDistractors).size, e.definitionDistractors.length, `${term}: duplicate definition distractors`);
    for (const m of e.misuseSentences) assert.ok(m.text && m.reason.length > 15, `${term}: misuse reason`);
    for (const c of e.contrasts) assert.ok(c.text && c.reason.length > 15, `${term}: contrast reason`);
  }
});

test('spelling errors are realistic and distinct from the headword', () => {
  for (const [term, e] of entries) {
    assert.equal(new Set(e.spellingErrors).size, e.spellingErrors.length, `${term}: duplicates`);
    for (const s of e.spellingErrors) {
      assert.notEqual(s, term, `${term}: error equals correct spelling`);
      assert.ok(!/^(.)\1/.test(s) || /^(.)\1/.test(term), `${term}/${s}: doubled first letter is not a realistic error`);
      assert.ok(Math.abs(s.length - term.length) <= 3, `${term}/${s}: too different in length`);
    }
  }
});

test('knowledge-free solver cues stay near chance on the banked contexts', () => {
  const all = entries.flatMap(([, e]) => e.contexts);
  for (const [name, cue] of Object.entries(cues)) {
    const hits = all.filter(c => {
      const o = options(c);
      return cue(c, o) === c.answer;
    }).length;
    const rate = hits / all.length;
    assert.ok(rate <= 0.4, `cue "${name}" picks the answer ${(rate * 100).toFixed(0)}% of the time (chance 25%)`);
  }
});

// Per-word standard: no surface cue may identify the answer in more than one third of a word's questions
// (chance is 25%). The tolerance only absorbs floating-point error, e.g. 2/6.
const PER_WORD_CEILING = 1 / 3 + 1e-9;

function cueRates(samples) {
  const rates = {};
  for (const [name, cue] of Object.entries(cues)) {
    const hits = samples.filter(c => cue(c, options(c)) === c.answer).length;
    rates[name] = hits / samples.length;
  }
  return rates;
}

test('per word: no single banked word is guessable by any cue (raw contexts)', () => {
  const report = [];
  for (const [term, e] of entries) {
    const rates = cueRates(e.contexts);
    report.push(`${term}: ${Object.entries(rates).map(([k, v]) => `${k}=${Math.round(v * 100)}%`).join(' ')}`);
    for (const [name, rate] of Object.entries(rates)) {
      assert.ok(rate <= PER_WORD_CEILING, `${term}: cue "${name}" picks the answer in ${Math.round(rate * 100)}% of contexts\n${report.join('\n')}`);
    }
  }
});

// ---- Assembled student questions -------------------------------------------------------
function targetFor(term) {
  const item = unit1.items.find(row => row.term === term);
  assert.ok(item, `no Unit 1 item for ${term}`);
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === item.vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence?.occurrenceId);
  return { item, occurrence, contexts };
}

function assemble(term, contextId, type, seed) {
  const { item, occurrence, contexts } = targetFor(term);
  // Mark every other bank context as used so the builder is forced onto this one.
  const usedContentIds = bank[term].contexts.filter(c => c.id !== contextId).map(c => `language-bank:${c.id}`);
  const args = { activityType:type, occurrence, item, contexts, unitActivities:unit1.activities, unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status:'building' }, readinessStage:'building', usedContentIds, seed };
  const activity = type === 'context_sentence_match' ? buildPathwayActivity(args) : buildFoundationalActivity(args);
  assert.equal(activity.languageBankContextId, contextId, `${term}/${type}: builder did not serve ${contextId}`);
  const opts = type === 'context_sentence_match' ? activity.matchOptions : activity.options;
  return { text: activity.sourceText, answer: activity.markingReference.acceptedAnswers[0], distractors: opts.filter(o => o !== activity.markingReference.acceptedAnswers[0]).map(o => ({ text:o })), opts };
}

const ASSEMBLED_TYPES = ['choose_word_sentence', 'gap_fill_bank', 'context_sentence_match'];
const SEEDS = ['s1', 's2', 's3', 's4'];

test('assembled questions: structure, bank-only distractors and fail-closed content', () => {
  for (const [term, e] of entries) {
    for (const c of e.contexts) {
      for (const type of ASSEMBLED_TYPES) {
        const q = assemble(term, c.id, type, 'structure');
        assert.equal(q.opts.length, 4, `${c.id}/${type}: four options`);
        assert.equal(new Set(q.opts.map(o => o.toLowerCase())).size, 4, `${c.id}/${type}: duplicate options`);
        const permitted = new Set(options(c));
        assert.ok(q.opts.every(o => permitted.has(o)), `${c.id}/${type}: option outside the reviewed bank record: ${q.opts.join(' | ')}`);
      }
    }
  }
});

test('assembled questions: knowledge-free cues stay near chance in aggregate', () => {
  const samples = [];
  for (const [term, e] of entries) for (const c of e.contexts) for (const type of ASSEMBLED_TYPES) samples.push(assemble(term, c.id, type, 'cue'));
  for (const [name, rate] of Object.entries(cueRates(samples))) {
    assert.ok(rate <= 0.4, `assembled cue "${name}" picks the answer ${Math.round(rate * 100)}% of the time (chance 25%)`);
  }
});

test('assembled questions: per word, no cue can hide inside the aggregate', () => {
  const report = [];
  for (const [term, e] of entries) {
    const samples = [];
    for (const c of e.contexts) for (const type of ASSEMBLED_TYPES) samples.push(assemble(term, c.id, type, 'cue'));
    const rates = cueRates(samples);
    report.push(`${term}: ${Object.entries(rates).map(([k, v]) => `${k}=${Math.round(v * 100)}%`).join(' ')}`);
    for (const [name, rate] of Object.entries(rates)) {
      assert.ok(rate <= PER_WORD_CEILING, `${term}: assembled cue "${name}" picks the answer ${Math.round(rate * 100)}% of the time\n${report.join('\n')}`);
    }
  }
});

test('assembled questions: the correct answer is not tied to an option position', () => {
  for (const type of ASSEMBLED_TYPES) {
    const counts = [0, 0, 0, 0];
    let total = 0;
    for (const [term, e] of entries) for (const c of e.contexts) for (const seed of SEEDS) {
      const q = assemble(term, c.id, type, seed);
      counts[q.opts.indexOf(q.answer)] += 1;
      total += 1;
    }
    for (const n of counts) assert.ok(n / total <= 0.4, `${type}: answer position skew ${counts.join('/')}`);
  }
});
