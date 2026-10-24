-- Read-only post-deploy checks for 20261024160000 (Sets) and 20261024170000 (Set membership). Changes nothing.
-- After 1600: 1-3 true. After 1700: ALL true. members_unit1 should be 210 for the current Unit 1 release (4+4+3+5+5 Sets of 10).
select
  to_regclass('public.vocabulary_pathway_sets') is not null                                                                   as "1_sets_table_exists",
  exists (select 1 from pg_trigger where tgname = 'vocabulary_missions_apply_set_progress')                                    as "2_settlement_trigger_exists",
  not has_table_privilege('authenticated', 'public.vocabulary_pathway_sets', 'update')                                         as "3_students_cannot_update_sets",
  to_regclass('public.vocabulary_set_members') is not null                                                                    as "4_members_table_exists",
  coalesce((select prosrc like '%targets_not_set_members%' from pg_proc where proname = 'vocabulary_set_apply_mission'), false) as "5_membership_check_installed",
  exists (select 1 from pg_trigger where tgname = 'vocabulary_pathway_sets_require_members')                                   as "6_set_requires_members_guard",
  not has_table_privilege('authenticated', 'public.vocabulary_set_members', 'insert')                                          as "7_students_cannot_write_members",
  (select count(*) from public.vocabulary_set_members where unit_number = 1)                                                   as "members_unit1 (expect 210)",
  (select count(*) from (select 1 from public.vocabulary_set_members group by unit_number, pathway_id, set_number having count(*) <> 10) x) as "sets_without_ten_members (expect 0)";
