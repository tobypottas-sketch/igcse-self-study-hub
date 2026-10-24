// Job 9: rank of the correct Meaning gloss by character length among its four options (0 = longest ... 3 = shortest).
// Over the whole unit each rank should be about 25% so length carries no information.
import unit from '../content/vocabulary/units/unit-01.js';
const rows = [];
for (const item of unit.items) for (const [i, m] of (item.senses[0].masteryContexts ?? []).entries()) {
  const lens = [m.meaning.length, ...(m.wrongMeanings ?? []).map(x => x.length)];
  const rank = lens.slice(1).filter(l => l > lens[0]).length;       // number of wrong options longer than the correct one
  const ties = lens.slice(1).filter(l => l === lens[0]).length;
  rows.push({ term: item.term, i, rank, ties, correct: m.meaning, lens });
}
const dist = [0, 1, 2, 3].map(r => rows.filter(x => x.rank === r).length);
console.log('contexts', rows.length, 'rank distribution (0=correct longest ... 3=correct shortest):', dist.join(' / '), ' ties:', rows.filter(r => r.ties).length);
if (process.argv.includes('--list')) for (const r of rows) console.log(String(r.rank), r.ties ? 'T' : ' ', r.term.padEnd(14), r.i, r.lens.join(','), r.correct);
