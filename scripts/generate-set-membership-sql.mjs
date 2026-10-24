// Prints (or, with --write, splices into the migration) the authoritative Set members for every released unit's LIVE pathways.
// Source of truth: the unit release content -> the canonical readiness evaluator -> computePathwaySets (the same code the app uses).
import fs from 'node:fs';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

export const RELEASES = [unit1];
export function membershipRows(releases = RELEASES) {
  const rows = [];
  for (const unit of releases) {
    const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit) });
    for (const pathway of Object.values(readiness.pathways)) {
      if (!(pathway.playableSetCount > 0)) continue;                               // a pathway that is not live offers no Set
      pathway.setMembers.forEach((members, setIndex) => members.forEach((occurrenceId, index) => rows.push({ unit: readiness.unitNumber, pathway: pathway.pathwayId, set: setIndex + 1, position: index + 1, occurrenceId })));
    }
  }
  return rows;
}
export function membershipSql(rows = membershipRows()) {
  const values = rows.map(r => `  (${r.unit}, '${r.pathway}', ${r.set}, ${r.position}, '${r.occurrenceId}')`).join(',\n');
  return `insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values\n${values}\non conflict do nothing;`;
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const sql = membershipSql();
  if (process.argv.includes('--write')) {
    const file = new URL('../supabase/migrations/20261024170000_vocabulary_set_membership.sql', import.meta.url);
    const text = fs.readFileSync(file, 'utf8').replace(/-- BEGIN GENERATED MEMBERS[^\n]*\n[\s\S]*?\n-- END GENERATED MEMBERS/, `-- BEGIN GENERATED MEMBERS (scripts/generate-set-membership-sql.mjs)\n${sql}\n-- END GENERATED MEMBERS`);
    fs.writeFileSync(file, text);
  } else console.log(sql);
}
