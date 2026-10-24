// A faithful in-memory model of the SERVER side of Sets-of-10 progression (start_vocabulary_mission + record_vocabulary_mission + the
// Set trigger in supabase/migrations/20261024160000_vocabulary_pathway_sets.sql). Synthetic data only. The Set state machine itself is the
// production pure module (stage-progression.js); tests/db/pathway-sets.scenario.sql + tests/db/set-parity.* prove the SQL port matches it.
import { applyMissionResult, newSetState } from '../../src/vocabulary/stage-progression.js';

const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const clone = value => JSON.parse(JSON.stringify(value));

export function dbRow({ pathwayId, setNumber = 1, stage = 'recognise', phase = 'stage', status = 'active', completed = null, weak = [], support = [], flags = [] } = {}) {
  return {
    pathway_id: pathwayId, unit_number: 1, set_number: setNumber, stage, phase, status,
    completed_stages: completed ?? STAGES.slice(0, Math.max(0, STAGES.indexOf(stage))), weak_target_ids: weak,
    advanced_with_support: support, support_flags: flags, applied_mission_ids: [], history: []
  };
}

// membersFor(pathwayId, setNumber) -> the Set's authoritative occurrence ids (the model of vocabulary_set_members). null = no membership check (legacy tests).
export function createSetServer({ rows = [], unitNumber = 1, maxSets = 12, startId = 1, membersFor = null } = {}) {
  const sets = new Map(); const starts = new Map(); let counter = startId; const log = [];
  const key = (pathwayId, setNumber) => `${pathwayId}|${setNumber}`;
  for (const row of rows) sets.set(key(row.pathway_id, row.set_number), clone(row));
  const idFor = () => `00000000-0000-4000-8000-${String(counter++).padStart(12, '0')}`;

  function activeRow(pathwayId) {
    return [...sets.values()].filter(r => r.pathway_id === pathwayId && r.status === 'active').sort((a, b) => a.set_number - b.set_number)[0] ?? null;
  }

  function start(args = {}) {
    log.push({ op: 'start', ...clone(args) });
    const { kind, pathwayId = null, pathwayStage = null, forceNew = false, setProgression = false, setNumber = null } = args;
    const progress = setProgression === true && kind === 'pathway';
    let stage = pathwayStage; let setRow = null;
    if (progress) {
      setRow = activeRow(pathwayId);
      if (!setRow) {
        const max = Math.max(0, ...[...sets.values()].filter(r => r.pathway_id === pathwayId).map(r => r.set_number));
        const next = max + 1;
        if (next > 1 && setNumber !== next) throw Object.assign(new Error('No further Set is available'), { code: 'rpc_error', serverMessage: 'No further Set is available' });
        if (next > maxSets) throw Object.assign(new Error('No further Set is available'), { code: 'rpc_error', serverMessage: 'No further Set is available' });
        setRow = dbRow({ pathwayId, setNumber: next });
        sets.set(key(pathwayId, next), setRow);
      }
      stage = setRow.stage;
      for (const s of starts.values()) {
        if (s.status === 'open' && s.kind === 'pathway' && s.pathwayId === pathwayId && s.setNumber != null && !(s.setNumber === setRow.set_number && s.stage === stage && s.setPhase === setRow.phase)) s.status = 'abandoned';
      }
    }
    const matching = [...starts.values()].find(s => s.status === 'open' && s.kind === kind && s.pathwayId === pathwayId
      && (progress ? (s.setNumber === setRow.set_number && s.stage === stage && s.setPhase === setRow.phase) : (s.setNumber == null && s.stage === stage)));
    if (matching && !forceNew) return { missionId: matching.id, missionSeed: matching.seed, resumed: true, startedAt: matching.startedAt, pathwayStage: matching.stage, setNumber: matching.setNumber, setPhase: matching.setPhase, weakTargetIds: setRow ? [...setRow.weak_target_ids] : [] };
    if (matching) matching.status = 'abandoned';
    const id = idFor();
    const entry = { id, seed: `seed-${id.slice(-8)}-0123456789`, kind, pathwayId, stage, setNumber: progress ? setRow.set_number : null, setPhase: progress ? setRow.phase : null, status: 'open', startedAt: new Date().toISOString() };
    starts.set(id, entry);
    return { missionId: id, missionSeed: entry.seed, resumed: false, startedAt: entry.startedAt, pathwayStage: entry.stage, setNumber: entry.setNumber, setPhase: entry.setPhase, weakTargetIds: setRow ? [...setRow.weak_target_ids] : [] };
  }

  // attempts = the saved payloads of this mission (what the Edge Function stored). Score = targets that finished correct, as the SQL derives it.
  function scoreOf(attempts) {
    const byTarget = new Map();
    for (const a of attempts) {
      const correct = a.rawAnswer !== '__wrong__';
      const finishing = (a.firstAttempt && correct) || (!a.firstAttempt && a.recoveredLater);
      if (finishing && !byTarget.has(a.occurrenceId)) byTarget.set(a.occurrenceId, correct);
    }
    const missed = [...new Set(attempts.map(a => a.occurrenceId))].filter(id => !attempts.some(a => a.occurrenceId === id && a.firstAttempt && a.rawAnswer !== '__wrong__'));
    return { score: [...byTarget.values()].filter(Boolean).length, completed: byTarget.size, targets: new Set(attempts.map(a => a.occurrenceId)).size, missed };
  }

  function record(missionId, attempts) {
    log.push({ op: 'record', missionId });
    const entry = starts.get(missionId);
    const mine = attempts.filter(a => a.missionId === missionId);
    if (!entry || mine.length === 0) return null;
    if (entry.status === 'completed') return { duplicate: true, mission_id: missionId };
    if (entry.status !== 'open') return null;                                    // abandoned: cannot be recorded
    const { score, completed, targets, missed } = scoreOf(mine);
    if (targets !== 10 || completed !== 10) return null;
    entry.status = 'completed';
    if (entry.kind === 'pathway' && entry.setNumber != null) {
      const row = sets.get(key(entry.pathwayId, entry.setNumber));
      const claimedStage = mine[0].pathwayStage;
      if (row && !row.applied_mission_ids.includes(missionId)) {
        row.applied_mission_ids.push(missionId);
        // Membership (mirrors the migration): the targets attempted AND the targets finished must be exactly the Set's members, order ignored.
        const members = membersFor ? membersFor(entry.pathwayId, entry.setNumber) : null;
        const sameIds = (a, b) => a.length === b.length && a.every(id => b.includes(id));
        const attempted = [...new Set(mine.map(a => a.occurrenceId))];
        const finished = [...new Set(mine.filter(a => (a.firstAttempt && a.rawAnswer !== '__wrong__') || (!a.firstAttempt && a.recoveredLater)).map(a => a.occurrenceId))];
        const memberOk = !members || (members.length === 10 && sameIds(attempted, members) && sameIds(finished, members));
        if (!memberOk) row.history.push({ missionId, rejected: 'targets_not_set_members' });
        if (memberOk && row.status !== 'maintain' && entry.stage === row.stage && entry.setPhase === row.phase && claimedStage === entry.stage) {
          const kind = row.phase === 'consolidate' ? 'consolidate' : row.phase === 'recovery' ? 'recovery' : 'stage';
          const before = { ...newSetState(), stage: row.stage, phase: row.phase, advancedWithSupport: [...row.advanced_with_support], supportFlags: [...row.support_flags], maintain: false };
          const after = applyMissionResult(before, { missionId, stage: row.stage, kind, size: 10, score, complete: true, missedTargetIds: missed });
          const advanced = after.maintain || after.stage !== row.stage;
          if (advanced) row.completed_stages = [...row.completed_stages, row.stage];
          row.weak_target_ids = advanced ? [] : (row.phase === 'recovery' ? row.weak_target_ids : missed);
          row.stage = after.stage; row.phase = after.phase; row.status = after.maintain ? 'maintain' : 'active';
          row.advanced_with_support = after.advancedWithSupport; row.support_flags = after.supportFlags;
        }
      }
    }
    let best = 0; let streak = 0;
    for (const a of mine) { if (a.firstAttempt && a.rawAnswer !== '__wrong__') { streak += 1; best = Math.max(best, streak); } else streak = 0; }
    return {
      mission_id: missionId, unit_number: unitNumber, mission_kind: entry.kind, pathway_id: entry.pathwayId, pathway_stage: entry.kind === 'pathway' ? entry.stage : null,
      practice_family: mine[0].practiceFamily ?? 'recommended', mission_size: 10, score, stars: score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0, best_streak: best,
      completed_at: new Date().toISOString(), duplicate: false
    };
  }

  return { start, record, rows: () => [...sets.values()].map(clone), row: (pathwayId, setNumber) => clone(sets.get(key(pathwayId, setNumber)) ?? null), starts, log };
}
