// Prints (or, with --write, splices into the migration) the authoritative Set members for every released unit's LIVE pathways.
// Source of truth: the unit release content -> the canonical readiness evaluator -> computePathwaySets (the same code the app uses).
import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadReleases, contentVersionFor } from './vocabulary-releases.mjs';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';

// Every released unit (content/vocabulary/releases/unit-NN.js), ascending. Units appear here the moment their release file exists.
const RELEASED = await loadReleases();
export const RELEASES = RELEASED.map(entry => entry.release);
export const releaseFor = unitNumber => RELEASES.find(release => Number(release.unitNumber) === Number(unitNumber)) ?? null;
// The v2 delta migration below belongs to Unit 1 (the baseline seed is Unit 1's), so its header version/checksum are Unit 1's.
export const DELTA_UNIT = 1;
export const CONTENT_VERSION = contentVersionFor(DELTA_UNIT);
// One unit's authoritative Set members.
export const membershipRowsForUnit = unitNumber => membershipRows(releaseFor(unitNumber) ? [releaseFor(unitNumber)] : []);
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
export function membershipChecksum(rows = membershipRows()) {
  return crypto.createHash('sha256').update(rows.map(row => `${row.unit}|${row.pathway}|${row.set}|${row.position}|${row.occurrenceId}`).join('\n')).digest('hex');
}
export function membershipSql(rows = membershipRows()) {
  const values = rows.map(r => `  (${r.unit}, '${r.pathway}', ${r.set}, ${r.position}, '${r.occurrenceId}')`).join(',\n');
  return `insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values\n${values}\non conflict do nothing;`;
}

// ---- Job 8: additive membership delta (version strategy) ----
// The first migration (20261024170000) is immutable history: it seeded the Sets that were live then. When the ladder changes which targets are
// servable, the CURRENT membership may differ from that seed. We never edit the seed and never silently reshuffle: the delta migration replaces a
// Set's rows only when NO student has started that Set (guarded in SQL, and it raises instead of skipping so a started Set is a decision, not a drift).
// A Set that is no longer offered is REMOVED (guarded, then deleted): see removedSets().
export const BASELINE_MIGRATION = new URL('../supabase/migrations/20261024170000_vocabulary_set_membership.sql', import.meta.url);
export const DELTA_MIGRATION = new URL('../supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql', import.meta.url);
export function baselineRows() {
  const sql = fs.readFileSync(BASELINE_MIGRATION, 'utf8');
  return [...sql.matchAll(/\((\d+), '([a-z_]+)', (\d+), (\d+), '([a-z0-9_]+)'\)/g)].map(m => ({ unit: +m[1], pathway: m[2], set: +m[3], position: +m[4], occurrenceId: m[5] }));
}
const setKey = r => `${r.unit}|${r.pathway}|${r.set}`;
const members = rows => { const map = new Map(); for (const r of rows) (map.get(setKey(r)) ?? map.set(setKey(r), []).get(setKey(r))).push(r); for (const list of map.values()) list.sort((a, b) => a.position - b.position); return map; };
// Sets whose live membership differs from the seed (same Set number, different ordered members).
export function changedSets(current = membershipRows(), baseline = baselineRows()) {
  const now = members(current); const was = members(baseline); const changed = [];
  for (const [key, list] of now) {
    const before = was.get(key);
    if (before && before.map(r => r.occurrenceId).join() !== list.map(r => r.occurrenceId).join()) changed.push({ key, was: before, now: list });
  }
  return changed;
}
// Job 9 follow-up: Sets in the BASELINE that no longer exist in the CURRENT membership. Leaving their rows in place is NOT inert: server Set
// progression can open "the next Set number" and the leftover rows would satisfy the membership guard. They get the same started-Set guard
// as a changed Set, and (when unstarted) their rows are deleted without replacement.
export function removedSets(current = membershipRows(), baseline = baselineRows()) {
  const now = members(current); const removed = [];
  for (const [key, list] of members(baseline)) if (!now.has(key)) removed.push({ key, was: list, now: [], removed: true });
  return removed;
}
export function deltaSql(current = membershipRows(), baseline = baselineRows()) {
  const sets = [...changedSets(current, baseline), ...removedSets(current, baseline)];
  if (!sets.length) return '';
  // ONE statement (one implicit transaction): every started-Set guard runs before anything is written, so a started Set aborts the whole
  // migration and never leaves some Sets replaced and others not.
  const ident = ({ now, was }) => (now[0] ?? was[0]);
  const guards = sets.map(entry => {
    const { unit, pathway, set } = ident(entry);
    return `  if exists (select 1 from public.vocabulary_pathway_sets where unit_number = ${unit} and pathway_id = '${pathway}' and set_number = ${set}) then
    raise exception 'Set ${unit}/${pathway}/${set} has already been started by a student; its members must not change silently. Decide a version policy first.';
  end if;`;
  }).join('\n');
  const writes = sets.map(entry => {
    const { now } = entry; const { unit, pathway, set } = ident(entry);
    const del = `  delete from public.vocabulary_set_members where unit_number = ${unit} and pathway_id = '${pathway}' and set_number = ${set};`;
    if (!now.length) return del;                                                  // removed Set: delete, no replacement
    const values = now.map(r => `    (${r.unit}, '${r.pathway}', ${r.set}, ${r.position}, '${r.occurrenceId}')`).join(',\n');
    return `${del}
  insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values
${values};`;
  }).join('\n');
  return `do $$
begin
${guards}
${writes}
end $$;`;
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  // The baseline migration is immutable history. --write only refreshes the generated DELTA block of the v2 migration.
  if (process.argv.includes('--write')) {
    // Job 9 (Part 12): the generated block also carries the content lock header (version + membership checksum), so a migration that no longer
    // matches the release fails tests/vocabulary-content-drift.test.js. The lock file itself is refreshed by scripts/vocabulary-content-checksum.mjs --write.
    const text = fs.readFileSync(DELTA_MIGRATION, 'utf8').replace(/-- BEGIN GENERATED DELTA[^\n]*\n[\s\S]*?\n-- END GENERATED DELTA/, () => `-- BEGIN GENERATED DELTA (scripts/generate-set-membership-sql.mjs)\n-- CONTENT LOCK version=${CONTENT_VERSION} membership=${membershipChecksum(membershipRowsForUnit(DELTA_UNIT))}\n${deltaSql()}\n-- END GENERATED DELTA`);
    fs.writeFileSync(DELTA_MIGRATION, text);
  } else if (process.argv.includes('--unit')) {
    // A unit's membership as insert SQL (for a NEW migration: the baseline and v2 migrations are immutable history).
    const unitNumber = Number(process.argv[process.argv.indexOf('--unit') + 1]);
    const rows = membershipRowsForUnit(unitNumber);
    if (!rows.length) { console.error(`Unit ${unitNumber} has no released, live pathways.`); process.exit(1); }
    console.log(`-- Unit ${unitNumber} Set membership, GENERATED by scripts/generate-set-membership-sql.mjs --unit ${unitNumber}\n-- membership checksum ${membershipChecksum(rows)}\n${membershipSql(rows)}`);
  } else console.log(deltaSql());
}
