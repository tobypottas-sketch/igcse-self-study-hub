begin;
insert into public.vocabulary_reward_catalog
 (reward_id,name,category,xp_price,description,icon,enabled)
values
 ('blockverse','Blockverse Theme','themes',2000,
  'Floating voxel islands, grass blocks and diamond light.','',true),
 ('voxel-master-frame','Voxel Master Frame','frames',800,
  'A portrait frame built from grass blocks, stone and diamond crystals.','',true),
 ('diamond-block-badge','Diamond Block Badge','badges',600,
  'A glowing diamond-block emblem.','',true),
 ('master-builder','Master Builder','titles',1200,
  'A crowned voxel castle title plate.','',true),
 ('pixel-burst','Pixel Burst','effects',1000,
  'Colourful pixel fragments burst and disperse around your avatar.','',true)
on conflict (reward_id) do nothing;

-- Fail atomically if a pre-existing row disagrees with the approved economy.
do $$
begin
  if exists (
    select 1
    from (values ('blockverse','themes',2000),('voxel-master-frame','frames',800),
      ('diamond-block-badge','badges',600),('master-builder','titles',1200),
      ('pixel-burst','effects',1000)) as expected(id,category,price)
    where not exists (
      select 1 from public.vocabulary_reward_catalog as catalog
      where catalog.reward_id=expected.id and catalog.category=expected.category
        and catalog.xp_price=expected.price and catalog.enabled
    )
  ) then
    raise exception 'Blockverse catalogue does not match the approved reward IDs, categories and prices';
  end if;
end $$;
commit;
