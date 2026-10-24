// Job 9 Part 1: Unit 1 content-gap inventory, derived from the real release content and the real builders.
// Usage: node scripts/vocabulary-job9-inventory.mjs [--json]
import { content, bank } from '../tests/support/vocabulary-contract/bank.js';
import { glossBlank, blankableGapContexts } from '../supabase/functions/_shared/vocabulary-typed-forms.js';
import { evaluateFamilyEligibility } from '../supabase/functions/_shared/vocabulary-word-family.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

const senseOf = (item, occ) => (item.senses ?? []).find(s => s.senseId === occ.senseId) ?? item.senses?.[0] ?? {};
const words = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
const out = { wordFamilies: [], meaning: [], context: [], paraphrasing: {} };

for (const occ of content.occurrences) {
  const item = content.itemsById[occ.vocabularyId]; const sense = senseOf(item, occ);
  const verdict = evaluateFamilyEligibility(item, sense);
  out.wordFamilies.push({ term: item.term, bare: item.wordFamily ?? [], authoredForms: (sense.wordFamilyForms ?? []).length, status: verdict.status, reason: verdict.reason });
  const masteryCtx = sense.masteryContexts ?? [];
  const usable = masteryCtx.map(m => glossBlank({ item, sense, masteryContext: m })).filter(Boolean);
  const wrong = sense.misleadingDistractors ?? [];
  const perContext = masteryCtx.map(m => ({ meaningWords: words(m.meaning), wrongWords: wrong.map(words) }));
  out.meaning.push({ term: item.term, masteryContexts: masteryCtx.length, usableGlossContexts: usable.length, wrongMeanings: wrong, wrongPerContextWordDelta: perContext.map(c => c.wrongWords.map(w => w - c.meaningWords)) });
  const ctxs = (content.contextsByOccurrence?.[occ.occurrenceId] ?? content.contexts.filter(c => c.occurrenceId === occ.occurrenceId));
  const gaps = blankableGapContexts(ctxs, item, sense);
  const sentenceCount = t => (String(t).match(/[.!?](\s|$)/g) ?? []).length;
  out.context.push({ term: item.term, contexts: ctxs.length, byType: ctxs.reduce((a, c) => (a[c.type] = (a[c.type] ?? 0) + 1, a), {}), blankableGaps: gaps.length, maxSentences: Math.max(...ctxs.map(c => sentenceCount(c.text))), passageLevel: ctxs.filter(c => sentenceCount(c.text) >= 2).length });
}

const q = bank().questions.filter(x => x.pathwayId === 'meaning' && x.stageId === 'apply' && x.type === 'meaning_in_context');
const lenRank = q.map(x => { const o = x.options ?? []; const a = x.answers[0]; const len = Math.max(...o.map(s => s.length)); return { longest: o.filter(s => s.length === len).length === 1 && o.find(s => s.length === len) === a, position: o.indexOf(a), n: o.length, wordDelta: o.filter(s => s !== a).map(s => words(s) - words(a)) }; });
out.meaningApplyLeak = { samples: q.length, longestIsCorrect: lenRank.filter(r => r.longest).length, positions: lenRank.reduce((a, r) => (a[r.position] = (a[r.position] ?? 0) + 1, a), {}) };

const readiness = evaluateUnitReadiness({ content });
for (const [id, p] of Object.entries(readiness.pathways)) out.paraphrasing[id] = { live: p.live, reason: p.reason ?? p.reasons ?? null, stageCounts: p.stageCounts, stageMinimums: p.stageMinimums, served: p.served?.length ?? p.servedCount ?? null, sets: p.sets?.length ?? null };
out.authoring = readiness.authoring;

if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  const count = (arr, f) => arr.filter(f).length;
  console.log('WORD FAMILIES  bare=%d authoredForms=%d eligible=%d noFamily=%d', count(out.wordFamilies, w => w.bare.length), count(out.wordFamilies, w => w.authoredForms), count(out.wordFamilies, w => w.status === 'eligible'), count(out.wordFamilies, w => !w.bare.length));
  console.log('MEANING        masteryContexts<2=%d usableGloss<2=%d', count(out.meaning, m => m.masteryContexts < 2), count(out.meaning, m => m.usableGlossContexts < 2));
  console.log('               short:', out.meaning.filter(m => m.usableGlossContexts < 2).map(m => `${m.term}(${m.masteryContexts}/${m.usableGlossContexts})`).join(', '));
  console.log('               apply leak:', JSON.stringify(out.meaningApplyLeak));
  console.log('CONTEXT        passageLevel contexts=%d  words with >=2 blankable gaps=%d', out.context.reduce((s, c) => s + c.passageLevel, 0), count(out.context, c => c.blankableGaps >= 2));
  console.log('               <2 gaps:', out.context.filter(c => c.blankableGaps < 2).map(c => `${c.term}(${c.blankableGaps})`).join(', '));
  console.log('PATHWAYS'); for (const [id, p] of Object.entries(out.paraphrasing)) console.log(' ', id, p.live, JSON.stringify(p.reason), JSON.stringify(p.stageCounts), 'served', p.served, 'sets', p.sets);
}
