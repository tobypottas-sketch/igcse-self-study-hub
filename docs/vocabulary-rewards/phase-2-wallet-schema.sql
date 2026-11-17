-- Vocabulary Rewards Shop — Phase 2 (NOT APPLIED; release-flagged OFF).
-- All XP funding must come from a trusted server-side computation of the existing
-- lifetime XP rules. Never accept student-supplied XP or let clients update balances.
-- For review before execution: tables/RPCs are isolated and do not change missions,
-- mastery, scores, merits, profiles, or the existing XP level calculation.

create table if not exists public.vocabulary_reward_catalog (
  reward_id text primary key check (reward_id ~ '^[a-z0-9-]{2,50}$'),
  name text not null,
  category text not null check (category in ('themes','frames','titles','effects')),
  xp_price integer not null check (xp_price > 0 and xp_price <= 100000),
  description text not null,
  icon text not null,
  enabled boolean not null default false
);

create table if not exists public.vocabulary_reward_wallets (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  verified_earned_xp bigint not null default 0 check (verified_earned_xp >= 0),
  spent_xp bigint not null default 0 check (spent_xp >= 0 and spent_xp <= verified_earned_xp),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocabulary_reward_owned (
  student_id uuid not null references public.vocabulary_reward_wallets(student_id) on delete cascade,
  reward_id text not null references public.vocabulary_reward_catalog(reward_id),
  category text not null check (category in ('themes','frames','titles','effects')),
  acquired_at timestamptz not null default now(),
  equipped boolean not null default false,
  primary key (student_id,reward_id)
);

create unique index if not exists vocabulary_reward_single_equipped_category
  on public.vocabulary_reward_owned(student_id,category) where equipped;

create table if not exists public.vocabulary_reward_purchases (
  student_id uuid not null references public.vocabulary_reward_wallets(student_id) on delete cascade,
  reward_id text not null references public.vocabulary_reward_catalog(reward_id),
  price_paid integer not null check (price_paid > 0),
  purchased_at timestamptz not null default now(),
  primary key (student_id,reward_id)
);

alter table public.vocabulary_reward_catalog enable row level security;
alter table public.vocabulary_reward_wallets enable row level security;
alter table public.vocabulary_reward_owned enable row level security;
alter table public.vocabulary_reward_purchases enable row level security;

-- Client grants are explicitly read-only. There are no client-side INSERT,
-- UPDATE or DELETE grants or policies, including for wallets and purchases.
revoke all on public.vocabulary_reward_catalog, public.vocabulary_reward_wallets,
  public.vocabulary_reward_owned, public.vocabulary_reward_purchases from anon,authenticated;
grant select on public.vocabulary_reward_catalog, public.vocabulary_reward_wallets,
  public.vocabulary_reward_owned, public.vocabulary_reward_purchases to authenticated;

create policy "rewards_catalog_student_read"
  on public.vocabulary_reward_catalog for select to authenticated using (true);
create policy "rewards_wallet_self_read"
  on public.vocabulary_reward_wallets for select to authenticated
  using (student_id=(select auth.uid()));
create policy "rewards_owned_self_read"
  on public.vocabulary_reward_owned for select to authenticated
  using (student_id=(select auth.uid()));
create policy "rewards_purchases_self_read"
  on public.vocabulary_reward_purchases for select to authenticated
  using (student_id=(select auth.uid()));

-- The database catalogue owns the price. Every reward starts disabled.
insert into public.vocabulary_reward_catalog
 (reward_id,name,category,xp_price,description,icon,enabled) values
 ('midnight','Midnight Theme','themes',600,'A calmer dark theme for focused study.','🌙',false),
 ('forest','Forest Theme','themes',600,'A fresh, nature-inspired look.','🌿',false),
 ('sakura','Sakura Theme','themes',900,'A soft pink springtime palette.','🌸',false),
 ('ocean','Ocean Theme','themes',900,'Cool blue shades for your workspace.','🌊',false),
 ('gold-frame','Golden Frame','frames',800,'A golden border for your profile.','🏅',false),
 ('aurora-frame','Aurora Frame','frames',1800,'A luminous, colourful profile frame.','💠',false),
 ('scholar-frame','Scholar Frame','frames',1200,'An elegant academic profile border.','📚',false),
 ('word-wizard','Word Wizard','titles',1000,'A title for dedicated vocabulary learners.','🧙',false),
 ('word-explorer','Word Explorer','titles',350,'Celebrate your curiosity about words.','🧭',false),
 ('language-ace','Language Ace','titles',1600,'For students reaching new heights.','🏆',false),
 ('pixel-badge','Pixel Badge','effects',400,'Retro-style decoration for your profile.','✨',false),
 ('sparkle','Sparkle Effect','effects',1100,'A gentle sparkle around your avatar.','⭐',false)
on conflict (reward_id) do nothing;

-- Purchases are deliberately unavailable until verified XP funding is ready.
-- Even if called with a forged price or by a different user, the RPC uses
-- auth.uid() and the server-side reward catalogue and locks the student's wallet.
create or replace function public.redeem_vocabulary_reward(p_reward_id text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
  v_student uuid := auth.uid();
  v_price integer;
  v_category text;
  v_earned bigint;
  v_spent bigint;
begin
  if v_student is null or not exists (
    select 1 from public.profiles where id=v_student and role='student' and active=true
  ) then raise exception 'Student account required'; end if;

  select xp_price,category into v_price,v_category
    from public.vocabulary_reward_catalog
    where reward_id=p_reward_id and enabled=true;
  if not found then raise exception 'Reward is not available'; end if;

  select verified_earned_xp,spent_xp into v_earned,v_spent
    from public.vocabulary_reward_wallets where student_id=v_student for update;
  if not found then raise exception 'Verified XP wallet not available'; end if;
  if exists(select 1 from public.vocabulary_reward_owned
            where student_id=v_student and reward_id=p_reward_id) then
    return jsonb_build_object('status','owned','balance',v_earned-v_spent);
  end if;
  if v_earned-v_spent < v_price then raise exception 'Not enough available XP'; end if;

  insert into public.vocabulary_reward_owned(student_id,reward_id,category)
    values(v_student,p_reward_id,v_category);
  insert into public.vocabulary_reward_purchases(student_id,reward_id,price_paid)
    values(v_student,p_reward_id,v_price);
  update public.vocabulary_reward_wallets
    set spent_xp=spent_xp+v_price,updated_at=now() where student_id=v_student;
  return jsonb_build_object('status','purchased','balance',v_earned-v_spent-v_price);
end $$;

create or replace function public.equip_vocabulary_reward(p_reward_id text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
  v_student uuid := auth.uid();
  v_category text;
begin
  if v_student is null or not exists (
    select 1 from public.profiles where id=v_student and role='student' and active=true
  ) then raise exception 'Student account required'; end if;
  -- Serialise equip/purchase writes per student, even across devices.
  perform 1 from public.vocabulary_reward_wallets where student_id=v_student for update;
  if not found then raise exception 'Wallet not available'; end if;
  select category into v_category from public.vocabulary_reward_owned
    where student_id=v_student and reward_id=p_reward_id;
  if not found then raise exception 'Reward is not owned'; end if;
  update public.vocabulary_reward_owned set equipped=false
    where student_id=v_student and category=v_category and equipped=true;
  update public.vocabulary_reward_owned set equipped=true
    where student_id=v_student and reward_id=p_reward_id;
  return jsonb_build_object('status','equipped','rewardId',p_reward_id);
end $$;

revoke all on function public.redeem_vocabulary_reward(text) from public,anon,authenticated;
revoke all on function public.equip_vocabulary_reward(text) from public,anon,authenticated;
grant execute on function public.redeem_vocabulary_reward(text) to authenticated;
grant execute on function public.equip_vocabulary_reward(text) to authenticated;

-- RELEASE BLOCKERS (do NOT bypass):
-- 1. Implement a trusted, auditable source of verified_earned_xp that exactly
--    matches computeXp() including mission caps and milestone bonuses.
-- 2. Review concurrency, repeated purchase and RLS tests with authenticated roles.
-- 3. Enable catalogue rows only after the student UI is ready to read real balances.
