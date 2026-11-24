begin;

alter table public.vocabulary_reward_catalog
  drop constraint vocabulary_reward_catalog_category_check,
  add constraint vocabulary_reward_catalog_category_check check (category in ('themes','frames','badges','titles','effects','avatars'));

alter table public.vocabulary_reward_owned
  drop constraint vocabulary_reward_owned_category_check,
  add constraint vocabulary_reward_owned_category_check check (category in ('themes','frames','badges','titles','effects','avatars'));

alter table public.vocabulary_reward_sandbox_owned
  drop constraint vocabulary_reward_sandbox_owned_category_check,
  add constraint vocabulary_reward_sandbox_owned_category_check check (category in ('themes','frames','badges','titles','effects','avatars'));

alter table public.vocabulary_reward_catalog
  drop constraint vocabulary_reward_catalog_xp_price_check,
  add constraint vocabulary_reward_catalog_xp_price_check
  check (xp_price between 1 and 100000 or (xp_price = 0 and category = 'avatars'));
alter table public.vocabulary_reward_purchases
  drop constraint vocabulary_reward_purchases_price_paid_check,
  add constraint vocabulary_reward_purchases_price_paid_check check (price_paid >= 0);
alter table public.vocabulary_reward_sandbox_owned
  drop constraint vocabulary_reward_sandbox_owned_price_paid_check,
  add constraint vocabulary_reward_sandbox_owned_price_paid_check
  check (price_paid > 0 or (price_paid = 0 and category = 'avatars'));

CREATE OR REPLACE FUNCTION public.unequip_vocabulary_reward(p_student_id uuid, p_category text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if p_student_id is null or p_category not in ('themes','frames','badges','titles','effects','avatars') then
  raise exception 'Invalid reward category';end if;
 if not exists(select 1 from public.profiles where id=p_student_id and role='student' and active=true)
 then raise exception 'Student account required';end if;
 perform 1 from public.vocabulary_reward_wallets where student_id=p_student_id for update;
 if not found then raise exception 'Wallet not available';end if;
 update public.vocabulary_reward_owned set equipped=false
 where student_id=p_student_id and category=p_category and equipped=true;
 return jsonb_build_object('status','unequipped','category',p_category);
end;$function$;

CREATE OR REPLACE FUNCTION public.unequip_vocabulary_sandbox_reward(p_student_id uuid, p_category text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if p_student_id is null or p_category not in ('themes','frames','badges','titles','effects','avatars')
 then raise exception 'Invalid reward category';end if;
 perform 1 from public.vocabulary_reward_sandbox_wallets
 where student_id=p_student_id and enabled=true for update;
 if not found then raise exception 'Sandbox unavailable';end if;
 update public.vocabulary_reward_sandbox_owned set equipped=false
 where student_id=p_student_id and category=p_category and equipped=true;
 return jsonb_build_object('status','unequipped','category',p_category);
end;$function$;

insert into public.vocabulary_reward_catalog (reward_id,name,category,xp_price,description,icon,enabled)
values
  ('avatar-classic-explorer','Classic Explorer','avatars',0,'Keep a map handy for the next adventure.','',true),
  ('avatar-study-hero','Study Hero','avatars',0,'Bring a little magic to study time.','',true),
  ('avatar-pixel-bot','Pixel Bot','avatars',0,'A pocket-sized robot with a thumbs-up.','',true),
  ('avatar-pocket-dragon','Pocket Dragon','avatars',0,'A fiery friend with a curious streak.','',true),
  ('avatar-forest-ranger','Forest Ranger','avatars',1200,'Follow the trail deep into the woods.','',true),
  ('avatar-woodland-guardian','Woodland Guardian','avatars',1200,'Wear a crown of leaves and wildflowers.','',true),
  ('avatar-shadow-fox','Shadow Fox','avatars',1200,'Slip between the trees on quiet paws.','',true),
  ('avatar-ocean-voyager','Ocean Voyager','avatars',1200,'Chase the horizon in a sea-blue coat.','',true),
  ('avatar-ocean-navigator','Ocean Navigator','avatars',1200,'Chart a course past the harbour lights.','',true),
  ('avatar-aqua-shark','Aqua Shark','avatars',1200,'Dive in with gold goggles and a grin.','',true),
  ('avatar-blossom-wanderer','Blossom Wanderer','avatars',1200,'Take the long way through falling petals.','',true),
  ('avatar-sakura-spirit','Sakura Spirit','avatars',1200,'Carry spring blossoms wherever you go.','',true),
  ('avatar-sakura-kitsune','Sakura Kitsune','avatars',1200,'A fox spirit with a crown of pink petals.','',true),
  ('avatar-night-scholar','Night Scholar','avatars',1200,'Read by the light of the stars.','',true),
  ('avatar-lunar-mage','Lunar Mage','avatars',1200,'Draw your power from the crescent moon.','',true),
  ('avatar-phantom-cat','Phantom Cat','avatars',1200,'A watchful cat with a moonlit gaze.','',true),
  ('avatar-cyber-hacker','Cyber Hacker','avatars',1200,'Keep a low profile under the neon lights.','',true),
  ('avatar-neon-runner','Neon Runner','avatars',1200,'Race through the city after dark.','',true),
  ('avatar-cyber-mech','Cyber Mech','avatars',1200,'Power up in chrome and neon armour.','',true),
  ('avatar-star-seer','Star Seer','avatars',1200,'Read the skies in a star-lined cloak.','',true),
  ('avatar-astral-sorceress','Astral Sorceress','avatars',1200,'Channel a little starlight.','',true),
  ('avatar-cosmic-dragon','Cosmic Dragon','avatars',1200,'Glide through the stars on shimmering scales.','',true),
  ('avatar-wasteland-survivor','Wasteland Survivor','avatars',1200,'Gear up for the road beyond the ruins.','',true),
  ('avatar-dawn-pathfinder','Dawn Pathfinder','avatars',1200,'Find a route through the dust at sunrise.','',true),
  ('avatar-zombie-survivor','Zombie Survivor','avatars',1200,'Even the undead can join the team.','',true),
  ('avatar-voxel-adventurer','Voxel Adventurer','avatars',1200,'Pack a pickaxe and explore the blocklands.','',true),
  ('avatar-voxel-architect','Voxel Architect','avatars',1200,'Build your next big idea one block at a time.','',true),
  ('avatar-emerald-golem','Emerald Golem','avatars',1200,'Guard your build in glowing green armour.','',true);

commit;
