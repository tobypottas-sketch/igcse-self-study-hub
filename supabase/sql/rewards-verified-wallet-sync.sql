-- Production Rewards Shop: verified wallet synchronisation, not XP calculation.
-- MUST be called only by a trusted Edge Function after computing canonical XP
-- from server-held missions and mastery. Never accept browser-supplied XP.
-- This migration performs no student wallet inserts or updates by itself.
create or replace function public.sync_verified_vocabulary_reward_wallet(
  p_student_id uuid,
  p_verified_earned_xp bigint
) returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_current bigint;
  v_spent bigint;
begin
  if p_student_id is null or p_verified_earned_xp is null
     or p_verified_earned_xp < 0
     or not exists (
       select 1 from public.profiles
       where id = p_student_id and role = 'student' and active = true
     )
  then
    raise exception 'Invalid student or verified XP';
  end if;

  -- Create the first wallet safely. An insert race is resolved by the
  -- primary-key conflict, and all subsequent checks lock the same wallet.
  insert into public.vocabulary_reward_wallets(
    student_id, verified_earned_xp, spent_xp
  )
  values (p_student_id, 0, 0)
  on conflict (student_id) do nothing;

  select verified_earned_xp, spent_xp into v_current, v_spent
  from public.vocabulary_reward_wallets
  where student_id = p_student_id
  for update;

  if not found then raise exception 'Wallet not available'; end if;
  if p_verified_earned_xp < v_spent then
    raise exception 'Verified XP is below already spent XP';
  end if;
  if p_verified_earned_xp < v_current then
    raise exception 'Verified XP regression requires investigation';
  end if;

  -- Exactly the canonical cumulative XP, never a delta. Rerunning this
  -- after retries or reconnects cannot double-credit a wallet.
  update public.vocabulary_reward_wallets
    set verified_earned_xp = p_verified_earned_xp,
        updated_at = now()
  where student_id = p_student_id
    and verified_earned_xp <= p_verified_earned_xp;

  return jsonb_build_object(
    'status', case when p_verified_earned_xp = v_current
                   then 'unchanged' else 'synchronised' end,
    'verifiedEarned', p_verified_earned_xp,
    'spent', v_spent,
    'available', p_verified_earned_xp - v_spent
  );
end;
$function$;

revoke all on function public.sync_verified_vocabulary_reward_wallet(uuid,bigint)
  from public, anon, authenticated;
grant execute on function public.sync_verified_vocabulary_reward_wallet(uuid,bigint)
  to service_role;
