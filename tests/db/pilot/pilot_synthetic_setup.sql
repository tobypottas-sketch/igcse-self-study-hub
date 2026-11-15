-- ISOLATED SYNTHETIC PILOT: one pilot-only form of 40 obvious placeholder items, assigned to ONE test student.
-- Does not touch real items, Forms A/B, other students, progress or the gate.
-- Everything is identifiable by form_code 'DIAG-PILOT-SYNTHETIC' and item_id prefix 'diag-pilot-syn-'.
-- Reverse with pilot_synthetic_teardown.sql.
-- BEFORE RUNNING: replace the test student's email below (a dedicated test account with role 'student').
do $$
declare
  c_test_email constant text := 'REPLACE-WITH-TEST-STUDENT-EMAIL';
  v_student uuid; v_admin uuid; v_form uuid; v_level text; v_key text; p int;
begin
  select p.id into v_student from public.profiles p join auth.users u on u.id=p.id
   where lower(u.email)=lower(c_test_email) and p.role='student' and p.active;
  if v_student is null then raise exception 'PILOT: test student not found or not an active student'; end if;
  if exists(select 1 from public.student_class_memberships where student_id=v_student and ended_at is null)
    then raise exception 'PILOT: test student must not belong to a real class'; end if;
  if exists(select 1 from private.vocabulary_diagnostic_forms where form_code='DIAG-PILOT-SYNTHETIC')
    then raise exception 'PILOT: already set up; run the teardown first'; end if;
  select id into v_admin from public.profiles where role='admin' and active order by id limit 1;
  for p in 1..40 loop
    v_level:=(array['A1','A2','B1','B2','C1'])[((p-1)/8)+1];
    v_key:=(array['A','B','C','D'])[((p-1)%4)+1];
    insert into private.vocabulary_diagnostic_items
      (item_id,version,form_family,level_hypothesis,lemma,tested_sense,stem,options,correct_option_id,authoring,review_status)
    select 'diag-pilot-syn-'||lpad(p::text,2,'0'),1,'pilot-synthetic',v_level,'pilot-synthetic','synthetic pilot placeholder',
      'Pilot test question '||p||' of 40 (synthetic). Choose the word "correct".',
      jsonb_agg(jsonb_build_object('id',id,'text',case when id=v_key then 'correct' else 'not this one ('||id||')' end) order by id),
      v_key,jsonb_build_object('pilotSynthetic',true),'draft'
    from unnest(array['A','B','C','D']) id;
  end loop;
  update private.vocabulary_diagnostic_items set review_status='pilot' where form_family='pilot-synthetic';
  insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version)
    values ('DIAG-PILOT-SYNTHETIC',1,'draft','pilot-synthetic') returning id into v_form;
  for p in 1..40 loop
    insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
    values (v_form,p,'diag-pilot-syn-'||lpad(p::text,2,'0'),1,
      case (p/4)%2 when 0 then array['A','B','C','D'] else array['D','C','B','A'] end);
  end loop;
  update private.vocabulary_diagnostic_forms set status='pilot' where id=v_form;
  insert into private.vocabulary_diagnostic_assignments(student_id,assigned_by,form_id,kind)
    values (v_student,coalesce(v_admin,v_student),v_form,'baseline');
end $$;
select f.form_code,f.status,(select count(*) from private.vocabulary_diagnostic_form_items fi where fi.form_id=f.id) as items,
  (select count(*) from private.vocabulary_diagnostic_assignments a where a.form_id=f.id) as assignments
from private.vocabulary_diagnostic_forms f where f.form_code='DIAG-PILOT-SYNTHETIC';
