import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { showsTargetWord } from '../src/vocabulary/apply-situation.js';

test('every Unit 1 word has at least four authored, target-free, full-sentence situation distractors', () => {
  for (const item of unit1.items) {
    const rows = item.senses[0].situationDistractors;
    assert.ok(rows?.length >= 4, `${item.term} needs at least four authored situations (Job 9 added extras so each question can draw a comparable-length set)`);
    assert.equal(new Set(rows).size, rows.length, `${item.term} has duplicate situations`);
    for (const row of rows) {
      assert.ok(row.trim().split(/\s+/).length >= 6, `${item.term}: too short: ${row}`);
      assert.ok(!showsTargetWord(row, item, null), `${item.term}: shows the target word: ${row}`);
    }
  }
});
