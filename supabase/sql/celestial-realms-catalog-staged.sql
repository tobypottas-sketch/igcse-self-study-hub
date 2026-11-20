-- Celestial Realms — five premium cosmetics, deliberately DISABLED.
-- Apply only after PNG assets, browser previews and sandbox purchase/equip QA
-- have passed. No student balance, purchase, equipment or activity mutation.
insert into public.vocabulary_reward_catalog
 (reward_id,name,category,xp_price,description,icon,enabled)
values
 ('celestial-realms','Celestial Realms Theme','themes',2500,
  'Explore floating palaces, luminous skies and a magical celestial landscape.','🌌',false),
 ('astral-halo-frame','Astral Halo Frame','frames',1200,
  'A gilded cosmic portrait frame with moonlight and lavender clouds.','🌙',false),
 ('starseer-emblem','Starseer Emblem','badges',800,
  'A radiant moon-and-star insignia with golden wings.','⭐',false),
 ('sky-wanderer','Sky Wanderer','titles',1000,
  'Your celestial explorer title, framed by constellations and starlight.','✨',false),
 ('stardust-trail','Stardust Trail','effects',1500,
  'A swirling ring of violet and golden stardust around your avatar.','💫',false)
on conflict (reward_id) do nothing;
-- This is not a bundle-sale implementation. The concept image included a
-- decorative 12,000-XP bundle CTA; the live shop currently offers individual
-- verified purchases only. No items are automatically enabled.
