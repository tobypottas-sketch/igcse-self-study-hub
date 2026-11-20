-- Pixel Badge category correction: the artwork is a BADGE, not an animated effect.
-- Transactional DML only. Preserve reward_id, original 400 XP price, every
-- ownership/acquisition record, price_paid, purchase history and wallet.
-- If a student has another Badge equipped, keep that Badge equipped and
-- move Pixel Badge as owned but unequipped; otherwise preserve equipped Pixel.
begin;
do $guard$
begin
  if not exists (select 1 from public.vocabulary_reward_catalog
                 where reward_id='pixel-badge' and category in ('effects','badges') and xp_price=400)
  then raise exception 'Pixel Badge catalog unexpectedly changed; migration aborted'; end if;
end $guard$;

-- Resolve any future overlap before entering the Badge category to satisfy
-- the per-student one-equipped-per-category partial unique indexes.
update public.vocabulary_reward_owned as pixel
   set equipped=false
 where pixel.reward_id='pixel-badge' and pixel.equipped=true
   and exists (select 1 from public.vocabulary_reward_owned as other
               where other.student_id=pixel.student_id and other.category='badges'
                 and other.equipped=true and other.reward_id<>'pixel-badge');

update public.vocabulary_reward_sandbox_owned as pixel
   set equipped=false
 where pixel.reward_id='pixel-badge' and pixel.equipped=true
   and exists (select 1 from public.vocabulary_reward_sandbox_owned as other
               where other.student_id=pixel.student_id and other.category='badges'
                 and other.equipped=true and other.reward_id<>'pixel-badge');

update public.vocabulary_reward_catalog
   set category='badges',description='A retro pixel-art emblem for your profile.'
 where reward_id='pixel-badge';

update public.vocabulary_reward_owned
   set category='badges'
 where reward_id='pixel-badge' and category='effects';

update public.vocabulary_reward_sandbox_owned
   set category='badges'
 where reward_id='pixel-badge' and category='effects';

do $verify$
begin
 if (select category from public.vocabulary_reward_catalog where reward_id='pixel-badge') <> 'badges'
    or exists(select 1 from public.vocabulary_reward_owned where reward_id='pixel-badge' and category<>'badges')
    or exists(select 1 from public.vocabulary_reward_sandbox_owned where reward_id='pixel-badge' and category<>'badges')
 then raise exception 'Pixel Badge category inconsistent: rollback'; end if;
end $verify$;
commit;
