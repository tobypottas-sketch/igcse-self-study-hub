import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { validateAdminProvisionRequest } from './validation.js';

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

function randomChar(alphabet: string): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return alphabet[bytes[0] % alphabet.length];
}

function generateTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%*-_';
  const all = `${upper}${lower}${digits}${symbols}`;
  const chars = [randomChar(upper), randomChar(lower), randomChar(digits), randomChar(symbols)];
  while (chars.length < 16) chars.push(randomChar(all));

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
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

    const input = validateAdminProvisionRequest(await req.json());

    if (input.action === 'reset_password') {
      const temporaryPassword = generateTemporaryPassword();
      const { error: authError } = await adminClient.auth.admin.updateUserById(input.userId, { password: temporaryPassword });
      if (authError) return Response.json({ error: authError.message }, { status: 400 });

      const { error: flagError } = await adminClient
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', input.userId);
      if (flagError) return Response.json({ error: flagError.message }, { status: 400 });
      return Response.json({ ok: true, userId: input.userId, temporaryPassword });
    }

    if (input.action === 'set_active') {
      const { data: profile, error: updateError } = await adminClient
        .from('profiles')
        .update({ active: input.active })
        .eq('id', input.userId)
        .select('id, active')
        .single();
      if (updateError || !profile) {
        return Response.json({ error: updateError?.message ?? 'Account not found' }, { status: 400 });
      }
      return Response.json({ ok: true, userId: profile.id, active: profile.active });
    }

    const temporaryPassword = generateTemporaryPassword();
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: temporaryPassword,
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

    return Response.json({ ok: true, userId, role: input.role, temporaryPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 400 });
  }
});
