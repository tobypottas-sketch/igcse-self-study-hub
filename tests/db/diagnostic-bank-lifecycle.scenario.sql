-- Behavioural scenario for supabase/diagnostic/item_lifecycle_NOT_APPLIED.sql.
-- THROWAWAY local Postgres only, via tests/db/run-diagnostic-lifecycle-scenario.sh.
-- All item text below is synthetic placeholder text, not diagnostic content.
create schema scenario;
create function scenario.expect_error(p_sql text, p_code text) returns void language plpgsql as $$
begin
  execute p_sql;
  raise exception 'EXPECTED % BUT STATEMENT SUCCEEDED: %', p_code, p_sql;
exception when others then
  if sqlerrm not like '%'||p_code||'%' then raise exception 'EXPECTED % GOT %', p_code, sqlerrm; end if;
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
select public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','retire-form','{"formCode":"SYN-FORM-A","reason":"retire compromised draft form"}');
select scenario.expect_error($$update private.vocabulary_diagnostic_forms set status='draft' where form_code='SYN-FORM-A'$$,'FORM_RETIRED');
select scenario.expect_error($$delete from private.vocabulary_diagnostic_forms where form_code='SYN-FORM-A'$$,'FORM_DELETE_FORBIDDEN');

-- Audit is append-only.
select scenario.expect_error($$delete from private.vocabulary_diagnostic_item_events$$,'AUDIT_APPEND_ONLY');
select scenario.expect_error($$update private.vocabulary_diagnostic_item_events set reason='edited reason text'$$,'AUDIT_APPEND_ONLY');

select 'PASS' as result,
  (select count(*) from private.vocabulary_diagnostic_items) as item_rows,
  (select count(*) from private.vocabulary_diagnostic_item_events) as audit_rows,
  public.vocabulary_diagnostic_bank_admin('00000000-0000-0000-0000-00000000000a','inventory','{}') as inventory;
