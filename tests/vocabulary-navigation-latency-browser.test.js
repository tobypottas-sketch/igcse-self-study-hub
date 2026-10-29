import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPlaywright,findChromium } from './helpers/pathway-geometry-harness.mjs';
import { profileNavigation } from './helpers/navigation-latency-harness.mjs';
import unit from '../content/vocabulary/releases/unit-01.js';

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
for (const [label,cpu,net] of [['normal',1,40],['throttled',4,600]]) {
  browserTest(`real student router continues from bundled settlement state (${label})`, async () => {
    assert.deepEqual([unit.occurrences.length,unit.contexts.length,unit.activities.length],[50,342,490]);
    const profile = await profileNavigation({cpu,net});
    assert.deepEqual(profile.errors,[]);
    const continuing = profile.results.find(row => row.name === 'continue');
    const reads = continuing.calls.filter(row => row.name === 'read:vocabulary_pathway_sets');
    const missions = continuing.calls.filter(row => row.name === 'rpc:start_vocabulary_mission');
    const settled = continuing.spans.find(row => row.name === 'settleMission');
    if (net >= 600) assert.ok(settled,'the throttled Continue overlaps settlement');
    assert.equal(reads.length,settled ? 0 : 1,'waiting Continue uses the bundle; later launches still refresh');
    assert.equal(missions.length,1,'exactly one next mission is requested');
    if (reads.length) assert.ok(missions[0].start >= reads[0].end,'a later launch reads fresh progress before requesting a mission');
    assert.ok(!continuing.calls.some(row => /read:vocabulary_(global_mastery|unit_mastery|unit_occurrences)/.test(row.name)),'Continue does not reload the dashboard/mastery');
    if (settled) assert.ok(settled.end <= missions[0].start,'settlement finishes before the next mission starts');
    assert.match(profile.stageText,/Match/,'the same Context Set advances to Match');
    for (const row of profile.results.filter(row => row.name.startsWith('next-') || row.name === 'return-unit')) {
      assert.equal(row.calls.filter(call => call.start >= 0 && !/activity_events/.test(call.name)).length,0,`${row.name} does not start a blocking request`);
    }
    console.log(JSON.stringify({label,results:profile.results.filter(row => !row.name.startsWith('next-') || row.name === 'next-0').map(row => ({name:row.name,ms:row.ms,calls:row.calls,longTasks:row.longTasks}))}));
  });
}
