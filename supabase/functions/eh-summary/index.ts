import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { handleSummaryRequest } from './handler.js';
import { createSummaryLoader } from './loader.js';

// Server-to-server only. Deploy with gateway JWT verification OFF (see docs/eh-summary-deployment.md);
// authentication is the shared secret checked inside handleSummaryRequest. This file only wires the pieces together.

function firstNamedKey(raw: string | undefined): string {
  if (!raw) throw new Error('Missing Supabase key configuration.');
  const parsed = JSON.parse(raw);
  const value = parsed.default ?? Object.values(parsed)[0];
  if (typeof value !== 'string' || !value) throw new Error('Invalid Supabase key configuration.');
  return value;
}

function loadSummaryData(args: { ids: string[]; since?: string }) {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) throw new Error('Missing SUPABASE_URL.');
  const secretKey = firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return createSummaryLoader(admin)(args);
}

Deno.serve((req: Request) =>
  handleSummaryRequest(req, { env: { EH_SERVICE_KEY: Deno.env.get('EH_SERVICE_KEY') }, loadSummaryData })
);
