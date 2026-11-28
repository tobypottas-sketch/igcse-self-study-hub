import assert from 'node:assert/strict';
import test from 'node:test';
import { activeLearningV2Coverage as coverage } from '../src/reporting/active-learning-v2-coverage.js';
import { reportingPeriod } from '../src/reporting/periods.js';

const period = reportingPeriod('custom',{from:'2026-11-28',to:'2026-11-28',now:new Date('2026-11-29T00:00:00+08:00')});
const start = '2026-11-28T00:00:00+08:00';
const end = '2026-11-29T00:00:00+08:00';
const full = { starts_at:start, ends_at:end };
const verify = options => coverage({module:'vocabulary_paraphrase',period,windows:[full],segments:[],...options});

test('China-time day and touching pilot windows give full coverage', () => {
  assert.equal(new Date(period.start).toISOString(),'2026-11-27T16:00:00.000Z');
  const midday = '2026-11-28T12:00:00+08:00';
  assert.equal(verify({windows:[{starts_at:midday,ends_at:end},{starts_at:start,ends_at:midday}]}),'enabled_no_recorded_time');
  assert.equal(verify({segments:[{}]}),'recorded');
});

test('coverage states distinguish missing, historical, partial and query failure', () => {
  assert.equal(verify({windows:[]}),'not_enabled');
  assert.equal(verify({windows:[{starts_at:end,ends_at:null}]}),'before_activation');
  assert.equal(verify({windows:[{starts_at:'2026-11-28T09:00:00+08:00',ends_at:null}]}),'partial');
  assert.equal(verify({windows:[{starts_at:start,ends_at:'2026-11-28T09:00:00+08:00'}]}),'partial');
  assert.equal(verify({module:'reading'}),'outside_module_scope');
  assert.equal(verify({failed:true}),'query_failed');
});
