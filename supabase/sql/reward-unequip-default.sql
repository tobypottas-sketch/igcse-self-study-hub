-- Remove only the equipped cosmetic in one category; inventory and XP never change.
-- Both procedures are service-role only. The Edge functions derive student IDs
-- from verified JWTs and must never accept a client-supplied student ID.
create or replace function public.unequip_vocabulary_reward(p_student_id uuid,p_category text)
returns jsonb language plpgsql set search_path='' as $fn$
begin
 if p_student_id is null or p_category not in ('themes','frames','titles','effects') then
  raise exception 'Invalid reward category';end if;
 if not exists(select 1 from public.profiles where id=p_student_id and role='student' and active=true)
 then raise exception 'Student account required';end if;
 perform 1 from public.vocabulary_reward_wallets where student_id=p_student_id for update;
 if not found then raise exception 'Wallet not available';end if;
 update public.vocabulary_reward_owned set equipped=false
 where student_id=p_student_id and category=p_category and equipped=true;
 return jsonb_build_object('status','unequipped','category',p_category);
end;$fn$;
revoke all on function public.unequip_vocabulary_reward(uuid,text) from public,anon,authenticated;
grant execute on function public.unequip_vocabulary_reward(uuid,text) to service_role;

create or replace function public.unequip_vocabulary_sandbox_reward(p_student_id uuid,p_category text)
returns jsonb language plpgsql set search_path='' as $fn$
begin
 if p_student_id is null or p_category not in ('themes','frames','titles','effects')
 then raise exception 'Invalid reward category';end if;
 perform 1 from public.vocabulary_reward_sandbox_wallets
 where student_id=p_student_id and enabled=true for update;
 if not found then raise exception 'Sandbox unavailable';end if;
 update public.vocabulary_reward_sandbox_owned set equipped=false
 where student_id=p_student_id and category=p_category and equipped=true;
 return jsonb_build_object('status','unequipped','category',p_category);
end;$fn$;
revoke all on function public.unequip_vocabulary_sandbox_reward(uuid,text) from public,anon,authenticated;
grant execute on function public.unequip_vocabulary_sandbox_reward(uuid,text) to service_role;
