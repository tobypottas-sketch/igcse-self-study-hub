-- Editorial-revision migration against two synthetic DRAFT baseline forms.
-- THROWAWAY local Postgres only. Synthetic placeholder content only.
-- Run: tests/db/run-diagnostic-lifecycle-scenario.sh tests/db/diagnostic-editorial-revisions.scenario.sql
create schema rev;
create function rev.expect_error(p_sql text, p_code text) returns void language plpgsql as $$
declare v_succeeded boolean:=false;
begin
  begin execute p_sql; v_succeeded:=true;
  exception when others then
    if sqlerrm not like '%'||p_code||'%' then raise exception 'EXPECTED % GOT %', p_code, sqlerrm; end if;
  end;
  if v_succeeded then raise exception 'EXPECTED % BUT STATEMENT SUCCEEDED: %', p_code, p_sql; end if;
end $$;
create function rev.level(n int) returns text language sql immutable as
 $$ select (array['A1','A2','B1','B2','C1'])[case when n<=50 then (n-1)/10 else (n-51)/6 end + 1] $$;
create function rev.id(n int) returns text language sql immutable as $$ select 'diag-candidate-'||lpad(n::text,3,'0') $$;
insert into public.profiles(id,role,active) values
 ('00000000-0000-0000-0000-0000000000a1','admin',true),('00000000-0000-0000-0000-0000000000e1','student',true);

-- 80 synthetic v1 items split A/B like assemble_draft_forms.sql (alternate within level+construct);
-- each form gets 8 per level and 10 keys in each displayed slot.
do $$ declare v_a uuid; v_b uuid; begin
  insert into private.vocabulary_diagnostic_items(item_id,version,form_family,level_hypothesis,lemma,tested_sense,stem,options,correct_option_id,authoring)
  select rev.id(n),1,'synthetic-80',rev.level(n),'lemma-'||n,'synthetic sense','Synthetic original stem '||n,
    jsonb_build_array(jsonb_build_object('id','A','text','orig '||n||'A'),jsonb_build_object('id','B','text','orig '||n||'B'),
      jsonb_build_object('id','C','text','orig '||n||'C'),jsonb_build_object('id','D','text','orig '||n||'D')),
    (array['A','B','C','D'])[n%4+1],
    jsonb_build_object('construct',case when n<=50 then 'context' when (n-51)%6<4 then 'precise' else 'phrase' end)
  from generate_series(1,80) n;
  insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version) values
    ('DIAG-BASELINE-A-DRAFT',1,'draft','syn') returning id into v_a;
  insert into private.vocabulary_diagnostic_forms(form_code,version,status,item_bank_version) values
    ('DIAG-BASELINE-B-DRAFT',1,'draft','syn') returning id into v_b;
  with ordered as (
    select i.item_id,i.level_hypothesis,i.correct_option_id,
      row_number() over(partition by i.level_hypothesis,i.authoring->>'construct' order by i.item_id) g
    from private.vocabulary_diagnostic_items i),
  allocated as (
    select case when g%2=1 then v_a else v_b end f,item_id,correct_option_id,
      row_number() over(partition by g%2 order by level_hypothesis,item_id) p from ordered)
  insert into private.vocabulary_diagnostic_form_items(form_id,position,item_id,item_version,option_order)
  select f,p,item_id,1,array['A','B','C','D']
  from allocated;
end $$;
-- Key at displayed slot (position-1)%4+1, so each form has 10 keys per slot.
update private.vocabulary_diagnostic_form_items fi set option_order=(
  select array_agg(case when s=(fi.position-1)%4+1 then i.correct_option_id
    else (array(select x from unnest(array['A','B','C','D']) x where x<>i.correct_option_id order by x))[case when s<(fi.position-1)%4+1 then s else s-1 end] end order by s)
  from generate_series(1,4) s)
from private.vocabulary_diagnostic_items i where i.item_id=fi.item_id and i.version=fi.item_version;

create table rev.v1_snapshot as select md5(string_agg(row(i.*)::text,',' order by item_id)) h
  from private.vocabulary_diagnostic_items i;
create table rev.slots_before as
  select f.form_code,fi.position,fi.item_id,array_position(fi.option_order,i.correct_option_id) slot
  from private.vocabulary_diagnostic_form_items fi join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
  join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version;
do $$ begin
  if exists(select 1 from rev.slots_before group by form_code,slot having count(*)<>10) then raise exception 'FIXTURE KEY SLOTS NOT BALANCED'; end if;
end $$;

-- Synthetic package: same 20 IDs/forms as the real proposal; one keeps its old key letter.
create temp table diag_editorial_package(doc jsonb not null);
insert into pg_temp.diag_editorial_package(doc)
select jsonb_build_object('package_version','synthetic-v1','proposed_replacements',jsonb_agg(jsonb_build_object(
  'form',x.form,'item_id',rev.id(x.n),'provisional_level',rev.level(x.n),'target_lemma','lemma-'||x.n,
  'stem','Synthetic revised stem '||x.n,
  'options',jsonb_build_array(jsonb_build_object('id','A','text','revised '||x.n||'A'),jsonb_build_object('id','B','text','revised '||x.n||'B'),
    jsonb_build_object('id','C','text','revised '||x.n||'C'),jsonb_build_object('id','D','text','revised '||x.n||'D')),
  'correct_option_id',(array['A','B','C','D'])[case when x.n=11 then x.n%4 else (x.n+1)%4 end + 1],
  'editorial_rationale','synthetic') order by x.n))
from (values ('A',11),('A',61),('A',59),('A',65),('A',25),('A',29),('A',39),('A',45),
  ('B',12),('B',58),('B',62),('B',64),('B',74),('B',76),('B',60),('B',66),('B',18),('B',26),('B',38),('B',48)) x(form,n);

\i supabase/diagnostic/editorial_revisions_NOT_APPLIED.sql

-- Fail-closed checks (each runs in a subtransaction and is rolled back).
select rev.expect_error($q$do $d$ begin update private.vocabulary_diagnostic_forms set status='retired' where form_code='DIAG-BASELINE-B-DRAFT';
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'FORMS_NOT_BOTH_DRAFT');
select rev.expect_error($q$do $d$ begin insert into private.vocabulary_diagnostic_assignments(student_id,assigned_by,form_id,kind)
  select '00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000a1',id,'baseline' from private.vocabulary_diagnostic_forms where form_code='DIAG-BASELINE-A-DRAFT';
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'FORM_ALREADY_ASSIGNED');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,form}','"B"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'ITEM_NOT_IN_FORM');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,expected_current_version}','2');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'ITEM_VERSION_MISMATCH');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,target_lemma}','"other"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'LEMMA_MISMATCH');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,provisional_level}','"C1"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'LEVEL_MISMATCH');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,stem}','"Synthetic original stem 11"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'STEM_UNCHANGED');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,options,1,text}','"revised 11A"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'OPTIONS_INVALID');
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,0,correct_option_id}','"E"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'KEY_INVALID');
-- A late failure (after some inserts) must leave nothing behind.
select rev.expect_error($q$do $d$ begin update pg_temp.diag_editorial_package set doc=jsonb_set(doc,'{proposed_replacements,19,target_lemma}','"other"');
  perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'LEMMA_MISMATCH');
do $$ begin
  if (select count(*) from private.vocabulary_diagnostic_items)<>80 then raise exception 'FAILED RUN LEFT ROWS'; end if;
end $$;

create table rev.applied as select * from pg_temp.diag_apply_editorial_revisions();

do $$ begin
  if (select count(*) from rev.applied)<>20 or (select count(*) from rev.applied where to_version=2 and from_version=1)<>20
    then raise exception 'EXPECTED 20 v1->v2 REPLACEMENTS'; end if;
  if (select count(*) from rev.applied where form_code='DIAG-BASELINE-A-DRAFT')<>8 then raise exception 'EXPECTED 8 IN FORM A'; end if;
  if (select count(*) from private.vocabulary_diagnostic_items)<>100 then raise exception 'EXPECTED 80 v1 + 20 v2 ITEMS'; end if;
  if (select md5(string_agg(row(i.*)::text,',' order by item_id)) from private.vocabulary_diagnostic_items i where version=1)
     is distinct from (select h from rev.v1_snapshot) then raise exception 'v1 ITEMS CHANGED'; end if;
  if exists(select 1 from private.vocabulary_diagnostic_items where version=2 and (review_status<>'draft'
       or authoring->'editorialRevision'->>'status'<>'proposed-editorial-not-calibrated' or authoring->>'construct' is null))
    then raise exception 'v2 METADATA WRONG'; end if;
  if exists(select 1 from private.vocabulary_diagnostic_forms where status<>'draft') then raise exception 'FORM PUBLISHED'; end if;
  -- every slot keeps its item and key position; only the 20 replaced slots change version
  if exists(select 1 from rev.slots_before b
      join private.vocabulary_diagnostic_forms f on f.form_code=b.form_code
      join private.vocabulary_diagnostic_form_items fi on fi.form_id=f.id and fi.position=b.position
      join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
      where fi.item_id<>b.item_id or array_position(fi.option_order,i.correct_option_id)<>b.slot
         or fi.item_version<>case when exists(select 1 from rev.applied a where a.item_id=b.item_id) then 2 else 1 end)
    then raise exception 'SLOT ITEM/KEY POSITION CHANGED'; end if;
  if exists(select 1 from private.vocabulary_diagnostic_form_items fi
      join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
      join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
      group by f.form_code,i.level_hypothesis having count(*)<>8) then raise exception 'LEVEL BALANCE'; end if;
end $$;

-- Re-running is refused: the form now holds v2.
select rev.expect_error('select pg_temp.diag_apply_editorial_revisions()','ITEM_VERSION_MISMATCH');
-- An unused newer version also blocks.
select rev.expect_error($q$do $d$ begin update private.vocabulary_diagnostic_form_items fi set item_version=1,option_order=array['A','B','C','D'] from rev.applied a join private.vocabulary_diagnostic_forms f on f.form_code=a.form_code where fi.form_id=f.id and fi.position=a.form_position and a.item_id='diag-candidate-011'; perform pg_temp.diag_apply_editorial_revisions(); end $d$$q$,'NEWER_VERSION_EXISTS');
-- The read-only structural checker still runs cleanly (counts only).
\o /dev/null
\i supabase/diagnostic/verify_forms_readonly.sql
\o
select 'PASS' as result;
