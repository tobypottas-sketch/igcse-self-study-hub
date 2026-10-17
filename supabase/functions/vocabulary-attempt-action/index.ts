import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { applyEvidence, markCuratedAnswer } from '../_shared/vocabulary-engine.js';
import { buildStoredAttemptMetadata, strandForQuestionType, validateVocabularyAttempt } from './validation.js';

const CORS = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers:CORS });

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

function globalMasteryFromRow(row: any) {
  return {
    status:row?.status ?? 'new',
    strandEvidence:row?.strand_evidence ?? {},
    successfulProductions:row?.successful_productions ?? 0,
    productionContextIds:row?.production_context_ids ?? [],
    recentErrorCount:row?.recent_error_pattern ? 1 : 0,
    recoveryCount:0,
    reviewStage:row?.review_stage ?? 0,
    reviewFailureCount:row?.review_failure_count ?? 0,
    reviewDueAt:row?.review_due_at ?? null
  };
}

function unitMasteryFromRow(row: any) {
  const detail = row?.contextual_evidence && typeof row.contextual_evidence === 'object' ? row.contextual_evidence : {};
  return {
    status:row?.status ?? 'new',
    strandEvidence:detail.strandEvidence ?? {},
    successfulProductions:detail.successfulProductions ?? 0,
    productionContextIds:detail.productionContextIds ?? [],
    recentErrorCount:detail.recentErrorCount ?? (row?.recent_error_pattern ? 1 : 0),
    recoveryCount:detail.recoveryCount ?? 0,
    reviewStage:0,
    reviewFailureCount:0,
    reviewDueAt:null
  };
}

function errorPattern(marked: any) {
  return marked.correct ? null : (marked.misconceptionCategory ?? 'retrieval_failure');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status:204, headers:CORS });
  if (req.method !== 'POST') return json({ error:'Method not allowed' }, 405);
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error:'Authentication required' }, 401);
    const url = Deno.env.get('SUPABASE_URL');
    if (!url) throw new Error('Missing SUPABASE_URL.');
    const publishableKey = firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
    const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));

    const callerClient = createClient(url, publishableKey, {
      global:{ headers:{ Authorization:authHeader } },
      auth:{ persistSession:false, autoRefreshToken:false }
    });
    const { data:callerData, error:callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return json({ error:'Invalid session' }, 401);

    const adminClient = createClient(url, secretKey, { auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:profile, error:profileError } = await adminClient.from('profiles').select('role, active').eq('id', callerData.user.id).single();
    if (profileError || !profile?.active) return json({ error:'Active account required' }, 403);

    const input = validateVocabularyAttempt(await req.json());
    const staff = profile.role === 'teacher' || profile.role === 'admin';
    if (input.preview && !staff) return json({ error:'Teacher or admin preview required' }, 403);
    if (!input.preview && profile.role !== 'student') return json({ error:'Student account required for mastery updates' }, 403);

    const { data:occurrence, error:occurrenceError } = await adminClient
      .from('vocabulary_unit_occurrences')
      .select('occurrence_id, vocabulary_id, unit_number, sense_id, status, active')
      .eq('occurrence_id', input.occurrenceId)
      .eq('status', 'live')
      .eq('active', true)
      .single();
    if (occurrenceError || !occurrence) return json({ error:'Live vocabulary target not found' }, 404);

    const [{ data:item, error:itemError }, { data:context, error:contextError }] = await Promise.all([
      adminClient.from('vocabulary_items').select('vocabulary_id, senses, status').eq('vocabulary_id', occurrence.vocabulary_id).eq('status','live').single(),
      adminClient.from('vocabulary_contexts').select('context_id, occurrence_id, sense_id, accepted_answers, misconception_category, status').eq('context_id', input.contextId).eq('status','live').single()
    ]);
    if (itemError || !item) return json({ error:'Vocabulary content not found' }, 404);
    if (contextError || !context || context.occurrence_id !== occurrence.occurrence_id || context.sense_id !== occurrence.sense_id) {
      return json({ error:'Vocabulary context does not match target' }, 400);
    }
    const sense = Array.isArray(item.senses) ? item.senses.find((candidate: any) => candidate?.senseId === occurrence.sense_id) : null;
    if (!sense) return json({ error:'Vocabulary sense not found' }, 400);

    const marked = markCuratedAnswer({
      item:{ vocabularyId:item.vocabulary_id },
      sense,
      context:{ contextId:context.context_id, acceptedAnswers:context.accepted_answers ?? [] },
      questionType:input.questionType,
      rawAnswer:input.rawAnswer
    });
    const strand = strandForQuestionType(input.questionType);
    const evidence = {
      strand,
      correct:marked.correct,
      firstAttempt:input.firstAttempt,
      retryUsed:input.retryUsed,
      recoveredLater:input.recoveredLater,
      contextId:context.context_id,
      questionType:input.questionType,
      review:input.review
    };

    if (input.preview) {
      return json({ ok:true, preview:true, correct:marked.correct, misconceptionCategory:marked.misconceptionCategory, strand });
    }

    const [{ data:globalRow }, { data:unitRow }] = await Promise.all([
      adminClient.from('vocabulary_global_mastery').select('*').eq('student_id', callerData.user.id).eq('vocabulary_id', occurrence.vocabulary_id).maybeSingle(),
      adminClient.from('vocabulary_unit_mastery').select('*').eq('student_id', callerData.user.id).eq('occurrence_id', occurrence.occurrence_id).maybeSingle()
    ]);
    const now = new Date();
    const nextGlobal = applyEvidence(globalMasteryFromRow(globalRow), evidence, now);
    const nextUnit = applyEvidence(unitMasteryFromRow(unitRow), { ...evidence, review:false }, now);
    const recentErrorPattern = errorPattern(marked);
    const unitContextualEvidence = {
      strandEvidence:nextUnit.strandEvidence,
      successfulProductions:nextUnit.successfulProductions,
      productionContextIds:nextUnit.productionContextIds,
      recentErrorCount:nextUnit.recentErrorCount,
      recoveryCount:nextUnit.recoveryCount
    };

    const { error:masteryWriteError } = await adminClient.rpc('apply_vocabulary_mastery_state', {
      p_student_id:callerData.user.id,
      p_vocabulary_id:occurrence.vocabulary_id,
      p_occurrence_id:occurrence.occurrence_id,
      p_global_status:nextGlobal.status,
      p_global_strand_evidence:nextGlobal.strandEvidence,
      p_successful_productions:nextGlobal.successfulProductions,
      p_production_context_ids:nextGlobal.productionContextIds,
      p_review_stage:nextGlobal.reviewStage,
      p_review_due_at:nextGlobal.reviewDueAt,
      p_review_failure_count:nextGlobal.reviewFailureCount,
      p_global_error_pattern:recentErrorPattern,
      p_unit_status:nextUnit.status,
      p_unit_contextual_evidence:unitContextualEvidence,
      p_unit_error_pattern:recentErrorPattern,
      p_seen_at:now.toISOString()
    });
    if (masteryWriteError) throw new Error('Unable to update vocabulary mastery.');

    const metadata = buildStoredAttemptMetadata({
      unitNumber:occurrence.unit_number,
      strand,
      questionType:input.questionType,
      firstAttempt:input.firstAttempt,
      retryUsed:input.retryUsed,
      recoveredLater:input.recoveredLater,
      correct:marked.correct,
      misconceptionCategory:marked.misconceptionCategory,
      vocabularyId:occurrence.vocabulary_id,
      occurrenceId:occurrence.occurrence_id
    });
    const { error:activityError } = await callerClient.from('activity_events').insert({
      app_key:'vocabulary_paraphrase',
      event_type:'question_attempt',
      activity_id:`${occurrence.occurrence_id}:${context.context_id}:${input.questionType}`,
      skill:strand,
      set_id:`unit-${occurrence.unit_number}`,
      mode:'practice',
      strong:marked.correct && input.firstAttempt,
      score:marked.correct ? 1 : 0,
      max_score:1,
      metadata
    });
    if (activityError) console.warn('Vocabulary activity event write failed after mastery update.');

    return json({
      ok:true,
      correct:marked.correct,
      misconceptionCategory:marked.misconceptionCategory,
      strand,
      globalStatus:nextGlobal.status,
      unitStatus:nextUnit.status,
      reviewDueAt:nextGlobal.reviewDueAt,
      recovery:input.recoveredLater && marked.correct
    });
  } catch (error) {
    return json({ error:error instanceof Error ? error.message : 'Unexpected error' }, 400);
  }
});
