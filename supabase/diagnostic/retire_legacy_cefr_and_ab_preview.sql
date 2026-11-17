-- Retire superseded CEFR/40-item and A/B NGSL preview systems.
-- PRECONDITION: Edge Function only accepts ngsl-* actions and NGSL teacher preview.
-- Safety: fail if any former student activity or review data exists.
-- Destructive by design for the abandoned banks ONLY. NGSL single 50-item tables untouched.
do $guard$
begin
 if exists(select 1 from private.vocabulary_diagnostic_assignments)
 or exists(select 1 from private.vocabulary_diagnostic_sessions)
 or exists(select 1 from private.vocabulary_diagnostic_responses)
 or exists(select 1 from private.vocabulary_diagnostic_results)
 or exists(select 1 from private.vocabulary_diagnostic_reviews) then
    raise exception 'LEGACY_DATA_EXISTS_ABORT_CLEANUP';
 end if;
 if (select count(*) from private.ngsl_baseline_items)<>50 then
    raise exception 'NGSL_50_BANK_MISSING_ABORT_CLEANUP';
 end if;
end $guard$;

drop function if exists public.vocabulary_diagnostic_teacher_form_preview(uuid,text) restrict;
drop function if exists public.vocabulary_diagnostic_review_form_worklist(uuid,text) restrict;
drop function if exists public.vocabulary_diagnostic_form_readiness(uuid) restrict;
drop function if exists public.vocabulary_diagnostic_review_api(uuid,text,jsonb) restrict;
drop function if exists public.vocabulary_diagnostic_api(uuid,text,jsonb) restrict;
drop function if exists private.vocabulary_diagnostic_safe_question(uuid,integer) restrict;

drop table if exists private.ngsl_diagnostic_preview_items restrict;
drop table if exists private.vocabulary_diagnostic_results restrict;
drop table if exists private.vocabulary_diagnostic_responses restrict;
drop table if exists private.vocabulary_diagnostic_sessions restrict;
drop table if exists private.vocabulary_diagnostic_assignments restrict;
drop table if exists private.vocabulary_diagnostic_reviews restrict;
drop table if exists private.vocabulary_diagnostic_form_items restrict;
drop table if exists private.vocabulary_diagnostic_forms restrict;
drop table if exists private.vocabulary_diagnostic_items restrict;
