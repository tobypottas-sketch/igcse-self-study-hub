import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { applyEvidence, markCuratedAnswer, spotMeaningChangeMarking } from '../_shared/vocabulary-engine.js';
import { buildStoredAttemptMetadata, strandForQuestionType, validateVocabularyAttempt } from './validation.js';

const CORS = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers:CORS });

const ACTIVITY_EVIDENCE: Record<string, { strands:string[]; evidenceStrength:string; productive:boolean }> = {
  meaning_match:{ strands:['meaning'], evidenceStrength:'light', productive:false },
  which_situation_fits:{ strands:['meaning','context'], evidenceStrength:'medium', productive:false },
  meaning_in_context:{ strands:['context','meaning'], evidenceStrength:'medium', productive:false },
  correct_usage:{ strands:['context','recognition'], evidenceStrength:'medium', productive:false },
  collocation_builder:{ strands:['recognition','production'], evidenceStrength:'strong', productive:true },
  word_family_switch:{ strands:['production'], evidenceStrength:'strong', productive:true },
  question_text_bridge:{ strands:['context','paraphrasing'], evidenceStrength:'medium', productive:false },
  find_evidence:{ strands:['context'], evidenceStrength:'medium', productive:false },
  phrase_match:{ strands:['paraphrasing'], evidenceStrength:'light', productive:false },
  build_paraphrase:{ strands:['paraphrasing'], evidenceStrength:'strong', productive:true },
  complete_paraphrase:{ strands:['paraphrasing','production'], evidenceStrength:'strong', productive:true },
  rewrite_phrase:{ strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true },
  same_idea:{ strands:['paraphrasing'], evidenceStrength:'medium', productive:false },
  spot_meaning_change:{ strands:['paraphrasing','context'], evidenceStrength:'medium', productive:false },
  build_same_idea:{ strands:['paraphrasing','production'], evidenceStrength:'strong', productive:true },
  rewrite_idea:{ strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true },
  improve_vocabulary:{ strands:['production'], evidenceStrength:'very_strong', productive:true },
  explain_another_way:{ strands:['paraphrasing','production'], evidenceStrength:'very_strong', productive:true }
};
const sentenceAnswerTypes = new Set(['which_situation_fits','correct_usage']);

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
    productionActivityTypes:row?.production_activity_types ?? [],
    unscaffoldedProductions:row?.unscaffolded_productions ?? 0,
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
    productionActivityTypes:detail.productionActivityTypes ?? [],
    unscaffoldedProductions:detail.unscaffoldedProductions ?? 0,
    recentErrorCount:detail.recentErrorCount ?? (row?.recent_error_pattern ? 1 : 0),
    recoveryCount:detail.recoveryCount ?? 0,
    reviewStage:0,
    reviewFailureCount:0,
    reviewDueAt:null
  };
}

function errorPattern(marked: any) { return marked.correct ? null : (marked.misconceptionCategory ?? 'retrieval_failure'); }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.map(item => String(item ?? '').trim()).filter(Boolean) : []; }
function evidenceContract(questionType: string) {
  const designed = ACTIVITY_EVIDENCE[questionType];
  if (designed) return designed;
  const strand = strandForQuestionType(questionType);
  return { strands:[strand], evidenceStrength:null, productive:strand === 'production' };
}
function authoritativeSupport(input: any) {
  if (input.repeatedGuess) return 'major';
  if (input.retryUsed || input.firstAttempt === false) return input.supportLevel === 'major' ? 'major' : 'light';
  return 'none';
}
function phraseMarking(data: any, questionType: string) {
  const variants = strings(data?.acceptedVariants);
  if (questionType === 'complete_paraphrase') {
    const chunks = strings(data?.chunks);
    return { acceptedAnswers:chunks.length ? [chunks[chunks.length - 1]] : [String(data?.equivalentPhrase ?? '')], distractors:[] };
  }
  return { acceptedAnswers:[String(data?.equivalentPhrase ?? ''), ...variants].filter(Boolean), distractors:strings(data?.commonMeaningDistortions).map(text => ({ text, misconceptionCategory:'meaning_confusion' })) };
}
function ideaMarking(data: any) {
  return { acceptedAnswers:strings(data?.accurateParaphrases), distractors:Array.isArray(data?.distractors) ? data.distractors : [] };
}
function questionTextMarking(data: any, activityVariantId: string | null, questionType: string) {
  const questions = Array.isArray(data?.questions) ? data.questions : [];
  if (!activityVariantId) throw new Error('Question ↔ Text activity variant is required.');
  const index = Number(activityVariantId.slice(1));
  if (!Number.isInteger(index) || index < 0 || index >= questions.length) throw new Error('Question ↔ Text activity variant is invalid.');
  const selected = questions[index];
  if (questionType === 'question_text_bridge') return { acceptedAnswers:[String(selected?.question ?? '').trim()].filter(Boolean), distractors:[] };
  return { acceptedAnswers:strings(selected?.evidenceSpans), distractors:[] };
}
function unitActivityMarking(activity: any, questionType: string, activityVariantId: string | null) {
  const data = activity?.activity_data && typeof activity.activity_data === 'object' ? activity.activity_data : {};
  if (activity.content_type === 'phrase_set') return phraseMarking(data, questionType);
  if (activity.content_type === 'idea_set' && questionType === 'spot_meaning_change') return spotMeaningChangeMarking(data, activityVariantId);
  if (activity.content_type === 'idea_set') return ideaMarking(data);
  if (activity.content_type === 'question_text') return questionTextMarking(data, activityVariantId, questionType);
  if (activity.content_type === 'writing_set') return { acceptedAnswers:strings(data.acceptedAnswers), distractors:[] };
  throw new Error('Unsupported vocabulary unit activity content type.');
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

    const callerClient = createClient(url, publishableKey, { global:{ headers:{ Authorization:authHeader } }, auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerData, error:callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return json({ error:'Invalid session' }, 401);

    const adminClient = createClient(url, secretKey, { auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:profile, error:profileError } = await adminClient.from('profiles').select('role, active').eq('id', callerData.user.id).single();
    if (profileError || !profile?.active) return json({ error:'Active account required' }, 403);

    const input = validateVocabularyAttempt(await req.json());
    const staff = profile.role === 'teacher' || profile.role === 'admin';
    if (input.preview && !staff) return json({ error:'Teacher or admin preview required' }, 403);
    if (!input.preview && profile.role !== 'student') return json({ error:'Student account required for mastery updates' }, 403);

    const { data:occurrence, error:occurrenceError } = await adminClient.from('vocabulary_unit_occurrences').select('occurrence_id, vocabulary_id, unit_number, sense_id, status, active').eq('occurrence_id', input.occurrenceId).eq('status', 'live').eq('active', true).single();
    if (occurrenceError || !occurrence) return json({ error:'Live vocabulary target not found' }, 404);

    const { data:item, error:itemError } = await adminClient.from('vocabulary_items').select('vocabulary_id, senses, word_family, collocations, status').eq('vocabulary_id', occurrence.vocabulary_id).eq('status','live').single();
    if (itemError || !item) return json({ error:'Vocabulary content not found' }, 404);
    const sense = Array.isArray(item.senses) ? item.senses.find((candidate: any) => candidate?.senseId === occurrence.sense_id) : null;
    if (!sense) return json({ error:'Vocabulary sense not found' }, 400);

    let markingContext: any;
    let evidenceContentId: string;
    let primaryEvidenceTargetId: string | null = occurrence.vocabulary_id;

    if (input.contentSource === 'unit_activity') {
      const { data:activity, error:activityError } = await adminClient.from('vocabulary_unit_activities').select('activity_content_id, unit_number, content_type, activity_data, status').eq('activity_content_id', input.activityContentId).eq('unit_number', occurrence.unit_number).eq('status','live').single();
      if (activityError || !activity) return json({ error:'Live vocabulary unit activity not found' }, 404);
      const data = activity.activity_data && typeof activity.activity_data === 'object' ? activity.activity_data : {};
      const linkedVocabularyIds = strings(data.linkedVocabularyIds);
      const curatedPrimary = data.primaryEvidenceTargetId ? String(data.primaryEvidenceTargetId) : null;
      if (!linkedVocabularyIds.includes(occurrence.vocabulary_id)) return json({ error:'Vocabulary unit activity is not linked to this target' }, 400);
      if (input.primaryEvidenceTargetId && input.primaryEvidenceTargetId !== curatedPrimary) return json({ error:'Primary evidence target does not match curated activity' }, 400);
      primaryEvidenceTargetId = curatedPrimary;
      if (primaryEvidenceTargetId && primaryEvidenceTargetId !== occurrence.vocabulary_id) return json({ error:'Curated primary evidence target does not match occurrence' }, 400);
      const marking = unitActivityMarking(activity, input.questionType, input.activityVariantId);
      markingContext = { contextId:activity.activity_content_id, activityContentId:activity.activity_content_id, ...marking };
      evidenceContentId = activity.activity_content_id;
    } else {
      const { data:context, error:contextError } = await adminClient.from('vocabulary_contexts').select('context_id, occurrence_id, sense_id, prompt_text, accepted_answers, misconception_category, status').eq('context_id', input.contextId).eq('status','live').single();
      if (contextError || !context || context.occurrence_id !== occurrence.occurrence_id || context.sense_id !== occurrence.sense_id) return json({ error:'Vocabulary context does not match target' }, 400);
      const acceptedAnswers = sentenceAnswerTypes.has(input.questionType) ? [String(context.prompt_text ?? '').trim()].filter(Boolean) : (context.accepted_answers ?? []);
      markingContext = { contextId:context.context_id, acceptedAnswers };
      evidenceContentId = context.context_id;
    }

    const marked = markCuratedAnswer({ item:{ vocabularyId:item.vocabulary_id }, sense, context:markingContext, questionType:input.questionType, rawAnswer:input.rawAnswer });
    const contract = evidenceContract(input.questionType);
    const strand = contract.strands[0] ?? strandForQuestionType(input.questionType);
    const supportLevel = authoritativeSupport(input);
    const evidence = {
      strand, strands:contract.strands, evidenceStrength:contract.evidenceStrength, supportLevel,
      productive:contract.productive, repeatedGuess:input.repeatedGuess, correct:marked.correct,
      firstAttempt:input.firstAttempt, retryUsed:input.retryUsed, recoveredLater:input.recoveredLater,
      contextId:input.contentSource === 'context' ? evidenceContentId : null,
      activityContentId:input.contentSource === 'unit_activity' ? evidenceContentId : null,
      questionType:input.questionType, activityType:input.questionType, review:input.review
    };

    if (input.preview) return json({ ok:true, preview:true, correct:marked.correct, misconceptionCategory:marked.misconceptionCategory, strand, strands:contract.strands, supportLevel });

    const shouldUpdateTargetMastery = input.contentSource === 'context' || primaryEvidenceTargetId === occurrence.vocabulary_id;
    let nextGlobal: any = null;
    let nextUnit: any = null;
    const recentErrorPattern = errorPattern(marked);

    if (shouldUpdateTargetMastery) {
      const [{ data:globalRow }, { data:unitRow }] = await Promise.all([
        adminClient.from('vocabulary_global_mastery').select('*').eq('student_id', callerData.user.id).eq('vocabulary_id', occurrence.vocabulary_id).maybeSingle(),
        adminClient.from('vocabulary_unit_mastery').select('*').eq('student_id', callerData.user.id).eq('occurrence_id', occurrence.occurrence_id).maybeSingle()
      ]);
      const now = new Date();
      nextGlobal = applyEvidence(globalMasteryFromRow(globalRow), evidence, now);
      nextUnit = applyEvidence(unitMasteryFromRow(unitRow), { ...evidence, review:false }, now);
      const unitContextualEvidence = {
        strandEvidence:nextUnit.strandEvidence, successfulProductions:nextUnit.successfulProductions,
        productionContextIds:nextUnit.productionContextIds, productionActivityTypes:nextUnit.productionActivityTypes,
        unscaffoldedProductions:nextUnit.unscaffoldedProductions, recentErrorCount:nextUnit.recentErrorCount,
        recoveryCount:nextUnit.recoveryCount
      };
      const { error:masteryWriteError } = await adminClient.rpc('apply_vocabulary_mastery_state', {
        p_student_id:callerData.user.id, p_vocabulary_id:occurrence.vocabulary_id, p_occurrence_id:occurrence.occurrence_id,
        p_global_status:nextGlobal.status, p_global_strand_evidence:nextGlobal.strandEvidence,
        p_successful_productions:nextGlobal.successfulProductions, p_production_context_ids:nextGlobal.productionContextIds,
        p_production_activity_types:nextGlobal.productionActivityTypes, p_unscaffolded_productions:nextGlobal.unscaffoldedProductions,
        p_review_stage:nextGlobal.reviewStage, p_review_due_at:nextGlobal.reviewDueAt,
        p_review_failure_count:nextGlobal.reviewFailureCount, p_global_error_pattern:recentErrorPattern,
        p_unit_status:nextUnit.status, p_unit_contextual_evidence:unitContextualEvidence,
        p_unit_error_pattern:recentErrorPattern, p_seen_at:now.toISOString()
      });
      if (masteryWriteError) throw new Error('Unable to update vocabulary mastery.');
    }

    const metadata = buildStoredAttemptMetadata({
      unitNumber:occurrence.unit_number, strand, questionType:input.questionType,
      firstAttempt:input.firstAttempt, retryUsed:input.retryUsed, recoveredLater:input.recoveredLater,
      correct:marked.correct, misconceptionCategory:marked.misconceptionCategory,
      evidenceStrength:contract.evidenceStrength, supportLevel,
      vocabularyId:occurrence.vocabulary_id, occurrenceId:occurrence.occurrence_id
    });
    const { error:activityEventError } = await callerClient.from('activity_events').insert({
      app_key:'vocabulary_paraphrase', event_type:'question_attempt',
      activity_id:`${occurrence.occurrence_id}:${evidenceContentId}:${input.questionType}${input.activityVariantId ? `:${input.activityVariantId}` : ''}`,
      skill:strand, set_id:`unit-${occurrence.unit_number}`, mode:'practice',
      strong:marked.correct && input.firstAttempt && supportLevel === 'none', score:marked.correct ? 1 : 0, max_score:1, metadata
    });
    if (activityEventError) console.warn('Vocabulary activity event write failed after attempt processing.');

    return json({
      ok:true, correct:marked.correct, misconceptionCategory:marked.misconceptionCategory,
      strand, strands:contract.strands, supportLevel, masteryUpdated:shouldUpdateTargetMastery,
      globalStatus:nextGlobal?.status ?? null, unitStatus:nextUnit?.status ?? null,
      reviewDueAt:nextGlobal?.reviewDueAt ?? null, recovery:input.recoveredLater && marked.correct
    });
  } catch (error) {
    return json({ error:error instanceof Error ? error.message : 'Unexpected error' }, 400);
  }
});
