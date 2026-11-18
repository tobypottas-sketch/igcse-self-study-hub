-- Assessment-integrity v2. Idempotent queued events may arrive shortly after
-- completion. Only the owning student can submit; teacher results stay scoped.
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
 -- Permit slow/retried events just after the last answer, without reopening
 -- the assessment or allowing indefinite post-assessment event submission.
 if s.state='completed' and (s.completed_at is null or s.completed_at<now()-interval '1 hour')
 then return jsonb_build_object('ok',true,'ignored',true);end if;
 if p_question_position>s.next_index then raise exception 'INVALID_REQUEST';end if;
 if (select count(*) from private.ngsl_integrity_events where session_id=s.id)>=200
 then return jsonb_build_object('ok',true,'limited',true);end if;
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
    'focusLosses',counts.focus_losses,
    'fullscreenExits',counts.fullscreen_exits,
    'lastEventAt',counts.last_event_at,
    'timeline',coalesce((
       select jsonb_agg(jsonb_build_object(
         'type',item.event_type,'position',item.question_position,'at',item.occurred_at
       ) order by item.occurred_at,item.id)
       from (select e.event_type,e.question_position,e.occurred_at,e.id
             from private.ngsl_integrity_events e where e.session_id=s.id
             order by e.occurred_at,e.id limit 60) item
     ),'[]'::jsonb)
   ))
   from private.ngsl_baseline_sessions s
   join lateral(
     select count(*) filter(where e.event_type in ('tab_hidden','window_blur'))::integer focus_losses,
       count(*) filter(where e.event_type='fullscreen_exit')::integer fullscreen_exits,
       max(e.occurred_at) last_event_at
     from private.ngsl_integrity_events e where e.session_id=s.id
   ) counts on true
   where s.state='completed' and counts.last_event_at is not null and
    (exists(select 1 from public.profiles p where p.id=p_actor and p.role::text='admin' and p.active=true)
     or exists(select 1 from public.student_class_memberships m
        join public.teacher_classes tc on tc.class_id=m.class_id
        where m.student_id=s.student_id and m.ended_at is null and tc.teacher_id=p_actor))
 ),'[]'::jsonb));
end;$fn$;
revoke all on function public.vocabulary_ngsl_integrity_report(uuid) from public,anon,authenticated;
grant execute on function public.vocabulary_ngsl_integrity_report(uuid) to service_role;
