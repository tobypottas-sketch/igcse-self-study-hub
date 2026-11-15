-- Removes ONLY the isolated synthetic pilot created by pilot_synthetic_setup.sql
-- (form 'DIAG-PILOT-SYNTHETIC', items 'diag-pilot-syn-*') and the test student's sessions/results on it.
do $$
declare v_form uuid;
begin
  select id into v_form from private.vocabulary_diagnostic_forms where form_code='DIAG-PILOT-SYNTHETIC';
  if v_form is not null then
    delete from private.vocabulary_diagnostic_results where session_id in
      (select id from private.vocabulary_diagnostic_sessions where form_id=v_form);
    delete from private.vocabulary_diagnostic_responses where session_id in
      (select id from private.vocabulary_diagnostic_sessions where form_id=v_form);
    delete from private.vocabulary_diagnostic_sessions where form_id=v_form;
    delete from private.vocabulary_diagnostic_assignments where form_id=v_form;
    delete from private.vocabulary_diagnostic_form_items where form_id=v_form;
    delete from private.vocabulary_diagnostic_forms where id=v_form;
  end if;
  if exists(select 1 from private.vocabulary_diagnostic_form_items where item_id like 'diag-pilot-syn-%')
    then raise exception 'PILOT: synthetic items are used by another form; not deleting them'; end if;
  delete from private.vocabulary_diagnostic_items where item_id like 'diag-pilot-syn-%' and form_family='pilot-synthetic';
end $$;
select (select count(*) from private.vocabulary_diagnostic_forms where form_code='DIAG-PILOT-SYNTHETIC') as pilot_forms,
       (select count(*) from private.vocabulary_diagnostic_items where item_id like 'diag-pilot-syn-%') as pilot_items;
