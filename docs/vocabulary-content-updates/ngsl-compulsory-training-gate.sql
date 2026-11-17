-- NGSL compulsory baseline: protect actual training writes, not only frontend navigation.
-- All active student accounts, including existing users, must finish their sole 50-question session.
-- No existing vocabulary tables or progress records are removed or reset.
create or replace function private.ngsl_student_needs_baseline(p_student uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select exists (
   select 1 from public.profiles p
   where p.id = p_student and p.active = true and p.role::text = 'student'
 ) and not exists (
   select 1
   from private.ngsl_baseline_sessions s
   join private.ngsl_baseline_results r on r.session_id = s.id and r.student_id = s.student_id
   where s.student_id = p_student and s.state = 'completed'
 );
$$;
revoke all on function private.ngsl_student_needs_baseline(uuid) from public, anon, authenticated;

create or replace function private.ngsl_guard_vocabulary_write()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_student uuid;
begin
 if tg_table_name = 'activity_events' then
   if new.app_key is distinct from 'vocabulary_paraphrase' then return new; end if;
   v_student := new.user_id;
 else
   v_student := new.student_id;
 end if;
 if v_student is not null and private.ngsl_student_needs_baseline(v_student) then
   raise exception 'NGSL_BASELINE_REQUIRED' using errcode='P0001';
 end if;
 return new;
end;
$$;
revoke all on function private.ngsl_guard_vocabulary_write() from public, anon, authenticated;

-- CREATE TRIGGER is guarded for repeatable safe deployment.
do $$
declare t text;
begin
 foreach t in array array[
  'activity_events','vocabulary_mission_starts','vocabulary_missions',
  'vocabulary_global_mastery','vocabulary_unit_mastery',
  'vocabulary_pathway_sets','vocabulary_unit_pathway_journey',
  'vocabulary_unit_check_attempts'
 ] loop
  if not exists (
   select 1 from pg_trigger g
   where g.tgrelid = format('public.%I',t)::regclass
     and g.tgname = 'ngsl_compulsory_training_gate'
     and not g.tgisinternal
  ) then
   execute format(
    'create trigger ngsl_compulsory_training_gate before insert or update on public.%I for each row execute function private.ngsl_guard_vocabulary_write()',t
   );
  end if;
 end loop;
end;
$$;
