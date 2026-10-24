// Job 9 (Part 9): human-review sheets, DERIVED from the canonical JavaScript release. Edit the JS, never the sheet.
// node scripts/generate-unit1-review-sheets.mjs <outDir>   -> writes four CSV files (word families, passages, meaning wrongs, mastery contexts).
import fs from 'node:fs';
import path from 'node:path';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { unit1WordFamilies, unit1WordFamilyRejected } from '../content/vocabulary/units/unit-01-word-families.js';

const csv = rows => rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';
export function reviewSheets() {
  const sheets = {};
  const wf = [['headword', 'status', 'form', 'part of speech', 'example', 'second example', 'why taught / why rejected', 'decision']];
  for (const item of unit1.items) {
    const family = unit1WordFamilies[item.term];
    if (family) for (const f of item.senses[0].wordFamilyForms) wf.push([item.term, 'accepted', f.form, f.partOfSpeech, f.example, f.altExample ?? '', family.forms.find(x => x.form === f.form)?.why ?? '', '']);
    else wf.push([item.term, 'rejected', '', '', '', '', unit1WordFamilyRejected[item.term] ?? '', '']);
  }
  sheets['word-families'] = csv(wf);
  const ps = [['word', 'passage', 'answer', 'gap-fill row', 'decision']];
  for (const item of unit1.items) for (const p of item.senses[0].masteryPassages ?? []) ps.push([item.term, p.text, p.answer, p.contextId, '']);
  sheets['context-passages'] = csv(ps);
  const mw = [['word', 'correct meaning', 'wrong meaning 1', 'wrong meaning 2', 'wrong meaning 3', 'decision']];
  for (const item of unit1.items) { const s = item.senses[0]; mw.push([item.term, s.acceptedParaphrases[0], ...(s.wrongParaphrases ?? ['', '', '']), '']); }
  sheets['meaning-match-wrong-meanings'] = csv(mw);
  const mc = [['word', 'mastery sentence', 'meaning (typed answer is the word)', 'wrong meaning 1', 'wrong meaning 2', 'wrong meaning 3', 'decision']];
  for (const item of unit1.items) for (const c of item.senses[0].masteryContexts ?? []) mc.push([item.term, c.text, c.meaning, ...(c.wrongMeanings ?? ['', '', '']), '']);
  sheets['meaning-mastery-contexts'] = csv(mc);
  return sheets;
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const dir = path.resolve(process.argv[2] ?? '.');
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(reviewSheets())) { fs.writeFileSync(path.join(dir, `unit1-${name}.csv`), text); console.log(name, text.split('\n').length - 2, 'rows'); }
}
