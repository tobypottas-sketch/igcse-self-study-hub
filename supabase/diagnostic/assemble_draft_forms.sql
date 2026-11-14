-- Confidential diagnostic draft-form assembly. NO item text/keys in git.
-- Creates only DRAFT forms. Does not change item review status, grant access,
-- assign students or expose candidate questions to the browser.
-- Each 40-item draft: per hypothesised band 5 context, 2 precise, 1 phrase.
-- Forms are disjoint; they are NOT equated and are NOT calibrated.

do $assemble$
declare
  v_form_a uuid;
  v_form_b uuid;
  v_count integer;
  v_bad integer;
  v_form_record record;
begin
  -- Refuse to assemble against an incomplete or reviewed/mixed bank.
  select count(*) into v_count
  from private.vocabulary_diagnostic_items
  where item_id like 'diag-candidate-%' and version=1;
  if v_count<>80 then
    raise exception 'EXPECTED_80_CANDIDATES_FOUND_%',v_count;
  end if;
  select count(*) into v_bad
  from private.vocabulary_diagnostic_items i
  where i.item_id like 'diag-candidate-%' and i.version=1
    and (i.review_status<>'draft'
      or i.authoring->'levelReference'->>'status'<>'unverified'
      or i.correct_option_id not in ('A','B','C','D')
      or jsonb_array_length(i.options)<>4);
  if v_bad<>0 then raise exception 'BANK_STATUS_OR_OPTIONS_CHANGED'; end if;
  if exists (
    select 1
    from (
      select level_hypothesis,authoring->>'construct' as construct,count(*) as n
      from private.vocabulary_diagnostic_items
      where item_id like 'diag-candidate-%' and version=1
      group by 1,2
    ) c
    where c.level_hypothesis not in ('A1','A2','B1','B2','C1')
      or (c.construct='meaning_in_context' and c.n<>10)
      or (c.construct='precise_meaning' and c.n<>4)
      or (c.construct='collocation_sense' and c.n<>2)
      or c.construct not in ('meaning_in_context','precise_meaning','collocation_sense')
  ) then raise exception 'BANK_BALANCE_INVALID'; end if;

  if exists(select 1 from private.vocabulary_diagnostic_forms
    where form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT'))
    then raise exception 'DRAFT_FORMS_ALREADY_EXIST'; end if;

  insert into private.vocabulary_diagnostic_forms
    (form_code,version,status,item_bank_version)
  values ('DIAG-BASELINE-A-DRAFT',1,'draft','unverified-original-80-v1')
  returning id into v_form_a;
  insert into private.vocabulary_diagnostic_forms
    (form_code,version,status,item_bank_version)
  values ('DIAG-BASELINE-B-DRAFT',1,'draft','unverified-original-80-v1')
  returning id into v_form_b;

  -- Only private item IDs and versions are selected by this SQL.
  -- Never export the answer-bearing options or item text.
  with ordered as (
    select i.item_id,i.version,i.level_hypothesis,
      i.authoring->>'construct' as construct,
      row_number() over(partition by i.level_hypothesis,i.authoring->>'construct'
                        order by i.item_id) as group_index
    from private.vocabulary_diagnostic_items i
    where i.item_id like 'diag-candidate-%' and i.version=1
  ),
  allocated as (
    select case when group_index % 2 = 1 then v_form_a else v_form_b end as form_id,
      item_id,version,level_hypothesis,construct,
      ceil(group_index / 2.0)::int as wave
    from ordered
  ),
  ranked as (
    select form_id,item_id,version,
      row_number() over(partition by form_id
        order by wave,
        case level_hypothesis when 'A1' then 1 when 'A2' then 2
          when 'B1' then 3 when 'B2' then 4 else 5 end,
        case construct when 'meaning_in_context' then 1
          when 'precise_meaning' then 2 else 3 end,
        item_id)::integer as position
    from allocated
  )
  insert into private.vocabulary_diagnostic_form_items
    (form_id,position,item_id,item_version,option_order)
  select form_id,position,item_id,version,
    case ((position-1) % 4)
      when 0 then array['C','A','D','B']
      when 1 then array['B','D','A','C']
      when 2 then array['D','B','C','A']
      else array['A','C','B','D'] end::text[]
  from ranked;

  for v_form_record in
    select f.id,f.form_code,count(*) as total
    from private.vocabulary_diagnostic_forms f
    join private.vocabulary_diagnostic_form_items fi on fi.form_id=f.id
    where f.id in (v_form_a,v_form_b)
    group by f.id,f.form_code
  loop
    if v_form_record.total<>40 then
      raise exception 'FORM_COUNT_INVALID_%_%',v_form_record.form_code,v_form_record.total;
    end if;
  end loop;
  if (select count(*) from private.vocabulary_diagnostic_form_items
      where form_id in (v_form_a,v_form_b))<>80 then
    raise exception 'ASSIGNMENT_COVERAGE_INVALID';
  end if;
end;
$assemble$;
