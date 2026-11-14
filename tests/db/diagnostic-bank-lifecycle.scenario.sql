-- Behavioural scenario for supabase/diagnostic/item_lifecycle_NOT_APPLIED.sql.
-- THROWAWAY local Postgres only, via tests/db/run-diagnostic-lifecycle-scenario.sh.
-- All item text below is synthetic placeholder text, not diagnostic content.
create schema scenario;
create function scenario.expect_error(p_sql text, p_code text) returns void language plpgsql as $$
declare v_succeeded boolean:=false;
begin
  begin
    execute p_sql;
    v_succeeded:=true;
  exception when others then
    if sqlerrm not like '%'||p_code||'%' then raise exception 'EXPECTED % GOT %', p_code, sqlerrm; end if;
  end;
  -- Raised outside the inner block so the handler above cannot swallow it.
  if v_succeeded then raise exception 'EXPECTED % BUT STATEMENT SUCCEEDED: %', p_code, p_sql; end if;
end $$;
create function scenario.item(p_id text, p_stem text) returns jsonb language sql as $$
  select jsonb_build_object('itemId',p_id,'levelHypothesis','B1','formFamily','synthetic-family',
   'lemma','placeholder','sense','synthetic sense','stem',p_stem,'correctOptionId','C',
   'options',jsonb_build_array(jsonb_build_object('id','A','text','alpha'),jsonb_build_object('id','B','text','beta'),
     jsonb_build_object('id','C','text','gamma'),jsonb_build_object('id','D','text','delta')))
$$;

insert into public.profiles(id,role,active) values
 ('00000000-0000-0000-0000-00000000000a','admin',true),
 ('00000000-0000-0000-0000-00000000000b','admin',true),
 ('00000000-0000-0000-0000-00000000000c','teacher',true),
 ('00000000-0000-0000-0000-00000000000d','teacher',true),
 ('00000000-0000-0000-0000-00000000000e','student',true);

-- Access: only active admins.
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000c','inventory','{}')$$,'BANK_ACCESS_DENIED');
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000e','inventory','{}')$$,'BANK_ACCESS_DENIED');
do $$ begin
  if has_function_privilege('authenticated','public.vocabulary_diagnostic_bank_admin(uuid,text,jsonb)','EXECUTE')
     or has_function_privilege('anon','public.vocabulary_diagnostic_bank_admin(uuid,text,jsonb)','EXECUTE')
     or not has_function_privilege('service_role','public.vocabulary_diagnostic_bank_admin(uuid,text,jsonb)','EXECUTE')
  then raise exception 'BANK RPC GRANTS WRONG'; end if;
end $$;

-- Import: validated, versioned, never echoes content.
do $$ declare r jsonb; begin
  r:=public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
     jsonb_build_object('reason','synthetic import for scenario','items',jsonb_build_array(scenario.item('diag-synthetic-001','Synthetic placeholder stem number one?'))));
  if r::text ~* '(stem|options|correct|gamma|placeholder stem)' then raise exception 'IMPORT ECHOED CONTENT %',r; end if;
  if r->'imported'->0->>'version'<>'1' then raise exception 'BAD VERSION %',r; end if;
end $$;
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',jsonb_build_object('reason','too short'))$$,'REASON_REQUIRED');
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','duplicate stem should fail','items',jsonb_build_array(scenario.item('diag-synthetic-009','Synthetic placeholder stem number one?'))))$$,'CONTENT_REUSE_FORBIDDEN');
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','bad key should fail','items',jsonb_build_array(scenario.item('diag-synthetic-002','Synthetic placeholder stem two?')||'{"correctOptionId":"E"}')))$$,'INVALID_ITEM');
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','duplicate options should fail','items',jsonb_build_array(scenario.item('diag-synthetic-002','Synthetic placeholder stem two?')||
  '{"options":[{"id":"A","text":"same"},{"id":"B","text":"same"},{"id":"C","text":"x"},{"id":"D","text":"y"}]}')))$$,'INVALID_ITEM');
-- New content under an existing ID becomes version 2.
do $$ declare r jsonb; begin
  r:=public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
     jsonb_build_object('reason','synthetic revision for scenario','items',jsonb_build_array(scenario.item('diag-synthetic-001','Synthetic placeholder stem, revised?'))));
  if r->'imported'->0->>'version'<>'2' then raise exception 'EXPECTED VERSION 2 %',r; end if;
end $$;

-- Authoring-schema exports import: per-option rationales stay on options (rendered by the staff review page),
-- top-level metadata lands in `authoring`, unknown option keys are rejected.
select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','authoring export shape','items',jsonb_build_array(
    scenario.item('diag-synthetic-003','Synthetic placeholder stem three?')||jsonb_build_object(
      'construct','meaning_in_context','domain','school','partOfSpeech','verb',
      'levelReference',jsonb_build_object('framework','CEFR','status','unverified'),
      'source',jsonb_build_object('author','synthetic'),
      'options',jsonb_build_array(
        jsonb_build_object('id','A','text','alpha','rationale','synthetic rationale a'),
        jsonb_build_object('id','B','text','beta','rationale','synthetic rationale b'),
        jsonb_build_object('id','C','text','gamma','rationale','synthetic rationale c'),
        jsonb_build_object('id','D','text','delta','rationale','synthetic rationale d'))))));
do $$ declare i private.vocabulary_diagnostic_items%rowtype; d jsonb; begin
  select * into i from private.vocabulary_diagnostic_items where item_id='diag-synthetic-003';
  if exists(select 1 from jsonb_array_elements(i.options) o where (select array_agg(k order by k) from jsonb_object_keys(o) k)<>array['id','rationale','text'])
    then raise exception 'OPTIONS SHAPE WRONG %',i.options; end if;
  if i.authoring->>'construct'<>'meaning_in_context' or i.authoring->'levelReference'->>'framework'<>'CEFR'
     or i.authoring->>'partOfSpeech'<>'verb'
    then raise exception 'AUTHORING NOT KEPT %',i.authoring; end if;
  d:=public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-00000000000c','detail','{"itemId":"diag-synthetic-003","version":1}');
  if d->'item'->>'construct'<>'meaning_in_context' or d->'item'->'levelReference' is null or d->'item'->>'partOfSpeech'<>'verb'
     or (select o->>'rationale' from jsonb_array_elements(d->'item'->'options') o where o->>'id'='C')<>'synthetic rationale c'
    then raise exception 'REVIEW DETAIL MISSING METADATA %',d; end if;
end $$;
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','unknown option key should fail','items',jsonb_build_array(scenario.item('diag-synthetic-004','Synthetic placeholder stem four?')||
  '{"options":[{"id":"A","text":"a","extra":"x"},{"id":"B","text":"b"},{"id":"C","text":"c"},{"id":"D","text":"d"}]}')))$$,'INVALID_ITEM');

-- Immutability and deletion.
select scenario.expect_error($$update private.vocabulary_diagnostic_items set correct_option_id='A' where item_id='diag-synthetic-001' and version=1$$,'ITEM_CONTENT_IMMUTABLE');
select scenario.expect_error($$update private.vocabulary_diagnostic_items set stem='changed text here' where item_id='diag-synthetic-001' and version=1$$,'ITEM_CONTENT_IMMUTABLE');
select scenario.expect_error($$delete from private.vocabulary_diagnostic_items where item_id='diag-synthetic-001'$$,'ITEM_DELETE_FORBIDDEN');

-- Promotion requires the full existing review chain plus an independent admin.
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','promote',
  '{"itemId":"diag-synthetic-001","version":2,"to":"pilot","reason":"pilot evidence note that is long enough"}')$$,'REVIEW_SEQUENCE_REQUIRED');
do $$ declare q jsonb:='{"singleKey":true,"plausibleDistractors":true,"noAnswerClues":true,"appropriateLevel":true}'; begin
  perform public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-00000000000c','decision',
    jsonb_build_object('itemId','diag-synthetic-001','version',2,'stage','language','decision','approve','notes','language review ok','qualityConfirmations',q));
  perform public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-00000000000a','decision',
    jsonb_build_object('itemId','diag-synthetic-001','version',2,'stage','assessment','decision','approve','notes','assessment review ok','qualityConfirmations',q));
end $$;
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000b','promote',
  '{"itemId":"diag-synthetic-001","version":2,"to":"pilot","reason":"pilot evidence note that is long enough"}')$$,'CEFR_VERIFICATION_REQUIRED');
do $$ begin
  perform public.vocabulary_diagnostic_review_api('00000000-0000-0000-0000-00000000000d','decision',
    jsonb_build_object('itemId','diag-synthetic-001','version',2,'stage','cefr','decision','verify',
     'notes','CEFR reference checked against permitted source notes',
     'qualityConfirmations','{"singleKey":true,"plausibleDistractors":true,"noAnswerClues":true,"appropriateLevel":true}'::jsonb));
end $$;
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','promote',
  '{"itemId":"diag-synthetic-001","version":2,"to":"pilot","reason":"pilot evidence note that is long enough"}')$$,'INDEPENDENT_PUBLISHER_REQUIRED');
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000b','promote',
  '{"itemId":"diag-synthetic-001","version":2,"to":"pilot","reason":"short"}')$$,'REASON_REQUIRED');
select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000b','promote',
  '{"itemId":"diag-synthetic-001","version":2,"to":"pilot","reason":"pilot evidence note that is long enough"}');
select scenario.expect_error($$update private.vocabulary_diagnostic_items set review_status='draft' where item_id='diag-synthetic-001' and version=2$$,'ITEM_STATUS_REGRESSION');

-- Forms: draft membership only, release requires releasable items.
insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version) values ('SYN-FORM-A',1,'draft','syn'),('SYN-FORM-B',1,'draft','syn');
insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
 select id,1,'diag-synthetic-001',1,array['A','B','C','D'] from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-A';
select scenario.expect_error($$update private.vocabulary_diagnostic_forms set status='pilot' where form_code='SYN-FORM-A'$$,'FORM_ITEMS_NOT_RELEASABLE');
select scenario.expect_error($$update private.vocabulary_diagnostic_forms set status='pilot' where form_code='SYN-FORM-B'$$,'FORM_ITEMS_NOT_RELEASABLE');
insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
 select id,1,'diag-synthetic-001',2,array['B','A','D','C'] from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-B';
update private.vocabulary_diagnostic_forms set status='pilot' where form_code='SYN-FORM-B';
select scenario.expect_error($$update private.vocabulary_diagnostic_form_items set option_order=array['A','B','C','D'] where form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-B')$$,'FORM_LOCKED');

-- Membership moves and deletes check both the source (OLD) and destination (NEW) forms.
select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','synthetic draft item for membership tests','items',jsonb_build_array(scenario.item('diag-synthetic-002','Synthetic placeholder stem two?'))));
insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version) values ('SYN-FORM-C',1,'draft','syn'),('SYN-FORM-D',1,'draft','syn');
insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
 select id,1,'diag-synthetic-002',1,array['A','B','C','D'] from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-C';
delete from private.vocabulary_diagnostic_form_items where form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-C');
do $$ begin if exists(select 1 from private.vocabulary_diagnostic_form_items fi join private.vocabulary_diagnostic_forms f on f.id=fi.form_id where f.form_code='SYN-FORM-C')
  then raise exception 'DRAFT DELETE DID NOT APPLY'; end if; end $$;
select scenario.expect_error($$delete from private.vocabulary_diagnostic_form_items where form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-B')$$,'FORM_LOCKED');
insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
 select id,1,'diag-synthetic-002',1,array['A','B','C','D'] from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-C';
select scenario.expect_error($$update private.vocabulary_diagnostic_form_items set form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-C'), position=9
  where form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-B')$$,'FORM_LOCKED');
select scenario.expect_error($$update private.vocabulary_diagnostic_form_items set form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-B'), position=9
  where form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-C')$$,'FORM_LOCKED');
update private.vocabulary_diagnostic_form_items set form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-D')
  where form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-C');
do $$ begin
  if (select count(*) from private.vocabulary_diagnostic_form_items fi join private.vocabulary_diagnostic_forms f on f.id=fi.form_id where f.form_code='SYN-FORM-D')<>1
     or (select count(*) from private.vocabulary_diagnostic_form_items fi join private.vocabulary_diagnostic_forms f on f.id=fi.form_id where f.form_code='SYN-FORM-B')<>1
  then raise exception 'DRAFT-TO-DRAFT MOVE WRONG'; end if;
end $$;

-- Retirement: blocked while in a released form, idempotent, terminal, never deletes.
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','retire',
  '{"reason":"compromised by public exposure","items":[{"itemId":"diag-synthetic-001","version":2}]}')$$,'ITEM_IN_RELEASED_FORM');
do $$ declare r jsonb; begin
  r:=public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','retire',
     '{"reason":"compromised by public exposure","items":[{"itemId":"diag-synthetic-001","version":1}]}');
  if (r->>'retired')::int<>1 then raise exception 'RETIRE FAILED %',r; end if;
  r:=public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','retire',
     '{"reason":"compromised by public exposure","items":[{"itemId":"diag-synthetic-001","version":1}]}');
  if (r->>'alreadyRetired')::int<>1 then raise exception 'RETIRE NOT IDEMPOTENT %',r; end if;
end $$;
select scenario.expect_error($$update private.vocabulary_diagnostic_items set review_status='approved' where item_id='diag-synthetic-001' and version=1$$,'ITEM_RETIRED');
-- Retired item still sits in draft form A (history preserved) but cannot be added anywhere new.
select scenario.expect_error($$insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
  select id,2,'diag-synthetic-001',1,array['A','B','C','D'] from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-A'$$,'ITEM_RETIRED');
-- Retired text cannot be re-imported under a new ID.
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','import',
  jsonb_build_object('reason','reuse of retired text','items',jsonb_build_array(scenario.item('diag-synthetic-777','Synthetic placeholder stem number one?'))))$$,'CONTENT_REUSE_FORBIDDEN');
update private.vocabulary_diagnostic_form_items set option_order=array['D','C','B','A'] where item_id='diag-synthetic-001' and item_version=1;
select scenario.expect_error($$update private.vocabulary_diagnostic_form_items set form_id=(select id from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-D'), position=5
  where item_id='diag-synthetic-001' and item_version=1$$,'ITEM_RETIRED');
select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','retire-form','{"formCode":"SYN-FORM-A","reason":"retire compromised draft form"}');
select scenario.expect_error($$update private.vocabulary_diagnostic_forms set status='draft' where form_code='SYN-FORM-A'$$,'FORM_RETIRED');
select scenario.expect_error($$delete from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-A'$$,'FORM_DELETE_FORBIDDEN');

-- Sessions can only be created on released forms; retire-form refuses while a session is open.
insert into private.vocabulary_diagnostic_assignments(student_id,assigned_by,form_id,kind)
 select '00000000-0000-0000-0000-00000000000e','00000000-0000-0000-0000-00000000000a',id,'baseline' from private.vocabulary_diagnostic_forms where form_code in ('SYN-FORM-A','SYN-FORM-B');
select scenario.expect_error($$insert into private.vocabulary_diagnostic_sessions(assignment_id,student_id,form_id,kind)
  select a.id,a.student_id,a.form_id,a.kind from private.vocabulary_diagnostic_assignments a join private.vocabulary_diagnostic_forms f on f.id=a.form_id where f.form_code='SYN-FORM-A'$$,'FORM_UNAVAILABLE');
insert into private.vocabulary_diagnostic_sessions(assignment_id,student_id,form_id,kind)
  select a.id,a.student_id,a.form_id,a.kind from private.vocabulary_diagnostic_assignments a join private.vocabulary_diagnostic_forms f on f.id=a.form_id where f.form_code='SYN-FORM-B';
select scenario.expect_error($$select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','retire-form','{"formCode":"SYN-FORM-B","reason":"retire while session open"}')$$,'FORM_HAS_OPEN_SESSIONS');

-- Audit is append-only.
select scenario.expect_error($$delete from private.vocabulary_diagnostic_item_events$$,'AUDIT_APPEND_ONLY');
select scenario.expect_error($$update private.vocabulary_diagnostic_item_events set reason='edited reason text'$$,'AUDIT_APPEND_ONLY');

select 'PASS' as result,
  (select count(*) from private.vocabulary_diagnostic_items) as item_rows,
  (select count(*) from private.vocabulary_diagnostic_item_events) as audit_rows,
  public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','inventory','{}') as inventory;
