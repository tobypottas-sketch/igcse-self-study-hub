-- Synthetic-only regression for the bundled settlement RPC. Run in a THROWAWAY database via run-local-scenarios.sh.
begin;
insert into public.profiles(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
create temp table r(label text, ok boolean);
grant all on r to authenticated,anon;

create function pg_temp.prepare(p_student uuid, p_pathway text default 'context', p_count int default 10)
returns uuid language plpgsql as $$
declare j jsonb; m uuid; member record; i int := 0;
begin
  perform set_config('request.jwt.claim.sub',p_student::text,true);
  j := public.start_vocabulary_mission(1,'pathway',p_pathway,'recognise','stage',false,true,null);
  m := (j->>'mission_id')::uuid;
  for member in select occurrence_id from public.vocabulary_set_members
    where unit_number=1 and pathway_id=p_pathway and set_number=(j->>'set_number')::int order by position limit p_count loop
    i := i+1;
    insert into public.activity_events(user_id,app_key,event_type,set_id,occurred_at,metadata)
    values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',now()+i*interval '1 millisecond',
      jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id',member.occurrence_id,'attempt_number',1,'outcome','correct',
        'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',j->>'pathway_stage'));
  end loop;
  return m;
end $$;

create temp table prepared as select pg_temp.prepare('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') id;
grant select on prepared to authenticated,anon;
-- A different student's Set must never appear, even though the function is callable by any signed-in student.
select public.start_vocabulary_mission(1,'pathway','meaning','recognise','stage',false,true,null)
from (select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true)) auth;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
set local role authenticated;
create temp table recorded as select public.record_vocabulary_mission_with_sets((select id from prepared)) j;
insert into r select 'returns committed next stage, not a client projection',
  j->'pathway_sets'->0->>'stage'='match' and j->'pathway_sets'->0->>'phase'='stage' and j->'pathway_sets'->0->>'status'='active' from recorded;
insert into r select 'returns only this student and unit, with display fields only',
  jsonb_array_length(j->'pathway_sets')=1 and j->'pathway_sets'->0->>'pathway_id'='context'
  and j->'pathway_sets'->0->>'unit_number'='1' and not (j->'pathway_sets'->0 ? 'student_id')
  and not (j->'pathway_sets'->0 ? 'history') from recorded;
insert into r select 'server-derived scoring is preserved',j->>'score'='10' and j->>'duplicate'='false' from recorded;
insert into r select 'retry returns duplicate with same Set state',
  j->>'duplicate'='true' and j->'pathway_sets'->0->>'stage'='match'
  from (select public.record_vocabulary_mission_with_sets((select id from prepared)) j) retry;
create temp table next_mission as select public.start_vocabulary_mission(1,'pathway','context','recognise','stage',false,true,null) j;
insert into r select 'start derives stage despite stale client hint',j->>'pathway_stage'='match' and j->>'set_number'='1' from next_mission;
insert into r select 'a repeated start resumes the same next mission',
  j->>'resumed'='true' and j->>'mission_id'=(select j->>'mission_id' from next_mission)
  from (select public.start_vocabulary_mission(1,'pathway','context','recognise','stage',false,true,null) j) resumed;
reset role;
insert into r select 'settlement advances only once',cardinality(applied_mission_ids)=1 and jsonb_array_length(history)=1
  from public.vocabulary_pathway_sets where student_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and pathway_id='context';
insert into r select 'old mission closed and only one next mission open',
  (select status='completed' from public.vocabulary_mission_starts where mission_id=(select id from prepared))
  and (select count(*)=1 from public.vocabulary_mission_starts where student_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and status='open');

-- On a later device, recording the next completed mission moves to Apply. Retrying the old record returns current authoritative rows.
select public.record_vocabulary_mission_with_sets(pg_temp.prepare('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'));
insert into r select 'a later-device advancement is not rolled back by retry',
  j->>'duplicate'='true' and j->'pathway_sets'->0->>'stage'='apply'
  from (select public.record_vocabulary_mission_with_sets((select id from prepared)) j) retry;

do $$begin
  perform set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
  begin
    perform public.record_vocabulary_mission_with_sets((select id from prepared));
    insert into r values ('other student cannot record or obtain state',false);
  exception when others then insert into r values ('other student cannot record or obtain state',true); end;
end $$;
set local role anon;
do $$begin
  begin perform public.record_vocabulary_mission_with_sets((select id from prepared)); insert into r values ('anonymous execute denied',false);
  exception when insufficient_privilege then insert into r values ('anonymous execute denied',true); end;
end $$;
reset role;

create temp table incomplete as select pg_temp.prepare('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','meaning',9) id;
do $$begin
  begin perform public.record_vocabulary_mission_with_sets((select id from incomplete)); insert into r values ('incomplete mission still rejected',false);
  exception when others then insert into r values ('incomplete mission still rejected',sqlerrm like 'Mission is not complete%'); end;
end $$;

-- A failed response read rolls the entire RPC back, so it cannot silently commit an unreported advancement.
create temp table atomic_case as select pg_temp.prepare('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','precision_use') id;
grant select on atomic_case to authenticated;
revoke select on public.vocabulary_pathway_sets from authenticated;
set local role authenticated;
do $$begin
  begin perform public.record_vocabulary_mission_with_sets((select id from atomic_case)); insert into r values ('read failure rejects atomically',false);
  exception when insufficient_privilege then insert into r values ('read failure rejects atomically',true); end;
end $$;
reset role;
grant select on public.vocabulary_pathway_sets to authenticated;
insert into r select 'failed response read leaves no settlement or advancement',
  not exists(select 1 from public.vocabulary_missions where mission_id=(select id from atomic_case))
  and exists(select 1 from public.vocabulary_pathway_sets where student_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' and pathway_id='precision_use' and stage='recognise');

-- Mastery exposes Maintain; the next Set still requires the existing explicit next-Set intent.
update public.vocabulary_pathway_sets set stage='mastery',completed_stages=array['recognise','match','apply','recall']
where student_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and pathway_id='context';
create temp table mastered as select public.record_vocabulary_mission_with_sets(pg_temp.prepare('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')) j;
insert into r select 'Mastery returns Maintain with all five completed stages',
  j->'pathway_sets'->0->>'status'='maintain' and jsonb_array_length(j->'pathway_sets'->0->'completed_stages')=5 from mastered;
do $$declare j jsonb; begin
  begin perform public.start_vocabulary_mission(1,'pathway','context','mastery','stage',false,true,null); insert into r values ('next Set requires intent',false);
  exception when others then insert into r values ('next Set requires intent',sqlerrm='No further Set is available'); end;
  j:=public.start_vocabulary_mission(1,'pathway','context','mastery','stage',false,true,2);
  insert into r values ('next Set starts Recognise only when requested',j->>'set_number'='2' and j->>'pathway_stage'='recognise');
end $$;
select * from r;
do $$begin assert not exists(select 1 from r where ok is distinct from true),'bundled settlement regression'; end $$;
rollback;
