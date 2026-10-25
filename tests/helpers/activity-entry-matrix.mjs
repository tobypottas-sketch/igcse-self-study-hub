// The activity-entry matrix: every major Vocabulary Builder entry path measured Cold / Warm / Repeat with the real flow.
//   Cold   = first entry in a freshly loaded page (unit just opened, nothing cached by earlier launches)
//   Warm   = unit content already loaded and another activity already launched and left
//   Repeat = the same activity entered again after leaving it (a left, unfinished mission is resumed)
// "ms" is click -> first paint of a usable question (answer control enabled), both gestures summed: pathway card -> popup, popup -> activity.
import { openEntryPage } from './activity-entry-harness.mjs';

export const ROWS = [
  { id:'Meaning Recommended', pathway:'meaning', stage:'recognise', choice:'recommended' },
  { id:'Meaning open activity', pathway:'meaning', stage:'recognise', choice:'meaning:recognise' },
  { id:'Context Match', pathway:'context', stage:'match', choice:'context:match' },
  { id:'Context Recommended', pathway:'context', stage:'match', choice:'recommended' },
  { id:'Word Families Recommended', pathway:'word_families', stage:'match', choice:'recommended' },
  { id:'Word Families Match the Family', pathway:'word_families', stage:'match', choice:'word_families:match' },
  { id:'Precision Apply', pathway:'precision_use', stage:'apply', choice:'precision_use:apply' },
  { id:'Precision Mastery', pathway:'precision_use', stage:'mastery', choice:'precision_use:mastery' },
  { id:'Spelling & Recall', pathway:'spelling_recall', stage:'recognise', choice:'spelling_recall:recognise' },
  { id:'Mixed Practice', pathway:'meaning', stage:'recognise', choice:'mixed' }
];
const median = list => { const sorted = list.filter(Number.isFinite).sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null; };
const round = value => value == null ? null : Math.round(value);

async function entry(api, row) {
  if (row.choice === 'mixed') { const launch = await api.mixed(); return { launch, sheet:null, ms:launch.paintMs }; }
  const result = await api.enter(row.pathway, row.choice);
  return { ...result, ms:result.sheet.error ? null : result.sheet.paintMs + result.launch.paintMs };
}
const warmUpPathway = row => row.pathway === 'meaning' ? 'context' : 'meaning';

export async function measureRow(root, row, { width = 1280, height = 900, netMs = 0, cpu = 1 } = {}) {
  const out = { id:row.id };
  // COLD (fresh page)
  let api = await openEntryPage({ root, width, height, netMs, cpu, pathway:row.pathway, stage:row.stage });
  const unit = await api.openUnit();
  const cold = await entry(api, row);
  out.unitOpenMs = round(unit.paintMs); out.unitLongTaskMs = unit.longTaskMs;
  out.cold = { ms:round(cold.ms), sheet:round(cold.sheet?.paintMs), launch:round(cold.launch.paintMs), reason:cold.launch.reason, calls:cold.launch.calls, sheetCalls:cold.sheet?.calls ?? [], tl:cold.launch.tl, sheetTl:cold.sheet?.tl ?? [] };
  await api.close();
  // WARM + REPEAT (fresh page, a different launch first)
  api = await openEntryPage({ root, width, height, netMs, cpu, pathway:row.pathway, stage:row.stage });
  await api.openUnit();
  const other = row.choice === 'mixed' ? { id:'warmup', pathway:'meaning', choice:'recommended' } : { id:'warmup', pathway:warmUpPathway(row), choice:'recommended' };
  await entry(api, other); await api.leave();
  const warm = await entry(api, row); await api.leave();
  const repeat = await entry(api, row);
  out.warm = { ms:round(warm.ms), sheet:round(warm.sheet?.paintMs), launch:round(warm.launch.paintMs), reason:warm.launch.reason, calls:warm.launch.calls, sheetCalls:warm.sheet?.calls ?? [], tl:warm.launch.tl, sheetTl:warm.sheet?.tl ?? [] };
  out.repeat = { ms:round(repeat.ms), sheet:round(repeat.sheet?.paintMs), launch:round(repeat.launch.paintMs), reason:repeat.launch.reason, calls:repeat.launch.calls, sheetCalls:repeat.sheet?.calls ?? [] };
  out.errors = api.errors();
  await api.close();
  return out;
}

export async function runMatrix(root, options = {}) {
  const rows = [];
  for (const row of options.rows ?? ROWS) rows.push(await measureRow(root, row, options));
  return rows;
}

export function formatTable(rows) {
  const lines = ['| Entry path | Unit open | Cold | Warm | Repeat | Calls before first paint (cold) | End |', '|---|---:|---:|---:|---:|---|---|'];
  for (const r of rows) {
    const calls = [...(r.cold.sheetCalls ?? []), ...r.cold.calls].filter(c => !/activity_events/.test(c.name)).map(c => c.name.replace(/^(from|rpc|invoke):/, ''));
    lines.push(`| ${r.id} | ${r.unitOpenMs} | ${r.cold.ms} | ${r.warm.ms} | ${r.repeat.ms} | ${calls.length}: ${calls.join(', ')} | ${r.cold.reason}/${r.warm.reason}/${r.repeat.reason} |`);
  }
  return lines.join('\n');
}
