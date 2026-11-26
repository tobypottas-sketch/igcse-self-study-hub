import {getCurrentProfile} from './auth.js';
import {getSupabaseClient} from './supabase.js';

// Enable only after Entra staff assignment and the Supabase provider have been checked.
export const MICROSOFT_STAFF_PILOT_ENABLED = false;
const callbackMarker = 'microsoft-return';

export function microsoftCallbackUrl(pageUrl) {
  const url = new URL('./microsoft-sign-in.html',pageUrl);
  url.searchParams.set(callbackMarker,'1');
  return url.href;
}

export async function startMicrosoftSignIn(client,pageUrl) {
  const {error} = await client.auth.signInWithOAuth({
    provider:'azure',
    options:{scopes:'email',redirectTo:microsoftCallbackUrl(pageUrl)}
  });
  if (error) throw error;
}

export async function finishMicrosoftStaffSignIn(client) {
  try {
    const {data,error} = await client.auth.getUser();
    if (error || !data?.user?.identities?.some(identity=>identity.provider==='azure')) {
      throw new Error('Microsoft identity unavailable');
    }
    const profile = await getCurrentProfile(client);
    if (profile.id!==data.user.id || !['teacher','admin'].includes(profile.role) || profile.must_change_password) {
      throw new Error('Staff pilot access required');
    }
    return true;
  } catch {
    await client.auth.signOut({scope:'local'});
    return false;
  }
}

export async function bootMicrosoftPilot(root,{
  enabled=MICROSOFT_STAFF_PILOT_ENABLED, getClient=getSupabaseClient, location=root.ownerDocument.defaultView.location
}={}) {
  const button = root.querySelector('[data-microsoft-sign-in]');
  const status = root.querySelector('[data-pilot-status]');
  if (!enabled) {
    status.textContent = 'The staff pilot is not open yet. Use your existing Hub sign-in.';
    return;
  }

  const url = new URL(location.href);
  if (url.searchParams.get(callbackMarker)==='1') {
    status.textContent = 'Checking your Hub staff account…';
    try {
      const providerHash=new URLSearchParams(url.hash.slice(1));
      if (url.searchParams.has('error') || providerHash.has('error')) {
        status.textContent = 'Microsoft sign-in was cancelled or unavailable. Return to Hub sign-in to continue.';
        return;
      }
      if (await finishMicrosoftStaffSignIn(await getClient())) {
        location.replace(new URL('./',url).href);
        return;
      }
    } catch { /* Keep the password sign-in link available. */ }
    status.textContent = 'Microsoft sign-in could not open a Hub staff profile. Use your existing Hub sign-in.';
    return;
  }

  status.textContent = 'Use your school Microsoft account to join the staff sign-in pilot.';
  button.hidden = false;
  button.addEventListener('click',async ()=>{
    button.disabled = true;
    status.textContent = 'Opening Microsoft sign-in…';
    try {
      await startMicrosoftSignIn(await getClient(),url.href);
    } catch {
      status.textContent = 'Microsoft sign-in is unavailable. Try again or use your existing Hub sign-in.';
      button.disabled = false;
    }
  });
}

if (typeof document!=='undefined') {
  const root = document.getElementById('microsoft-sign-in');
  if (root) void bootMicrosoftPilot(root);
}
