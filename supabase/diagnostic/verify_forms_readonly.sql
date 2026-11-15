-- READ-ONLY form integrity check. Single SELECT; returns counts only (no stems, options or keys).
-- Paste into the Supabase SQL Editor or run via the Management API query endpoint.
with fi as (
  select f.form_code, f.status as form_status, fi.position, fi.item_id, fi.item_version, fi.option_order,
         i.level_hypothesis, i.options, i.correct_option_id, i.review_status
  from private.vocabulary_diagnostic_forms f
  left join private.vocabulary_diagnostic_form_items fi on fi.form_id=f.id
  left join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
)
select jsonb_pretty(jsonb_agg(row_to_json(x) order by x.form_code)) as forms from (
  select form_code, form_status,
    count(position) as items,
    count(distinct position) as distinct_positions,
    min(position) as min_position, max(position) as max_position,
    count(*) filter (where position is not null and options is null) as broken_refs,
    jsonb_object_agg_strict_level as per_level,
    count(*) filter (where options is not null and (
      jsonb_array_length(options)<>4
      or (select count(distinct e->>'id') from jsonb_array_elements(options) e where e->>'id' in ('A','B','C','D') and coalesce(trim(e->>'text'),'')<>'')<>4
      or (select count(*) from jsonb_array_elements(options) e where e->>'id'=correct_option_id)<>1
      or (select count(distinct x) from unnest(option_order) x where x in ('A','B','C','D'))<>4)) as invalid_items,
    count(*) filter (where array_position(option_order,correct_option_id)=1) as key_in_slot_1,
    count(*) filter (where array_position(option_order,correct_option_id)=2) as key_in_slot_2,
    count(*) filter (where array_position(option_order,correct_option_id)=3) as key_in_slot_3,
    count(*) filter (where array_position(option_order,correct_option_id)=4) as key_in_slot_4,
    count(*) filter (where option_order<>array['A','B','C','D']) as reordered_items,
    jsonb_object_agg_status as item_statuses,
    (select count(*) from fi o where o.form_code<>fi.form_code and o.item_id in
       (select item_id from fi s where s.form_code=fi.form_code)) as items_shared_with_other_forms
  from fi
  cross join lateral (select
    (select jsonb_object_agg(level_hypothesis,n) from (select level_hypothesis,count(*) n from fi l where l.form_code=fi.form_code and l.position is not null group by 1) z) as jsonb_object_agg_strict_level,
    (select jsonb_object_agg(review_status,n) from (select review_status,count(*) n from fi l where l.form_code=fi.form_code and l.position is not null group by 1) z) as jsonb_object_agg_status) agg
  group by form_code, form_status, jsonb_object_agg_strict_level, jsonb_object_agg_status
) x;
