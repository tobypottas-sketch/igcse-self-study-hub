// Job 8 Part 17: per pathway/stage capacity of the Unit 1 release. Read-only. `node scripts/vocabulary-capacity-report.mjs [--json]`
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';

const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const VARIANTS = 6;
export function capacityReport() {
  const content = releasePlannerContent(unit1);
  const readiness = evaluateUnitReadiness({ content });
  const rows = [];
  for (const [pathwayId, p] of Object.entries(readiness.pathways)) {
    for (const stage of STAGES) {
      const eligible = []; const cues = new Set(); const fingerprints = new Set(); const types = {}; let distractorMin = null; let repeatRisk = 0;
      for (const target of content.occurrences) {
        const seen = new Set();
        for (let k = 0; k < VARIANTS; k += 1) {
          let q; try { q = planPathwayQuestion({ pathwayId, stageId: stage, content, target, seed: `${target.occurrenceId}:${k}:cap`, optionNonce: `n${k}`, reviewPolicy: 'prefer' }).question; } catch { break; }
          if (k === 0) eligible.push(target.occurrenceId);
          types[q.type] = (types[q.type] ?? 0) + 1;
          const cue = `${q.type}|${q.contentId ?? q.contextId ?? ''}|${q.activityVariantId ?? ''}|${q.prompt}|${q.sourceText ?? ''}`;
          seen.add(cue); cues.add(`${target.occurrenceId}|${cue}`); fingerprints.add(`${target.occurrenceId}|${cue}`);
          const n = (q.options?.length ?? q.matchOptions?.length ?? q.tiles?.length ?? 0); if (n) distractorMin = distractorMin == null ? n : Math.min(distractorMin, n);
        }
        if (seen.size <= 1 && eligible.includes(target.occurrenceId)) repeatRisk += 1;
      }
      rows.push({ pathwayId, stage, live: p.live, eligible: eligible.length, distinctCues: cues.size, minChoiceCount: distractorMin, repeatRiskTargets: repeatRisk, types });
    }
  }
  const pathways = Object.fromEntries(Object.entries(readiness.pathways).map(([id, p]) => [id, { live: p.live, served: p.servedCount, fullSets: p.setMembers?.length ?? 0, heldBack: p.heldBackOccurrenceIds?.length ?? 0, stageCounts: p.stageCounts }]));
  return { rows, pathways, authoring: readiness.authoring };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const report = capacityReport();
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 1));
  else {
    for (const [id, p] of Object.entries(report.pathways)) console.log(`${id}: live=${p.live} served=${p.served} fullSets=${p.fullSets} heldBack=${p.heldBack}`);
    for (const r of report.rows) console.log(`${r.pathwayId}/${r.stage}: eligible=${r.eligible} cues=${r.distinctCues} minChoices=${r.minChoiceCount ?? '-'} singleCueTargets=${r.repeatRiskTargets} ${JSON.stringify(r.types)}`);
    console.log(JSON.stringify(report.authoring));
  }
}
