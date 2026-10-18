create table if not exists public.vocabulary_unit_pathway_journey (
  student_id uuid not null references auth.users(id) on delete cascade,
  unit_number integer not null,
  pathway_id text not null check (pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  current_stage text not null default 'recognise' check (current_stage in ('recognise','match','apply','recall','mastery')),
  completed_stages text[] not null default '{}'::text[],
  stage_attempts integer not null default 0 check (stage_attempts >= 0 and stage_attempts <= 10),
  stage_clean_successes integer not null default 0 check (stage_clean_successes >= 0 and stage_clean_successes <= 10),
  updated_at timestamptz not null default now(),
  primary key (student_id, unit_number, pathway_id)
);

alter table public.vocabulary_unit_pathway_journey enable row level security;

create policy "students read own vocabulary pathway journey"
on public.vocabulary_unit_pathway_journey
for select
to authenticated
using (student_id = auth.uid());

grant select on public.vocabulary_unit_pathway_journey to authenticated;
revoke insert, update, delete on public.vocabulary_unit_pathway_journey from anon, authenticated;

create index if not exists vocabulary_unit_pathway_journey_student_unit_idx
on public.vocabulary_unit_pathway_journey(student_id, unit_number);

create or replace function public.record_vocabulary_pathway_journey_from_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pathway text;
  v_stage text;
  v_served_stage text;
  v_unit integer;
  v_attempt_number integer;
  v_row public.vocabulary_unit_pathway_journey%rowtype;
  v_attempts integer;
  v_clean integer;
  v_completed text[];
  v_next_stage text;
begin
  if new.app_key <> 'vocabulary_paraphrase' or new.event_type <> 'question_attempt' then
    return new;
  end if;

  v_pathway := nullif(new.metadata->>'pathway_id','');
  v_stage := nullif(new.metadata->>'pathway_stage','');
  v_served_stage := nullif(new.metadata->>'served_pathway_stage','');
  if v_pathway is null or v_stage is null or v_served_stage is null then
    return new;
  end if;

  if (new.metadata->>'attempt_number') !~ '^[0-9]+$' or (new.metadata->>'unit_number') !~ '^[0-9]+$' then
    return new;
  end if;
  v_attempt_number := (new.metadata->>'attempt_number')::integer;
  v_unit := (new.metadata->>'unit_number')::integer;

  -- A stage window counts the ten original questions only. Retries and lower-rung
  -- recovery support are useful learning evidence but cannot manufacture pathway progress.
  if v_attempt_number <> 1 or v_stage <> v_served_stage then
    return new;
  end if;

  if v_pathway not in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')
     or v_stage not in ('recognise','match','apply','recall','mastery') then
    return new;
  end if;

  insert into public.vocabulary_unit_pathway_journey (
    student_id, unit_number, pathway_id, current_stage, completed_stages,
    stage_attempts, stage_clean_successes, updated_at
  ) values (
    new.user_id, v_unit, v_pathway, 'recognise', '{}'::text[], 0, 0, now()
  ) on conflict (student_id, unit_number, pathway_id) do nothing;

  select * into v_row
  from public.vocabulary_unit_pathway_journey
  where student_id = new.user_id
    and unit_number = v_unit
    and pathway_id = v_pathway
  for update;

  -- Ignore stale or tampered stage coordinates. The database journey is authoritative.
  if v_row.current_stage <> v_stage then
    return new;
  end if;

  v_attempts := v_row.stage_attempts + 1;
  v_clean := v_row.stage_clean_successes + case when new.strong is true then 1 else 0 end;

  if v_attempts < 10 then
    update public.vocabulary_unit_pathway_journey
    set stage_attempts = v_attempts,
        stage_clean_successes = v_clean,
        updated_at = now()
    where student_id = new.user_id
      and unit_number = v_unit
      and pathway_id = v_pathway;
    return new;
  end if;

  if v_clean >= 8 then
    v_completed := v_row.completed_stages;
    if not (v_stage = any(v_completed)) then
      v_completed := array_append(v_completed, v_stage);
    end if;
    v_next_stage := case v_stage
      when 'recognise' then 'match'
      when 'match' then 'apply'
      when 'apply' then 'recall'
      when 'recall' then 'mastery'
      else 'mastery'
    end;

    update public.vocabulary_unit_pathway_journey
    set current_stage = v_next_stage,
        completed_stages = v_completed,
        stage_attempts = 0,
        stage_clean_successes = 0,
        updated_at = now()
    where student_id = new.user_id
      and unit_number = v_unit
      and pathway_id = v_pathway;
  else
    update public.vocabulary_unit_pathway_journey
    set stage_attempts = 0,
        stage_clean_successes = 0,
        updated_at = now()
    where student_id = new.user_id
      and unit_number = v_unit
      and pathway_id = v_pathway;
  end if;

  return new;
end;
$$;

revoke all on function public.record_vocabulary_pathway_journey_from_event() from public, anon, authenticated;

drop trigger if exists trg_record_vocabulary_pathway_journey on public.activity_events;
create trigger trg_record_vocabulary_pathway_journey
after insert on public.activity_events
for each row
execute function public.record_vocabulary_pathway_journey_from_event();
