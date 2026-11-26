-- Explicit enrollment keeps the Structure pilot closed by default.
create table private.writing_structure_progress_pilot (
  student_id uuid primary key references public.profiles(id) on delete cascade
);
alter table private.writing_structure_progress_pilot enable row level security;
revoke all on private.writing_structure_progress_pilot from public, anon, authenticated;

create function private.writing_structure_pilot_enrolled()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(private.writing_ready_role() = 'student', false)
    and exists (select 1 from private.writing_structure_progress_pilot where student_id = auth.uid());
$$;

create function public.writing_structure_pilot_enrolled()
returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.writing_structure_pilot_enrolled(); $$;

create function private.save_writing_structure_pilot_stage(p_stage text, p_expected_revision integer)
returns table (current_stage text, revision_number integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_progress public.writing_pathway_progress%rowtype;
begin
  if not private.writing_structure_pilot_enrolled() then
    raise exception 'Writing pilot access denied' using errcode = '42501';
  end if;
  if p_stage is null or p_stage not in ('discover','explore','practise','apply','master')
    or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid writing pilot checkpoint' using errcode = '22023';
  end if;

  if p_expected_revision = 0 then
    insert into public.writing_pathway_progress(student_id,app_key,curriculum_id,curriculum_version,pathway_id,current_stage)
      values(v_student,'review_writing','review',1,'structure',p_stage)
      on conflict (student_id,app_key,curriculum_id,curriculum_version,pathway_id) do nothing
      returning * into v_progress;
    if found then
      return query select v_progress.current_stage, v_progress.revision_number;
      return;
    end if;
  end if;

  select * into v_progress from public.writing_pathway_progress p
   where p.student_id=v_student and p.app_key='review_writing'
     and p.curriculum_id='review' and p.curriculum_version=1 and p.pathway_id='structure'
   for update;
  if not found or (
    v_progress.revision_number <> p_expected_revision and not (
      v_progress.revision_number = p_expected_revision::bigint + 1 and v_progress.current_stage = p_stage
    )
  ) then
    raise exception 'Writing pilot checkpoint is stale' using errcode = 'PT409';
  end if;

  if v_progress.current_stage <> p_stage then
    update public.writing_pathway_progress p
      set current_stage=p_stage, updated_at=statement_timestamp(), revision_number=p.revision_number+1
      where p.id=v_progress.id
      returning * into v_progress;
  end if;
  return query select v_progress.current_stage, v_progress.revision_number;
end;
$$;

create function public.save_writing_structure_pilot_stage(p_stage text, p_expected_revision integer)
returns table (current_stage text, revision_number integer)
language sql security invoker set search_path = ''
as $$ select * from private.save_writing_structure_pilot_stage(p_stage,p_expected_revision); $$;

revoke all on function private.writing_structure_pilot_enrolled(), public.writing_structure_pilot_enrolled(),
  private.save_writing_structure_pilot_stage(text,integer), public.save_writing_structure_pilot_stage(text,integer)
  from public, anon, authenticated;
grant execute on function private.writing_structure_pilot_enrolled(), public.writing_structure_pilot_enrolled(),
  private.save_writing_structure_pilot_stage(text,integer), public.save_writing_structure_pilot_stage(text,integer)
  to authenticated;
