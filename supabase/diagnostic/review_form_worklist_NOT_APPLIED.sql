-- Staff-only, read-only ordered worklist for approving an assembled diagnostic form.
-- This does NOT approve, promote, assign, or expose keys or question content.
create or replace function public.vocabulary_diagnostic_review_form_worklist(
  p_actor uuid, p_form text
) returns jsonb
language plpgsql security definer set search_path=''
as $function$
declare
  v_form_id uuid;
  v_items jsonb;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id=p_actor and p.active=true and p.role::text in ('teacher','admin')
  ) then raise exception 'REVIEW_ACCESS_DENIED'; end if;
  if p_form is null or p_form not in ('A','B') then
    raise exception 'INVALID_FORM';
  end if;
  select f.id into v_form_id from private.vocabulary_diagnostic_forms f
  where f.form_code='DIAG-BASELINE-'||p_form||'-DRAFT';
  if v_form_id is null then raise exception 'FORM_UNAVAILABLE'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'position',fi.position,'id',i.item_id,'version',i.version,
    'lemma',i.lemma,'level',i.level_hypothesis,'status',i.review_status,
    'languageApproved',exists(select 1 from private.vocabulary_diagnostic_reviews r
      where r.item_id=i.item_id and r.item_version=i.version and r.stage='language' and r.decision='approve'),
    'assessmentApproved',exists(select 1 from private.vocabulary_diagnostic_reviews r
      where r.item_id=i.item_id and r.item_version=i.version and r.stage='assessment' and r.decision='approve'),
    'cefrVerified',exists(select 1 from private.vocabulary_diagnostic_reviews r
      where r.item_id=i.item_id and r.item_version=i.version and r.stage='cefr' and r.decision='verify'),
    'flagged',exists(select 1 from private.vocabulary_diagnostic_reviews r
      where r.item_id=i.item_id and r.item_version=i.version and r.decision in ('flag','reject'))
  ) order by fi.position),'[]'::jsonb) into v_items
  from private.vocabulary_diagnostic_form_items fi
  join private.vocabulary_diagnostic_items i
    on i.item_id=fi.item_id and i.version=fi.item_version
  where fi.form_id=v_form_id;
  return jsonb_build_object('form',p_form,'total',jsonb_array_length(v_items),'items',v_items);
end;
$function$;
revoke all on function public.vocabulary_diagnostic_review_form_worklist(uuid,text) from public,anon,authenticated;
grant execute on function public.vocabulary_diagnostic_review_form_worklist(uuid,text) to service_role;
