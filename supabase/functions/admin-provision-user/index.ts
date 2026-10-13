import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { validateProvisionInput } from './validation.js';

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

    const input = validateProvisionInput(await req.json());
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.temporaryPassword,
      email_confirm: true,
      app_metadata: { role: input.role }
    });
    if (createError || !created.user) {
      return Response.json({ error: createError?.message ?? 'Unable to create account' }, { status: 400 });
    }

    const userId = created.user.id;
    const { error: insertProfileError } = await adminClient.from('profiles').insert({
      id: userId,
      role: input.role,
      display_name: input.displayName,
      school_email: input.email,
      active: true,
      must_change_password: true
    });

    let membershipError = null;
    if (!insertProfileError && input.role === 'student') {
      const result = await adminClient.from('student_class_memberships').insert({
        student_id: userId,
        class_id: input.classId,
        changed_by: callerData.user.id
      });
      membershipError = result.error;
    }

    if (insertProfileError || membershipError) {
      await adminClient.auth.admin.deleteUser(userId);
      return Response.json({ error: 'Account setup failed; no account was retained.' }, { status: 500 });
    }

    return Response.json({ ok: true, userId, role: input.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 400 });
  }
});
