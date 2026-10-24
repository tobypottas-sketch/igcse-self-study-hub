-- Vocabulary Builder: STAGE_CONTRACT v2 activity types (Job 8).
--
-- ADDITIVE. The only change is to the question_type allow-list inside private.vocabulary_activity_metadata_is_safe: seven new
-- question types are accepted in attempt metadata. Every existing type, every other field rule, every table, policy, grant and
-- function stays exactly as it was; nothing is dropped, rewritten or backfilled, and no student data is read or written.
-- (spelling_cue_match and explain_another_way stay in the list so historic attempts remain valid; they are simply no longer on the
-- pathway ladder, which the Edge Function enforces.)
--
-- New types: gloss_in_context_type (Meaning Mastery), type_in_passage (Context Mastery), word_family_identify (Word Families
-- Recognise), family_multi_form (Word Families Mastery), precision_type_cued (Precision Recall), upgrade_passage (Precision
-- Mastery), spot_the_error (Spelling Match).
--
-- Order: run this BEFORE deploying the updated vocabulary-attempt-action Edge Function (the function is the only writer of these
-- question types, so running it first means no accepted attempt can be rejected by the database).

create or replace function private.vocabulary_activity_metadata_is_safe(value jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(value) = 'object' then coalesce(
    private.activity_metadata_is_safe(value - array[
      'question_type','unit_number','strand','retry_used','recovery','misconception',
      'skill_family','evidence_strength','support_level','practice_focus','target_id',
      'occurrence_id','pathway_id','pathway_stage','served_pathway_stage',
      'mission_id','mission_size','mission_kind','practice_family'
    ])
    and (not (value ? 'question_type') or
      (jsonb_typeof(value->'question_type') = 'string' and value->>'question_type' in (
'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check',
  'which_situation_fits','meaning_in_context','correct_usage','collocation_builder','word_family_switch',
  'find_evidence','phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','same_idea',
  'spot_meaning_change','build_same_idea','rewrite_idea','improve_vocabulary','explain_another_way',
  'definition_to_word','word_definition_match','drag_word_definition','drag_definition_word',
  'gap_fill_bank','drag_word_sentence','type_missing_word','spell_word','choose_word_sentence','word_family_choice',
  'type_word_from_definition','context_sentence_match','word_family_match','precision_choice','precision_match',
  'spelling_choice','spelling_cue_match','spelling_rebuild','spell_in_context',
  'gloss_in_context_type','type_in_passage','word_family_identify','family_multi_form',
  'precision_type_cued','upgrade_passage','spot_the_error'
      )))
    and not exists (
      select 1 from jsonb_each(value) as field(key, val)
      where case key
        when 'unit_number' then not (jsonb_typeof(val) = 'number' and val::text ~ '^([1-9]|1[0-9]|20)$')
        when 'strand' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('meaning','recognition','context','paraphrasing','production'))
        when 'retry_used' then jsonb_typeof(val) <> 'boolean'
        when 'recovery' then jsonb_typeof(val) <> 'boolean'
        when 'misconception' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('related_but_inaccurate','wrong_form','meaning_confusion','retrieval_failure','context_mismatch','quantity_change','degree_change','time_change','cause_effect_change','contrast_change','added_information','omitted_information','unnatural_collocation','too_vague','register_mismatch'))
        when 'skill_family' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('meaning','context','question_text','phrase_paraphrasing','idea_paraphrasing','writing_vocabulary','communication_repair'))
        when 'evidence_strength' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('light','medium','strong','very_strong'))
        when 'support_level' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('none','light','major'))
        when 'practice_focus' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('learn','context','question_text','phrase_paraphrase','idea_paraphrase','writing','adaptive'))
        when 'target_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^vocab_[a-z0-9_]{1,120}$')
        when 'occurrence_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^u[0-9]{1,2}_[a-z0-9_]{1,120}$')
        when 'pathway_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall'))
        when 'pathway_stage' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('recognise','match','apply','recall','mastery'))
        when 'served_pathway_stage' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('recognise','match','apply','recall','mastery'))
        when 'mission_id' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
        when 'mission_size' then not (jsonb_typeof(val) = 'number' and val::text = '10')
        when 'mission_kind' then not (jsonb_typeof(val) = 'string' and val #>> '{}' in ('pathway','mixed'))
        when 'practice_family' then not (jsonb_typeof(val) = 'string' and val #>> '{}' ~ '^[a-z0-9_:]{1,40}$')
        else false
      end
    ), false) else false end;
$$;

revoke all on function private.vocabulary_activity_metadata_is_safe(jsonb) from public;
grant execute on function private.vocabulary_activity_metadata_is_safe(jsonb) to authenticated, service_role;
