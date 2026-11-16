-- NOT APPLIED. Deploy before enabling the staff real-form preview.
-- Return only the ordered, student-visible question content for an active staff member.
-- Never expose correct_option_id, lemmas, private review metadata, or score details.
create or replace function public.vocabulary_diagnostic_teacher_form_preview(
  p_actor uuid, p_form text
) returns jsonb
language plpgsql security definer
set search_path = ''
as $function$
declare
  v_form_code text;
  v_form_id uuid;
  v_status text;
  v_items jsonb;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = p_actor and p.active = true and p.role::text in ('teacher','admin')
  ) then
    raise exception 'REVIEW_ACCESS_DENIED';
  end if;

  if p_form not in ('A','B') or p_form is null then
    raise exception 'INVALID_FORM';
  end if;
  v_form_code := 'DIAG-BASELINE-' || p_form || '-DRAFT';
  select f.id,f.status into v_form_id,v_status
  from private.vocabulary_diagnostic_forms f where f.form_code=v_form_code;
  if v_form_id is null or v_status <> 'draft' then
    raise exception 'FORM_UNAVAILABLE';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'position',s.position,
    'stem',s.stem,
    'options',s.display_options
  ) order by s.position),'[]'::jsonb)
  into v_items
  from (
    select fi.position,i.stem,
      (select jsonb_agg(jsonb_build_object(
        'id',chr(64 + choice.ordinality::int),
        'text',option_row.value->>'text'
      ) order by choice.ordinality)
       from unnest(fi.option_order) with ordinality as choice(option_id,ordinality)
       join lateral jsonb_array_elements(i.options) option_row(value)
         on option_row.value->>'id'=choice.option_id
      ) as display_options
    from private.vocabulary_diagnostic_form_items fi
    join private.vocabulary_diagnostic_items i
      on i.item_id=fi.item_id and i.version=fi.item_version
    where fi.form_id=v_form_id
    order by fi.position
  ) s;
  if jsonb_array_length(v_items)<>40
      or exists (
        select 1 from private.vocabulary_diagnostic_form_items fi
        join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
        where fi.form_id=v_form_id and
        (array_length(fi.option_order,1)<>4
          or (select count(distinct u) from unnest(fi.option_order) u)<>4
          or jsonb_array_length(i.options)<>4)
      ) then
    raise exception 'FORM_INVALID';
  end if;
  return jsonb_build_object('form',p_form,'total',40,'questions',v_items);
end;
$function$;

revoke all on function public.vocabulary_diagnostic_teacher_form_preview(uuid,text) from public, anon, authenticated;
grant execute on function public.vocabulary_diagnostic_teacher_form_preview(uuid,text) to service_role;
