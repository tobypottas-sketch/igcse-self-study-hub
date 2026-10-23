import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { buildPathwayCoverage } from '../src/vocabulary/pathway-coverage.js';
import { clearPathwayCoverage, coverageServes, registerPathwayCoverage, servedByAnyLivePathway } from '../src/vocabulary/pathway-coverage-store.js';
import { planMixedReviewQuestion } from '../src/vocabulary/mixed-review.js';
import { VOCABULARY_PATHWAYS } from '../src/vocabulary/pathway-model.js';
import { freshPathwayProgress } from '../src/vocabulary/pathway-progress.js';
import { achievements, bestAndAim, bucketKey, computeXp, evaluateMission, progressSnapshot } from '../src/vocabulary/engagement-model.js';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';
import { loadVocabularyMissions, loadVocabularyUnit } from '../src/vocabulary/data.js';

after(() => clearPathwayCoverage());
const full = releasePlannerContent(unit1);
const ids = ['recognise', 'match', 'apply', 'recall', 'mastery'];

// ---------------------------------------------------------------------------------------------------------------- Mixed Practice
test('Mixed Practice never serves a locked pathway, and the test would catch the leak', () => {
  const ideaWords = unit1.occurrences.filter(row => unit1.activities.some(a => a.contentType === 'idea_set' && a.activityData.linkedVocabularyIds.includes(row.vocabularyId)));
  const phraseWords = unit1.occurrences.filter(row => unit1.activities.some(a => a.contentType === 'phrase_set' && a.activityData.linkedVocabularyIds.includes(row.vocabularyId)));
  const targets = [...ideaWords, ...phraseWords];
  const pathwaysSeen = () => {
    const seen = new Set();
    for (const target of targets) for (let seed = 0; seed < 40; seed += 1) {
      try { seen.add(planMixedReviewQuestion({ content:full, target, seed:`leak-${seed}` }).plan.pathwayId); } catch { /* nothing buildable for this seed */ }
    }
    return seen;
  };
  clearPathwayCoverage();
  assert.ok(pathwaysSeen().has('paraphrasing'), 'control: with no readiness evaluated, a locked pathway can leak into Mixed Practice');
  registerPathwayCoverage(1, buildPathwayCoverage({ content:full }));
  const seen = pathwaysSeen();
  assert.equal(seen.has('paraphrasing'), false, 'locked Paraphrasing must not appear');
  assert.ok(seen.has('meaning') && seen.has('spelling_recall'), 'live pathways still do');
});

test('coverage helpers: locked pathways serve nobody; live ones serve only their cohort', () => {
  registerPathwayCoverage(1, buildPathwayCoverage({ content:full }));
  const phraseWord = unit1.occurrences.find(row => unit1.activities.some(a => a.contentType === 'phrase_set' && a.activityData.linkedVocabularyIds.includes(row.vocabularyId)));
  assert.equal(coverageServes(1, 'paraphrasing', phraseWord.occurrenceId), false);
  assert.equal(coverageServes(1, 'meaning', phraseWord.occurrenceId), true);
  assert.equal(servedByAnyLivePathway(1, phraseWord.occurrenceId, ['paraphrasing']), false);
  assert.equal(servedByAnyLivePathway(1, phraseWord.occurrenceId, VOCABULARY_PATHWAYS.map(p => p.id)), true);
  clearPathwayCoverage();
});

// ---------------------------------------------------------------------------------------------------------------- locked tile
test('a locked pathway is a calm Coming soon tile: not selectable, no score, no progress, no evidence', () => {
  const root = { innerHTML:'' };
  const states = Object.fromEntries(VOCABULARY_PATHWAYS.map(p => [p.id, { currentStage:'recognise', completedStages:[], mastered:false, available:p.id !== 'paraphrasing', coverageCount:40, totalCount:50 }]));
  states.paraphrasing = { currentStage:'recognise', completedStages:[], mastered:false, available:false, coverageCount:12, totalCount:50, unavailableReason:'diversity_below_minimum', stageEvidence:{ attempts:3, cleanSuccesses:2 } };
  renderVocabularyUnit(root, { unitNumber:1, unitTitle:'Sports', progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} }, pathwayStates:states, contentReady:true });
  const card = root.innerHTML.match(/<button[^>]*data-pathway="paraphrasing"[\s\S]*?<\/button>/)[0];
  assert.match(card, /data-pathway-status="unavailable"/);
  assert.match(card, / disabled aria-disabled="true"/);
  assert.match(card, /Coming soon/);
  assert.doesNotMatch(card, /words available|Continue pathway|Review pathway|clean|attempt/i);
  assert.doesNotMatch(card, /Needs practice|Mastered/);
});

// ---------------------------------------------------------------------------------------------------------------- dynamic completion
function registerLive(liveIds, occurrences) {
  const all = occurrences.map(row => row.occurrenceId);
  registerPathwayCoverage(1, Object.fromEntries(VOCABULARY_PATHWAYS.map(p => [p.id, liveIds.includes(p.id)
    ? { available:true, occurrenceIds:all, totalOccurrences:all.length }
    : { available:false, occurrenceIds:[], totalOccurrences:all.length, reason:'stage_below_minimum' }])));
}
function allMastered(occurrences) {
  const progress = freshPathwayProgress({ completedStages:ids });
  return Object.fromEntries(occurrences.map(row => [row.occurrenceId, { status:'mastered', contextualEvidence:{ pathwayProgress:Object.fromEntries(VOCABULARY_PATHWAYS.map(p => [p.id, progress])) } }]));
}
function snapshotFor(liveIds) {
  const occurrences = unit1.occurrences.slice(0, 12);
  registerLive(liveIds, occurrences);
  return progressSnapshot({ occurrences, unitMastery:allMastered(occurrences), globalMastery:{} });
}

test('two live pathways mastered is "released complete", not Unit Mastery: no badge, no unit XP', () => {
  const snapshot = snapshotFor(['meaning', 'spelling_recall']);
  assert.deepEqual(snapshot.units[1], { livePathways:2, totalPathways:6, comingSoon:4, masteredPathways:2, releasedComplete:true, unitMastered:false });
  assert.equal(snapshot.unitsMastered, 0);
  assert.equal(computeXp({ snapshot }).parts.unitMasteries, 0);
  assert.equal(achievements({ snapshot }).find(row => row.id === 'unit_master').unlocked, false);
  const root = { innerHTML:'' };
  renderVocabularyUnit(root, { unitNumber:1, unitTitle:'Sports', progress:{ mastered:12, total:12, needsAnotherLook:0, reviewDue:0, stages:{} }, pathwayStates:{}, contentReady:true, completion:snapshot.units[1] });
  assert.match(root.innerHTML, /All released pathways mastered · 4 coming soon/);
});

test('publishing another pathway later ends the released-complete state and never removes earned XP', () => {
  const before = computeXp({ snapshot:snapshotFor(['meaning', 'spelling_recall']) });
  // A third pathway goes live; the student has not mastered it, so it is outstanding again.
  const occurrences = unit1.occurrences.slice(0, 12);
  registerLive(['meaning', 'spelling_recall', 'context'], occurrences);
  const mastery = allMastered(occurrences);
  for (const row of Object.values(mastery)) delete row.contextualEvidence.pathwayProgress.context;
  const after = progressSnapshot({ occurrences, unitMastery:mastery, globalMastery:{} });
  assert.equal(after.units[1].releasedComplete, false);
  assert.equal(after.units[1].unitMastered, false);
  assert.equal(after.units[1].livePathways, 3);
  assert.ok(computeXp({ snapshot:after }).total >= before.total, 'XP never goes down because a pathway was published');
  assert.equal(computeXp({ snapshot:after }).parts.unitMasteries, 0);
});

test('Unit Master, its badge and the unit XP need all six pathways live AND mastered', () => {
  const snapshot = snapshotFor(VOCABULARY_PATHWAYS.map(p => p.id));
  assert.equal(snapshot.units[1].unitMastered, true);
  assert.equal(snapshot.units[1].releasedComplete, false);
  assert.equal(snapshot.unitsMastered, 1);
  assert.equal(computeXp({ snapshot }).parts.unitMasteries, 200);
  assert.equal(achievements({ snapshot }).find(row => row.id === 'unit_master').unlocked, true);
});

test('a unit whose readiness has not been evaluated cannot count as fully released', () => {
  const occurrences = unit1.occurrences.slice(0, 12);
  clearPathwayCoverage();
  const snapshot = progressSnapshot({ occurrences, unitMastery:allMastered(occurrences), globalMastery:{} });
  assert.equal(snapshot.units[1].unitMastered, false);
  assert.equal(snapshot.unitsMastered, 0);
});

// ---------------------------------------------------------------------------------------------------------------- personal bests
let n = 0;
function mission(overrides = {}) {
  n += 1;
  return { mission_id:`m${String(n).padStart(4, '0')}`, unit_number:1, mission_kind:'pathway', pathway_id:'meaning', pathway_stage:'recognise', practice_family:'recommended', mission_size:10, score:6, stars:1, best_streak:3, completed_at:`2026-10-${String(10 + (n % 15)).padStart(2, '0')}T08:00:00Z`, ...overrides };
}

test('personal-best buckets are per unit: a Unit 2 mission is never compared with Unit 1', () => {
  const u1 = mission({ score:9 });
  const u2 = mission({ unit_number:2, score:5, completed_at:'2026-10-30T08:00:00Z' });
  assert.notEqual(bucketKey(u1), bucketKey(u2));
  const evaluation = evaluateMission([u1, u2], u2.mission_id);
  assert.equal(evaluation.isFirstInBucket, true, 'the first Unit 2 result is its own mark to beat');
  assert.equal(evaluation.isPersonalBest, false);
  const mixed1 = mission({ mission_kind:'mixed', pathway_id:null, pathway_stage:null, practice_family:'mixed' });
  const mixed2 = mission({ unit_number:2, mission_kind:'mixed', pathway_id:null, pathway_stage:null, practice_family:'mixed' });
  assert.notEqual(bucketKey(mixed1), bucketKey(mixed2), 'Mixed Practice is its own bucket inside each unit');
  assert.notEqual(bucketKey(mixed1), bucketKey(u1));
  const descriptor = { kind:'pathway', pathwayId:'meaning', stage:'recognise', family:'recommended' };
  assert.equal(bestAndAim([u1], { ...descriptor, unitNumber:1 }).best.score, 9);
  assert.equal(bestAndAim([u1], { ...descriptor, unitNumber:2 }).best, null);
});

// ---------------------------------------------------------------------------------------------------------------- paging
// A fake Data API that honours range() and never returns more than 1,000 rows from one request.
function fakeClient(tables, requests = []) {
  return {
    from(table) {
      const rows = tables[table] ?? [];
      const builder = {
        select() { return builder; }, eq() { return builder; }, in() { return builder; }, gte() { return builder; }, order() { return builder; }, limit() { return builder; },
        range(from, to) { requests.push({ table, from, to }); return Promise.resolve({ data:rows.slice(from, Math.min(to + 1, from + 1000)), count:rows.length, error:null }); },
        then(resolve, reject) { requests.push({ table, from:null, to:null }); return Promise.resolve({ data:rows.slice(0, 1000), error:null }).then(resolve, reject); }
      };
      return builder;
    }
  };
}

test('the student mission history is read in full, in pages, so personal bests stay right past 1,000 missions', async () => {
  const rows = Array.from({ length:2350 }, (_, index) => mission({ mission_id:`p${String(index).padStart(5, '0')}`, completed_at:new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(), score:index === 2349 ? 10 : 5 }));
  const requests = [];
  const loaded = await loadVocabularyMissions(fakeClient({ vocabulary_missions:rows }, requests));
  assert.equal(loaded.length, 2350);
  assert.equal(loaded.at(-1).mission_id, 'p02349', 'the newest mission is present, not just the oldest 1,000');
  assert.deepEqual(requests.map(r => r.from), [0, 1000, 2000]);
  assert.equal(evaluateMission(loaded, 'p02349').isPersonalBest, true);
});

test('a unit with more than 1,000 activity rows is read completely, not cut at the Data API cap', async () => {
  const activities = Array.from({ length:1300 }, (_, index) => ({ activity_content_id:`a${String(index).padStart(5, '0')}`, unit_number:1, content_type:'writing_set', activity_data:{}, status:'live' }));
  const occurrences = unit1.occurrences.slice(0, 3).map(row => ({ occurrence_id:row.occurrenceId, vocabulary_id:row.vocabularyId, unit_number:1, unit_title:'Sports', set_number:1, position_in_unit:1, sense_id:row.senseId, status:'live' }));
  const items = unit1.items.slice(0, 3).map(item => ({ vocabulary_id:item.vocabularyId, term:item.term, part_of_speech:item.partOfSpeech, core_meaning:item.coreMeaning, senses:item.senses, word_family:item.wordFamily, collocations:item.collocations, status:'live' }));
  const loaded = await loadVocabularyUnit(fakeClient({ vocabulary_items:items, vocabulary_contexts:[], vocabulary_unit_activities:activities }), 1, { occurrences });
  assert.equal(loaded.activities.length, 1300);
  clearPathwayCoverage();
});
