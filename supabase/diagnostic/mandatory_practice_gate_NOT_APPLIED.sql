-- PREPARED, NOT APPLIED. Future schoolwide Vocabulary diagnostic enforcement.
-- The single switch stays OFF; activate only after a complete approved test form,
-- functional student player, reviewed item bank and signed-off end-to-end tests.
-- Must be applied in a controlled rollout AFTER write-path/role regression tests.

create table if not exists private.vocabulary_diagnostic_gate_settings (
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into private.vocabulary_diagnostic_gate_settings(singleton,enabled)
 values(true,false) on conflict(singleton) do nothing;
alter table private.vocabulary_diagnostic_gate_settings enable row level security;
revoke all on private.vocabulary_diagnostic_gate_settings from public,anon,authenticated;

create or replace function private.vocabulary_diagnostic_enforce_practice_gate()
returns trigger
language plpgsql security definer set search_path=''
as $$
declare
 v_enabled boolean := false;
 v_student uuid;
begin
 select enabled into v_enabled
  from private.vocabulary_diagnostic_gate_settings where singleton=true;
 if coalesce(v_enabled,false)=false then return new; end if;

 if tg_table_name='activity_events' then
   -- This is a shared event table; ignore every non-vocabulary activity.
   if new.app_key is distinct from 'vocabulary_paraphrase' then return new; end if;
   v_student:=new.user_id;
 else
   v_student:=new.student_id;
 end if;

 if not exists(select 1 from public.profiles p
     where p.id=v_student and p.active and p.role::text='student')
   then return new; end if;

 if not exists(
   select 1 from private.vocabulary_diagnostic_results r
   join private.vocabulary_diagnostic_sessions s on s.id=r.session_id
   where r.student_id=v_student and s.kind='baseline' and s.state='completed'
 ) then
   raise exception 'VOCAB_DIAGNOSTIC_REQUIRED' using errcode='P0001';
 end if;
 return new;
end;
$$;
revoke all on function private.vocabulary_diagnostic_enforce_practice_gate()
 from public,anon,authenticated;

-- Guard actual database write paths, not just the browser navigation and
-- vocabulary-attempt-action endpoint. This prevents direct-RPC bypasses.
drop trigger if exists vocab_diag_require_baseline on public.vocabulary_missions;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_missions for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.vocabulary_mission_starts;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_mission_starts for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.vocabulary_global_mastery;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_global_mastery for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.vocabulary_unit_mastery;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_unit_mastery for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.vocabulary_pathway_sets;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_pathway_sets for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.vocabulary_unit_check_attempts;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_unit_check_attempts for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.vocabulary_unit_pathway_journey;
create trigger vocab_diag_require_baseline before insert or update
 on public.vocabulary_unit_pathway_journey for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

drop trigger if exists vocab_diag_require_baseline on public.activity_events;
create trigger vocab_diag_require_baseline before insert or update
 on public.activity_events for each row
 execute function private.vocabulary_diagnostic_enforce_practice_gate();

-- Intentionally NO UPDATE that sets enabled=true in this migration.
-- Do not switch this flag without a separate authorised release.
