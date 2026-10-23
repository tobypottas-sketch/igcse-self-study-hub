// Executable specification of Locked Decision 4 (typed-answer classification). Reference only.
// Explicit accepted forms win over edit distance: "admits" for "admit" is one edit but is a WRONG INFLECTION, not a typo.
export const MIN_LENGTH_FOR_SLIP = 5;   // short words are too easy to confuse with other words (rise/rose, cat/cut)

const norm = v => String(v ?? '').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/[.!?,;:]+$/u, '').replace(/\s+/g, ' ');

// Optimal-string-alignment distance: one insertion, deletion, substitution or adjacent transposition counts as 1 ("aviod" -> "avoid").
export function osaDistance(a, b) {
  const x = Array.from(a), y = Array.from(b);
  const d = Array.from({ length: x.length + 1 }, (_, i) => Array.from({ length: y.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= x.length; i += 1) for (let j = 1; j <= y.length; j += 1) {
    const cost = x[i - 1] === y[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    if (i > 1 && j > 1 && x[i - 1] === y[j - 2] && x[i - 2] === y[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[x.length][y.length];
}

export function classifyTypedAnswer({ expected, typed, pathwayId = 'meaning', forms = [], lexicon = [] } = {}) {
  const want = norm(expected), got = norm(typed);
  const spellingPathway = pathwayId === 'spelling_recall';
  // lexicalMatch = the learner reached the right lexical item (true even for a wrong inflection) so evidence can tell a form error from a wrong word.
  const result = (cls, semanticallyCorrect, orthographicallyClean, lexicalMatch = false) => ({ class: cls, semanticallyCorrect, orthographicallyClean, lexicalMatch, correct: cls === 'exact' || (cls === 'spelling_slip' && !spellingPathway) });
  if (!got) return result('wrong_lexical', false, false);
  if (got === want) return result('exact', true, true, true);
  const formSet = new Set(forms.map(norm));
  if (formSet.has(got)) return result('wrong_inflection', false, true, true);                 // right word, wrong form requested
  if (new Set(lexicon.map(norm)).has(got)) return result('wrong_lexical', false, true);  // another real item
  if (want.length >= MIN_LENGTH_FOR_SLIP && osaDistance(got, want) === 1) return result('spelling_slip', !spellingPathway, false, true);
  return result('wrong_lexical', false, false);
}
