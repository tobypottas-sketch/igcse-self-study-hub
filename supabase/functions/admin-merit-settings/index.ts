import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, { ...init, headers:{ ...corsHeaders, ...(init.headers ?? {}) } });
}

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers:corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error:'Method not allowed' }, { status:405 });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error:'Authentication required' }, { status:401 });
    const url = Deno.env.get('SUPABASE_URL');
    if (!url) throw new Error('Missing SUPABASE_URL.');
    const publishableKey = firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
    const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
    const callerClient = createClient(url, publishableKey, { global:{ headers:{ Authorization:authHeader } }, auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:callerData, error:callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return jsonResponse({ error:'Invalid session' }, { status:401 });
    const adminClient = createClient(url, secretKey, { auth:{ persistSession:false, autoRefreshToken:false } });
    const { data:profile, error:profileError } = await adminClient.from('profiles').select('role,active').eq('id',callerData.user.id).single();
    if (profileError || !profile?.active || profile.role !== 'admin') return jsonResponse({ error:'Admin access required' }, { status:403 });

    const body = await req.json();
    const classId = String(body?.classId ?? '').trim();
    const value = Number(body?.pathwaysPerMerit);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(classId)) return jsonResponse({ error:'Invalid class' }, { status:400 });
    if (!Number.isInteger(value) || value < 1 || value > 6) return jsonResponse({ error:'Pathways per merit must be an integer from 1 to 6' }, { status:400 });

    const { data, error } = await adminClient.from('classes')
      .update({ merit_pathways_required:value })
      .eq('id',classId).eq('active',true)
      .select('id,class_name,merit_pathways_required').maybeSingle();
    if (error) return jsonResponse({ error:error.message }, { status:400 });
    if (!data) return jsonResponse({ error:'Class not found or inactive' }, { status:404 });
    return jsonResponse({ ok:true, class:data });
  } catch (error) {
    return jsonResponse({ error:error instanceof Error ? error.message : 'Unable to update merit threshold' }, { status:500 });
  }
});
