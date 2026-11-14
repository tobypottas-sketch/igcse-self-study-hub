-- One-time private randomisation for DRAFT alternate forms.
-- No keyed content or generated key-position mapping is stored in GitHub.
-- Each 40-item form gets exactly 10 keyed answers in each visual slot.
-- Cryptographically random ranking avoids repeating A/B/C/D correct-slot patterns.

do $shuffle$
declare
  v_invalid integer;
begin
  if (select count(*) from private.vocabulary_diagnostic_forms
       where form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT')
         and status='draft')<>2
    then raise exception 'ONLY_TWO_DRAFT_FORMS_MAY_BE_SHUFFLED'; end if;
  if exists (
    select 1 from private.vocabulary_diagnostic_assignments a
    join private.vocabulary_diagnostic_forms f on f.id=a.form_id
    where f.form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT')
  ) then raise exception 'FORM_ALREADY_ASSIGNED'; end if;

  with ranked as (
    select fi.form_id,fi.position,i.correct_option_id,
      row_number() over(partition by fi.form_id order by gen_random_uuid())::int as shuffled_rank
    from private.vocabulary_diagnostic_form_items fi
    join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
    join private.vocabulary_diagnostic_items i
      on i.item_id=fi.item_id and i.version=fi.item_version
    where f.form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT')
      and f.status='draft'
  ),
  planned as (
    select form_id,position,correct_option_id,
      ((shuffled_rank-1)%4)+1 as correct_slot,
      array(select distractor.letter
        from unnest(array['A','B','C','D']::text[]) as distractor(letter)
        where distractor.letter<>ranked.correct_option_id
        order by gen_random_uuid()) as distractors
    from ranked
  )
  update private.vocabulary_diagnostic_form_items fi
   set option_order=(
      select array_agg(
        case when n=planned.correct_slot then planned.correct_option_id
             else planned.distractors[case when n<planned.correct_slot then n else n-1 end]
        end order by n)
      from generate_series(1,4) as g(n)
   )
   from planned
   where fi.form_id=planned.form_id and fi.position=planned.position;

  select count(*) into v_invalid
  from private.vocabulary_diagnostic_form_items fi
  join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
  join private.vocabulary_diagnostic_items i
    on i.item_id=fi.item_id and i.version=fi.item_version
  where f.form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT')
    and (
      cardinality(fi.option_order)<>4
      or (select count(distinct x) from unnest(fi.option_order) x)<>4
      or array_position(fi.option_order,i.correct_option_id) is null
    );
  if v_invalid<>0 then raise exception 'INVALID_OPTION_ORDERS_AFTER_SHUFFLE'; end if;

  if exists (
    select 1 from (
      select f.form_code,
        array_position(fi.option_order,i.correct_option_id) as slot,
        count(*) as n
      from private.vocabulary_diagnostic_form_items fi
      join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
      join private.vocabulary_diagnostic_items i
        on i.item_id=fi.item_id and i.version=fi.item_version
      where f.form_code in ('DIAG-BASELINE-A-DRAFT','DIAG-BASELINE-B-DRAFT')
      group by f.form_code,array_position(fi.option_order,i.correct_option_id)
    ) counts where counts.n<>10
  ) then raise exception 'KEY_POSITION_BALANCE_FAILED'; end if;
end;
$shuffle$;
