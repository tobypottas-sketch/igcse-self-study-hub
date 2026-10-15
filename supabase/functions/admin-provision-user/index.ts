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
    const callerClient = createClient(url, publishableKey, { global:{ headers:{ Authorization:authHeader } }, auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerData, error:callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return Response.json({ error:'Invalid session' }, { status:401 });

    const adminClient = createClient(url, secretKey, { auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerProfile, error:profileError } = await adminClient.from('profiles').select('role, active').eq('id', callerData.user.id).single();
    if (profileError || !callerProfile?.active || callerProfile.role !== 'admin') return Response.json({ error:'Admin access required' }, { status:403 });

    const input = validateAdminProvisionRequest(await req.json());

    if (input.action === 'reset_password') {
      const temporaryPassword = generateTemporaryPassword();
      const { error:flagError } = await adminClient.from('profiles').update({ must_change_password:true }).eq('id', input.userId);
      if (flagError) return Response.json({ error:flagError.message }, { status:400 });
      const { error:authError } = await adminClient.auth.admin.updateUserById(input.userId, { password:temporaryPassword });
      if (authError) return Response.json({ error:authError.message }, { status:400 });
      return Response.json({ ok:true, userId:input.userId, temporaryPassword });
    }

    if (input.action === 'set_active') {
      const { data:profile, error:updateError } = await adminClient.from('profiles').update({ active:input.active }).eq('id', input.userId).select('id, active').single();
      if (updateError || !profile) return Response.json({ error:updateError?.message ?? 'Account not found' }, { status:400 });
      return Response.json({ ok:true, userId:profile.id, active:profile.active });
    }

    const provisionOne = async (row: { displayName:string; email:string }, classId: string | null, role: 'student' | 'teacher', password: string) => {
      const { data:created, error:createError } = await adminClient.auth.admin.createUser({ email:row.email, password, email_confirm:true, app_metadata:{ role } });
      if (createError || !created.user) return { error:createError?.message ?? 'Unable to create account' };
      const userId = created.user.id;
      const { error:insertProfileError } = await adminClient.from('profiles').insert({ id:userId, role, display_name:row.displayName, school_email:row.email, active:true, must_change_password:true });
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
      if (classError || !targetClass?.active) return Response.json({ error:'Class is not active' }, { status:400 });

      const frequencies = new Map<string, number>();
      for (const row of input.rows) frequencies.set(row.email, (frequencies.get(row.email) ?? 0) + 1);
      const emails = [...new Set(input.rows.map(row => row.email))];
      const { data:existing, error:existingError } = await adminClient.from('profiles').select('school_email').in('school_email', emails);
      if (existingError) return Response.json({ error:existingError.message }, { status:400 });
      const existingEmails = new Set((existing ?? []).map(item => String(item.school_email).toLowerCase()));
      const created = [];
      const failed = [];
      const issuedPasswords = new Set<string>();

      for (const row of input.rows) {
        if ((frequencies.get(row.email) ?? 0) > 1) { failed.push({ ...row, reason:'Duplicate email in batch.' }); continue; }
        if (existingEmails.has(row.email)) { failed.push({ ...row, reason:'Email already exists.' }); continue; }
        let temporaryPassword = generateTemporaryPassword();
        while (issuedPasswords.has(temporaryPassword)) temporaryPassword = generateTemporaryPassword();
        issuedPasswords.add(temporaryPassword);
        const result = await provisionOne(row, input.classId, 'student', temporaryPassword);
        if ('error' in result) failed.push({ ...row, reason:result.error });
        else created.push({ userId:result.userId, displayName:row.displayName, email:row.email, temporaryPassword });
      }
      return Response.json({ ok:failed.length === 0, created, failed });
    }

    const temporaryPassword = generateTemporaryPassword();
    const result = await provisionOne({ displayName:input.displayName, email:input.email }, input.classId, input.role, temporaryPassword);
    if ('error' in result) return Response.json({ error:result.error }, { status:400 });
    return Response.json({ ok:true, userId:result.userId, role:input.role, temporaryPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error:message }, { status:400 });
  }
});
