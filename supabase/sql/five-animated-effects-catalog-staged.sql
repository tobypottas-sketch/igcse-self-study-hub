-- Five original animated Effects — staged release, deliberately DISABLED.
-- Apply once PNGs and animation QA pass; enable after authenticated purchase/equip
-- verification. Original purchases, wallets, ownership and progress are untouched.
insert into public.vocabulary_reward_catalog
 (reward_id,name,category,xp_price,description,icon,enabled)
values
 ('forest-fireflies','Forest Fireflies','effects',900,
  'Soft golden-green fireflies drift around your avatar.','🌿',false),
 ('ocean-bubbles','Ocean Bubbles','effects',900,
  'Translucent ocean bubbles rise gently around your avatar.','🫧',false),
 ('sakura-petals','Falling Sakura Petals','effects',1000,
  'Delicate pink sakura petals float across your profile.','🌸',false),
 ('midnight-starlight','Midnight Starlight','effects',1000,
  'Twinkling midnight stars illuminate your avatar.','✨',false),
 ('rainbow-aura','Rainbow Aura','effects',1600,
  'A rare iridescent rainbow halo shimmers around your profile.','🌈',false)
on conflict (reward_id) do nothing;
-- One Effects equipment slot for all five. Do not create production ownership.
