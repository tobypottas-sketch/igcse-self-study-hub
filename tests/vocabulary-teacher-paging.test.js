import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllRows, fetchAllRowsForIds, IncompleteDataError, ID_CHUNK, MAX_PAGES } from '../src/vocabulary/teacher-paging.js';
import { ACTIVITY_WINDOW_DAYS, loadVocabularyTeacherData } from '../src/vocabulary/teacher-data.js';
import { buildPracticeHabits } from '../src/vocabulary/practice-habits.js';

const API_CAP = 1000;

// A stand-in for the Data API: filters, ordering, ranges, an exact count, and the hard 1,000-row cap per request.
function fakeClient(tables, { failTable = null, failAfterPages = 0, lieAboutCount = false, log = [] } = {}) {
  return { from(table) {
    const state = { table, filters:[], orders:[], count:false, from:0, to:API_CAP - 1 };
    const builder = {
      select(_columns, options = {}) { state.count = options.count === 'exact'; return builder; },
      eq(column, value) { state.filters.push(row => row[column] === value); return builder; },
      in(column, values) { state.filters.push(row => values.includes(row[column])); state.ids = values.length; return builder; },
      gte(column, value) { state.filters.push(row => row[column] >= value); return builder; },
      order(column, { ascending = true } = {}) { state.orders.push([column, ascending]); return builder; },
      range(from, to) { state.from = from; state.to = to; return builder; },
      then(resolve, reject) {
        const rows = (tables[table] ?? []).filter(row => state.filters.every(test => test(row)));
        for (const [column, ascending] of [...state.orders].reverse()) rows.sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (ascending ? 1 : -1));
        const requested = state.to - state.from + 1;
        const page = rows.slice(state.from, state.from + Math.min(requested, API_CAP));
        log.push({ table, from:state.from, returned:page.length, ids:state.ids ?? 0, ordered:state.orders.map(item => item[0]) });
        const pagesOfTable = log.filter(entry => entry.table === table).length;
        if (failTable === table && pagesOfTable > failAfterPages) return Promise.resolve({ data:null, error:{ message:'boom' } }).then(resolve, reject);
        return Promise.resolve({ data:page, error:null, count:state.count ? (lieAboutCount ? rows.length + 1 : rows.length) : null }).then(resolve, reject);
      }
    };
    return builder;
  } };
}

const NOW = new Date('2026-10-23T12:00:00Z');
function world({ students = 30, words = 50, activityPerStudent = 110, missionsPerStudent = 42 } = {}) {
  const studentRows = Array.from({ length:students }, (_, index) => ({ id:`s${String(index).padStart(3, '0')}`, display_name:`Student ${index}`, role:'student' }));
  const occurrences = Array.from({ length:words }, (_, index) => ({ occurrence_id:`u1_${String(index).padStart(2, '0')}`, vocabulary_id:`vocab_${index}`, unit_number:1, unit_title:'Sports and Free Time' }));
  const day = 24 * 60 * 60 * 1000;
  const tables = {
    profiles:studentRows,
    student_class_memberships:studentRows.map(row => ({ student_id:row.id, class_id:'c1', ended_at:null })),
    classes:[{ id:'c1', class_name:'11A', active:true }],
    vocabulary_items:occurrences.map(row => ({ vocabulary_id:row.vocabulary_id, term:row.vocabulary_id })),
    vocabulary_unit_occurrences:occurrences,
    vocabulary_global_mastery:studentRows.flatMap(student => occurrences.map(occ => ({ student_id:student.id, vocabulary_id:occ.vocabulary_id, status:'building', strand_evidence:{}, recent_error_pattern:null, updated_at:NOW.toISOString() }))),
    vocabulary_unit_mastery:studentRows.flatMap(student => occurrences.map(occ => ({ student_id:student.id, occurrence_id:occ.occurrence_id, status:'building', recent_error_pattern:null, contextual_evidence:{} }))),
    activity_events:studentRows.flatMap((student, s) => Array.from({ length:activityPerStudent }, (_, n) => ({ id:`e${s}-${n}`, user_id:student.id, app_key:'vocabulary_paraphrase', occurred_at:new Date(NOW.getTime() - (n + 1) * 60 * 60 * 1000).toISOString(), event_type:'question_attempt', metadata:{ attempt_number:1 } }))),
    vocabulary_merit_awards:[],
    vocabulary_missions:studentRows.flatMap((student, s) => Array.from({ length:missionsPerStudent }, (_, n) => ({ mission_id:`m${s}-${n}`, student_id:student.id, completed_at:new Date(NOW.getTime() - (n + 1) * day).toISOString(), mission_kind:'pathway', unit_number:1 })))
  };
  // Old attempts outside the window must not be loaded.
  tables.activity_events.push(...studentRows.slice(0, 3).map((student, index) => ({ id:`old${index}`, user_id:student.id, app_key:'vocabulary_paraphrase', occurred_at:new Date(NOW.getTime() - (ACTIVITY_WINDOW_DAYS + 30) * day).toISOString(), event_type:'question_attempt', metadata:{} })));
  return tables;
}

test('without paging the Data API cap would silently cut a long table', async () => {
  const tables = { t:Array.from({ length:2350 }, (_, index) => ({ id:index })) };
  const cut = await fakeClient(tables).from('t').select('*').order('id');
  assert.equal(cut.data.length, API_CAP);
});

test('fetchAllRows returns every row across pages and checks the exact count', async () => {
  const log = [];
  const tables = { t:Array.from({ length:2350 }, (_, index) => ({ id:index })) };
  const rows = await fetchAllRows(() => fakeClient(tables, { log }).from('t').select('*', { count:'exact' }).order('id'));
  assert.equal(rows.length, 2350);
  assert.equal(new Set(rows.map(row => row.id)).size, 2350);
  assert.deepEqual(log.map(entry => entry.returned), [1000, 1000, 350]);
});

test('an exact multiple of the page size still reads to the end', async () => {
  const tables = { t:Array.from({ length:2000 }, (_, index) => ({ id:index })) };
  const rows = await fetchAllRows(() => fakeClient(tables).from('t').select('*', { count:'exact' }).order('id'));
  assert.equal(rows.length, 2000);
});

test('paging that cannot be shown to be complete is an error, never a shorter list', async () => {
  const sharedLog = [];
  const tables = { t:Array.from({ length:1500 }, (_, index) => ({ id:index })) };
  await assert.rejects(fetchAllRows(() => fakeClient(tables, { lieAboutCount:true }).from('t').select('*', { count:'exact' }).order('id'), { label:'things' }), IncompleteDataError);
  await assert.rejects(fetchAllRows(() => fakeClient(tables, { failTable:'t', failAfterPages:1, log:sharedLog }).from('t').select('*', { count:'exact' }).order('id'), { label:'things' }), /Unable to load things/);
  await assert.rejects(fetchAllRows(() => fakeClient({ t:Array.from({ length:50 }, (_, index) => ({ id:index })) }).from('t').select('*', { count:'exact' }).order('id'), { pageSize:10, maxPages:3 }), IncompleteDataError);
  assert.ok(MAX_PAGES >= 100);
});

test('long id lists are sent in chunks', async () => {
  const log = [];
  const ids = Array.from({ length:250 }, (_, index) => `s${index}`);
  const tables = { t:ids.map(id => ({ id, k:id })) };
  const rows = await fetchAllRowsForIds(ids, part => fakeClient(tables, { log }).from('t').select('*', { count:'exact' }).in('k', part).order('id'));
  assert.equal(rows.length, 250);
  assert.ok(log.every(entry => entry.ids <= ID_CHUNK));
  assert.equal(log.length, 3);
});

test('the teacher loader returns every relevant row when each dataset is over 1,000 rows', async () => {
  const log = [];
  const tables = world();
  assert.ok(tables.vocabulary_global_mastery.length > API_CAP);
  assert.ok(tables.vocabulary_unit_mastery.length > API_CAP);
  assert.ok(tables.activity_events.length > API_CAP);
  assert.ok(tables.vocabulary_missions.length > API_CAP);
  const { classes } = await loadVocabularyTeacherData(fakeClient(tables, { log }), { now:NOW });
  const klass = classes[0];
  assert.equal(klass.students.length, 30);
  assert.equal(klass.mastery.length, 30 * 50);
  assert.equal(klass.unitMastery.length, 30 * 50);
  assert.equal(klass.activity.length, 30 * 110, 'attempts inside the window, none outside it');
  assert.equal(klass.missions.length, 30 * 42);
  assert.equal(klass.missionsAvailable, true);
  assert.ok(log.every(entry => entry.returned <= API_CAP));
  assert.ok(log.every(entry => entry.ordered.length >= 1), 'every paged query has a stable order');
});

test('teacher habits are computed from the complete mission history, not the first page', async () => {
  const tables = world({ students:3, words:5, activityPerStudent:5, missionsPerStudent:1200 });
  const { classes } = await loadVocabularyTeacherData(fakeClient(tables), { now:NOW });
  const habits = buildPracticeHabits({ students:classes[0].students, missions:classes[0].missions, activity:classes[0].activity, now:NOW });
  for (const row of habits.rows) assert.equal(row.totalMissions, 1200);
});

test('evidence and engagement are read by separate queries and never mixed', async () => {
  const log = [];
  const { classes } = await loadVocabularyTeacherData(fakeClient(world({ students:2, words:3, activityPerStudent:2, missionsPerStudent:2 }), { log }), { now:NOW });
  const missionKeys = Object.keys(classes[0].missions[0]).sort();
  assert.deepEqual(missionKeys, ['completedAt', 'kind', 'studentId', 'unitNumber']);
  assert.ok(Object.keys(classes[0].mastery[0]).every(key => !/mission|completed/i.test(key)));
  assert.ok(new Set(log.map(entry => entry.table)).has('vocabulary_missions'));
});

test('missing optional engagement tables do not block the rest, but a failure in evidence data does', async () => {
  const tables = world({ students:2, words:3, activityPerStudent:2, missionsPerStudent:2 });
  const withoutMissions = await loadVocabularyTeacherData(fakeClient(tables, { failTable:'vocabulary_missions' }), { now:NOW });
  assert.equal(withoutMissions.classes[0].missionsAvailable, false);
  assert.equal(withoutMissions.classes[0].mastery.length, 6);
  await assert.rejects(loadVocabularyTeacherData(fakeClient(tables, { failTable:'vocabulary_global_mastery' }), { now:NOW }), /Unable to load vocabulary mastery/);
});
