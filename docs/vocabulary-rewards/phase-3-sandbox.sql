-- Sandbox XP is deliberately separate from verified learning XP.
-- A sandbox account can buy cosmetics without changing real XP/levels.
create table if not exists public.vocabulary_reward_sandbox_wallets(
 student_id uuid primary key references public.profiles(id) on delete cascade,
 granted_xp bigint not null default 0 check(granted_xp>=0),
 spent_xp bigint not null default 0 check(spent_xp>=0 and spent_xp<=granted_xp),
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.vocabulary_reward_sandbox_wallets enable row level security;
revoke all on public.vocabulary_reward_sandbox_wallets from anon,authenticated;
grant select on public.vocabulary_reward_sandbox_wallets to authenticated;
create policy "rewards_sandbox_self_read" on public.vocabulary_reward_sandbox_wallets
 for select to authenticated using(student_id=(select auth.uid()));

-- Allow sandbox purchases for the one deliberately enabled sandbox wallet.
-- Global rewards remain disabled for the real economy; the existing real
-- purchase RPC and ordinary XP balances remain unchanged.
create or replace function public.redeem_vocabulary_sandbox_reward(p_student_id uuid,p_reward_id text)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare
 v_balance bigint; v_spent bigint; v_price integer; v_category text;
begin
 if not exists(select 1 from public.profiles where id=p_student_id and role='student' and active=true)
 then raise exception 'Student account required'; end if;
 select granted_xp,spent_xp into v_balance,v_spent
   from public.vocabulary_reward_sandbox_wallets
   where student_id=p_student_id and enabled=true for update;
 if not found then raise exception 'Sandbox account is not enabled'; end if;
 select xp_price,category into v_price,v_category from public.vocabulary_reward_catalog
   where reward_id=p_reward_id;
 if not found then raise exception 'Reward is unavailable'; end if;
 if exists(select 1 from public.vocabulary_reward_owned
   where student_id=p_student_id and reward_id=p_reward_id)
 then return jsonb_build_object('status','owned','balance',v_balance-v_spent); end if;
 if v_balance-v_spent < v_price then raise exception 'Not enough sandbox XP'; end if;
 -- A zero-real-XP wallet maintains the existing ownership foreign key
 -- while the separate sandbox ledger holds all simulated currency.
 insert into public.vocabulary_reward_owned(student_id,reward_id,category)
 values(p_student_id,p_reward_id,v_category);
 insert into public.vocabulary_reward_purchases(student_id,reward_id,price_paid)
 values(p_student_id,p_reward_id,v_price);
 update public.vocabulary_reward_sandbox_wallets set spent_xp=spent_xp+v_price,updated_at=now()
 where student_id=p_student_id;
 return jsonb_build_object('status','purchased','balance',v_balance-v_spent-v_price);
end $$;
revoke all on function public.redeem_vocabulary_sandbox_reward(uuid,text) from public,anon,authenticated;
grant execute on function public.redeem_vocabulary_sandbox_reward(uuid,text) to service_role;
