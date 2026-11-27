import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { reportingPeriod, schoolDay, timestampOf } from '../src/reporting/periods.js';
import { summarizeEngagement } from '../src/reporting/engagement.js';
import { evidenceState, REPORTING_CAPABILITIES } from '../src/reporting/capabilities.js';
import { buildWritingRows } from '../src/writing/submissions.js';
import { saveVocabularyMerits } from '../src/vocabulary/merit-awards.js';

const now = new Date('2026-11-23T16:30:00Z');
const period = reportingPeriod('thisWeek',{ now });
const event = (eventType, overrides = {}) => ({
  appKey:'reading', eventType, occurredAt:'2026-11-23T16:00:00Z', ...overrides
});

test('Shanghai midnight, Monday and inclusive school dates are deterministic across browser host timezones', () => {
  assert.equal(schoolDay(Date.parse('2026-11-23T15:59:59.999Z')), '2026-11-23');
  assert.equal(schoolDay(Date.parse('2026-11-23T16:00:00Z')), '2026-11-24');
  assert.equal(new Date(period.start).toISOString(),'2026-11-22T16:00:00.000Z');
  const monday = reportingPeriod('thisWeek',{now:new Date('2026-11-22T16:00:00Z')});
  assert.equal(monday.start, monday.asOf);
  for (const [kind,days] of [['last7',7],['last30',30]]) {
    assert.equal(reportingPeriod(kind,{now}).start, now.getTime()-days*86400000);
  }
  assert.equal(reportingPeriod('today',{now}).start, Date.parse('2026-11-23T16:00:00Z'));
  const custom = reportingPeriod('custom',{now,from:'2026-11-23',to:'2026-11-24'});
  assert.equal(new Date(custom.end).toISOString(),'2026-11-24T16:00:00.000Z');
  assert.throws(() => reportingPeriod('custom',{now,from:'2026-11-24',to:'2026-11-23'}), RangeError);
  assert.throws(() => reportingPeriod('custom',{now,from:'2026-02-30',to:'2026-03-03'}), RangeError);
  assert.ok(Number.isNaN(timestampOf('2026-11-23T16:00:00')));
  const module = new URL('../src/reporting/periods.js', import.meta.url).href;
  const code = `import { reportingPeriod } from '${module}'; console.log(JSON.stringify(reportingPeriod('thisWeek',{now:new Date('${now.toISOString()}')})))`;
  for (const TZ of ['America/Los_Angeles','Asia/Tokyo','UTC']) {
    assert.deepEqual(JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code],{
      env:{ ...process.env,TZ }, encoding:'utf8'
    })),period);
  }
});

test('opens and time updates support access and estimated time without counting as practice or completion', () => {
  const report = summarizeEngagement([
    event('app_open'), event('active_time',{activeSeconds:30,id:'t1'}),
    event('active_time',{activeSeconds:30,id:'t1'}), event('active_time',{activeSeconds:45,id:'t2'})
  ],period);
  assert.equal(report.modules.get('reading').access,1);
  assert.equal(report.modules.get('reading').estimatedSeconds,75);
  assert.equal(report.modules.get('reading').activityCompletions,0);
  assert.equal(report.activeDays,0);
  assert.equal(report.lastPractice,null);
  assert.equal(report.lastInteraction.appKey,'reading');
  assert.deepEqual(report.learningAreas,[]);
});

test('deduplicates stable evidence, excludes future and preview data and distinguishes exam results', () => {
  const report = summarizeEngagement([
    event('question_attempt',{ appKey:'listening',attemptId:'a' }),
    event('question_attempt',{ appKey:'listening',attemptId:'a' }),
    event('question_answered',{ mode:'exam' }),
    event('question_attempt',{ mode:'exam',resultType:'exam_reconciliation' }),
    event('question_attempt',{ preview:true }),
    event('question_attempt',{ synthetic:true }),
    event('question_attempt',{ occurredAt:null }),
    event('question_attempt',{ occurredAt:'2026-11-23T16:30:01Z' }),
    event('exercise_result',{ appKey:'vocabulary_paraphrase' }),
    event(null,{ appKey:'vocabulary_paraphrase',source:'mission',id:'m' }),
    event(null,{ appKey:'vocabulary_paraphrase',source:'unit-check',id:'c' }),
    event(null,{ appKey:'email_writing',source:'submission',id:'s' })
  ],period);
  assert.equal(report.activeDays,1);
  assert.equal(report.modules.get('listening').answerAttempts,1);
  assert.equal(report.modules.get('reading').assessmentAnswers,1);
  assert.equal(report.modules.get('reading').assessmentResults,1);
  assert.equal(report.modules.get('reading').assessmentCompletions,0);
  assert.equal(report.modules.get('reading').answerAttempts,0);
  assert.equal(report.modules.get('vocabulary_paraphrase').activityCompletions,1);
  assert.equal(report.modules.get('vocabulary_paraphrase').assessmentCompletions,1);
  assert.equal(report.modules.get('email_writing').writingSubmissions,1);
});

test('current class participation starts at enrolment while authorised lifetime records retain history', () => {
  const records = [
    event('question_attempt',{ classId:'old',occurredAt:'2026-11-23T13:00:00Z' }),
    event('question_attempt',{ classId:null,occurredAt:'2026-11-23T15:59:59Z' }),
    event('question_attempt',{ classId:'new' }),
    event('question_attempt',{ classId:'old' })
  ];
  const current = summarizeEngagement(records,period,{classId:'new',startedAt:'2026-11-23T16:00:00Z'});
  assert.equal(current.modules.get('reading').answerAttempts,1);
  assert.equal(current.activeDays,1);
  assert.equal(summarizeEngagement(records,period).modules.get('reading').answerAttempts,4);
  assert.equal(summarizeEngagement(records,period,{classId:'new'}).sufficient,false);
  assert.equal(summarizeEngagement(records,period,{classId:'new',startedAt:now}).activeDays,0);
});

test('coverage and failed retrieval are distinguished from an empty successful read', () => {
  assert.equal(Object.keys(REPORTING_CAPABILITIES).length,7);
  assert.equal(REPORTING_CAPABILITIES.email_writing.engagement,undefined);
  assert.equal(evidenceState({coverage:'full'}),'no-records');
  assert.equal(evidenceState({coverage:'limited'}),'limited-coverage');
  assert.equal(evidenceState({coverage:'limited',hasEvidence:true}),'recorded');
  assert.equal(evidenceState({coverage:'unavailable'}),'tracking-unavailable');
  assert.equal(evidenceState({coverage:'pilot'}),'pilot-only');
  assert.equal(evidenceState({coverage:'limited',sufficient:false}),'insufficient-evidence');
  assert.equal(evidenceState({retrieval:'error',coverage:'full'}),'retrieval-failure');
  assert.equal(evidenceState({retrieval:'restricted'}),'permission-restricted');
});

test('repeated and concurrent award requests use the same idempotent unique-ledger write', async () => {
  const ledger = new Map();
  const client = { from(table) {
    assert.equal(table,'vocabulary_merit_awards');
    return { async upsert(rows,options) {
      assert.deepEqual(options,{onConflict:'student_id,merit_number',ignoreDuplicates:true});
      for (const row of rows) {
        const id = [row.student_id,row.merit_number].join('/');
        if (!ledger.has(id)) ledger.set(id,row);
      }
      return {error:null};
    }};
  }};
  await Promise.all([
    saveVocabularyMerits(client,'teacher-a','student',[1,1]),
    saveVocabularyMerits(client,'teacher-b','student',[1,2])
  ]);
  await saveVocabularyMerits(client,'teacher-b','student',[1,2]);
  assert.equal(ledger.size,2);
  assert.equal(ledger.get('student/1').awarded_by,'teacher-a');
});

test('assessed notes results preserve engagement without inflating whole-assessment completions', () => {
  const report = summarizeEngagement([
    event('exercise_result',{ mode:'exam', id:'result' }),
    event('exercise_result',{ mode:'exam', id:'result' }),
    event('exercise_result',{ mode:'practice', id:'practice' })
  ],period);
  const reading = report.modules.get('reading');
  assert.equal(reading.assessmentResults,1);
  assert.equal(reading.assessmentCompletions,0);
  assert.equal(reading.activityCompletions,1);
});

test('work done outside the Hub yields no recorded submission and no completion judgement', () => {
  const [learner] = buildWritingRows([{studentId:'uuid',classId:'class',displayName:'Synthetic'}],[],{
    classId:'class',appKey:'email_writing',from:'2026-11-23',to:'2026-11-24'
  });
  assert.deepEqual(learner.submissions,[]);
  assert.equal(Object.hasOwn(learner,'missingHomework'),false);
});
