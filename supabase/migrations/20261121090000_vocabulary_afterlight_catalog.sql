-- Release with Afterlight's frontend after approval. The five-slot catalogue
-- and ownership constraints are already used by the existing badge rewards.
begin;
insert into public.vocabulary_reward_catalog as catalog
 (reward_id,name,category,xp_price,description,icon,enabled)
values
 ('afterlight','Afterlight Theme','themes',2200,
  'An abandoned city reclaimed by vines and warm evening light.','',true),
 ('survivor-frame','Survivor Frame','frames',800,
  'A weathered steel portrait frame wrapped in vines.','',true),
 ('last-explorer-badge','Last Explorer Badge','badges',600,
  'A trail insignia for explorers of the reclaimed city.','',true),
 ('the-pathfinder','The Pathfinder','titles',1200,
  'A weathered title plate for a student who finds a way through.','',true),
 ('golden-sunrays','Golden Sunrays','effects',1400,
  'Slanting afternoon sunlight and drifting dust surround your avatar.','',true)
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  name = excluded.name,
  description = excluded.description
where catalog.category = excluded.category and catalog.xp_price = excluded.xp_price;

-- Fail atomically if a pre-existing row disagrees with the approved economy.
do $$
begin
  if exists (
    select 1
    from (values ('afterlight','themes',2200),('survivor-frame','frames',800),
      ('last-explorer-badge','badges',600),('the-pathfinder','titles',1200),
      ('golden-sunrays','effects',1400)) as expected(id,category,price)
    where not exists (
      select 1 from public.vocabulary_reward_catalog as catalog
      where catalog.reward_id=expected.id and catalog.category=expected.category
        and catalog.xp_price=expected.price and catalog.enabled
    )
  ) then
    raise exception 'Afterlight catalogue does not match the approved reward IDs, categories and prices';
  end if;
end $$;
commit;
