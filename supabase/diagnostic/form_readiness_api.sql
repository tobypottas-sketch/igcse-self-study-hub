-- Service-role-only teacher summary of PRIVATE diagnostic draft forms.
-- Exposes no stems, keys, options, item IDs or learner data.
create or replace function public.vocabulary_diagnostic_form_readiness(p_actor uuid)
returns jsonb
language plpgsql security definer
set search_path=''
as $$
declare
 v_role text;
 v_forms jsonb;
begin
 select role::text into v_role from public.profiles
 where id=p_actor and active=true;
 if v_role not in ('teacher','admin') or v_role is null then
   raise exception 'REVIEW_ACCESS_DENIED';
 end if;

 select coalesce(jsonb_agg(jsonb_build_object(
   'formCode',form_code,
   'status',status,
   'total',item_count,
   'bands',bands,
   'constructs',constructs,
   'languageApproved',language_ok,
   'assessmentApproved',assessment_ok,
   'cefrVerified',cefr_ok,
   'flagged',flagged_count,
   'reviewReady',false
 ) order by form_code),'[]'::jsonb) into v_forms
 from (
   select f.form_code,f.status,
      count(fi.item_id)::int as item_count,
      coalesce((select jsonb_object_agg(k.band,k.total) from (
        select i2.level_hypothesis as band,count(*)::int total
        from private.vocabulary_diagnostic_form_items fi2
        join private.vocabulary_diagnostic_items i2
          on i2.item_id=fi2.item_id and i2.version=fi2.item_version
        where fi2.form_id=f.id group by i2.level_hypothesis
      ) k),'{}'::jsonb) as bands,
      coalesce((select jsonb_object_agg(k.construct,k.total) from (
        select i2.authoring->>'construct' as construct,count(*)::int total
        from private.vocabulary_diagnostic_form_items fi2
        join private.vocabulary_diagnostic_items i2
          on i2.item_id=fi2.item_id and i2.version=fi2.item_version
        where fi2.form_id=f.id group by i2.authoring->>'construct'
      ) k),'{}'::jsonb) as constructs,
      count(*) filter(where exists(
        select 1 from private.vocabulary_diagnostic_reviews r
        where r.item_id=fi.item_id and r.item_version=fi.item_version
        and r.stage='language' and r.decision='approve'))::int as language_ok,
      count(*) filter(where exists(
        select 1 from private.vocabulary_diagnostic_reviews r
        where r.item_id=fi.item_id and r.item_version=fi.item_version
        and r.stage='assessment' and r.decision='approve'))::int as assessment_ok,
      count(*) filter(where exists(
        select 1 from private.vocabulary_diagnostic_reviews r
        where r.item_id=fi.item_id and r.item_version=fi.item_version
        and r.stage='cefr' and r.decision='verify'))::int as cefr_ok,
      count(*) filter(where exists(
        select 1 from private.vocabulary_diagnostic_reviews r
        where r.item_id=fi.item_id and r.item_version=fi.item_version
        and r.decision in ('flag','reject')))::int as flagged_count
   from private.vocabulary_diagnostic_forms f
   left join private.vocabulary_diagnostic_form_items fi on fi.form_id=f.id
   where f.form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT')
   group by f.id,f.form_code,f.status
 ) summary;
 return jsonb_build_object('forms',v_forms,
   'note','Draft forms are not CEFR-calibrated or available to students.');
end;
$$;
revoke all on function public.vocabulary_diagnostic_form_readiness(uuid)
 from public,anon,authenticated;
grant execute on function public.vocabulary_diagnostic_form_readiness(uuid)
 to service_role;
