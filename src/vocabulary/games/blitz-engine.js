// PROTOTYPE (throwaway). Word Blitz rules as a small pure state machine. It reads Unit 1 items/contexts that are handed in and nothing else:
// no storage, no network, no progression, XP, mastery or Set code.
export const BLITZ = Object.freeze({ durationMs: 60000, base: 100, urgentMs: 10000, tiers: Object.freeze([[0, 1], [3, 2], [6, 3], [10, 4]]) });
export const multiplierFor = streak => BLITZ.tiers.reduce((m, [from, x]) => (streak >= from ? x : m), 1);
// Streak still needed for the next multiplier tier (null at the top tier).
export const nextTierAt = streak => (BLITZ.tiers.find(([from]) => from > streak) ?? [null])[0];

const shuffle = (list, rng) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SENTENCE_TYPES = new Set(['meaning_context', 'production_context', 'paraphrase_context']);

// Blank the target in a context sentence, keeping any ending (avoid -> "____ed") so the student can see the form required.
export function blankSentence(text, term) {
  const t = String(term ?? '').trim(); const s = String(text ?? '');
  if (!t || !s || s.includes('____') || s.length > 150) return null;
  const match = new RegExp(`\\b${escapeRegex(t)}(\\w{0,4})\\b`, 'i').exec(s);
  if (!match) return null;
  return `${s.slice(0, match.index)}____${match[1]}${s.slice(match.index + match[0].length)}`;
}

export function buildBlitzPool(content, rng = Math.random) {
  const items = (content?.items ?? []).filter(item => item.term && item.coreMeaning);
  if (items.length < 4) return [];
  const contextsByWord = {};
  for (const context of content?.contexts ?? []) if (SENTENCE_TYPES.has(context.type)) (contextsByWord[context.vocabularyId] ??= []).push(context);
  const options = item => {
    const samePos = items.filter(other => other.vocabularyId !== item.vocabularyId && other.partOfSpeech === item.partOfSpeech);
    const rest = items.filter(other => other.vocabularyId !== item.vocabularyId && other.partOfSpeech !== item.partOfSpeech);
    const distractors = [...shuffle(samePos, rng), ...shuffle(rest, rng)].slice(0, 3).map(other => other.term);
    const all = shuffle([item.term, ...distractors], rng);
    return { options: all, answerIndex: all.indexOf(item.term) };
  };
  const pool = [];
  for (const item of items) {
    pool.push({ id: `def:${item.vocabularyId}`, type: 'def', label: 'Which word means…', prompt: item.coreMeaning, term: item.term, meaning: item.coreMeaning, build: () => options(item) });
    const paraphrases = (item.senses ?? []).flatMap(sense => sense.acceptedParaphrases ?? []).filter(text => text && text.length <= 40 && !text.toLowerCase().includes(item.term.toLowerCase()));
    if (paraphrases.length) pool.push({ id: `para:${item.vocabularyId}`, type: 'para', label: 'Another way to say…', prompt: paraphrases[Math.floor(rng() * paraphrases.length)], term: item.term, meaning: item.coreMeaning, build: () => options(item) });
    const gaps = (contextsByWord[item.vocabularyId] ?? []).map(context => blankSentence(context.text, item.term)).filter(Boolean);
    if (gaps.length) pool.push({ id: `gap:${item.vocabularyId}`, type: 'gap', label: 'Fill the gap', prompt: gaps[Math.floor(rng() * gaps.length)], term: item.term, meaning: item.coreMeaning, build: () => options(item) });
  }
  return shuffle(pool, rng);
}

export function createBlitz({ content, rng = Math.random, now = () => Date.now(), durationMs = BLITZ.durationMs } = {}) {
  let queue = []; let lastWord = null; let startedAt = 0; let locked = false;
  const s = { status: 'ready', score: 0, correct: 0, answered: 0, streak: 0, bestStreak: 0, question: null, durationMs };
  const draw = () => {
    if (!queue.length) queue = buildBlitzPool(content, rng);
    if (!queue.length) return null;
    let index = queue.findIndex(q => q.term !== lastWord); if (index < 0) index = 0;   // never the same word twice in a row
    const [q] = queue.splice(index, 1); lastWord = q.term;
    return { ...q, ...q.build() };
  };
  const remaining = () => (s.status === 'playing' ? Math.max(0, durationMs - (now() - startedAt)) : s.status === 'over' ? 0 : durationMs);
  const finish = () => { s.status = 'over'; s.question = null; locked = true; };
  return {
    state: s,
    remaining,
    start() { s.status = 'playing'; startedAt = now(); s.score = s.correct = s.answered = s.streak = s.bestStreak = 0; locked = false; s.question = draw(); if (!s.question) finish(); return s.question; },
    // Returns null when the answer is ignored (not playing, already answered, or out of time).
    answer(index) {
      if (s.status !== 'playing' || locked) return null;
      if (remaining() <= 0) { finish(); return null; }
      locked = true; s.answered += 1;
      const correct = Number(index) === s.question.answerIndex;
      let points = 0;
      if (correct) { s.correct += 1; s.streak += 1; s.bestStreak = Math.max(s.bestStreak, s.streak); points = BLITZ.base * multiplierFor(s.streak); s.score += points; } else s.streak = 0;
      return { correct, points, multiplier: multiplierFor(s.streak), streak: s.streak, correctIndex: s.question.answerIndex, term: s.question.term, meaning: s.question.meaning };
    },
    next() { if (s.status !== 'playing') return null; if (remaining() <= 0) { finish(); return null; } locked = false; s.question = draw(); return s.question; },
    tick() { if (s.status === 'playing' && remaining() <= 0) finish(); return s.status; },
    summary() { return { score: s.score, correct: s.correct, answered: s.answered, accuracy: s.answered ? Math.round((s.correct / s.answered) * 100) : 0, bestStreak: s.bestStreak }; }
  };
}
