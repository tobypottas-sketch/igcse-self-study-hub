import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { validateTaskAction } from './validation.js';

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
    if (profileError || !callerProfile?.active) return Response.json({ error: 'Active account required' }, { status: 403 });

    const input = validateTaskAction(await req.json());

    if (input.action === 'create') {
      if (callerProfile.role !== 'teacher' && callerProfile.role !== 'admin') {
        return Response.json({ error: 'Teacher or admin access required' }, { status: 403 });
      }

      const { data, error } = await adminClient
        .from('essay_tasks')
        .insert({
          created_by: callerData.user.id,
          study_mode: input.studyMode,
          settings: input.settings
        })
        .select('id, study_mode, settings')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true, task: { id: data.id, studyMode: data.study_mode, settings: data.settings } });
    }

    const { data, error } = await adminClient
      .from('essay_tasks')
      .select('id, study_mode, settings, active, expires_at')
      .eq('id', input.taskId)
      .single();
    if (error || !data?.active) return Response.json({ error: 'Controlled Essay task not found' }, { status: 404 });
    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
      return Response.json({ error: 'Controlled Essay task has expired' }, { status: 410 });
    }

    return Response.json({ ok: true, task: { id: data.id, studyMode: data.study_mode, settings: data.settings } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 400 });
  }
});
