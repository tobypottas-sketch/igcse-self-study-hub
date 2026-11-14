-- Review is accessible only through trusted authenticated Edge Function.
create table if not exists private.vocabulary_diagnostic_reviews (
 id uuid primary key default gen_random_uuid(),
 item_id text not null,
 item_version integer not null,
 reviewer_id uuid not null references public.profiles(id),
 stage text not null check(stage in ('language','assessment','cefr','flag')),
 decision text not null check(decision in ('approve','flag','reject','verify')),
 notes text not null default '',
 created_at timestamptz not null default now(),
 foreign key(item_id,item_version) references private.vocabulary_diagnostic_items(item_id,version) on delete restrict,
 check(length(notes)<=1500),
 check(stage<>'cefr' or decision in ('verify','flag','reject')),
 check(stage<>'flag' or decision='flag')
);
alter table private.vocabulary_diagnostic_reviews add column if not exists quality_confirmations jsonb;
create index if not exists diag_reviews_item_idx on private.vocabulary_diagnostic_reviews(item_id,item_version,created_at desc);
alter table private.vocabulary_diagnostic_reviews enable row level security;
revoke all on private.vocabulary_diagnostic_reviews from public,anon,authenticated;
-- This table is a factual audit; every decision is append-only.

create or replace function public.vocabulary_diagnostic_review_api(
 p_actor uuid, p_action text, p_data jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
 v_role text;
 v_item private.vocabulary_diagnostic_items%rowtype;
 v_id text;
 v_version integer;
 v_page integer;
 v_level text;
 v_stage text;
 v_decision text;
 v_notes text;
 v_language uuid;
 v_assessment uuid;
 v_verified uuid;
 v_review jsonb;
 v_quality jsonb;
begin
 select role::text into v_role from public.profiles where id=p_actor and active;
 if v_role not in ('teacher','admin') or v_role is null
   then raise exception 'REVIEW_ACCESS_DENIED'; end if;
 if p_action='list' then
   v_page:=greatest(0,least(100,coalesce(nullif(p_data->>'page','')::integer,0)));
   v_level:=nullif(p_data->>'level','');
   if v_level is not null and v_level not in ('A1','A2','B1','B2','C1')
     then raise exception 'INVALID_LEVEL'; end if;
   return jsonb_build_object(
     'total',(select count(*) from private.vocabulary_diagnostic_items i
       where v_level is null or i.level_hypothesis=v_level),
     'items',coalesce((select jsonb_agg(jsonb_build_object(
       'id',t.item_id,'version',t.version,'lemma',t.lemma,'level',t.level_hypothesis,
       'status',t.review_status,'construct',t.authoring->>'construct',
       'flags',(select count(*) from private.vocabulary_diagnostic_reviews r
         where r.item_id=t.item_id and r.item_version=t.version and r.decision in ('flag','reject')),
       'languageApproved',(select count(*)>0 from private.vocabulary_diagnostic_reviews r
         where r.item_id=t.item_id and r.item_version=t.version and r.stage='language' and r.decision='approve'),
       'assessmentApproved',(select count(*)>0 from private.vocabulary_diagnostic_reviews r
         where r.item_id=t.item_id and r.item_version=t.version and r.stage='assessment' and r.decision='approve'),
       'cefrVerified',(select count(*)>0 from private.vocabulary_diagnostic_reviews r
         where r.item_id=t.item_id and r.item_version=t.version and r.stage='cefr' and r.decision='verify')
       ) order by t.level_hypothesis,t.item_id)
       from (select * from private.vocabulary_diagnostic_items i
         where v_level is null or i.level_hypothesis=v_level
         order by i.level_hypothesis,i.item_id limit 10 offset v_page*10) t),'[]'::jsonb)
   );
 elsif p_action in ('detail','decision') then
   v_id:=p_data->>'itemId';
   v_version:=coalesce(nullif(p_data->>'version','')::integer,1);
   select * into v_item from private.vocabulary_diagnostic_items
     where item_id=v_id and version=v_version
     for update;
   if not found then raise exception 'ITEM_UNAVAILABLE'; end if;
   if p_action='detail' then
     return jsonb_build_object(
       'item',jsonb_build_object('id',v_item.item_id,'version',v_item.version,
       'lemma',v_item.lemma,'partOfSpeech',v_item.authoring->>'partOfSpeech',
       'level',v_item.level_hypothesis,'sense',v_item.tested_sense,'stem',v_item.stem,
       'options',v_item.options,'correctOptionId',v_item.correct_option_id,
       'status',v_item.review_status,'source',v_item.authoring->'source',
       'levelReference',v_item.authoring->'levelReference',
       'construct',v_item.authoring->>'construct'),
       'reviews',coalesce((select jsonb_agg(jsonb_build_object(
         'stage',r.stage,'decision',r.decision,'notes',r.notes,'qualityConfirmations',r.quality_confirmations,
         'reviewerId',r.reviewer_id,'createdAt',r.created_at)
         order by r.created_at desc)
         from private.vocabulary_diagnostic_reviews r
         where r.item_id=v_id and r.item_version=v_version),'[]'::jsonb)
     );
   end if;
   v_stage:=p_data->>'stage';v_decision:=p_data->>'decision';
   v_notes:=trim(coalesce(p_data->>'notes',''));
   v_quality:=p_data->'qualityConfirmations';
   if v_stage not in ('language','assessment','cefr','flag')
      or v_decision not in ('approve','flag','reject','verify')
      or length(v_notes)>1500
      or length(v_notes)<12
      or (v_stage='cefr' and v_decision not in ('verify','flag','reject'))
      or (v_stage='flag' and v_decision<>'flag')
      or (v_stage not in ('cefr','flag') and v_decision='verify')
     then raise exception 'INVALID_REVIEW'; end if;
   -- Quality attestations are required for approval and CEFR verification.
   -- Reject missing, partial, or incorrectly typed claims at the trusted RPC.
   if v_decision in ('approve','verify') and (
     jsonb_typeof(v_quality) is distinct from 'object'
     or v_quality is distinct from '{"singleKey":true,"plausibleDistractors":true,"noAnswerClues":true,"appropriateLevel":true}'::jsonb
   ) then raise exception 'QUALITY_CONFIRMATIONS_REQUIRED'; end if;
   if v_item.review_status in ('pilot','approved','retired')
      then raise exception 'ITEM_LOCKED'; end if;
   -- Block promotion if prior flags/rejections exist, until a future version is
   -- authored and re-reviewed. Flags cannot be dismissed silently.
   if v_decision in ('approve','verify') and exists(
     select 1 from private.vocabulary_diagnostic_reviews
      where item_id=v_id and item_version=v_version and decision in ('flag','reject')
   ) then raise exception 'REVISION_REQUIRED'; end if;
   if v_stage='language' and v_decision='approve'
      and v_item.review_status not in ('draft','language_reviewed')
     then raise exception 'REVIEW_SEQUENCE_REQUIRED'; end if;
   if v_stage='assessment' and v_decision='approve'
      and v_item.review_status not in ('language_reviewed','assessment_reviewed')
     then raise exception 'REVIEW_SEQUENCE_REQUIRED'; end if;
   if v_stage='assessment' and v_decision='approve' then
     select reviewer_id into v_language
       from private.vocabulary_diagnostic_reviews where item_id=v_id and item_version=v_version
         and stage='language' and decision='approve' order by created_at desc limit 1;
     if v_language is null or v_language=p_actor
       then raise exception 'INDEPENDENT_LANGUAGE_REVIEW_REQUIRED'; end if;
   end if;
   if v_stage='cefr' and v_decision='verify' then
     if length(v_notes)<30 then raise exception 'CEFR_EVIDENCE_REQUIRED'; end if;
     -- A claim of CEFR source verification requires a meaningful written note.
     -- This is not score calibration and does not assign proficiency to students.
   end if;
   insert into private.vocabulary_diagnostic_reviews
     (item_id,item_version,reviewer_id,stage,decision,notes,quality_confirmations)
   values(v_id,v_version,p_actor,v_stage,v_decision,v_notes,case when v_decision in ('approve','verify') then v_quality else null end);
   if v_stage='language' and v_decision='approve' then
     update private.vocabulary_diagnostic_items set review_status='language_reviewed'
       where item_id=v_id and version=v_version;
   elsif v_stage='assessment' and v_decision='approve' then
     update private.vocabulary_diagnostic_items set review_status='assessment_reviewed'
       where item_id=v_id and version=v_version;
   end if;
   -- No automatic promotion to pilot; a separate assessed, verified and
   -- independently approved publishing process is required.
   return jsonb_build_object('saved',true,'status','review_recorded');
 end if;
 raise exception 'UNKNOWN_REVIEW_ACTION';
end;
$$;
revoke all on function public.vocabulary_diagnostic_review_api(uuid,text,jsonb)
 from public,anon,authenticated;
grant execute on function public.vocabulary_diagnostic_review_api(uuid,text,jsonb) to service_role;
