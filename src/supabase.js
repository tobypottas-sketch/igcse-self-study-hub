import { getSupabaseConfig } from './config.js';

let clientPromise;

export async function getSupabaseClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm');
      const { url, publishableKey } = getSupabaseConfig();
      return createClient(url, publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    })();
  }
  return clientPromise;
}
