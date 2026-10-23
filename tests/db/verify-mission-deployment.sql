-- Read-only post-deploy checks for the mission-identity migrations. Run it AFTER 20261024120000 (the last column needs it); it changes nothing.
-- After 20261024120000: 1-4 true. After 20261024140000: ALL true. If `enforcement_installed` is false after 1400 was applied, 1200 was re-run
-- afterwards (it redefines the same functions): re-run 20261024140000.
select
  to_regclass('public.vocabulary_mission_starts') is not null                                              as "1_starts_table_exists",
  exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'start_vocabulary_mission') as "2_start_rpc_exists",
  exists (select 1 from information_schema.columns where table_name = 'vocabulary_missions' and column_name = 'outcome')                           as "3_outcome_column_exists",
  exists (select 1 from pg_trigger where tgname = 'vocabulary_missions_close_start')                                                               as "4_close_trigger_exists",
  coalesce((select prosrc like '%Mission was not issued by the server%' from pg_proc where proname = 'vocabulary_mission_derive_outcome'), false) as "enforcement_installed",
  coalesce((select prosrc like '%12 hours%' from pg_proc where proname = 'start_vocabulary_mission'), false)                                       as "stale_rule_installed",
  not has_function_privilege('anon', 'public.start_vocabulary_mission(integer,text,text,text,text,boolean)', 'execute')                            as "anon_cannot_start",
  (select count(*) from public.vocabulary_missions where outcome is null)                                                                          as "missions_without_outcome (expect 0)";
