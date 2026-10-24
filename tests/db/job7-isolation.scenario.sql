-- Job 7 (Part 14): account and privacy isolation on a throwaway local Postgres. Synthetic ids only. Every row must be t.
\set ON_ERROR_STOP off
insert into public.profiles(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333');
create temp table r(label text, ok boolean, detail text);
grant all on r to authenticated, anon;

-- One whole mission through the SERVER: start (server decides the step) -> the student's graded attempts -> record. Returns the Set row afterwards.
create or replace function pg_temp.mission(p_student uuid, p_pathway text, p_correct int, p_set int default null, p_claim_stage text default null, p_attempt_stage text default null)
returns jsonb language plpgsql as $$
declare j jsonb; m uuid; i int; st text; rec jsonb; s public.vocabulary_pathway_sets; off int;
begin
  perform set_config('request.jwt.claim.sub', p_student::text, false);
  j := public.start_vocabulary_mission(1, 'pathway', p_pathway, coalesce(p_claim_stage, 'recognise'), 'stage', false, true, p_set);
  m := (j->>'mission_id')::uuid; st := coalesce(p_attempt_stage, j->>'pathway_stage'); off := 10 * (coalesce((j->>'set_number')::int, 1) - 1);
  for i in 1..10 loop
    insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
      jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||(i+off),'attempt_number',1,'outcome',case when i<=p_correct then 'correct' else 'try_again' end,'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',st));
    if i > p_correct then
      insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
        jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||(i+off),'attempt_number',2,'outcome','try_again','recovery',true,'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',st));
    end if;
  end loop;
  rec := public.record_vocabulary_mission(m);
  return jsonb_build_object('start', j, 'record', rec);
end $$;

create or replace function pg_temp.sets(p_student uuid, p_pathway text) returns text language sql as $$
  select coalesce(string_agg(set_number || ':' || stage || '/' || phase || '/' || status, ' ' order by set_number), '(none)')
  from public.vocabulary_pathway_sets where student_id = p_student and unit_number = 1 and pathway_id = p_pathway $$;

insert into public.profiles(id, role) values ('44444444-4444-4444-8444-444444444444','teacher'),('55555555-5555-4555-8555-555555555555','admin'),('66666666-6666-4666-8666-666666666666','teacher');
create table public.job7_teacher_access(teacher uuid, student uuid);
grant select on public.job7_teacher_access to authenticated;
insert into public.job7_teacher_access values ('44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111');
create or replace function private.teacher_can_access_student(p uuid) returns boolean language sql stable security definer as $$ select exists (select 1 from public.job7_teacher_access where teacher = auth.uid() and student = p) $$;

-- two students each finish a Set mission (student 1: 10/10, student 2: 7/10)
select pg_temp.mission('11111111-1111-4111-8111-111111111111','meaning',10) is not null;
select pg_temp.mission('22222222-2222-4222-8222-222222222222','meaning',7) is not null;
select pg_temp.mission('33333333-3333-4333-8333-333333333333','context',10) is not null;

create or replace function pg_temp.seen(p_as uuid, p_table text, p_student uuid) returns bigint language plpgsql as $$
declare n bigint; begin
  perform set_config('request.jwt.claim.sub', p_as::text, false);
  execute format('select count(*) from public.%I where student_id = %L', p_table, p_student) into n; return n; end $$;
grant execute on function pg_temp.seen(uuid, text, uuid) to authenticated;

set role authenticated;
insert into r select 'I1 a student reads their own Set rows, missions and mission starts', (pg_temp.seen('11111111-1111-4111-8111-111111111111','vocabulary_pathway_sets','11111111-1111-4111-8111-111111111111') > 0) and (pg_temp.seen('11111111-1111-4111-8111-111111111111','vocabulary_missions','11111111-1111-4111-8111-111111111111') > 0) and (pg_temp.seen('11111111-1111-4111-8111-111111111111','vocabulary_mission_starts','11111111-1111-4111-8111-111111111111') > 0), '';
insert into r select 'I2 a student cannot read ANOTHER student''s Set rows, missions or mission starts', pg_temp.seen('11111111-1111-4111-8111-111111111111','vocabulary_pathway_sets','22222222-2222-4222-8222-222222222222') = 0 and pg_temp.seen('11111111-1111-4111-8111-111111111111','vocabulary_missions','22222222-2222-4222-8222-222222222222') = 0 and pg_temp.seen('11111111-1111-4111-8111-111111111111','vocabulary_mission_starts','22222222-2222-4222-8222-222222222222') = 0, '';
insert into r select 'I3 the same holds in the other direction', pg_temp.seen('22222222-2222-4222-8222-222222222222','vocabulary_pathway_sets','11111111-1111-4111-8111-111111111111') = 0 and pg_temp.seen('33333333-3333-4333-8333-333333333333','vocabulary_missions','11111111-1111-4111-8111-111111111111') = 0, '';
insert into r select 'I4 a teacher sees an assigned student and ONLY that student (existing helper)', pg_temp.seen('44444444-4444-4444-8444-444444444444','vocabulary_pathway_sets','11111111-1111-4111-8111-111111111111') > 0 and pg_temp.seen('44444444-4444-4444-8444-444444444444','vocabulary_missions','11111111-1111-4111-8111-111111111111') > 0 and pg_temp.seen('44444444-4444-4444-8444-444444444444','vocabulary_pathway_sets','22222222-2222-4222-8222-222222222222') = 0 and pg_temp.seen('44444444-4444-4444-8444-444444444444','vocabulary_mission_starts','33333333-3333-4333-8333-333333333333') = 0, '';
insert into r select 'I5 a teacher with no assigned students sees nothing', pg_temp.seen('66666666-6666-4666-8666-666666666666','vocabulary_pathway_sets','11111111-1111-4111-8111-111111111111') = 0 and pg_temp.seen('66666666-6666-4666-8666-666666666666','vocabulary_missions','22222222-2222-4222-8222-222222222222') = 0, '';
insert into r select 'I6 an admin reads every student (unchanged)', pg_temp.seen('55555555-5555-4555-8555-555555555555','vocabulary_pathway_sets','11111111-1111-4111-8111-111111111111') > 0 and pg_temp.seen('55555555-5555-4555-8555-555555555555','vocabulary_pathway_sets','22222222-2222-4222-8222-222222222222') > 0 and pg_temp.seen('55555555-5555-4555-8555-555555555555','vocabulary_missions','33333333-3333-4333-8333-333333333333') > 0, '';

-- another student cannot settle or replay someone else's mission
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
do $$ declare m uuid; before_stage text; res jsonb; begin
  select mission_id into m from public.vocabulary_missions where student_id = '11111111-1111-4111-8111-111111111111' limit 1;
  -- student 2 cannot even see the row, so the id is unknown to them; record must not touch student 1's Set
  begin res := public.record_vocabulary_mission(m); exception when others then res := null; end;
  insert into r values ('I7 a student cannot record another student''s mission', res is null or (res->>'student_id') is distinct from '11111111-1111-4111-8111-111111111111', coalesce(res::text,'rejected'));
end $$;
reset role;
insert into r select 'I8 student 1''s Set is exactly where their own 10/10 left it after the cross-student attempt', pg_temp.sets('11111111-1111-4111-8111-111111111111','meaning') = '1:match/stage/active', pg_temp.sets('11111111-1111-4111-8111-111111111111','meaning');

-- Set membership: world-readable to signed-in users (no private data), never writable, invisible to anon
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
insert into r select 'I9 a signed-in student can read Set membership', (select count(*) from public.vocabulary_set_members) > 0, '';
do $$ begin begin insert into public.vocabulary_set_members values (1,'meaning',9,1,'u1_hack'); insert into r values ('I10 a student cannot insert membership',false,'inserted'); exception when others then insert into r values ('I10 a student cannot insert membership',true,sqlerrm); end; end $$;
do $$ begin begin update public.vocabulary_set_members set occurrence_id = 'u1_hack'; insert into r values ('I11 a student cannot update membership',false,'updated'); exception when others then insert into r values ('I11 a student cannot update membership',true,sqlerrm); end; end $$;
reset role;
set role anon;
do $$ begin begin perform count(*) from public.vocabulary_set_members; insert into r values ('I12 anon cannot read membership',false,'read'); exception when others then insert into r values ('I12 anon cannot read membership',true,sqlerrm); end; end $$;
reset role;
insert into r select 'I13 the membership table holds only occurrence ids (no student column, nothing private)', not exists (select 1 from information_schema.columns where table_name = 'vocabulary_set_members' and column_name in ('student_id','user_id','email','name')), '';

select label, ok, detail from r order by 1;
