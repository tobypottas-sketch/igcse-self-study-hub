-- Expand the original pilot constraint to include the tenth published unit.
alter table public.vocabulary_battles drop constraint if exists vocabulary_battles_unit_number_check;
alter table public.vocabulary_battles add constraint vocabulary_battles_unit_number_check check (unit_number between 1 and 10);
