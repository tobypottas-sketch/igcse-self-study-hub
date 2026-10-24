// Job 9 Part 13. Usage: node scripts/vocabulary-leakage-analysis.mjs [--json] [--all] [--seeds N]   (default 12 question variants per target)
import { bank } from '../tests/support/vocabulary-contract/bank.js';
import { analyseByType } from '../tests/support/vocabulary-contract/leakage.js';
const FOCUS = new Set(['definition_to_word', 'meaning_match', 'which_situation_fits', 'meaning_in_context', 'precision_choice', 'word_definition_match', 'context_sentence_match', 'precision_match', 'word_family_match', 'spelling_choice', 'word_family_identify', 'word_family_choice', 'choose_word_sentence', 'gap_fill_bank', 'drag_word_sentence']);
const all = process.argv.includes('--all');
const seedCount = Number(process.argv[process.argv.indexOf('--seeds') + 1]) || 12;
const report = analyseByType(bank(Array.from({ length: seedCount }, (_, i) => i)).questions.filter(q => all || FOCUS.has(q.type)));
if (process.argv.includes('--json')) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
const pct = x => `${(x * 100).toFixed(0)}%`;
for (const [key, r] of Object.entries(report)) {
  console.log(`${key}  n=${r.n}  pos=${JSON.stringify(r.positions)}`);
  for (const [name, h] of Object.entries(r.heuristics)) if (h.fired) console.log(`   ${name.padEnd(18)} fired ${String(h.fired).padStart(4)}  acc ${pct(h.accuracy).padStart(4)}  chance ${pct(h.chance).padStart(4)}  ${h.verdict}${h.inverse ? '  (' + h.inverse + ')' : ''}`);
}
