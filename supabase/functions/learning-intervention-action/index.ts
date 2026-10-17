import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { validateInterventionAction, validateStatusTransition } from './validation.js';

const CORS = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const json = (body:unknown, status=200) => Response.json(body, { status, headers:CORS });

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

async function teacherCanAccessStudent(adminClient:any, teacherId:string, studentId:string) {
  const { data:memberships } = await adminClient.from('student_class_memberships').select('class_id').eq('student_id',studentId).is('ended_at',null);
  const classIds = (memberships ?? []).map((row:any) => row.class_id);
  if (!classIds.length) return false;
  const { data } = await adminClient.from('teacher_classes').select('class_id').eq('teacher_id',teacherId).in('class_id',classIds);
  return Boolean(data?.length);
}

async function teacherCanAccessClass(adminClient:any, teacherId:string, classId:string) {
  const { data } = await adminClient.from('teacher_classes').select('class_id').eq('teacher_id',teacherId).eq('class_id',classId).maybeSingle();
  return Boolean(data);
}

async function authorizeTargets(adminClient:any, callerId:string, role:string, input:any) {
  if (role === 'admin') return;
  if (role !== 'teacher') throw new Error('Teacher or admin access required.');
  for (const studentId of input.studentIds ?? []) if (!(await teacherCanAccessStudent(adminClient,callerId,studentId))) throw new Error('Student target is outside your assigned classes.');
  for (const classId of input.classIds ?? []) if (!(await teacherCanAccessClass(adminClient,callerId,classId))) throw new Error('Class target is outside your assigned classes.');
}

Deno.serve(async (req:Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status:204, headers:CORS });
  if (req.method !== 'POST') return json({ error:'Method not allowed' },405);
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error:'Authentication required' },401);
    const url = Deno.env.get('SUPABASE_URL');
    if (!url) throw new Error('Missing SUPABASE_URL.');
    const publishableKey = firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
    const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
    const callerClient = createClient(url,publishableKey,{ global:{ headers:{ Authorization:authHeader } }, auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerData, error:callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return json({ error:'Invalid session' },401);
    const adminClient = createClient(url,secretKey,{ auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:profile, error:profileError } = await adminClient.from('profiles').select('role, active').eq('id',callerData.user.id).single();
    if (profileError || !profile?.active) return json({ error:'Active account required' },403);
    const input = validateInterventionAction(await req.json());

    if (input.action === 'create') {
      await authorizeTargets(adminClient,callerData.user.id,profile.role,input);
      const { data:created, error:createError } = await adminClient.from('learning_interventions').insert({
        created_by:callerData.user.id,
        intervention_type:input.interventionType,
        target_scope:input.targetScope,
        learning_area:input.learningArea,
        skill:input.skill,
        context:input.context,
        session:input.session,
        status:input.status,
        reason_code:input.reasonCode,
        external_follow_up:input.externalFollowUp,
        due_at:input.dueAt
      }).select('id, intervention_type, target_scope, learning_area, skill, context, session, status, due_at, external_follow_up').single();
      if (createError || !created) throw new Error(createError?.message || 'Unable to create intervention.');
      const targets = [
        ...(input.studentIds ?? []).map((studentId:string) => ({ intervention_id:created.id, student_id:studentId })),
        ...(input.classIds ?? []).map((classId:string) => ({ intervention_id:created.id, class_id:classId }))
      ];
      const { error:targetError } = await adminClient.from('learning_intervention_targets').insert(targets);
      if (targetError) {
        await adminClient.from('learning_interventions').delete().eq('id',created.id);
        throw new Error('Unable to create intervention targets.');
      }
      return json({ ok:true, intervention:created });
    }

    const { data:existing, error:existingError } = await adminClient.from('learning_interventions').select('*').eq('id',input.interventionId).single();
    if (existingError || !existing) return json({ error:'Learning intervention not found' },404);
    const { data:targets } = await adminClient.from('learning_intervention_targets').select('student_id, class_id').eq('intervention_id',existing.id);
    const isStaff = profile.role === 'admin' || profile.role === 'teacher';
    let staffAccess = profile.role === 'admin' || existing.created_by === callerData.user.id;
    if (profile.role === 'teacher' && !staffAccess) {
      for (const target of targets ?? []) {
        if (target.student_id && await teacherCanAccessStudent(adminClient,callerData.user.id,target.student_id)) { staffAccess = true; break; }
        if (target.class_id && await teacherCanAccessClass(adminClient,callerData.user.id,target.class_id)) { staffAccess = true; break; }
      }
    }
    const studentTargeted = (targets ?? []).some((target:any) => target.student_id === callerData.user.id);

    if (input.action === 'status') {
      if (!staffAccess && !studentTargeted) return json({ error:'Intervention access denied' },403);
      if (!isStaff && !['started','completed'].includes(input.status)) return json({ error:'Students may only start or complete their own intervention' },403);
      validateStatusTransition(existing.status,input.status);
      const patch:any = { status:input.status, updated_at:new Date().toISOString() };
      if (input.status === 'completed') patch.completed_at = new Date().toISOString();
      if (input.status === 'reviewed') patch.reviewed_at = new Date().toISOString();
      const { data:updated, error:updateError } = await adminClient.from('learning_interventions').update(patch).eq('id',existing.id).select('id, status, completed_at, reviewed_at').single();
      if (updateError) throw new Error('Unable to update intervention status.');
      return json({ ok:true, intervention:updated });
    }

    if (!staffAccess) return json({ error:'Teacher or admin access required' },403);
    const { data:updated, error:updateError } = await adminClient.from('learning_interventions').update({
      outcome_status:input.outcomeStatus,
      outcome_summary:input.outcomeSummary,
      status:existing.status === 'completed' ? 'reviewed' : existing.status,
      reviewed_at:existing.status === 'completed' ? new Date().toISOString() : existing.reviewed_at,
      updated_at:new Date().toISOString()
    }).eq('id',existing.id).select('id, status, outcome_status, outcome_summary, reviewed_at').single();
    if (updateError) throw new Error('Unable to record intervention outcome.');
    return json({ ok:true, intervention:updated });
  } catch (error) {
    return json({ error:error instanceof Error ? error.message : 'Unexpected error' },400);
  }
});
