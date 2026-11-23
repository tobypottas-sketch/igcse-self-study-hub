-- Vocabulary Battles v1: private server-owned challenge ledger.
-- No client direct access: only a validated authenticated Edge Function
-- may read or write battle rows. No XP/mastery or reward currency coupling.
create table if not exists public.vocabulary_battles (
 id uuid primary key default gen_random_uuid(),
 class_id uuid not null references public.classes(id),
 challenger_id uuid not null references public.profiles(id),
 opponent_id uuid not null references public.profiles(id),
 unit_number smallint not null default 1 check(unit_number between 1 and 9),
 status text not null default 'pending' check(status in ('pending','accepted','declined','cancelled')),
 question_ids jsonb not null default '[]'::jsonb,
 challenger_answers jsonb not null default '[]'::jsonb,
 opponent_answers jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '10 minutes'),
 challenger_ready_at timestamptz,
 opponent_ready_at timestamptz,
 starts_at timestamptz,
 ends_at timestamptz,
 constraint battle_different_students check(challenger_id<>opponent_id),
 constraint battle_questions_array check(jsonb_typeof(question_ids)='array'),
 constraint battle_challenger_answers_array check(jsonb_typeof(challenger_answers)='array'),
 constraint battle_opponent_answers_array check(jsonb_typeof(opponent_answers)='array')
);
create index if not exists vocabulary_battles_challenger_created on public.vocabulary_battles(challenger_id,created_at desc);
create index if not exists vocabulary_battles_opponent_created on public.vocabulary_battles(opponent_id,created_at desc);
create index if not exists vocabulary_battles_class_created on public.vocabulary_battles(class_id,created_at desc);
alter table public.vocabulary_battles enable row level security;
revoke all on table public.vocabulary_battles from public, anon, authenticated;
grant select,insert,update,delete on table public.vocabulary_battles to service_role;
comment on table public.vocabulary_battles is 'Private classmate challenges; only Edge Functions can access; no XP or learning mastery updates';
