// Generates SQL for tests/db/mission-e2e.scenario: plays one REAL app.js mission in the harness (with a wrong answer + supported retry
// + recovery), builds each stored event with the Edge Function's own metadata builder, and emits INSERTs. Run: node tests/support/e2e-mission-sql.mjs > out.sql
import { harness, correctAnswer, settle } from '../vocabulary-app-harness.mjs';
import unit from '../../content/vocabulary/releases/unit-01.js';
import { buildStoredAttemptMetadata } from '../../supabase/functions/vocabulary-attempt-action/validation.js';

const MISSION = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'; const SEED = 'e2e-seed-0123456789abcdef'; const STUDENT = '11111111-1111-4111-8111-111111111111';
globalThis.localStorage = { _d: new Map(), getItem(k) { return this._d.get(k) ?? null; }, setItem(k, v) { this._d.set(k, String(v)); }, removeItem(k) { this._d.delete(k); } };
const server = async args => ({ missionId: MISSION, missionSeed: SEED, resumed: false, startedAt: new Date().toISOString(), ...args && {} });
const h = harness({ pathwayId: 'meaning', stage: 'recognise', size: 10, missionServer: server });
await h.run("startPathwaySession('meaning')");
let expectedScore = 0;
for (let i = 0; i < 10; i += 1) {
  if (i === 3) {                                   // first answer wrong -> supported retry -> then the recovery question later
    h.run('handleAnswer(null,"__wrong__")'); await settle(h);
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await settle(h);
  } else { h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await settle(h); if (i !== 3) expectedScore += 1; }
  if (h.state.session.completedTargetIds.length >= 10) break;
  await h.run('advanceToNextQuestion()');
}
// the missed target is re-asked as a recovery question
for (let guard = 0; guard < 4 && h.state.session.completedTargetIds.length < 10; guard += 1) { h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await settle(h); if (h.state.session.completedTargetIds.length < 10) await h.run('advanceToNextQuestion()'); }
const rows = [];
for (const p of h.saved) {
  const metadata = buildStoredAttemptMetadata({ unitNumber: 1, strand: p.strands?.[0] ?? 'meaning', questionType: p.questionType, firstAttempt: p.firstAttempt, retryUsed: p.retryUsed, recoveredLater: p.recoveredLater, correct: p.rawAnswer !== '__wrong__', misconceptionCategory: null, evidenceStrength: p.evidenceStrength, supportLevel: p.supportLevel, vocabularyId: unit.occurrences.find(o => o.occurrenceId === p.occurrenceId).vocabularyId, occurrenceId: p.occurrenceId, pathwayId: p.pathwayId, pathwayStage: p.pathwayStage, servedPathwayStage: p.servedPathwayStage, missionId: p.missionId, missionSize: p.missionSize, missionKind: p.missionKind, practiceFamily: p.practiceFamily });
  rows.push({ p, metadata });
}
console.log(`-- saved attempts: ${rows.length}; every payload names the server mission: ${rows.every(r => r.p.missionId === MISSION)}; completed targets: ${h.state.session.completedTargetIds.length}`);
console.log(`-- expected mission score (clean first-try targets): ${expectedScore}`);
console.log(`insert into public.profiles(id) values ('${STUDENT}') on conflict do nothing;`);
console.log(`insert into public.vocabulary_mission_starts(mission_id,mission_seed,student_id,unit_number,mission_kind,pathway_id,pathway_stage) values ('${MISSION}','${SEED}','${STUDENT}',1,'pathway','meaning','recognise');`);
for (const { p, metadata } of rows) {
  const md = JSON.stringify(metadata).replace(/'/g, "''");
  console.log(`insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values ('${STUDENT}','vocabulary_paraphrase','question_attempt','unit-1','${md}');`);
}
