-- Isolated Rewards Shop sandbox; never credits verified learning XP.
-- Designed for explicitly designated test accounts only.
create table if not exists public.vocabulary_reward_sandbox_wallets(
 student_id uuid primary key references public.profiles(id) on delete cascade,
 granted_xp bigint not null default 0 check(granted_xp >= 0),
 spent_xp bigint not null default 0 check(spent_xp >= 0 and spent_xp <= granted_xp),
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.vocabulary_reward_sandbox_owned(
 student_id uuid not null references public.vocabulary_reward_sandbox_wallets(student_id) on delete cascade,
 reward_id text not null references public.vocabulary_reward_catalog(reward_id),
 category text not null check(category in ('themes','frames','titles','effects')),
 price_paid integer not null check(price_paid>0),
 acquired_at timestamptz not null default now(),
 equipped boolean not null default false,
 primary key(student_id,reward_id)
);
create unique index if not exists vocabulary_sandbox_single_equipped
 on public.vocabulary_reward_sandbox_owned(student_id,category) where equipped;
create index if not exists vocabulary_sandbox_owned_reward_idx
 on public.vocabulary_reward_sandbox_owned(reward_id);

alter table public.vocabulary_reward_sandbox_wallets enable row level security;
alter table public.vocabulary_reward_sandbox_owned enable row level security;
revoke all on public.vocabulary_reward_sandbox_wallets,public.vocabulary_reward_sandbox_owned from anon,authenticated;
grant select on public.vocabulary_reward_sandbox_wallets,public.vocabulary_reward_sandbox_owned to authenticated;
create policy "sandbox_wallet_self_read" on public.vocabulary_reward_sandbox_wallets
 for select to authenticated using(student_id=(select auth.uid()));
create policy "sandbox_owned_self_read" on public.vocabulary_reward_sandbox_owned
 for select to authenticated using(student_id=(select auth.uid()));

-- Service role calls these only AFTER verifying the student JWT in Edge.
-- Row locking serialises purchases and equipment across devices.
create or replace function public.redeem_vocabulary_sandbox_reward(p_student_id uuid,p_reward_id text)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare
 v_balance bigint;v_spent bigint;v_price integer;v_category text;
begin
 if not exists(select 1 from public.profiles where id=p_student_id and role='student' and active=true)
 then raise exception 'Student account required'; end if;
 select granted_xp,spent_xp into v_balance,v_spent
 from public.vocabulary_reward_sandbox_wallets where student_id=p_student_id and enabled=true for update;
 if not found then raise exception 'Sandbox unavailable'; end if;
 select xp_price,category into v_price,v_category from public.vocabulary_reward_catalog
 where reward_id=p_reward_id;
 if not found then raise exception 'Reward unavailable'; end if;
 if exists(select 1 from public.vocabulary_reward_sandbox_owned
 where student_id=p_student_id and reward_id=p_reward_id)
 then return jsonb_build_object('status','owned','balance',v_balance-v_spent); end if;
 if v_balance-v_spent < v_price then raise exception 'Insufficient sandbox XP'; end if;
 insert into public.vocabulary_reward_sandbox_owned(student_id,reward_id,category,price_paid)
 values(p_student_id,p_reward_id,v_category,v_price);
 update public.vocabulary_reward_sandbox_wallets
 set spent_xp=spent_xp+v_price,updated_at=now() where student_id=p_student_id;
 return jsonb_build_object('status','purchased','balance',v_balance-v_spent-v_price);
end $$;

create or replace function public.equip_vocabulary_sandbox_reward(p_student_id uuid,p_reward_id text)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare v_category text;
begin
 perform 1 from public.vocabulary_reward_sandbox_wallets
 where student_id=p_student_id and enabled=true for update;
 if not found then raise exception 'Sandbox unavailable'; end if;
 select category into v_category from public.vocabulary_reward_sandbox_owned
 where student_id=p_student_id and reward_id=p_reward_id;
 if not found then raise exception 'Reward not owned'; end if;
 update public.vocabulary_reward_sandbox_owned set equipped=false
 where student_id=p_student_id and category=v_category and equipped;
 update public.vocabulary_reward_sandbox_owned set equipped=true
 where student_id=p_student_id and reward_id=p_reward_id;
 return jsonb_build_object('status','equipped','rewardId',p_reward_id);
end $$;
revoke all on function public.redeem_vocabulary_sandbox_reward(uuid,text) from public,anon,authenticated;
revoke all on function public.equip_vocabulary_sandbox_reward(uuid,text) from public,anon,authenticated;
grant execute on function public.redeem_vocabulary_sandbox_reward(uuid,text) to service_role;
grant execute on function public.equip_vocabulary_sandbox_reward(uuid,text) to service_role;
