import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { validateClassAction } from './validation.js';

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return Response.json({ error: 'Authentication required' }, { status: 401 });

    const url = Deno.env.get('SUPABASE_URL');
    if (!url) throw new Error('Missing SUPABASE_URL.');
    const publishableKey = firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
    const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));

    const callerClient = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return Response.json({ error: 'Invalid session' }, { status: 401 });

    const adminClient = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, active')
      .eq('id', callerData.user.id)
      .single();
    if (profileError || !callerProfile?.active || callerProfile.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const input = validateClassAction(await req.json());

    if (input.action === 'create_class') {
      const { data, error } = await adminClient
        .from('classes')
        .insert({ class_name: input.className })
        .select('id, class_name, active')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true, class: data });
    }

    if (input.action === 'assign_teacher') {
      const { data: teacher, error: teacherError } = await adminClient
        .from('profiles')
        .select('id, role, active')
        .eq('id', input.teacherId)
        .single();
      if (teacherError || !teacher?.active || teacher.role !== 'teacher') {
        return Response.json({ error: 'Teacher account is not active' }, { status: 400 });
      }

      const { data: targetClass, error: classError } = await adminClient
        .from('classes')
        .select('id, active')
        .eq('id', input.classId)
        .single();
      if (classError || !targetClass?.active) return Response.json({ error: 'Class is not active' }, { status: 400 });

      const { error } = await adminClient.from('teacher_classes').upsert({
        teacher_id: input.teacherId,
        class_id: input.classId,
        assigned_by: callerData.user.id
      }, { onConflict: 'teacher_id,class_id' });
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true });
    }

    const { data, error } = await adminClient.rpc('admin_transfer_student', {
      p_student: input.studentId,
      p_new_class: input.newClassId,
      p_changed_by: callerData.user.id
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true, membershipId: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 400 });
  }
});
