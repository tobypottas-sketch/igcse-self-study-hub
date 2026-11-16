-- NOT APPLIED. Proposed editorial replacements for the two DRAFT baseline forms.
-- Content-free: question text, options and keys never live in git. The private
-- file built by tools/diagnostic/build-editorial-revision-sql.mjs loads the
-- package into pg_temp.diag_editorial_package, includes this file, then calls
-- pg_temp.diag_apply_editorial_revisions() in one transaction.
--
-- Non-destructive: each replacement is a NEW item version (old versions stay);
-- only that slot's item_version changes. The old and new keys are swapped in the
-- slot's option_order, so the key stays in the same displayed position. Forms
-- stay draft; 40/40, 8 per level, no overlap and per-slot key counts are
-- re-checked. Any failed check aborts with no change; a re-run is refused.
create or replace function pg_temp.diag_apply_editorial_revisions()
returns table(form_code text, form_position integer, item_id text, from_version integer, to_version integer)
language plpgsql as $fn$
declare
  c_forms constant text[]:=array['DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT'];
  v_doc jsonb; v_pkg text; r jsonb; v_code text; v_ids text[];
  v_fi record; v_item record; v_new integer; v_order text[]; v_key text;
  v_slots_before jsonb; v_slots_after jsonb; v_unchanged_before text; v_unchanged_after text;
begin
  if (select count(*) from pg_temp.diag_editorial_package)<>1 then raise exception 'EDITORIAL_PACKAGE_MISSING'; end if;
  select p.doc into v_doc from pg_temp.diag_editorial_package p;
  v_pkg:=v_doc->>'package_version';
  if coalesce(trim(v_pkg),'')='' or jsonb_typeof(v_doc->'proposed_replacements') is distinct from 'array'
     or jsonb_array_length(v_doc->'proposed_replacements')=0 then raise exception 'EDITORIAL_PACKAGE_INVALID'; end if;

  perform 1 from private.vocabulary_diagnostic_forms f where f.form_code=any(c_forms) for update;
  if (select count(*) from private.vocabulary_diagnostic_forms f where f.form_code=any(c_forms) and f.status='draft')<>2
    then raise exception 'FORMS_NOT_BOTH_DRAFT'; end if;
  if exists(select 1 from private.vocabulary_diagnostic_assignments a
      join private.vocabulary_diagnostic_forms f on f.id=a.form_id where f.form_code=any(c_forms))
    then raise exception 'FORM_ALREADY_ASSIGNED'; end if;

  select array_agg(x->>'item_id') into v_ids from jsonb_array_elements(v_doc->'proposed_replacements') x;
  if cardinality(v_ids)<>(select count(distinct u) from unnest(v_ids) u) then raise exception 'DUPLICATE_ITEM_ID'; end if;

  select jsonb_object_agg(k,n) into v_slots_before from (
    select f.form_code||':'||array_position(fi.option_order,i.correct_option_id) k, count(*) n
    from private.vocabulary_diagnostic_form_items fi
    join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
    join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
    where f.form_code=any(c_forms) group by 1) s;
  select md5(string_agg(concat_ws('|',fi.form_id,fi.position,fi.item_id,fi.item_version,fi.option_order::text),',' order by fi.form_id,fi.position))
    into v_unchanged_before from private.vocabulary_diagnostic_form_items fi
    join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
    where f.form_code=any(c_forms) and fi.item_id<>all(v_ids);

  for r in select x from jsonb_array_elements(v_doc->'proposed_replacements') x loop
    v_code:=case r->>'form' when 'A' then c_forms[1] when 'B' then c_forms[2] end;
    if v_code is null then raise exception 'BAD_FORM %',r->>'item_id'; end if;
    select fi.form_id,fi.position,fi.item_version,fi.option_order into v_fi
      from private.vocabulary_diagnostic_form_items fi
      join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
      where f.form_code=v_code and fi.item_id=r->>'item_id';
    if not found then raise exception 'ITEM_NOT_IN_FORM % %',r->>'item_id',v_code; end if;
    if v_fi.item_version<>coalesce((r->>'expected_current_version')::int,1)
      then raise exception 'ITEM_VERSION_MISMATCH % (form holds v%)',r->>'item_id',v_fi.item_version; end if;
    if exists(select 1 from private.vocabulary_diagnostic_items i where i.item_id=r->>'item_id' and i.version>v_fi.item_version)
      then raise exception 'NEWER_VERSION_EXISTS %',r->>'item_id'; end if;
    select i.* into v_item from private.vocabulary_diagnostic_items i where i.item_id=r->>'item_id' and i.version=v_fi.item_version;
    if v_item.level_hypothesis is distinct from r->>'provisional_level' then raise exception 'LEVEL_MISMATCH %',r->>'item_id'; end if;
    if lower(trim(v_item.lemma)) is distinct from lower(trim(r->>'target_lemma')) then raise exception 'LEMMA_MISMATCH %',r->>'item_id'; end if;
    if coalesce(trim(r->>'stem'),'')='' then raise exception 'STEM_INVALID %',r->>'item_id'; end if;
    if lower(trim(r->>'stem'))=lower(trim(v_item.stem)) then raise exception 'STEM_UNCHANGED %',r->>'item_id'; end if;
    if jsonb_typeof(r->'options') is distinct from 'array' or jsonb_array_length(r->'options')<>4
      or (select array_agg(o->>'id' order by o->>'id') from jsonb_array_elements(r->'options') o) is distinct from array['A','B','C','D']
      or exists(select 1 from jsonb_array_elements(r->'options') o where coalesce(trim(o->>'text'),'')='')
      or (select count(distinct lower(trim(o->>'text'))) from jsonb_array_elements(r->'options') o)<>4
      then raise exception 'OPTIONS_INVALID %',r->>'item_id'; end if;
    v_key:=r->>'correct_option_id';
    if v_key is null or v_key not in ('A','B','C','D') then raise exception 'KEY_INVALID %',r->>'item_id'; end if;

    v_new:=v_fi.item_version+1;
    insert into private.vocabulary_diagnostic_items
      (item_id,version,form_family,level_hypothesis,lemma,tested_sense,stem,options,correct_option_id,authoring,review_status)
    values (v_item.item_id,v_new,v_item.form_family,v_item.level_hypothesis,v_item.lemma,v_item.tested_sense,trim(r->>'stem'),
      (select jsonb_agg(jsonb_build_object('id',o->>'id','text',trim(o->>'text')) order by o->>'id') from jsonb_array_elements(r->'options') o),
      v_key,
      v_item.authoring||jsonb_build_object('editorialRevision',jsonb_build_object(
        'packageVersion',v_pkg,'replacesVersion',v_fi.item_version,
        'rationale',r->>'editorial_rationale','status','proposed-editorial-not-calibrated')),
      'draft');
    -- Swap old and new key letters so the key keeps its displayed slot.
    v_order:=array(select case x when v_item.correct_option_id then v_key when v_key then v_item.correct_option_id else x end
      from unnest(v_fi.option_order) with ordinality t(x,n) order by n);
    update private.vocabulary_diagnostic_form_items fi set item_version=v_new,option_order=v_order
      where fi.form_id=v_fi.form_id and fi.position=v_fi.position;
    form_code:=v_code; form_position:=v_fi.position; item_id:=v_item.item_id;
    from_version:=v_fi.item_version; to_version:=v_new;
    return next;
  end loop;

  if exists(select 1 from (
      select f.form_code,count(*) n,count(distinct fi.position) p,count(distinct fi.item_id) d,min(fi.position) lo,max(fi.position) hi
      from private.vocabulary_diagnostic_forms f join private.vocabulary_diagnostic_form_items fi on fi.form_id=f.id
      where f.form_code=any(c_forms) group by 1) s where n<>40 or p<>40 or d<>40 or lo<>1 or hi<>40)
    or (select count(*) from private.vocabulary_diagnostic_forms f where f.form_code=any(c_forms))<>2
    then raise exception 'FORM_SHAPE_CHANGED'; end if;
  if exists(select 1 from (
      select f.form_code,i.level_hypothesis,count(*) n
      from private.vocabulary_diagnostic_forms f join private.vocabulary_diagnostic_form_items fi on fi.form_id=f.id
      join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
      where f.form_code=any(c_forms) group by 1,2) s where n<>8)
    then raise exception 'LEVEL_BALANCE_CHANGED'; end if;
  if exists(select fi.item_id from private.vocabulary_diagnostic_form_items fi
      join private.vocabulary_diagnostic_forms f on f.id=fi.form_id where f.form_code=any(c_forms)
      group by fi.item_id having count(distinct f.form_code)>1)
    then raise exception 'FORMS_OVERLAP'; end if;
  if exists(select 1 from private.vocabulary_diagnostic_form_items fi
      join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
      join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
      where f.form_code=any(c_forms) and ((select count(distinct x) from unnest(fi.option_order) x)<>4
        or array_position(fi.option_order,i.correct_option_id) is null))
    then raise exception 'OPTION_ORDER_INVALID'; end if;
  select jsonb_object_agg(k,n) into v_slots_after from (
    select f.form_code||':'||array_position(fi.option_order,i.correct_option_id) k, count(*) n
    from private.vocabulary_diagnostic_form_items fi
    join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
    join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
    where f.form_code=any(c_forms) group by 1) s;
  if v_slots_after is distinct from v_slots_before then raise exception 'KEY_SLOT_BALANCE_CHANGED'; end if;
  select md5(string_agg(concat_ws('|',fi.form_id,fi.position,fi.item_id,fi.item_version,fi.option_order::text),',' order by fi.form_id,fi.position))
    into v_unchanged_after from private.vocabulary_diagnostic_form_items fi
    join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
    where f.form_code=any(c_forms) and fi.item_id<>all(v_ids);
  if v_unchanged_after is distinct from v_unchanged_before then raise exception 'UNREPLACED_SLOTS_CHANGED'; end if;
  if (select count(*) from private.vocabulary_diagnostic_forms f where f.form_code=any(c_forms) and f.status='draft')<>2
    then raise exception 'FORMS_NOT_BOTH_DRAFT'; end if;
end;
$fn$;
