import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { handleMatchRequest } from './handler.js';

// Server-to-server only. Deploy with gateway JWT verification OFF (see docs/eh-match-deployment.md);
// authentication is the shared secret checked inside handleMatchRequest.

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

const PAGE_SIZE = 500;

async function loadStudentProfiles() {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) throw new Error('Missing SUPABASE_URL.');
  const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows: Array<{ id: string; display_name: string; school_email: string; role: string; active: boolean }> = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from('profiles')
      .select('id, display_name, school_email, role, active')
      .eq('role', 'student')
      .eq('active', true)
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error('profiles query failed');
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

Deno.serve((req: Request) =>
  handleMatchRequest(req, { env: { EH_SERVICE_KEY: Deno.env.get('EH_SERVICE_KEY') }, loadStudentProfiles })
);
