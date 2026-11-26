-- Dormant Academy foundation. Only private drafts have a student write API.
create table public.writing_pathway_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  app_key text not null references public.apps(app_key)
    check (app_key in ('review_writing','essay_writing','email_writing')),
  curriculum_id text not null check (curriculum_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  curriculum_version integer not null check (curriculum_version > 0),
  pathway_id text not null check (pathway_id in ('structure','expression','development','cohesion','editing','exam')),
  current_stage text not null check (current_stage in ('discover','explore','practise','apply','master')),
  completed_stages text[] not null default '{}',
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  revision_number integer not null default 1 check (revision_number > 0),
  unique (student_id, app_key, curriculum_id, curriculum_version, pathway_id),
  check (completed_stages = array_remove(array[
    case when 'discover'=any(completed_stages) then 'discover' end,
    case when 'explore'=any(completed_stages) then 'explore' end,
    case when 'practise'=any(completed_stages) then 'practise' end,
    case when 'apply'=any(completed_stages) then 'apply' end,
    case when 'master'=any(completed_stages) then 'master' end
  ], null)),
  check ((status='completed') = (completed_at is not null)),
  check (updated_at >= started_at and completed_at between started_at and updated_at)
);

create table public.writing_activity_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  app_key text not null references public.apps(app_key)
    check (app_key in ('review_writing','essay_writing','email_writing')),
  curriculum_id text not null check (curriculum_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  curriculum_version integer not null check (curriculum_version > 0),
  pathway_id text not null check (pathway_id in ('structure','expression','development','cohesion','editing','exam')),
  stage_id text not null check (stage_id in ('discover','explore','practise','apply','master')),
  activity_id text not null check (activity_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  content_version integer not null check (content_version > 0),
  request_id uuid not null,
  difficulty text check (difficulty in ('bronze','silver','gold')),
  attempt_type text not null check (attempt_type in ('objective','observation','annotation','writing','reflection')),
  validation_status text not null default 'unverified' check (validation_status in ('unverified','validated')),
  score integer,
  max_score integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (id, student_id, app_key),
  unique (student_id, app_key, request_id),
  check (completed_at >= started_at),
  check ((score is null and max_score is null) or
    (validation_status='validated' and attempt_type='objective' and completed_at is not null and
     score is not null and max_score is not null and max_score > 0 and score between 0 and max_score))
);

create table public.writing_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  app_key text not null references public.apps(app_key)
    check (app_key in ('review_writing','essay_writing','email_writing')),
  task_id text not null check (task_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  task_version integer not null check (task_version > 0),
  curriculum_id text not null check (curriculum_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  curriculum_version integer not null check (curriculum_version > 0),
  attempt_mode text not null check (attempt_mode in ('timed','untimed')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  submitted_at timestamptz,
  overtime boolean generated always as (coalesce(submitted_at > deadline_at, false)) stored,
  unique (id, student_id, app_key, task_id, task_version),
  check ((attempt_mode='timed') = (deadline_at is not null)),
  check (deadline_at > started_at and submitted_at >= started_at)
);

create table public.writing_drafts (
  id uuid primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  app_key text not null references public.apps(app_key)
    check (app_key in ('review_writing','essay_writing','email_writing')),
  task_id text not null check (task_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  task_version integer not null check (task_version > 0),
  activity_attempt_id uuid,
  exam_attempt_id uuid,
  draft_context text not null check (draft_context in ('studio','workshop','gold','exam')),
  workspace_state jsonb not null check (
    jsonb_typeof(workspace_state) = 'object' and octet_length(workspace_state::text) <= 262144
    and workspace_state @> '{"version":1}'
  ),
  original_response text not null default '' check (char_length(original_response) <= 30000),
  current_response text not null default '' check (char_length(current_response) <= 30000),
  revision_number integer not null default 1 check (revision_number > 0),
  last_request_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (activity_attempt_id, student_id, app_key)
    references public.writing_activity_attempts(id, student_id, app_key),
  foreign key (exam_attempt_id, student_id, app_key, task_id, task_version)
    references public.writing_exam_attempts(id, student_id, app_key, task_id, task_version),
  check (num_nonnulls(activity_attempt_id, exam_attempt_id) <= 1),
  check ((draft_context='exam') = (exam_attempt_id is not null))
);

alter table public.student_writing_submissions
  add column task_id text check (task_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  add column task_version integer check (task_version > 0),
  add column activity_attempt_id uuid,
  add column exam_attempt_id uuid,
  add column submission_type text check (submission_type in ('practice','revision','exam')),
  add column parent_submission_id uuid,
  add constraint writing_submission_identity unique (id, student_id, app_key, task_id, task_version),
  add constraint writing_submission_task_identity check ((task_id is null) = (task_version is null)),
  add constraint writing_submission_links check (
    num_nonnulls(activity_attempt_id, exam_attempt_id) <= 1 and
    (submission_type is null) = (task_id is null) and
    (activity_attempt_id is null or task_id is not null) and
    (submission_type is not distinct from 'exam') = (exam_attempt_id is not null) and
    (submission_type is not distinct from 'revision') = (parent_submission_id is not null) and
    (parent_submission_id is null or parent_submission_id <> id)
  ),
  add constraint writing_submission_activity_fk foreign key (activity_attempt_id, student_id, app_key)
    references public.writing_activity_attempts(id, student_id, app_key),
  add constraint writing_submission_exam_fk foreign key (exam_attempt_id, student_id, app_key, task_id, task_version)
    references public.writing_exam_attempts(id, student_id, app_key, task_id, task_version),
  add constraint writing_submission_parent_fk foreign key (parent_submission_id, student_id, app_key, task_id, task_version)
    references public.student_writing_submissions(id, student_id, app_key, task_id, task_version);

create unique index writing_submission_one_exam_idx
  on public.student_writing_submissions(exam_attempt_id) where exam_attempt_id is not null;
create index writing_submission_activity_idx on public.student_writing_submissions(activity_attempt_id)
  where activity_attempt_id is not null;
create index writing_submission_parent_idx on public.student_writing_submissions(parent_submission_id)
  where parent_submission_id is not null;
create index writing_attempt_activity_idx on public.writing_activity_attempts(student_id, app_key, activity_id, completed_at desc);
create index writing_exam_task_idx on public.writing_exam_attempts(student_id, app_key, task_id, started_at desc);
create index writing_draft_task_idx on public.writing_drafts(student_id, app_key, task_id, updated_at desc);

create function private.writing_ready_role()
returns public.user_role language sql stable security invoker set search_path = ''
as $$
  select p.role from public.profiles p
  where p.id = (select auth.uid()) and p.active and not p.must_change_password
$$;

create function private.writing_can_read(owner_id uuid, staff_visible boolean)
returns boolean language sql stable security invoker set search_path = ''
as $$
  select case (select private.writing_ready_role())
    when 'student' then owner_id = (select auth.uid())
    when 'teacher' then staff_visible and private.teacher_can_access_student(owner_id)
    when 'admin' then staff_visible
    else false
  end
$$;

revoke all on function private.writing_ready_role(), private.writing_can_read(uuid, boolean) from public, anon, authenticated;
grant execute on function private.writing_ready_role(), private.writing_can_read(uuid, boolean) to authenticated;

alter table public.writing_pathway_progress enable row level security;
alter table public.writing_activity_attempts enable row level security;
alter table public.writing_exam_attempts enable row level security;
alter table public.writing_drafts enable row level security;
revoke all on public.writing_pathway_progress, public.writing_activity_attempts,
  public.writing_exam_attempts, public.writing_drafts from public, anon, authenticated;
grant select on public.writing_pathway_progress, public.writing_activity_attempts,
  public.writing_exam_attempts, public.writing_drafts to authenticated;

create policy writing_progress_read on public.writing_pathway_progress for select to authenticated
  using (private.writing_can_read(student_id, true));
create policy writing_attempt_read on public.writing_activity_attempts for select to authenticated
  using (private.writing_can_read(student_id, completed_at is not null));
create policy writing_exam_read on public.writing_exam_attempts for select to authenticated
  using (private.writing_can_read(student_id, submitted_at is not null));
create policy writing_draft_read on public.writing_drafts for select to authenticated
  using (private.writing_can_read(student_id, false));

-- Legacy callers retain their original three insert columns and report policy.
-- The structured columns deliberately have no client write grant.

create function private.save_writing_draft(
  draft_id uuid, request_id uuid, expected_revision integer,
  genre text, task_key text, task_rev integer, context_key text,
  state jsonb, response_text text, first_response text
) returns public.writing_drafts
language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved public.writing_drafts;
begin
  if private.writing_ready_role() is distinct from 'student'::public.user_role then
    raise exception using errcode='42501', message='Writing draft access denied';
  end if;
  if draft_id is null or request_id is null or expected_revision is null or expected_revision < 0
     or context_key is null or context_key not in ('studio','workshop','gold')
     or state is null or jsonb_typeof(state) <> 'object'
     or not (state @> '{"version":1}') or octet_length(state::text) > 262144
     or exists (
       select 1 from jsonb_each(case when jsonb_typeof(state) = 'object' then state else '{}' end) e
       where case
         when e.key = 'version' then false
         when e.key = 'checklist' then jsonb_typeof(e.value) <> 'array'
         when e.key in ('observations','annotations','objective','gold','apply','master','planning','reflections')
           then jsonb_typeof(e.value) <> 'object'
         else true
       end
     )
     or response_text is null or first_response is null then
    raise exception using errcode='22023', message='Invalid writing draft payload';
  end if;

  if expected_revision = 0 then
    insert into public.writing_drafts (id, student_id, app_key, task_id, task_version,
      draft_context, workspace_state, original_response, current_response, last_request_id)
    values (draft_id, owner_id, genre, task_key, task_rev, context_key,
      state, first_response, response_text, request_id)
    on conflict (id) do nothing returning * into saved;
    if found then return saved; end if;
  end if;

  select * into saved from public.writing_drafts d
  where d.id = draft_id and d.student_id = owner_id for update;
  if not found then
    if expected_revision = 0 then
      raise exception using errcode='P0001', message='writing_draft_conflict';
    end if;
    raise exception using errcode='P0002', message='Writing draft missing';
  end if;
  if (saved.app_key, saved.task_id, saved.task_version, saved.draft_context)
     is distinct from (genre, task_key, task_rev, context_key)
     or saved.activity_attempt_id is not null or saved.exam_attempt_id is not null then
    raise exception using errcode='22023', message='Writing draft identity mismatch';
  end if;
  if saved.last_request_id = request_id then
    if saved.revision_number = expected_revision + 1
       and saved.workspace_state = state and saved.current_response = response_text
       and saved.original_response = first_response then
      return saved;
    end if;
    raise exception using errcode='P0001', message='writing_draft_conflict';
  end if;
  if saved.revision_number <> expected_revision
     or (saved.original_response <> '' and saved.original_response <> first_response) then
    raise exception using errcode='P0001', message='writing_draft_conflict';
  end if;

  update public.writing_drafts d
  set workspace_state=state, current_response=response_text, original_response=first_response,
      revision_number=d.revision_number+1, last_request_id=request_id, updated_at=statement_timestamp()
  where d.id=draft_id returning * into saved;
  return saved;
end
$$;

-- Expose only the invoker wrapper through the Data API.
create function public.save_writing_draft(
  draft_id uuid, request_id uuid, expected_revision integer,
  genre text, task_key text, task_rev integer, context_key text,
  state jsonb, response_text text, first_response text
) returns public.writing_drafts
language sql security invoker set search_path = ''
as $$
  select private.save_writing_draft(draft_id, request_id, expected_revision,
    genre, task_key, task_rev, context_key, state, response_text, first_response)
$$;

revoke all on function private.save_writing_draft(uuid, uuid, integer, text, text, integer, text, jsonb, text, text),
  public.save_writing_draft(uuid, uuid, integer, text, text, integer, text, jsonb, text, text)
  from public, anon, authenticated;
grant execute on function private.save_writing_draft(uuid, uuid, integer, text, text, integer, text, jsonb, text, text),
  public.save_writing_draft(uuid, uuid, integer, text, text, integer, text, jsonb, text, text)
  to authenticated;

-- Working-record deletion cannot cascade into completed evidence.
grant delete on public.writing_drafts to authenticated;
create policy writing_draft_delete on public.writing_drafts for delete to authenticated
  using (student_id=(select auth.uid()) and (select private.writing_ready_role())='student'
    and exam_attempt_id is null and activity_attempt_id is null);
