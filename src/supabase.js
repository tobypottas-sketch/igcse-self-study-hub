import { getSupabaseConfig } from './config.js';

let clientPromise;
let pilotClientPromise;

async function createHubClient(flowType, detectSessionInUrl) {
  const { createClient } = await import('./vendor/supabase-2.117.3.js');
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl, flowType }
  });
}

export async function getSupabaseClient() {
  clientPromise ??= createHubClient('implicit', true).catch(error => {
    clientPromise = undefined;
    throw error;
  });
  return clientPromise;
}

export function getMicrosoftPilotSupabaseClient() {
  pilotClientPromise ??= createHubClient('pkce', false).catch(error => {
    pilotClientPromise = undefined;
    throw error;
  });
  return pilotClientPromise;
}
