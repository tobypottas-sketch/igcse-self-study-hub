-- NGSL assessment integrity v1: server-timestamped focus / fullscreen notices.
-- Browser focus signals are NOT evidence of cheating and NEVER affect scoring.
create table if not exists private.ngsl_integrity_events(
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references private.ngsl_baseline_sessions(id) on delete cascade,
 student_id uuid not null references auth.users(id) on delete cascade,
 event_id uuid not null,
 event_type text not null check(event_type in ('tab_hidden','window_blur','fullscreen_exit','focus_return')),
 question_position integer not null check(question_position between 1 and 50),
 occurred_at timestamptz not null default now(),
 unique(session_id,event_id)
);
create index if not exists ngsl_integrity_session_idx on private.ngsl_integrity_events(session_id,occurred_at);
revoke all on private.ngsl_integrity_events from public,anon,authenticated;
alter table private.ngsl_integrity_events enable row level security;

create or replace function public.vocabulary_ngsl_integrity_event(
 p_actor uuid,p_session_id uuid,p_event_id uuid,p_event_type text,p_question_position integer
) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare s private.ngsl_baseline_sessions%rowtype;
begin
 if p_actor is null or p_session_id is null or p_event_id is null or
    p_event_type not in ('tab_hidden','window_blur','fullscreen_exit','focus_return') or
    p_question_position not between 1 and 50
 then raise exception 'INVALID_REQUEST'; end if;
 if not exists(select 1 from public.profiles where id=p_actor and role::text='student' and active=true)
 then raise exception 'ACCESS_DENIED';end if;
 select * into s from private.ngsl_baseline_sessions where id=p_session_id and student_id=p_actor;
 if not found then raise exception 'SESSION_UNAVAILABLE';end if;
 if s.state='completed' then return jsonb_build_object('ok',true,'ignored',true);end if;
 -- Do not accept future position claims, or arbitrary student IDs.
 if p_question_position>s.next_index then raise exception 'INVALID_REQUEST';end if;
 insert into private.ngsl_integrity_events(session_id,student_id,event_id,event_type,question_position)
 values(s.id,p_actor,p_event_id,p_event_type,p_question_position)
 on conflict(session_id,event_id) do nothing;
 return jsonb_build_object('ok',true);
end;$fn$;
revoke all on function public.vocabulary_ngsl_integrity_event(uuid,uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_integrity_event(uuid,uuid,uuid,text,integer) to service_role;

create or replace function public.vocabulary_ngsl_integrity_report(p_actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $fn$
begin
 if not exists(select 1 from public.profiles where id=p_actor and role::text in ('teacher','admin') and active=true)
 then raise exception 'ACCESS_DENIED';end if;
 return jsonb_build_object('events',coalesce((
   select jsonb_agg(jsonb_build_object(
    'studentId',s.student_id,
    'focusLosses',counted.focus_losses,
    'fullscreenExits',counted.fullscreen_exits,
    'lastEventAt',counted.last_event_at
   ))
   from private.ngsl_baseline_sessions s
   join lateral(
     select count(*) filter(where e.event_type in ('tab_hidden','window_blur'))::integer focus_losses,
       count(*) filter(where e.event_type='fullscreen_exit')::integer fullscreen_exits,
       max(e.occurred_at) last_event_at
     from private.ngsl_integrity_events e where e.session_id=s.id
   ) counted on true
   where s.state='completed' and counted.last_event_at is not null and
    (exists(select 1 from public.profiles p where p.id=p_actor and p.role::text='admin')
     or exists(select 1 from public.student_class_memberships m
        join public.teacher_classes tc on tc.class_id=m.class_id
        where m.student_id=s.student_id and m.ended_at is null and tc.teacher_id=p_actor))
 ),'[]'::jsonb));
end;$fn$;
revoke all on function public.vocabulary_ngsl_integrity_report(uuid) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_integrity_report(uuid) to service_role;
