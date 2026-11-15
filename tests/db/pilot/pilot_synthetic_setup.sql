-- ISOLATED SYNTHETIC PILOT: one pilot-only form of 40 obvious placeholder items, assigned to ONE test student.
-- Does not touch real items, Forms A/B, other students, progress or the gate.
-- Everything is identifiable by form_code 'DIAG-PILOT-SYNTHETIC' and item_id prefix 'diag-pilot-syn-'.
-- Reverse with pilot_synthetic_teardown.sql.
-- Uses the sole active student already provisioned in the dedicated TEST CLASS.
-- Refuses to run if that class has a different membership count, an inactive student,
-- or a student also enrolled in any other class.
do $
declare
  c_test_class constant uuid := '88e7bcb7-c2ed-4bf9-98fb-ac18a0636e4f';
  v_student uuid; v_admin uuid; v_form uuid; v_level text; v_key text; p int;
begin
  if not exists (select 1 from public.classes c
    where c.id=c_test_class and c.active and upper(trim(c.class_name))='TEST CLASS')
    then raise exception 'PILOT: dedicated TEST CLASS not found or inactive'; end if;
  if (select count(*) from public.student_class_memberships m
       where m.class_id=c_test_class and m.ended_at is null) <> 1
    then raise exception 'PILOT: TEST CLASS must contain exactly one active membership'; end if;
  select p.id into v_student from public.student_class_memberships m
    join public.profiles p on p.id=m.student_id
    join auth.users u on u.id=p.id
    where m.class_id=c_test_class and m.ended_at is null
      and p.role='student' and p.active;
  if v_student is null then raise exception 'PILOT: TEST CLASS student must have an active authenticated student profile'; end if;
  if exists(select 1 from public.student_class_memberships m
      where m.student_id=v_student and m.ended_at is null and m.class_id<>c_test_class)
    then raise exception 'PILOT: test student also belongs to another class'; end if;
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
