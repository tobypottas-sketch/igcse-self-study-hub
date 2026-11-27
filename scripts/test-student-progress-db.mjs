import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const nativeUrl = process.env.STUDENT_PROGRESS_TEST_DATABASE_URL;
async function connect() {
  if (!nativeUrl) return new PGlite();
  const url = new URL(nativeUrl);
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/student_progress_test') {
    throw new Error('Use an isolated student_progress_test database on 127.0.0.1.');
  }
  const { Client } = await import('pg');
  const client = new Client({connectionString:nativeUrl});
  await client.connect();
  return {
    async query(sql,args) {
      const result = await client.query(sql,args);
      return { ...result, affectedRows:result.rowCount };
    },
    exec:sql => client.query(sql),
    close:() => client.end()
  };
}
const db = await connect();
const uid = value => '00000000-0000-4000-8000-' + String(value).padStart(12,'0');
const [former, receiving, unassigned, admin, disabled, student, other, oldClass, newClass] =
  Array.from({length:9}, (_, index) => uid(index + 1));
const denied = error => error.code === '42501';
const role = async (databaseRole, id = '') => {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)",[id]);
  await db.exec(databaseRole === 'anon' ? 'set role anon' : 'set role authenticated');
};
const count = async (sql, args = []) => (await db.query(sql,args)).rows[0].n;
const roster = async () => (await db.query(
  "select payload->>'student_id' id from public.teacher_activity_rows() where record_type='student' order by id"
)).rows.map(row => row.id);
const ownEvents = id => count('select count(*)::int n from public.activity_events where user_id=$1',[id]);
const award = (actor, learner, number=1, connection=db) => connection.query(
  'insert into public.vocabulary_merit_awards(student_id,merit_number,awarded_by) values ($1,$3,$2) on conflict (student_id,merit_number) do nothing',
  [learner,actor,number]
);
const plan = async (sql,args=[]) => {
  const [entry] = (await db.query('explain (analyze, format json) '+sql,args)).rows[0]['QUERY PLAN'];
  const indexes = [];
  function visit(node) {
    if (node['Index Name']) indexes.push(node['Index Name']);
    for (const child of node.Plans ?? []) visit(child);
  }
  visit(entry.Plan);
  return { ms:entry['Execution Time'], rows:entry.Plan['Actual Rows'], indexes:[...new Set(indexes)] };
};

try {
  for (const name of [
    '20261013101928_self_study_foundation',
    '20261013111500_activity_events_foundation',
    '20261017051500_vocabulary_builder_foundation',
    '20261022120000_vocabulary_merit_awards',
    '20261027130000_vocabulary_unit_checks',
    '20261027190000_teacher_activity_dashboard',
    '20261124130000_student_writing_submissions',
    '20261126090000_writing_academy_persistence'
  ]) {
    if (name.startsWith('20261013101928')) {
      await db.exec(await readFile(new URL('../supabase/tests/writing_persistence_baseline.sql',import.meta.url),'utf8'));
    }
    await db.exec(await readFile(new URL('../supabase/migrations/'+name+'.sql',import.meta.url),'utf8'));
  }

  const profiles = [
    [former,'teacher'],[receiving,'teacher'],[unassigned,'teacher'],[admin,'admin'],
    [disabled,'teacher',false],[student,'student'],[other,'student']
  ];
  for (const [id, kind, active=true] of profiles) {
    await db.query('insert into auth.users values ($1)',[id]);
    await db.query('insert into public.profiles(id,role,active,must_change_password,display_name,school_email) values ($1,$2,$3,false,$4,$5)',
      [id,kind,active,'Synthetic account',id+'@example.invalid']);
  }
  await db.query("insert into public.classes(id,class_name) values ($1,'Source'),($2,'Destination')",[oldClass,newClass]);
  await db.query('insert into public.teacher_classes(teacher_id,class_id) values ($1,$4),($2,$5),($3,$4)',
    [former,receiving,disabled,oldClass,newClass]);
  await db.query("insert into public.student_class_memberships(student_id,class_id,started_at) values ($1,$3,now()-interval '21 days'),($2,$4,now()-interval '21 days')",
    [student,other,oldClass,newClass]);
  await db.exec("insert into public.apps(app_key,display_name,launch_url) values ('review_writing','Review','review-writing.html'),('reading','Reading','reading.html')");
  await role('authenticated',student);
  await db.exec("insert into public.activity_events(app_key,event_type,occurred_at) values ('reading','question_attempt',now()-interval '3 days')");
  await db.exec("insert into public.student_writing_submissions(app_key,task,response) values ('review_writing','Synthetic task','Synthetic submitted writing')");
  await db.query("select revision_number from public.save_writing_draft($1,$2,0,'review_writing','reporting-task',1,'studio',$3,'draft','original')",[uid(90),uid(91),{version:1}]);
  await assert.rejects(roster,denied);
  await assert.rejects(() => award(student,student),denied);
  assert.equal(await count('select count(*)::int n from public.writing_drafts'),1);

  await role('anon');
  await assert.rejects(roster,denied);
  await assert.rejects(() => ownEvents(student),denied);
  await assert.rejects(() => count('select count(*)::int n from public.writing_drafts'),denied);

  await role('authenticated',disabled);
  await assert.rejects(roster,denied);
  assert.equal(await ownEvents(student),0);
  await assert.rejects(() => award(disabled,student),denied);

  await role('authenticated',unassigned);
  assert.deepEqual(await roster(),[]);
  assert.equal(await ownEvents(student),0);
  assert.equal(await count('select count(*)::int n from public.student_writing_submissions'),0);
  await assert.rejects(() => award(unassigned,student),denied);

  await role('authenticated',former);
  assert.deepEqual(await roster(),[student]);
  assert.equal(await ownEvents(student),1);
  assert.equal(await ownEvents(other),0);
  assert.equal(await count('select count(*)::int n from public.student_writing_submissions'),1);
  assert.equal(await count('select count(*)::int n from public.writing_drafts'),0);
  assert.equal((await award(former,student)).affectedRows,1);
  assert.equal((await award(former,student)).affectedRows,0);
  await role('authenticated',admin);
  assert.deepEqual(await roster(),[student,other]);
  assert.equal(await count('select count(*)::int n from public.writing_drafts'),0);

  await db.exec('reset role');
  await db.query('update public.student_class_memberships set ended_at=now() where student_id=$1 and ended_at is null',[student]);
  await db.query('insert into public.student_class_memberships(student_id,class_id) values ($1,$2)',[student,newClass]);
  await role('authenticated',former);
  assert.deepEqual(await roster(),[]);
  assert.equal(await ownEvents(student),0);
  assert.equal(await count('select count(*)::int n from public.vocabulary_merit_awards'),0);
  assert.equal(await count('select count(*)::int n from public.student_writing_submissions'),0);
  await role('authenticated',receiving);
  assert.deepEqual(await roster(),[student,other]);
  assert.equal(await ownEvents(student),1);
  assert.equal(await count('select count(*)::int n from public.student_writing_submissions'),1);
  assert.equal(await count('select count(*)::int n from public.writing_drafts'),0);
  assert.equal((await award(receiving,student)).affectedRows,0);
  const retained = (await db.query('select awarded_by from public.vocabulary_merit_awards')).rows;
  assert.deepEqual(retained,[{awarded_by:former}]);
  if (nativeUrl) {
    const peer = await connect();
    try {
      await peer.query("select set_config('request.jwt.claim.sub', $1, false)",[admin]);
      await peer.exec('set role authenticated');
      const race = await Promise.all([award(receiving,student,2),award(admin,student,2,peer)]);
      assert.deepEqual(race.map(result=>result.affectedRows).sort(),[0,1]);
      assert.equal(await count('select count(*)::int n from public.vocabulary_merit_awards where merit_number=2'),1);
      console.log('Concurrent PostgreSQL awards: one inserted, one duplicate ignored.');
    } finally {
      await peer.close();
    }
  }
  console.log('Isolated role, transfer, canonical identity, private draft and unique award checks passed.');
  await db.exec('reset role');
  await db.exec(`insert into public.vocabulary_items(vocabulary_id,term,part_of_speech,core_meaning,status)
    select 'word-'||n,'word '||n,'noun','Synthetic definition','live' from generate_series(1,20) n;
    insert into public.vocabulary_unit_occurrences(occurrence_id,vocabulary_id,unit_number,unit_title,set_number,position_in_unit,sense_id,status)
    select vocabulary_id,vocabulary_id,1,'Synthetic unit',1,row_number() over (order by vocabulary_id),'sense','live'
    from public.vocabulary_items;`);

  // One-way fixture growth makes each run 15, 25 or 35 current students. All evidence is synthetic.
  for (const size of [15,25,35]) {
    await db.exec('reset role');
    const students = Array.from({length:size-2},(_,index)=>uid(100+index));
    await db.query('insert into auth.users select unnest($1::uuid[]) on conflict do nothing',[students]);
    await db.query(`insert into public.profiles(id,role,display_name,school_email,must_change_password)
      select id,'student','Synthetic learner',id||'@example.invalid',false from unnest($1::uuid[]) id on conflict do nothing`,[students]);
    await db.query(`insert into public.student_class_memberships(student_id,class_id,started_at)
      select id,$2,now()-interval '90 days' from unnest($1::uuid[]) id on conflict do nothing`,[students,newClass]);
    await db.query(`insert into public.vocabulary_global_mastery(student_id,vocabulary_id,status)
      select id,vocabulary_id,'building' from unnest($1::uuid[]) id cross join public.vocabulary_items on conflict do nothing`,[students]);
    await db.query(`insert into public.vocabulary_unit_mastery(student_id,occurrence_id,status)
      select id,occurrence_id,'building' from unnest($1::uuid[]) id cross join public.vocabulary_unit_occurrences on conflict do nothing`,[students]);
    for (const id of students.slice(size===15 ? 0 : size-12)) {
      await role('authenticated',id);
      await db.exec(`insert into public.activity_events(app_key,event_type,occurred_at)
        select 'reading','question_attempt',now()-(n||' days')::interval from generate_series(1,60) n`);
    }
    await db.exec('reset role');
    await db.exec('analyze public.activity_events');
    await role('authenticated',receiving);
    assert.equal((await roster()).length,size);
    const ids = [...students,student,other];
    const events = await plan(`select id, user_id, occurred_at from public.activity_events
      where user_id=any($1::uuid[]) and occurred_at>=now()-interval '30 days' and occurred_at<=now()
      order by occurred_at,id`,[ids]);
    const staff = await plan('select * from public.teacher_activity_rows()');
    const merit = await plan("select * from public.teacher_activity_rows() where record_type in ('student','vocabulary_global_mastery','vocabulary_unit_mastery','merit_award') order by record_type,payload limit 1000");
    const individual = await plan(`select id, user_id, occurred_at from public.activity_events
      where user_id=$1 and occurred_at>=now()-interval '30 days' order by occurred_at,id`,[students[0]]);
    const rosterPlan = await plan("select * from public.student_class_memberships where class_id=$1 and ended_at is null order by id",[newClass]);
    const vocabulary = await plan("select student_id,occurrence_id,status,contextual_evidence from public.vocabulary_unit_mastery where student_id=any($1::uuid[]) order by student_id,occurrence_id",[ids]);
    const meritBytes = await count(`select octet_length(coalesce(json_agg(r)::text,'[]')) n from (
      select record_type,payload from public.teacher_activity_rows()
      where record_type in ('student','vocabulary_global_mastery','vocabulary_unit_mastery','merit_award')
    ) r`);
    console.log(JSON.stringify({size,roster:rosterPlan,events,staff,merit,meritBytes,individual,vocabulary}));
  }
} finally {
  await db.close();
}
