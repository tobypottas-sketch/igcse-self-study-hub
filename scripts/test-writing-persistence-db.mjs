import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

const nativeUrl = process.env.WRITING_TEST_DATABASE_URL;
async function connect() {
  if (!nativeUrl) return new PGlite();
  const url = new URL(nativeUrl);
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/writing_persistence_test') {
    throw new Error('Use an empty, isolated writing_persistence_test database on 127.0.0.1.');
  }
  const {Client} = await import('pg');
  const client = new Client({connectionString:nativeUrl});
  await client.connect();
  return {
    query:(sql,args) => client.query(sql,args),
    async exec(sql) {
      return [await client.query(sql)].flat().map(result=>({affectedRows:result.rowCount}));
    },
    close:() => client.end()
  };
}
const db = await connect();
const uid = n => '00000000-0000-4000-8000-' + String(n).padStart(12,'0');
const [a,b,inactive,pending,teacher,inactiveTeacher,admin,unknown] = [1,2,3,4,5,6,7,8].map(uid);
const [draft,request,nextRequest,activity,exam,cls,nextClass] = [10,11,12,13,14,15,16].map(uid);
const app = 'review_writing';
const migrate = file => readFile(new URL(file, import.meta.url),'utf8').then(sql => db.exec(sql));
const as = async (role,owner='') => {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [owner]);
  await db.exec('set role '+role);
};
const count = async table => (await db.query('select count(*)::integer n from public.'+table)).rows[0].n;
const sqlCode = code => error => error.code === code;
const save = (revision=0, key=request, response='draft', state={version:1}, connection=db) => connection.query(
  'select revision_number from public.save_writing_draft($1,$2,$3,$4,$5,1,$6,$7,$8,$9)',
  [draft,key,revision,app,'review-willow-kitchen','studio',JSON.stringify(state),response,'original']
);

try {
  await migrate('../supabase/tests/writing_persistence_baseline.sql');
  await migrate('../supabase/migrations/20261013101928_self_study_foundation.sql');
  await migrate('../supabase/migrations/20261124130000_student_writing_submissions.sql');
  await db.exec(`
    insert into public.apps(app_key,display_name,launch_url) values
      ('review_writing','Review','review-writing.html'),('essay_writing','Essay','essay-writing.html'),
      ('email_writing','Email','email-writing.html');
    insert into public.classes(id,class_name) values ('${cls}','Synthetic class'),('${nextClass}','Other class');
    insert into auth.users values ${[a,b,inactive,pending,teacher,inactiveTeacher,admin,unknown].map(id=>`('${id}')`).join(',')};
    insert into public.profiles(id,role,active,must_change_password,display_name,school_email)
      values ${[a,b,inactive,pending,teacher,inactiveTeacher,admin].map((id,i)=>`('${id}','${i<4?'student':i<6?'teacher':'admin'}',${i!==2&&i!==5},${i===3},'Synthetic','sample${i}@example.invalid')`).join(',')};
    insert into public.teacher_classes(teacher_id,class_id) values ('${teacher}','${cls}'),('${inactiveTeacher}','${cls}');
    insert into public.student_class_memberships(student_id,class_id) values ('${a}','${cls}'),('${b}','${nextClass}');
  `);
  const legacy = "insert into public.student_writing_submissions(app_key,task,response) values ($1,'Legacy task','Legacy answer')";
  await as('authenticated',a);
  await db.query(legacy,[app]);
  await db.exec('reset role');
  await migrate('../supabase/migrations/20261126090000_writing_academy_persistence.sql');
  assert.equal(await count('student_writing_submissions'),1);
  await db.exec(`
    insert into public.writing_pathway_progress(student_id,app_key,curriculum_id,curriculum_version,pathway_id,current_stage)
      values ('${a}','${app}','review',1,'structure','discover'),('${b}','${app}','review',1,'structure','discover');
    insert into public.writing_activity_attempts(id,student_id,app_key,curriculum_id,curriculum_version,pathway_id,stage_id,
      activity_id,content_version,request_id,attempt_type,completed_at)
      values ('${activity}','${a}','${app}','review',1,'structure','practise','structure-focus',1,'${request}','objective',now());
    insert into public.writing_exam_attempts(id,student_id,app_key,task_id,task_version,curriculum_id,curriculum_version,attempt_mode)
      values ('${exam}','${a}','${app}','food-market',1,'review',1,'untimed');
  `);
  await as('anon');
  await assert.rejects(() => count('writing_drafts'),sqlCode('42501'));
  await assert.rejects(() => save(),sqlCode('42501'));
  for (const user of [unknown,inactive,pending,inactiveTeacher]) {
    await as('authenticated',user);
    assert.equal(await count('writing_pathway_progress'),0);
    await assert.rejects(() => save(),sqlCode('42501'));
  }
  await as('authenticated',a);
  assert.equal(await count('writing_pathway_progress'),1);
  assert.equal(await count('writing_activity_attempts'),1);
  assert.equal((await save()).rows[0].revision_number,1);
  assert.equal((await save()).rows[0].revision_number,1);
  assert.equal((await save(1,nextRequest,'newer')).rows[0].revision_number,2);
  await assert.rejects(() => save(1,request,'stale'),sqlCode('P0001'));
  await assert.rejects(() => save(2,uid(22),'invalid',{version:2}),sqlCode('22023'));
  await assert.rejects(() => save(2,uid(22),'invalid',{version:1,planning:[]}),sqlCode('22023'));
  await assert.rejects(() => save(2,uid(22),'x'.repeat(30001)),sqlCode('23514'));
  assert.equal((await db.query('select revision_number from public.writing_drafts')).rows[0].revision_number,2);
  await assert.rejects(() => db.exec(`update public.writing_drafts set student_id='${b}'`),sqlCode('42501'));
  await assert.rejects(() => db.exec('update public.writing_activity_attempts set score=100'),sqlCode('42501'));
  await assert.rejects(() => db.exec('update public.writing_activity_attempts set completed_at=null'),sqlCode('42501'));
  await assert.rejects(() => db.exec("update public.writing_exam_attempts set deadline_at=now()"),sqlCode('42501'));
  for (const genre of [app,'essay_writing','email_writing']) await db.query(legacy,[genre]);
  await assert.rejects(() => db.exec("update public.student_writing_submissions set response='changed'"),sqlCode('42501'));
  await assert.rejects(() => db.exec(`insert into public.student_writing_submissions(app_key,task,response,exam_attempt_id)
    values ('${app}','test','test','${exam}')`),sqlCode('42501'));
  if (nativeUrl) {
    const other = await connect();
    try {
      await other.query("select set_config('request.jwt.claim.sub', $1, false)",[a]);
      await other.exec('set role authenticated');
      const race = await Promise.allSettled([
        save(2,uid(41),'tab one'),
        save(2,uid(42),'tab two',{version:1},other)
      ]);
      assert.equal(race.filter(result=>result.status==='fulfilled').length,1);
      assert.equal(race.find(result=>result.status==='rejected').reason.code,'P0001');
      assert.equal((await db.query('select revision_number from public.writing_drafts')).rows[0].revision_number,3);
      console.log('Two PostgreSQL sessions submitted the same draft revision. One committed and one returned a conflict.');
    } finally {
      await other.close();
    }
  }
  await as('authenticated',b);
  assert.equal(await count('writing_drafts'),0);
  assert.equal(await count('writing_activity_attempts'),0);
  assert.equal((await db.exec('delete from public.writing_drafts'))[0].affectedRows,0);
  await assert.rejects(() => save(2,nextRequest,'another student'),sqlCode('P0002'));
  await assert.rejects(() => save(),sqlCode('P0001'));
  await as('authenticated',teacher);
  assert.equal(await count('writing_pathway_progress'),1);
  assert.equal(await count('writing_activity_attempts'),1);
  assert.equal(await count('writing_exam_attempts'),0);
  assert.equal(await count('writing_drafts'),0);
  assert.equal(await count('student_writing_submissions'),4);
  await assert.rejects(() => db.exec('update public.writing_pathway_progress set completed_at=now()'),sqlCode('42501'));
  await as('authenticated',admin);
  assert.equal(await count('writing_pathway_progress'),2);
  assert.equal(await count('writing_drafts'),0);
  await db.exec('reset role');
  await db.exec(`update public.student_class_memberships set ended_at=now() where student_id='${a}';
    insert into public.student_class_memberships(student_id,class_id) values ('${a}','${nextClass}');`);
  await as('authenticated',teacher);
  assert.equal(await count('writing_pathway_progress'),0);
  assert.equal(await count('student_writing_submissions'),0);
  await db.exec('reset role');
  await assert.rejects(() => db.exec(`update public.writing_activity_attempts set
    score=11,max_score=10,validation_status='validated' where id='${activity}'`),sqlCode('23514'));
  await assert.rejects(() => db.exec(`update public.writing_exam_attempts set deadline_at=now() where id='${exam}'`),sqlCode('23514'));
  await assert.rejects(() => db.exec(`insert into public.student_writing_submissions(student_id,app_key,task,response,task_id,task_version,submission_type,exam_attempt_id)
    values ('${a}','email_writing','test','test','food-market',1,'exam','${exam}')`),sqlCode('23503'));
  await db.exec(`insert into public.student_writing_submissions(student_id,app_key,task,response,task_id,task_version,submission_type,exam_attempt_id)
    values ('${a}','${app}','test','test','food-market',1,'exam','${exam}')`);
  await assert.rejects(() => db.exec(`insert into public.student_writing_submissions(student_id,app_key,task,response,task_id,task_version,submission_type,exam_attempt_id)
    values ('${a}','${app}','test','test','food-market',1,'exam','${exam}')`),sqlCode('23505'));
  await assert.rejects(() => db.exec(`insert into public.writing_drafts(id,student_id,app_key,task_id,task_version,draft_context,workspace_state,last_request_id,exam_attempt_id)
    values ('${uid(45)}','${b}','${app}','food-market',1,'exam','{"version":1}','${request}','${exam}')`),sqlCode('23503'));
  await as('authenticated',a);
  assert.equal((await db.exec('delete from public.writing_drafts'))[0].affectedRows,1);
  assert.equal(await count('writing_activity_attempts'),1);
  await db.exec('reset role');
  await db.query('delete from auth.users where id=$1',[a]);
  assert.equal(await count('writing_activity_attempts'),0);
  assert.equal(await count('writing_exam_attempts'),0);
  assert.equal(await count('student_writing_submissions'),0);
  console.log('Writing persistence upgrade, role isolation, draft retries, legacy submissions and account deletion scenarios passed.');
} finally {
  await db.close();
}
