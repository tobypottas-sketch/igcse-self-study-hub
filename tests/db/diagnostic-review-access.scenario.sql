-- Review API access and student-delivery checks. THROWAWAY local Postgres only.
-- Run: tests/db/run-diagnostic-lifecycle-scenario.sh tests/db/diagnostic-review-access.scenario.sql
-- Synthetic placeholder content only.
create schema access_scenario;
create function access_scenario.expect_error(p_sql text, p_code text) returns void language plpgsql as $$
declare v_succeeded boolean:=false;
begin
  begin execute p_sql; v_succeeded:=true;
  exception when others then
    if sqlerrm not like '%'||p_code||'%' then raise exception 'EXPECTED % GOT %', p_code, sqlerrm; end if;
  end;
  if v_succeeded then raise exception 'EXPECTED % BUT STATEMENT SUCCEEDED: %', p_code, p_sql; end if;
end $$;
insert into public.profiles(id,role,active) values
 ('00000000-0000-0000-0000-0000000000a1','admin',true),
 ('00000000-0000-0000-0000-0000000000c1','teacher',true),
 ('00000000-0000-0000-0000-0000000000c2','teacher',false),
 ('00000000-0000-0000-0000-0000000000e1','student',true);
select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-0000000000a1','import',jsonb_build_object('reason','synthetic access scenario',
 'items',jsonb_build_array(jsonb_build_object('itemId','diag-synthetic-501','levelHypothesis','B1','formFamily','synthetic-family','lemma','placeholder',
  'sense','synthetic sense','stem','Synthetic access stem?','correctOptionId','C',
  'options',jsonb_build_array(jsonb_build_object('id','A','text','alpha','rationale','ra'),jsonb_build_object('id','B','text','beta','rationale','rb'),
   jsonb_build_object('id','C','text','gamma','rationale','rc'),jsonb_build_object('id','D','text','delta','rationale','rd'))))));

-- Staff can read detail (with key) and list; students, inactive staff and unknown actors cannot.
do $$ declare d jsonb; l jsonb; begin
  d:=public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-0000000000c1','detail','{"itemId":"diag-synthetic-501","version":1}');
  if d->'item'->>'correctOptionId'<>'C' or jsonb_array_length(d->'item'->'options')<>4 then raise exception 'TEACHER DETAIL WRONG %',d; end if;
  l:=public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-0000000000a1','list','{}');
  if (l->>'total')::int<>1 or l::text ~ '(gamma|correctOptionId|Synthetic access stem)' then raise exception 'LIST WRONG OR LEAKS CONTENT %',l; end if;
end $$;
select access_scenario.expect_error($$select public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-0000000000e1','detail','{"itemId":"diag-synthetic-501","version":1}')$$,'REVIEW_ACCESS_DENIED');
select access_scenario.expect_error($$select public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-0000000000e1','list','{}')$$,'REVIEW_ACCESS_DENIED');
select access_scenario.expect_error($$select public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-0000000000c2','detail','{"itemId":"diag-synthetic-501","version":1}')$$,'REVIEW_ACCESS_DENIED');
select access_scenario.expect_error($$select public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-0000000000ff','detail','{"itemId":"diag-synthetic-501","version":1}')$$,'REVIEW_ACCESS_DENIED');
do $$ begin
  if has_function_privilege('authenticated','public.vocabulary_diagnostic_review_api(uuid,text,jsonb)','EXECUTE')
     or has_function_privilege('anon','public.vocabulary_diagnostic_review_api(uuid,text,jsonb)','EXECUTE')
     or has_table_privilege('authenticated','private.vocabulary_diagnostic_items','SELECT')
  then raise exception 'CLIENT ROLES CAN REACH REVIEW DATA'; end if;
end $$;

-- Student delivery path: safe_question returns id/text only, never key or rationale.
do $$ declare v_form uuid; v_assign uuid; v_session uuid; q jsonb; begin
  update private.vocabulary_diagnostic_items set review_status='pilot' where item_id='diag-synthetic-501';
  insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version) values ('SYN-ACCESS',1,'draft','syn') returning id into v_form;
  insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order) values (v_form,1,'diag-synthetic-501',1,array['D','C','B','A']);
  update private.vocabulary_diagnostic_forms set status='pilot' where id=v_form;
  insert into private.vocabulary_diagnostic_assignments(student_id,assigned_by,form_id,kind) values ('00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000a1',v_form,'baseline') returning id into v_assign;
  q:=public.vocabulary_diagnostic_api('00000000-0000-0000-0000-0000000000e1','start',jsonb_build_object('assignmentId',v_assign));
  if q::text ~* '(correct|rationale|"ra"|"rc"|levelHypothesis)' then raise exception 'STUDENT START LEAKS %',q; end if;
  if jsonb_array_length(q->'question'->'options')<>4 then raise exception 'STUDENT QUESTION SHAPE %',q; end if;
end $$;

select 'PASS' as result;
