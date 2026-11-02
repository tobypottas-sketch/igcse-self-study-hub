// eh-summary: pathway state per (unit, pathway) for the Evidence Hub summary. Pure: no I/O, no clock, no logging.
//
// Parity rule: this reproduces the Vocabulary student app's own decision from the same persisted inputs, using the SAME shared pure
// logic (supabase/functions/_shared/vocabulary-pathway-sets.js, extracted in H0). It contains no Set arithmetic or completion rule
// of its own. Inputs, exactly as the student app reads them:
//   members     public.vocabulary_set_members rows of the student's units (unit_number, pathway_id, set_number, position, occurrence_id)
//   occurrences public.vocabulary_unit_occurrences rows (occurrence_id, unit_number, position_in_unit, status, active)
//   setRows     public.vocabulary_pathway_sets rows of ONE student (unit_number, pathway_id, set_number, stage, phase, status, ...)
// An occurrence counts only when it is live and active, the same filter as loadVocabularyDashboard / loadVocabularyUnit in
// src/vocabulary/data.js (pinned by tests/eh-summary-pathway-state.test.js). Availability can therefore change after Sets exist.
// Set counts are internal fields; they are not part of the Evidence Hub contract.
import { PATHWAY_IDS } from '../_shared/vocabulary-pathway-contract.js';
import { coverageFromServerSetMembers, setsFromCoverage, groupSetRows, activeSetStep } from '../_shared/vocabulary-pathway-sets.js';

export const LIVE_OCCURRENCE_FILTER = Object.freeze({ status: 'live', active: true });

export function isLiveOccurrence(row) {
  return row?.status === LIVE_OCCURRENCE_FILTER.status && row?.active === LIVE_OCCURRENCE_FILTER.active;
}

function objects(list) { return (Array.isArray(list) ? list : []).filter(row => row && typeof row === 'object'); }
function unitOf(row) { const value = Number(row.unit_number ?? row.unitNumber); return Number.isInteger(value) ? value : null; }
function positionOf(row) { const value = Number(row.position_in_unit); return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER; }

// -> { units: { [unitNumber]: { pathways: { [pathwayId]: { available, state, setCount, setsMaintained } } } } }
// state: 'mastered' (available and every Set in Maintain) | 'in_progress' (available, not complete, at least one Set row in range) | 'none'.
// Only units that have at least one live occurrence appear, as in the student app.
export function derivePathwayStates({ members = [], occurrences = [], setRows = [] } = {}) {
  const memberRows = objects(members);
  const stateRows = objects(setRows);
  const liveByUnit = new Map();
  for (const row of objects(occurrences)) {
    const unit = unitOf(row);
    if (unit === null || !isLiveOccurrence(row)) continue;
    if (!liveByUnit.has(unit)) liveByUnit.set(unit, []);
    liveByUnit.get(unit).push(row);
  }
  const units = {};
  for (const [unit, live] of liveByUnit) {
    const ordered = [...live].sort((a, b) => positionOf(a) - positionOf(b));
    const authored = ordered.map(row => String(row.occurrence_id));
    const coverage = coverageFromServerSetMembers(memberRows.filter(row => unitOf(row) === unit), ordered);
    const grouped = groupSetRows(stateRows.filter(row => unitOf(row) === unit));
    const pathways = {};
    for (const pathwayId of PATHWAY_IDS) {
      const coverageRow = coverage[pathwayId] ?? { available: true, occurrenceIds: authored };
      const sets = setsFromCoverage(pathwayId, coverageRow, authored);
      const rows = grouped[pathwayId] ?? {};
      const step = activeSetStep({ sets, rowsForPathway: rows });
      let setsMaintained = 0;
      let hasRow = false;
      for (let number = 1; number <= step.setCount; number += 1) {
        if (!rows[number]) continue;
        hasRow = true;
        if (rows[number].status === 'maintain') setsMaintained += 1;
      }
      pathways[pathwayId] = {
        available: step.available === true,
        state: !step.available ? 'none' : step.firstPassComplete ? 'mastered' : hasRow ? 'in_progress' : 'none',
        setCount: step.setCount,
        setsMaintained
      };
    }
    units[unit] = { pathways };
  }
  return { units };
}
