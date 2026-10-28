alter table public.classes
  add column if not exists merit_pathways_required integer not null default 2;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'classes_merit_pathways_required_check'
      and conrelid = 'public.classes'::regclass
  ) then
    alter table public.classes
      add constraint classes_merit_pathways_required_check
      check (merit_pathways_required between 1 and 6);
  end if;
end $$;

create or replace function public.current_merit_pathways_required()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(c.merit_pathways_required, 2)
  from public.student_class_memberships scm
  join public.classes c on c.id = scm.class_id
  where scm.student_id = auth.uid()
    and scm.ended_at is null
    and c.active = true
  order by scm.started_at desc nulls last
  limit 1;
$$;

revoke all on function public.current_merit_pathways_required() from public;
grant execute on function public.current_merit_pathways_required() to authenticated;
