-- Test-only: replaces the seeded Unit 1 membership with synthetic members so scenarios can use short ids.
-- Set 1 = u1_t1..u1_t10, Set 2 = u1_t11..u1_t20, for every pathway. Never applied outside the throwaway local database.
delete from public.vocabulary_set_members;
insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id)
select 1, p, s, i, 'u1_t' || ((s - 1) * 10 + i)
from unnest(array['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']) p, generate_series(1,2) s, generate_series(1,10) i;
