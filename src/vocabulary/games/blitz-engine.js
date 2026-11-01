// Word Blitz rules as a small pure state machine. It reads Unit 1 items/contexts that are handed in and nothing else:
// no storage, no network, no progression, XP, mastery or Set code.
import { createGameHistory, leastRecentFirst } from './games-history.js';
export const BLITZ = Object.freeze({ durationMs: 60000, base: 100, urgentMs: 10000, tiers: Object.freeze([[0, 1], [3, 2], [6, 3], [10, 4]]) });
// Result-screen title, by score. Purely cosmetic.
export const RATINGS = Object.freeze([[3000, 'Unstoppable'], [1800, 'Brilliant'], [800, 'Strong round'], [0, 'Good start']]);
export const ratingFor = score => RATINGS.find(([from]) => score >= from)[1];
export const multiplierFor = streak => BLITZ.tiers.reduce((m, [from, x]) => (streak >= from ? x : m), 1);
// Streak still needed for the next multiplier tier (null at the top tier).
export const nextTierAt = streak => (BLITZ.tiers.find(([from]) => from > streak) ?? [null])[0];

const shuffle = (list, rng) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const STOP = new Set(['about', 'after', 'being', 'could', 'doing', 'every', 'from', 'have', 'into', 'more', 'other', 'someone', 'something', 'than', 'that', 'their', 'there', 'these', 'they', 'this', 'those', 'time', 'very', 'what', 'when', 'where', 'which', 'while', 'will', 'with', 'would', 'your', 'you', 'are', 'for', 'not', 'the', 'and', 'person', 'people']);
const contentWords = text => String(text ?? '').toLowerCase().match(/[a-z]{4,}/g)?.filter(word => !STOP.has(word)) ?? [];
const PARA_STOP = new Set(['with', 'the', 'for', 'you', 'and', 'are', 'not', 'about', 'from', 'has', 'was']);
const stem = word => word.replace(/(ing|ed|es|s|ly|ment|ion|ness)$/, '');

// Blank one whole-word occurrence of `answer` in a sentence. Used only for teacher-reviewed gap rows, so the blank is the exact form.
export function blankExact(text, answer) {
  const s = String(text ?? ''); const a = String(answer ?? '').trim();
  if (!s || !a || s.includes('____') || s.length > 160) return null;
  const match = new RegExp(`(^|[^A-Za-z])(${escapeRegex(a)})(?![A-Za-z])`, 'i').exec(s);
  if (!match) return null;
  const start = match.index + match[1].length;
  return { sentence: `${s.slice(0, start)}____${s.slice(start + a.length)}`, atStart: start === 0 };
}
// Kept for the prototype tests and for any caller that needs an inflection-tolerant blank.
export function blankSentence(text, term) {
  const t = String(term ?? '').trim(); const s = String(text ?? '');
  if (!t || !s || s.includes('____') || s.length > 150) return null;
  const match = new RegExp(`\\b${escapeRegex(t)}(\\w{0,4})\\b`, 'i').exec(s);
  if (!match) return null;
  return `${s.slice(0, match.index)}____${match[1]}${s.slice(match.index + match[0].length)}`;
}

// Words that may not share a question: near neighbours in meaning, where a distractor could be argued as correct.
const clusterOf = (term, confusable) => { const t = String(term).toLowerCase(); return new Set(confusable.filter(group => group.includes(t)).flat()); };
// Fallback order when a word class is too small to supply three distractors.
const NEAR_POS = { adverb: ['adjective', 'noun', 'verb'], adjective: ['noun', 'verb', 'adverb'], noun: ['adjective', 'verb', 'adverb'], verb: ['noun', 'adjective', 'adverb'] };

// `data` is the UNIT's Blitz dataset ({ confusable, meaningOptions }, see GAMES_BY_UNIT). Without it there is no game: the pool is empty and
// the engine never falls back to another unit's content.
export function buildBlitzPool(content, rng = Math.random, data = null) {
  if (!Array.isArray(data?.confusable) || !data.meaningOptions || typeof data.meaningOptions !== 'object') return [];
  const confusable = data.confusable; const meaningOptions = data.meaningOptions;
  // Optional, per unit: question ids the Games layer withholds even though the canonical content allows them elsewhere (for example an accepted
  // paraphrase that suits a pathway activity but is too loose for "Another way to say…"). Canonical content is never edited. Absent = nothing withheld.
  const excluded = new Set(Array.isArray(data.excluded) ? data.excluded : []);
  const items = (content?.items ?? []).filter(item => item.term && item.coreMeaning);
  if (items.length < 4) return [];
  const byId = new Map((content?.contexts ?? []).map(context => [context.contextId, context]));
  // Distractors for a definition / paraphrase question: other Unit 1 words of the same class, minus near neighbours and anything whose own
  // meaning overlaps the prompt. If the class is too small, the nearest other classes fill in (still minus near neighbours).
  const distractorsFor = (item, promptText) => {
    const blocked = clusterOf(item.term, confusable); const promptWords = new Set([...contentWords(promptText), ...contentWords(item.coreMeaning)].map(stem));
    const eligible = other => other.vocabularyId !== item.vocabularyId && !blocked.has(other.term.toLowerCase())
      && ![...contentWords(other.coreMeaning), ...(other.senses ?? []).flatMap(sense => (sense.acceptedParaphrases ?? []).flatMap(contentWords))].some(word => promptWords.has(stem(word)));
    const same = shuffle(items.filter(other => other.partOfSpeech === item.partOfSpeech && eligible(other)), rng);
    const near = (NEAR_POS[item.partOfSpeech] ?? []).flatMap(pos => shuffle(items.filter(other => other.partOfSpeech === pos && eligible(other)), rng));
    return [...same, ...near].slice(0, 3).map(other => other.term);
  };
  const choice = (item, promptText) => {
    const distractors = distractorsFor(item, promptText); if (distractors.length < 3) return null;
    const all = shuffle([item.term, ...distractors], rng); return { options: all, answerIndex: all.indexOf(item.term) };
  };
  const pool = []; const ids = new Set();
  // One stable id per genuinely different prompt; a repeated id (for example a row authored twice) is dropped, never served twice.
  const add = question => { if (excluded.has(question.id) || ids.has(question.id)) return; ids.add(question.id); pool.push(question); };
  const termsLower = items.map(item => item.term.toLowerCase());
  for (const item of items) {
    const meaning = item.coreMeaning;
    if (!meaning.toLowerCase().includes(item.term.toLowerCase())) add({ id: `def:${item.vocabularyId}`, type: 'def', label: 'Which word means…', prompt: meaning, term: item.term, meaning, build: () => choice(item, meaning) });
    // A paraphrase is used only if it is short, does not contain the word, and is not also (part of) another Unit 1 word's meaning or paraphrase.
    // Each reviewed paraphrase is its own prompt (at most two per word).
    const others = items.filter(other => other.vocabularyId !== item.vocabularyId);
    const paraphrases = [...new Set((item.senses ?? []).flatMap(sense => sense.acceptedParaphrases ?? []))].filter(text => text && text.length <= 40 && !text.toLowerCase().includes(item.term.toLowerCase())
      && !others.some(other => other.coreMeaning.toLowerCase().includes(text.toLowerCase()) || (other.senses ?? []).some(sense => (sense.acceptedParaphrases ?? []).some(p => p.toLowerCase() === text.toLowerCase()))) && !termsLower.includes(text.toLowerCase()));
    // A second paraphrase is used only when it is a genuinely different cue: not a rewording that shares a content word with the first ("top-level" / "highest-level").
    const tokens = text => new Set((text.toLowerCase().match(/[a-z]{3,}/g) ?? []).filter(word => !PARA_STOP.has(word)).map(stem));
    const chosen = []; for (const text of paraphrases) { if (chosen.length < 2 && chosen.every(taken => ![...tokens(text)].some(word => tokens(taken).has(word)))) chosen.push(text); }
    for (const text of chosen) add({ id: `para:${item.vocabularyId}:${text.toLowerCase().replace(/[^a-z]+/g, '-')}`, type: 'para', label: 'Another way to say…', prompt: text, term: item.term, meaning, build: () => choice(item, text) });
    // Gap sentences come only from teacher-reviewed rows: the three wrong options are reviewed to be unable to complete the sentence.
    // Meaning-in-context prompts come only from reviewed mastery contexts: the correct meaning and three reviewed wrong meanings.
    let gaps = 0;
    for (const sense of item.senses ?? []) {
      for (const row of sense.gapDistractors ?? []) {
        if (gaps >= 2) break;   // keep at most two gap rows per word so one word is not over-served
        const context = byId.get(row?.contextId); const wrong = [...new Set(row?.wrong ?? [])].filter(word => word && word.toLowerCase() !== String(row.answer).toLowerCase());
        if (!context || !row.answer || wrong.length < 3) continue;
        const blank = blankExact(context.text, row.answer); if (!blank) continue;
        const cap = word => (blank.atStart ? word.charAt(0).toUpperCase() + word.slice(1) : word);
        const before = pool.length;
        if (excluded.has(`gap:${row.contextId}`)) { gaps += 1; continue; }   // a withheld row still uses up its place, so another row never slips in
        add({ id: `gap:${row.contextId}`, type: 'gap', label: 'Fill the gap', prompt: blank.sentence, term: item.term, meaning,
          build: () => { const all = shuffle([cap(row.answer), ...wrong.slice(0, 3).map(cap)], rng); return { options: all, answerIndex: all.indexOf(cap(row.answer)) }; } });
        if (pool.length > before) gaps += 1;
      }
      for (const row of sense.masteryContexts ?? []) {
        const sentence = String(row?.text ?? '').trim(); const right = String(row?.meaning ?? '').trim();
        const wrong = [...new Set((row?.wrongMeanings ?? []).map(text => String(text).trim()))].filter(text => text && text.toLowerCase() !== right.toLowerCase());
        if (!row?.contextId || !sentence || !right || wrong.length < 3 || sentence.length > 130) continue;
        // Students see the plain-English wording kept in games-data.js for this reviewed row (same meaning, same order: correct first, then the three reviewed wrong ones).
        const shown = meaningOptions[row.contextId] ?? [right, ...wrong.slice(0, 3)];
        if (shown.length !== 4 || new Set(shown.map(text => text.toLowerCase())).size !== 4 || shown.some(text => text.length > 60)) continue;
        add({ id: `mic:${row.contextId}`, type: 'mic', label: `In this sentence, “${item.term}” means…`, prompt: sentence, term: item.term, meaning,
          build: () => { const all = shuffle(shown, rng); return { options: all, answerIndex: all.indexOf(shown[0]) }; } });
      }
    }
  }
  return shuffle(pool.filter(q => q.type === 'gap' || q.type === 'mic' || q.build()), rng);
}

// `history` (optional, see games-history.js) lets Play Again prefer prompts and words not seen recently. Without one, every game is independent.
export function createBlitz({ content, rng = Math.random, now = () => Date.now(), durationMs = BLITZ.durationMs, history = createGameHistory(), data = null } = {}) {
  let queue = []; let lastWord = null; let startedAt = 0; let locked = false; let round = 0;
  // Unseen prompts first, then least recently seen; among equals the words served least often come first. The pool arrives shuffled, so ties stay random.
  const ordered = pool => leastRecentFirst(pool, q => history.blitzSeen.get(q.id) ?? 0, q => history.blitzTermUse.get(q.term) ?? 0);
  const s = { status: 'ready', score: 0, correct: 0, answered: 0, streak: 0, bestStreak: 0, topMultiplier: 1, missed: [], question: null, durationMs };
  const draw = () => {
    if (!queue.length) queue = ordered(buildBlitzPool(content, rng, data));
    if (!queue.length) return null;
    let index = queue.findIndex(q => q.term !== lastWord); if (index < 0) index = 0;   // never the same word twice in a row
    const [q] = queue.splice(index, 1); lastWord = q.term;
    history.blitzSeen.set(q.id, round); history.blitzTermUse.set(q.term, (history.blitzTermUse.get(q.term) ?? 0) + 1);
    return { ...q, ...q.build() };
  };
  const remaining = () => (s.status === 'playing' ? Math.max(0, durationMs - (now() - startedAt)) : s.status === 'over' ? 0 : durationMs);
  const finish = () => { s.status = 'over'; s.question = null; locked = true; };
  return {
    state: s,
    remaining,
    start() { history.blitzRound += 1; round = history.blitzRound; queue = []; lastWord = null; s.status = 'playing'; startedAt = now(); s.score = s.correct = s.answered = s.streak = s.bestStreak = 0; s.topMultiplier = 1; s.missed = []; locked = false; s.question = draw(); if (!s.question) finish(); return s.question; },
    // Returns null when the answer is ignored (not playing, already answered, or out of time).
    answer(index) {
      if (s.status !== 'playing' || locked) return null;
      if (remaining() <= 0) { finish(); return null; }
      locked = true; s.answered += 1;
      const correct = Number(index) === s.question.answerIndex;
      let points = 0;
      if (correct) { s.correct += 1; s.streak += 1; s.bestStreak = Math.max(s.bestStreak, s.streak); points = BLITZ.base * multiplierFor(s.streak); s.score += points; s.topMultiplier = Math.max(s.topMultiplier, multiplierFor(s.streak)); } else { s.streak = 0; if (!s.missed.some(m => m.term === s.question.term)) s.missed.push({ term: s.question.term, meaning: s.question.meaning }); }
      return { correct, points, multiplier: multiplierFor(s.streak), streak: s.streak, correctIndex: s.question.answerIndex, term: s.question.term, meaning: s.question.meaning };
    },
    next() { if (s.status !== 'playing') return null; if (remaining() <= 0) { finish(); return null; } locked = false; s.question = draw(); return s.question; },
    tick() { if (s.status === 'playing' && remaining() <= 0) finish(); return s.status; },
    summary() { return { score: s.score, correct: s.correct, answered: s.answered, accuracy: s.answered ? Math.round((s.correct / s.answered) * 100) : 0, bestStreak: s.bestStreak, topMultiplier: s.topMultiplier, missed: s.missed.slice(0, 3), rating: ratingFor(s.score) }; }
  };
}
