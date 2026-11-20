-- Four original-theme premium badges: stage disabled, no purchases or XP changes.
-- Apply only after the original PNG artwork is deployed and all QA passes.
insert into public.vocabulary_reward_catalog
 (reward_id,name,category,xp_price,description,icon,enabled)
values
 ('forest-guardian-badge','Forest Guardian Badge','badges',500,
  'An emerald forest guardian crest with golden stag antlers and enchanted leaves.','🌿',false),
 ('ocean-explorer-badge','Ocean Explorer Badge','badges',500,
  'A sapphire ocean crest with golden trident, crashing waves and a luminous pearl.','🌊',false),
 ('sakura-spirit-badge','Sakura Spirit Badge','badges',500,
  'A magical pink fox spirit surrounded by glowing cherry blossoms and gold.','🌸',false),
 ('midnight-scholar-badge','Midnight Scholar Badge','badges',500,
  'A wise midnight owl with moonlit stars, a scholar cap and a glowing book.','🌙',false)
on conflict (reward_id) do nothing;
-- Four distinct badges share ONE Badge equipment slot. Themes remain independent.
-- The catalogue must not be enabled until artwork, purchase/equip and rollback QA pass.
