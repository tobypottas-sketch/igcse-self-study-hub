-- Neon District collection, deliberately DISABLED until assets and five-slot
-- migration are deployed and verified. Do not run until prereqs complete.
-- Does not touch balances, purchases or ownership.
insert into public.vocabulary_reward_catalog
 (reward_id,name,category,xp_price,description,icon,enabled)
values
 ('neon-district','Neon District Theme','themes',2500,
  'Transform your learning workspace into a neon cyberpunk city.','🌃',false),
 ('cyber-pulse-frame','Cyber Pulse Frame','frames',1200,
  'A luminous cyan-and-magenta cybernetic profile frame.','💠',false),
 ('neon-hacker-badge','Neon Hacker Badge','badges',800,
  'A collectible holographic hacker emblem for your profile.','🛡️',false),
 ('cyber-legend','Cyber Legend','titles',1000,
  'A futuristic title for dedicated vocabulary explorers.','⚡',false),
 ('electric-pulse','Electric Pulse','effects',1600,
  'An electric energy aura for your avatar.','✨',false)
on conflict (reward_id) do nothing;
-- Release requires separate reviewed UPDATE enabled=true after artwork,
-- SQL category migration and sandbox/purchase/equip QA have passed.
