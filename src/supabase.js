import { getSupabaseConfig } from './config.js';

let clientPromise;
let pilotClientPromise;

async function createHubClient(flowType, detectSessionInUrl) {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm');
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl, flowType }
  });
}

export async function getSupabaseClient() {
  clientPromise ??= createHubClient('implicit', true);
  return clientPromise;
}

export function getMicrosoftPilotSupabaseClient() {
  pilotClientPromise ??= createHubClient('pkce', false);
  return pilotClientPromise;
}
