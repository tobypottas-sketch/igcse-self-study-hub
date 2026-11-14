-- Isolated, opt-in vocabulary diagnostic pilot storage.
-- Does NOT enrol anyone, alter vocabulary mastery, or expose keyed items.
-- Apply only with the matching controlled API and security checks.
create table if not exists private.vocabulary_diagnostic_items (
  item_id text not null,
  version integer not null check (version > 0),
  form_family text not null,
  level_hypothesis text not null check (level_hypothesis in ('A1','A2','B1','B2','C1')),
  lemma text not null,
  tested_sense text not null,
  stem text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_option_id text not null check (correct_option_id in ('A','B','C','D')),
  authoring jsonb not null default '{}'::jsonb,
  review_status text not null default 'draft' check (review_status in ('draft','language_reviewed','assessment_reviewed','pilot','approved','retired')),
  created_at timestamptz not null default now(),
  primary key (item_id, version)
);

create table if not exists private.vocabulary_diagnostic_forms (
  id uuid primary key default gen_random_uuid(),
  form_code text not null unique,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft','pilot','approved','retired')),
  item_bank_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists private.vocabulary_diagnostic_form_items (
  form_id uuid not null references private.vocabulary_diagnostic_forms(id) on delete restrict,
  position integer not null check (position > 0),
  item_id text not null,
  item_version integer not null,
  option_order text[] not null check (cardinality(option_order) = 4),
  primary key (form_id, position),
  unique (form_id, item_id, item_version),
  foreign key (item_id,item_version) references private.vocabulary_diagnostic_items(item_id,version) on delete restrict
);

create table if not exists private.vocabulary_diagnostic_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  form_id uuid not null references private.vocabulary_diagnostic_forms(id) on delete restrict,
  kind text not null check (kind in ('baseline','follow_up','teacher_retake')),
  available_at timestamptz not null default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > available_at)
);

create table if not exists private.vocabulary_diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references private.vocabulary_diagnostic_assignments(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  form_id uuid not null references private.vocabulary_diagnostic_forms(id) on delete restrict,
  kind text not null check (kind in ('baseline','follow_up','teacher_retake')),
  state text not null default 'in_progress' check (state in ('in_progress','interrupted','completed','expired','void')),
  next_position integer not null default 1 check (next_position > 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score_model_version text not null default 'pilot-uncalibrated-v1'
);
create unique index if not exists vocab_diag_one_open_per_student
  on private.vocabulary_diagnostic_sessions(student_id)
  where state in ('in_progress','interrupted');
create index if not exists vocab_diag_session_student_idx
  on private.vocabulary_diagnostic_sessions(student_id, started_at desc);

create table if not exists private.vocabulary_diagnostic_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references private.vocabulary_diagnostic_sessions(id) on delete restrict,
  position integer not null check (position > 0),
  item_id text not null,
  item_version integer not null,
  answer_id text not null check (answer_id in ('A','B','C','D','unknown')),
  correct boolean not null,
  request_id uuid not null,
  request_hash text not null,
  submitted_at timestamptz not null default now(),
  unique (session_id, position),
  unique (session_id, item_id, item_version),
  unique (session_id, request_id),
  foreign key (item_id,item_version) references private.vocabulary_diagnostic_items(item_id,version)
);
create index if not exists vocab_diag_response_session_idx
  on private.vocabulary_diagnostic_responses(session_id);

create table if not exists private.vocabulary_diagnostic_results (
  session_id uuid primary key references private.vocabulary_diagnostic_sessions(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  score_status text not null default 'uncalibrated' check(score_status = 'uncalibrated'),
  level_estimate text check(level_estimate is null),
  total integer not null check(total>=0),
  correct integer not null check(correct>=0),
  unknown integer not null check(unknown>=0),
  band_coverage jsonb not null default '{}'::jsonb,
  form_version integer not null,
  item_bank_version text not null,
  model_version text not null,
  completed_at timestamptz not null default now()
);

-- Diagnostic data is backend-only. Do not grant authenticated direct access,
-- and do not expose private schema through PostgREST.
revoke all on private.vocabulary_diagnostic_items,
 private.vocabulary_diagnostic_forms,
 private.vocabulary_diagnostic_form_items,
 private.vocabulary_diagnostic_assignments,
 private.vocabulary_diagnostic_sessions,
 private.vocabulary_diagnostic_responses,
 private.vocabulary_diagnostic_results from public, anon, authenticated;
alter table private.vocabulary_diagnostic_items enable row level security;
alter table private.vocabulary_diagnostic_forms enable row level security;
alter table private.vocabulary_diagnostic_form_items enable row level security;
alter table private.vocabulary_diagnostic_assignments enable row level security;
alter table private.vocabulary_diagnostic_sessions enable row level security;
alter table private.vocabulary_diagnostic_responses enable row level security;
alter table private.vocabulary_diagnostic_results enable row level security;

comment on table private.vocabulary_diagnostic_items is
 'Backend-only keyed diagnostic content. Never publish through Pages or Data API.';
comment on table private.vocabulary_diagnostic_results is
 'Pilot results cannot contain a CEFR level until a separate calibrated schema migration.';
