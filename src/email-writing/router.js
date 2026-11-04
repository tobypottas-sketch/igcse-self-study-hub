import { getSupabaseClient } from '../supabase.js';
import { getCurrentProfile } from '../auth.js';

const root = document.getElementById('emailWritingApp');
const hubHref = './';

function renderShell() {
  // Full writer has its own second authentication check to prevent bypassing the entry point.
  window.location.replace('./email-writing-app.html');
}

function renderError() {
  root.innerHTML = `<div class="email-shell">
    <section class="email-panel" role="alert">
      <h1>Email Writing unavailable</h1>
      <p class="email-note email-error">We couldn't verify an active Hub account. Please sign in again from the Hub.</p>
      <a class="button button--primary" href="${hubHref}">Back to Hub</a>
    </section>
  </div>`;
}

async function boot() {
  if (!root) return;
  try {
    const client = await getSupabaseClient();
    const profile = await getCurrentProfile(client);
    if (!['student','teacher','admin'].includes(profile.role)) { renderError(); return; }
    if (profile.must_change_password) { window.location.replace(hubHref); return; }
    renderShell(profile);
    // Never render an authenticated workspace after the session is revoked.
    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') window.location.replace(hubHref);
    });
  } catch {
    renderError();
  }
}

void boot();
