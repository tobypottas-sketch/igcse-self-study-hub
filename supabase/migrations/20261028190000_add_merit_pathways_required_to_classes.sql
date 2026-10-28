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
