-- Vocabulary diagnostic: private item lifecycle (import, version, promote, retire).
-- STATUS: prepared for review, NOT APPLIED to any Supabase project.
-- Apply only through a reviewed managed migration after the live schema has
-- been re-verified. Additive: creates one audit table, guard triggers and one
-- service-role-only RPC. It does not touch students, assignments, sessions,
-- responses, results, vocabulary progress or the (absent) practice gate.
--
-- Boundary: item text, options and keys enter Postgres only through
-- public.vocabulary_diagnostic_bank_admin('import'), called from the Supabase
-- SQL Editor or a trusted server process. No RPC result echoes item content.

create table if not exists private.vocabulary_diagnostic_item_events (
 id uuid primary key default gen_random_uuid(),
 item_id text,
 item_version integer,
 form_id uuid references private.vocabulary_diagnostic_forms(id) on delete restrict,
 event text not null check (event in ('imported','promoted_pilot','promoted_approved','retired','form_retired')),
 actor_id uuid not null references public.profiles(id) on delete restrict,
 reason text not null default '' check (length(reason)<=1500),
 created_at timestamptz not null default now(),
 foreign key (item_id,item_version) references private.vocabulary_diagnostic_items(item_id,version) on delete restrict,
 check ((item_id is not null and item_version is not null and form_id is null)
     or (item_id is null and item_version is null and form_id is not null))
);
create index if not exists diag_item_events_item_idx on private.vocabulary_diagnostic_item_events(item_id,item_version,created_at);
alter table private.vocabulary_diagnostic_item_events enable row level security;
revoke all on private.vocabulary_diagnostic_item_events from public,anon,authenticated;

-- Audit rows are append-only.
create or replace function private.vocabulary_diagnostic_append_only()
returns trigger language plpgsql set search_path='' as $$
begin
 raise exception 'AUDIT_APPEND_ONLY';
end;
$$;
drop trigger if exists vocab_diag_item_events_append_only on private.vocabulary_diagnostic_item_events;
create trigger vocab_diag_item_events_append_only
 before update or delete on private.vocabulary_diagnostic_item_events
 for each row execute function private.vocabulary_diagnostic_append_only();

-- Item versions are immutable: content changes require a new version row.
-- Status may only move forward; retired is terminal; rows are never deleted.
create or replace function private.vocabulary_diagnostic_item_guard()
returns trigger language plpgsql set search_path='' as $$
declare
 v_rank constant jsonb:='{"draft":0,"language_reviewed":1,"assessment_reviewed":2,"pilot":3,"approved":4,"retired":5}';
begin
 if tg_op='DELETE' then raise exception 'ITEM_DELETE_FORBIDDEN'; end if;
 if (new.item_id,new.version,new.form_family,new.level_hypothesis,new.lemma,
     new.tested_sense,new.stem,new.options,new.correct_option_id)
    is distinct from
    (old.item_id,old.version,old.form_family,old.level_hypothesis,old.lemma,
     old.tested_sense,old.stem,old.options,old.correct_option_id)
   then raise exception 'ITEM_CONTENT_IMMUTABLE'; end if;
 if old.review_status='retired' and new.review_status<>'retired'
   then raise exception 'ITEM_RETIRED'; end if;
 if (v_rank->>new.review_status)::int < (v_rank->>old.review_status)::int
   then raise exception 'ITEM_STATUS_REGRESSION'; end if;
 return new;
end;
$$;
drop trigger if exists vocab_diag_item_guard on private.vocabulary_diagnostic_items;
create trigger vocab_diag_item_guard
 before update or delete on private.vocabulary_diagnostic_items
 for each row execute function private.vocabulary_diagnostic_item_guard();

-- Forms: only draft forms can change membership; retired items cannot be
-- added; a form can be released only when every item is pilot/approved;
-- retired forms are terminal.
create or replace function private.vocabulary_diagnostic_form_item_guard()
returns trigger language plpgsql set search_path='' as $$
declare v_status text;
begin
 -- UPDATE and DELETE remove membership from OLD's form; INSERT and UPDATE
 -- add membership to NEW's form. Both sides must be draft.
 if tg_op in ('UPDATE','DELETE') then
   select status into v_status from private.vocabulary_diagnostic_forms
    where id=old.form_id for share;
   if v_status is distinct from 'draft' then raise exception 'FORM_LOCKED'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 select status into v_status from private.vocabulary_diagnostic_forms
  where id=new.form_id for share;
 if v_status is distinct from 'draft' then raise exception 'FORM_LOCKED'; end if;
 if (tg_op='INSERT' or (new.form_id,new.item_id,new.item_version) is distinct from (old.form_id,old.item_id,old.item_version))
    and exists(select 1 from private.vocabulary_diagnostic_items i
      where i.item_id=new.item_id and i.version=new.item_version and i.review_status='retired')
   then raise exception 'ITEM_RETIRED'; end if;
 return new;
end;
$$;
drop trigger if exists vocab_diag_form_item_guard on private.vocabulary_diagnostic_form_items;
create trigger vocab_diag_form_item_guard
 before insert or update or delete on private.vocabulary_diagnostic_form_items
 for each row execute function private.vocabulary_diagnostic_form_item_guard();

create or replace function private.vocabulary_diagnostic_form_guard()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' then raise exception 'FORM_DELETE_FORBIDDEN'; end if;
 if old.status='retired' and new.status<>'retired' then raise exception 'FORM_RETIRED'; end if;
 if new.status in ('pilot','approved') and new.status is distinct from old.status and (
    not exists(select 1 from private.vocabulary_diagnostic_form_items where form_id=new.id)
    or exists(select 1 from private.vocabulary_diagnostic_form_items fi
      join private.vocabulary_diagnostic_items i on i.item_id=fi.item_id and i.version=fi.item_version
      where fi.form_id=new.id and i.review_status not in ('pilot','approved')))
   then raise exception 'FORM_ITEMS_NOT_RELEASABLE'; end if;
 return new;
end;
$$;
drop trigger if exists vocab_diag_form_guard on private.vocabulary_diagnostic_forms;
create trigger vocab_diag_form_guard
 before update or delete on private.vocabulary_diagnostic_forms
 for each row execute function private.vocabulary_diagnostic_form_guard();

-- A session may only be created on a released form. FOR SHARE serialises with
-- retire-form's FOR UPDATE, so a concurrent start either sees the retired form
-- or makes retire-form see the open session.
create or replace function private.vocabulary_diagnostic_session_form_guard()
returns trigger language plpgsql set search_path='' as $$
declare v_status text;
begin
 select status into v_status from private.vocabulary_diagnostic_forms
  where id=new.form_id for share;
 if v_status is distinct from 'pilot' and v_status is distinct from 'approved'
   then raise exception 'FORM_UNAVAILABLE'; end if;
 return new;
end;
$$;
drop trigger if exists vocab_diag_session_form_guard on private.vocabulary_diagnostic_sessions;
create trigger vocab_diag_session_form_guard
 before insert or update of form_id on private.vocabulary_diagnostic_sessions
 for each row execute function private.vocabulary_diagnostic_session_form_guard();

create or replace function public.vocabulary_diagnostic_bank_admin(
 p_actor uuid, p_action text, p_data jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer
set search_path=''
as $$
declare
 v_role text;
 v_reason text:=btrim(coalesce(p_data->>'reason',''));
 v_entry jsonb;
 v_id text;
 v_version integer;
 v_item private.vocabulary_diagnostic_items%rowtype;
 v_target text;
 v_language uuid;
 v_assessment uuid;
 v_form private.vocabulary_diagnostic_forms%rowtype;
 v_done jsonb:='[]'::jsonb;
 v_skipped integer:=0;
begin
 select role::text into v_role from public.profiles where id=p_actor and active;
 if v_role is distinct from 'admin' then raise exception 'BANK_ACCESS_DENIED'; end if;

 if p_action='inventory' then
   return jsonb_build_object(
    'items',coalesce((select jsonb_agg(to_jsonb(x)) from (
      select level_hypothesis as level, review_status as status, count(*) as n
      from private.vocabulary_diagnostic_items group by 1,2 order by 1,2) x),'[]'::jsonb),
    'forms',coalesce((select jsonb_agg(to_jsonb(x)) from (
      select status, count(*) as n from private.vocabulary_diagnostic_forms group by 1 order by 1) x),'[]'::jsonb));
 end if;

 if length(v_reason)<12 or length(v_reason)>1500 then raise exception 'REASON_REQUIRED'; end if;

 if p_action='import' then
   if jsonb_typeof(p_data->'items') is distinct from 'array'
      or jsonb_array_length(p_data->'items') not between 1 and 50
     then raise exception 'INVALID_IMPORT'; end if;
   for v_entry in select value from jsonb_array_elements(p_data->'items') loop
     v_id:=v_entry->>'itemId';
     if v_id is null or v_id !~ '^diag-[a-z0-9-]{6,80}$'
        or coalesce(v_entry->>'levelHypothesis','') not in ('A1','A2','B1','B2','C1')
        or length(btrim(coalesce(v_entry->>'formFamily','')))<4
        or length(btrim(coalesce(v_entry->>'lemma','')))<1
        or length(btrim(coalesce(v_entry->>'sense','')))<3
        or length(btrim(coalesce(v_entry->>'stem','')))<10 or length(v_entry->>'stem')>600
        or coalesce(v_entry->>'correctOptionId','') not in ('A','B','C','D')
        or jsonb_typeof(v_entry->'options') is distinct from 'array'
        or jsonb_array_length(v_entry->'options')<>4
        or (select count(distinct o->>'id') from jsonb_array_elements(v_entry->'options') o
             where o->>'id' in ('A','B','C','D'))<>4
        or exists(select 1 from jsonb_array_elements(v_entry->'options') o
             where jsonb_typeof(o) is distinct from 'object'
                or length(btrim(coalesce(o->>'text','')))<1 or length(o->>'text')>300
                or exists(select 1 from jsonb_object_keys(o) k where k not in ('id','text','rationale'))
                or (o ? 'rationale' and (jsonb_typeof(o->'rationale') is distinct from 'string' or length(o->>'rationale')>300)))
        or (select count(distinct lower(btrim(o->>'text'))) from jsonb_array_elements(v_entry->'options') o)<>4
        or (v_entry ? 'authoring' and jsonb_typeof(v_entry->'authoring') is distinct from 'object')
       then raise exception 'INVALID_ITEM'; end if;
     -- Exposed or previously used text can never come back as a "new" item.
     if exists(select 1 from private.vocabulary_diagnostic_items i
        where lower(btrim(i.stem))=lower(btrim(v_entry->>'stem')))
       then raise exception 'CONTENT_REUSE_FORBIDDEN'; end if;
     select coalesce(max(version),0)+1 into v_version
       from private.vocabulary_diagnostic_items where item_id=v_id;
     insert into private.vocabulary_diagnostic_items
       (item_id,version,form_family,level_hypothesis,lemma,tested_sense,stem,options,correct_option_id,authoring,review_status)
     values (v_id,v_version,btrim(v_entry->>'formFamily'),v_entry->>'levelHypothesis',
       btrim(v_entry->>'lemma'),btrim(v_entry->>'sense'),btrim(v_entry->>'stem'),
       -- Options keep id/text/rationale, the shape the staff review page renders;
       -- students only ever receive id/text via private.vocabulary_diagnostic_safe_question.
       -- Schema top-level metadata is kept in `authoring`, where review_api reads it.
       (select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',o->>'id','text',btrim(o->>'text'),'rationale',o->'rationale')) order by o->>'id')
          from jsonb_array_elements(v_entry->'options') o),
       v_entry->>'correctOptionId',
       coalesce(v_entry->'authoring','{}'::jsonb)||jsonb_strip_nulls(jsonb_build_object(
         'construct',v_entry->'construct','domain',v_entry->'domain','partOfSpeech',v_entry->'partOfSpeech',
         'levelReference',v_entry->'levelReference','source',v_entry->'source',
         'review',v_entry->'review','calibration',v_entry->'calibration')),
       'draft');
     insert into private.vocabulary_diagnostic_item_events(item_id,item_version,event,actor_id,reason)
       values (v_id,v_version,'imported',p_actor,v_reason);
     v_done:=v_done||jsonb_build_object('itemId',v_id,'version',v_version);
   end loop;
   return jsonb_build_object('imported',v_done);

 elsif p_action='promote' then
   v_id:=p_data->>'itemId';
   v_version:=nullif(p_data->>'version','')::integer;
   v_target:=p_data->>'to';
   if v_target not in ('pilot','approved') then raise exception 'INVALID_PROMOTION'; end if;
   if length(v_reason)<30 then raise exception 'EVIDENCE_REQUIRED'; end if;
   select * into v_item from private.vocabulary_diagnostic_items
    where item_id=v_id and version=v_version for update;
   if not found then raise exception 'ITEM_UNAVAILABLE'; end if;
   if v_target='pilot' then
     if v_item.review_status<>'assessment_reviewed' then raise exception 'REVIEW_SEQUENCE_REQUIRED'; end if;
     if exists(select 1 from private.vocabulary_diagnostic_reviews
        where item_id=v_id and item_version=v_version and decision in ('flag','reject'))
       then raise exception 'REVISION_REQUIRED'; end if;
     if not exists(select 1 from private.vocabulary_diagnostic_reviews
        where item_id=v_id and item_version=v_version and stage='cefr' and decision='verify')
       then raise exception 'CEFR_VERIFICATION_REQUIRED'; end if;
     select reviewer_id into v_language from private.vocabulary_diagnostic_reviews
      where item_id=v_id and item_version=v_version and stage='language' and decision='approve'
      order by created_at desc limit 1;
     select reviewer_id into v_assessment from private.vocabulary_diagnostic_reviews
      where item_id=v_id and item_version=v_version and stage='assessment' and decision='approve'
      order by created_at desc limit 1;
     if p_actor in (v_language,v_assessment) then raise exception 'INDEPENDENT_PUBLISHER_REQUIRED'; end if;
   elsif v_item.review_status<>'pilot' then raise exception 'REVIEW_SEQUENCE_REQUIRED';
   end if;
   update private.vocabulary_diagnostic_items set review_status=v_target
    where item_id=v_id and version=v_version;
   insert into private.vocabulary_diagnostic_item_events(item_id,item_version,event,actor_id,reason)
    values (v_id,v_version,'promoted_'||v_target,p_actor,v_reason);
   return jsonb_build_object('itemId',v_id,'version',v_version,'status',v_target);

 elsif p_action='retire' then
   if jsonb_typeof(p_data->'items') is distinct from 'array'
      or jsonb_array_length(p_data->'items') not between 1 and 500
     then raise exception 'INVALID_RETIREMENT'; end if;
   for v_entry in select value from jsonb_array_elements(p_data->'items') loop
     v_id:=v_entry->>'itemId';
     v_version:=nullif(v_entry->>'version','')::integer;
     select * into v_item from private.vocabulary_diagnostic_items
      where item_id=v_id and version=v_version for update;
     if not found then raise exception 'ITEM_UNAVAILABLE'; end if;
     if v_item.review_status='retired' then v_skipped:=v_skipped+1; continue; end if;
     if exists(select 1 from private.vocabulary_diagnostic_form_items fi
        join private.vocabulary_diagnostic_forms f on f.id=fi.form_id
        where fi.item_id=v_id and fi.item_version=v_version and f.status in ('pilot','approved'))
       then raise exception 'ITEM_IN_RELEASED_FORM'; end if;
     update private.vocabulary_diagnostic_items set review_status='retired'
      where item_id=v_id and version=v_version;
     insert into private.vocabulary_diagnostic_item_events(item_id,item_version,event,actor_id,reason)
      values (v_id,v_version,'retired',p_actor,v_reason);
     v_done:=v_done||jsonb_build_object('itemId',v_id,'version',v_version);
   end loop;
   return jsonb_build_object('retired',jsonb_array_length(v_done),'alreadyRetired',v_skipped);

 elsif p_action='retire-form' then
   select * into v_form from private.vocabulary_diagnostic_forms
    where form_code=p_data->>'formCode' for update;
   if not found then raise exception 'FORM_UNAVAILABLE'; end if;
   if v_form.status='retired' then return jsonb_build_object('formCode',v_form.form_code,'status','retired'); end if;
   if exists(select 1 from private.vocabulary_diagnostic_sessions
      where form_id=v_form.id and state in ('in_progress','interrupted'))
     then raise exception 'FORM_HAS_OPEN_SESSIONS'; end if;
   update private.vocabulary_diagnostic_forms set status='retired' where id=v_form.id;
   insert into private.vocabulary_diagnostic_item_events(form_id,event,actor_id,reason)
    values (v_form.id,'form_retired',p_actor,v_reason);
   return jsonb_build_object('formCode',v_form.form_code,'status','retired');
 end if;
 raise exception 'UNKNOWN_BANK_ACTION';
end;
$$;
revoke all on function public.vocabulary_diagnostic_bank_admin(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.vocabulary_diagnostic_bank_admin(uuid,text,jsonb) to service_role;
