import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { safeAuthAccountError, validateAdminProvisionRequest } from './validation.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: { ...corsHeaders, ...(init.headers ?? {}) }
  });
}

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

function randomIndex(length: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % length;
}

const studentWords = [
  'Apple','Beach','Berry','Blue','Breeze','Bridge','Cloud','Coral','Cove','Daisy','Dawn','Dream','Eagle','Ember','Falcon','Fern',
  'Field','Flame','Forest','Fox','Garden','Gold','Harbor','Hill','Honey','Island','Jade','Lake','Leaf','Lemon','Light','Lion',
  'Maple','Mango','Meadow','Moon','Nova','Ocean','Olive','Orange','Panda','Pearl','Pine','Plum','Rain','Reef','River','Robin',
  'Rocket','Rose','Ruby','Sage','Shell','Sky','Snow','Solar','Star','Stone','Storm','Sunny','Tiger','Tulip','Wave','Willow'
];

function generateStudentPassword(): string {
  const first = studentWords[randomIndex(studentWords.length)];
  let second = studentWords[randomIndex(studentWords.length)];
  while (second === first) second = studentWords[randomIndex(studentWords.length)];
  const digits = String(10 + randomIndex(90));
  return `${first}${second}${digits}`;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  if (!items.length) return [];
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const runnerCount = Math.min(Math.max(1, limit), items.length);
  const runners = Array.from({ length:runnerCount }, async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, { status: 405 });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Authentication required' }, { status: 401 });

    const url = Deno.env.get('SUPABASE_URL');
    if (!url) throw new Error('Missing SUPABASE_URL.');
    const publishableKey = firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
    const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
    const callerClient = createClient(url, publishableKey, { global:{ headers:{ Authorization:authHeader } }, auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerData, error:callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return jsonResponse({ error:'Invalid session' }, { status:401 });

    const adminClient = createClient(url, secretKey, { auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerProfile, error:profileError } = await adminClient.from('profiles').select('role, active').eq('id', callerData.user.id).single();
    if (profileError || !callerProfile?.active || !['admin','teacher'].includes(callerProfile.role)) return jsonResponse({ error:'Staff access required' }, { status:403 });

    const input = validateAdminProvisionRequest(await req.json());
    const isAdmin = callerProfile.role === 'admin';
    // Teachers may only list students and reset passwords. Every other existing
    // provision/account-management action remains administrator-only.
    if (!isAdmin && !['teacher_list_students','reset_password','issue_class_credentials'].includes(input.action))
      return jsonResponse({ error:'Administrator access required' }, { status:403 });

    if (input.action === 'teacher_list_students') {
      let allowedClasses: string[] | null = null;
      if (!isAdmin) {
        const {data:assignments,error:assignedError} = await adminClient.from('teacher_classes')
          .select('class_id').eq('teacher_id',callerData.user.id);
        if (assignedError) return jsonResponse({error:'Could not load teacher assignments.'},{status:503});
        allowedClasses = [...new Set((assignments??[]).map(x=>x.class_id))];
        if (!allowedClasses.length) return jsonResponse({students:[]});
      }
      let rosterQuery = adminClient.from('student_class_memberships')
        .select('student_id,class_id').is('ended_at',null);
      if (allowedClasses) rosterQuery = rosterQuery.in('class_id',allowedClasses);
      const {data:memberships,error:membersError} = await rosterQuery.range(0,999);
      if (membersError) return jsonResponse({error:'Could not load student roster.'},{status:503});
      const studentIds = [...new Set((memberships??[]).map(x=>x.student_id))];
      const profiles: {id:string;display_name:string;school_email:string}[] = [];
      for (let offset=0;offset<studentIds.length;offset+=100) {
        const {data:students,error:studentsError} = await adminClient.from('profiles')
          .select('id,display_name,school_email').in('id',studentIds.slice(offset,offset+100))
          .eq('role','student').eq('active',true);
        if (studentsError) return jsonResponse({error:'Could not load students.'},{status:503});
        profiles.push(...(students??[]));
      }
      const byId = new Map(profiles.map(x=>[x.id,x]));
      const students=(memberships??[]).flatMap(x=>{
        const student=byId.get(x.student_id);
        return student?[{id:student.id,name:student.display_name,email:student.school_email,classId:x.class_id}]:[];
      });
      return jsonResponse({students});
    }

    if (input.action === 'delete_account') {
      if (callerData.user.id === input.userId) return jsonResponse({ error:'You cannot delete your own staff account.' }, { status:400 });
      const { data:target, error:targetError } = await adminClient.from('profiles').select('id, role').eq('id', input.userId).single();
      if (targetError || !target) return jsonResponse({ error:'Account not found' }, { status:404 });
      if (target.role !== 'student' && target.role !== 'teacher') return jsonResponse({ error:'Only student and teacher accounts can be deleted here.' }, { status:400 });

      if (target.role === 'student') {
        const { error:membershipError } = await adminClient
          .from('student_class_memberships')
          .update({ ended_at:new Date().toISOString(), changed_by:callerData.user.id })
          .eq('student_id', input.userId)
          .is('ended_at', null);
        if (membershipError) return jsonResponse({ error:membershipError.message }, { status:400 });
      } else {
        const { error:taskError } = await adminClient
          .from('essay_tasks')
          .update({ active:false })
          .eq('created_by', input.userId);
        if (taskError) return jsonResponse({ error:taskError.message }, { status:400 });

        const { error:teacherError } = await adminClient.from('teacher_classes').delete().eq('teacher_id', input.userId);
        if (teacherError) return jsonResponse({ error:teacherError.message }, { status:400 });
      }

      const { error:deleteError } = await adminClient.auth.admin.deleteUser(input.userId);
      if (deleteError) return jsonResponse({ error:deleteError.message }, { status:400 });
      return jsonResponse({ ok:true, userId:input.userId, role:target.role });
    }

    if (input.action === 'reset_password') {
      if (!isAdmin) {
        const {data:student,error:studentError} = await adminClient.from('profiles')
          .select('id,role,active').eq('id',input.userId).maybeSingle();
        if (studentError || !student || student.role!=='student' || !student.active)
          return jsonResponse({error:'Student account unavailable.'},{status:403});
        const {data:memberships,error:memberError} = await adminClient.from('student_class_memberships')
          .select('class_id').eq('student_id',input.userId).is('ended_at',null);
        if (memberError || !memberships?.length)
          return jsonResponse({error:'Student has no active class.'},{status:403});
        const classIds = [...new Set(memberships.map(x=>x.class_id))];
        const {data:assignments,error:assignmentError} = await adminClient.from('teacher_classes')
          .select('class_id').eq('teacher_id',callerData.user.id).in('class_id',classIds);
        if (assignmentError || !assignments?.length)
          return jsonResponse({error:'You can reset only your own students.'},{status:403});
        // Rate-limit each teacher and target student; record attempts before changing credentials.
        const hour = new Date(Date.now()-3600000).toISOString();
        const day = new Date(Date.now()-86400000).toISOString();
        const [{count:actorCount,error:actorLimitError},{count:studentCount,error:studentLimitError}] = await Promise.all([
          adminClient.from('teacher_student_password_reset_events').select('id',{count:'exact',head:true})
            .eq('actor_id',callerData.user.id).gte('created_at',hour),
          adminClient.from('teacher_student_password_reset_events').select('id',{count:'exact',head:true})
            .eq('student_id',input.userId).gte('created_at',day)
        ]);
        if (actorLimitError || studentLimitError)
          return jsonResponse({error:'Reset auditing is unavailable.'},{status:503});
        if ((actorCount??0)>=30)
          return jsonResponse({error:'Teacher reset limit reached (30 in a rolling hour). Please try again after earlier resets expire, or contact an administrator.'},{status:429});
        if ((studentCount??0)>=3)
          return jsonResponse({error:'This student has reached the limit of 3 password resets in 24 hours. Please contact an administrator.'},{status:429});
        const {data:audit,error:auditError}=await adminClient.from('teacher_student_password_reset_events')
          .insert({actor_id:callerData.user.id,student_id:input.userId}).select('id').single();
        if (auditError || !audit)
          return jsonResponse({error:'Reset auditing is unavailable.'},{status:503});
        const temporaryPassword = generateStudentPassword();
        const {error:authError}=await adminClient.auth.admin.updateUserById(input.userId,{password:temporaryPassword});
        if (authError) return jsonResponse({error:'Could not reset student password.'},{status:500});
        await adminClient.from('teacher_student_password_reset_events').update({succeeded:true}).eq('id',audit.id);
        const {error:flagError}=await adminClient.from('profiles').update({must_change_password:false}).eq('id',input.userId);
        if (flagError) return jsonResponse({error:'Password changed, but student profile could not be updated. Contact an administrator.'},{status:500});
        return jsonResponse({ok:true,userId:input.userId,temporaryPassword});
      }
      const temporaryPassword = generateStudentPassword();
      const { error:flagError } = await adminClient.from('profiles').update({ must_change_password:false }).eq('id', input.userId);
      if (flagError) return jsonResponse({ error:flagError.message }, { status:400 });
      const { error:authError } = await adminClient.auth.admin.updateUserById(input.userId, { password:temporaryPassword });
      if (authError) return jsonResponse({ error:authError.message }, { status:400 });
      return jsonResponse({ ok:true, userId:input.userId, temporaryPassword });
    }

    if (input.action === 'issue_class_credentials') {
      if(!isAdmin){
        const {data:assignment,error:assignmentError}=await adminClient.from('teacher_classes')
          .select('class_id').eq('teacher_id',callerData.user.id).eq('class_id',input.classId).maybeSingle();
        if(assignmentError) return jsonResponse({error:'Could not verify teacher class assignment.'},{status:503});
        if(!assignment) return jsonResponse({error:'You can issue login cards only for your assigned classes.'},{status:403});
      }
      const { data:targetClass, error:classError } = await adminClient.from('classes').select('id, active').eq('id', input.classId).single();
      if (classError || !targetClass?.active) return jsonResponse({ error:'Class is not active' }, { status:400 });

      const { data:memberships, error:membershipError } = await adminClient
        .from('student_class_memberships')
        .select('student_id')
        .eq('class_id', input.classId)
        .is('ended_at', null);
      if (membershipError) return jsonResponse({ error:membershipError.message }, { status:400 });

      const classStudentIds=[...new Set((memberships??[]).map(item=>item.student_id))];
      const studentIds=input.studentIds??classStudentIds;
      if(studentIds.length>100) return jsonResponse({error:'Maximum 100 students per login-card batch.'},{status:400});
      if(studentIds.some(id=>!classStudentIds.includes(id)))
        return jsonResponse({error:'Selected students must belong to this active class.'},{status:403});
      if (!studentIds.length) return jsonResponse({ ok:true, created:[], failed:[] });

      const { data:students, error:studentsError } = await adminClient
        .from('profiles')
        .select('id, display_name, school_email, role, active')
        .in('id', studentIds);
      if (studentsError) return jsonResponse({ error:studentsError.message }, { status:400 });

      const activeById=new Map((students??[]).filter(student=>student.role==='student'&&student.active).map(student=>[student.id,student]));
      if(input.studentIds && studentIds.some(id=>!activeById.has(id)))
        return jsonResponse({error:'Selected students must be active accounts in this class.'},{status:409});
      const issuedPasswords = new Set<string>();
      const credentialPlans = studentIds.map(id=>activeById.get(id)).filter(Boolean)
        .map(student => {
          let password = generateStudentPassword();
          while (issuedPasswords.has(password)) password = generateStudentPassword();
          issuedPasswords.add(password);
          return { student, password };
        });

      const credentialResults = await mapWithConcurrency(credentialPlans, 12, async ({ student, password }) => {
        const { error:flagError } = await adminClient.from('profiles').update({ must_change_password:false }).eq('id', student.id);
        if (flagError) {
          return { ok:false, failed:{ userId:student.id, displayName:student.display_name, email:student.school_email, reason:flagError.message } };
        }
        const { error:authError } = await adminClient.auth.admin.updateUserById(student.id, { password });
        if (authError) {
          await adminClient.from('profiles').update({ must_change_password:true }).eq('id', student.id);
          return { ok:false, failed:{ userId:student.id, displayName:student.display_name, email:student.school_email, reason:'Unable to set student password.' } };
        }
        return { ok:true, created:{ userId:student.id, displayName:student.display_name, email:student.school_email, temporaryPassword:password } };
      });

      const created = credentialResults.filter(result => result.ok).map(result => result.created);
      const failed = credentialResults.filter(result => !result.ok).map(result => result.failed);
      return jsonResponse({ ok:failed.length === 0, created, failed });
    }

    if (input.action === 'set_active') {
      const { data:profile, error:updateError } = await adminClient.from('profiles').update({ active:input.active }).eq('id', input.userId).select('id, active').single();
      if (updateError || !profile) return jsonResponse({ error:updateError?.message ?? 'Account not found' }, { status:400 });
      return jsonResponse({ ok:true, userId:profile.id, active:profile.active });
    }

    const provisionOne = async (row: { displayName:string; email:string }, classId: string | null, role: 'student' | 'teacher', password: string) => {
      const { data:created, error:createError } = await adminClient.auth.admin.createUser({ email:row.email, password, email_confirm:true, app_metadata:{ role } });
      if (createError || !created.user) return { error:safeAuthAccountError(createError) };
      const userId = created.user.id;
      const { error:insertProfileError } = await adminClient.from('profiles').insert({ id:userId, role, display_name:row.displayName, school_email:row.email, active:true, must_change_password:false });
      let membershipError = null;
      if (!insertProfileError && role === 'student') {
        const membership = await adminClient.from('student_class_memberships').insert({ student_id:userId, class_id:classId, changed_by:callerData.user.id });
        membershipError = membership.error;
      }
      if (insertProfileError || membershipError) {
        await adminClient.auth.admin.deleteUser(userId);
        return { error:'Account setup failed; no account was retained.' };
      }
      return { userId };
    };

    if (input.action === 'bulk_provision_students') {
      const { data:targetClass, error:classError } = await adminClient.from('classes').select('id, active').eq('id', input.classId).single();
      if (classError || !targetClass?.active) return jsonResponse({ error:'Class is not active' }, { status:400 });

      const frequencies = new Map<string, number>();
      for (const row of input.rows) frequencies.set(row.email, (frequencies.get(row.email) ?? 0) + 1);
      const { data:existing, error:existingError } = await adminClient.from('profiles').select('school_email');
      if (existingError) return jsonResponse({ error:existingError.message }, { status:400 });
      const existingEmails = new Set((existing ?? []).map(item => String(item.school_email).toLowerCase()));
      const issuedPasswords = new Set<string>();
      const rowResults = new Array(input.rows.length);
      const provisionPlans = [];

      for (let index = 0; index < input.rows.length; index += 1) {
        const row = input.rows[index];
        if ((frequencies.get(row.email) ?? 0) > 1) {
          rowResults[index] = { ok:false, failed:{ ...row, reason:'Duplicate email in batch.' } };
          continue;
        }
        if (existingEmails.has(row.email)) {
          rowResults[index] = { ok:false, failed:{ ...row, reason:'Email already exists.' } };
          continue;
        }
        let temporaryPassword = generateStudentPassword();
        while (issuedPasswords.has(temporaryPassword)) temporaryPassword = generateStudentPassword();
        issuedPasswords.add(temporaryPassword);
        provisionPlans.push({ index, row, temporaryPassword });
      }

      const provisionResults = await mapWithConcurrency(provisionPlans, 12, async ({ index, row, temporaryPassword }) => {
        const result = await provisionOne(row, input.classId, 'student', temporaryPassword);
        if ('error' in result) return { index, value:{ ok:false, failed:{ ...row, reason:result.error } } };
        return { index, value:{ ok:true, created:{ userId:result.userId, displayName:row.displayName, email:row.email, temporaryPassword } } };
      });
      for (const result of provisionResults) rowResults[result.index] = result.value;

      const created = rowResults.filter(result => result?.ok).map(result => result.created);
      const failed = rowResults.filter(result => result && !result.ok).map(result => result.failed);
      return jsonResponse({ ok:failed.length === 0, created, failed });
    }

    if (input.action === 'provision' && input.role === 'student') {
      const { data:targetClass, error:classError } = await adminClient.from('classes').select('id, active').eq('id', input.classId).single();
      if (classError || !targetClass?.active) return jsonResponse({ error:'Class is not active' }, { status:400 });
    }

    const temporaryPassword = generateStudentPassword();
    const result = await provisionOne({ displayName:input.displayName, email:input.email }, input.classId, input.role, temporaryPassword);
    if ('error' in result) return jsonResponse({ error:result.error }, { status:400 });
    return jsonResponse({ ok:true, userId:result.userId, role:input.role, temporaryPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ error:message }, { status:400 });
  }
});
