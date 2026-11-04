import { getSupabaseClient } from '../supabase.js';
import { getCurrentProfile } from '../auth.js';
import { escapeHtml } from '../views/html.js';

const root = document.getElementById('emailWritingApp');
const hubHref = './';

function renderShell(profile) {
  const who = escapeHtml(profile.display_name);
  root.innerHTML = `<div class="email-shell">
    <header class="email-topbar">
      <span class="email-brand">iGCSE Self-Study Hub · Writing</span>
      <a class="email-return" href="${hubHref}">← Back to Hub</a>
    </header>
    <section class="email-panel" aria-labelledby="email-heading">
      <p class="eyebrow">Cambridge IGCSE ESL · 0511 · Paper 1</p>
      <h1 id="email-heading">Informal Email Writing</h1>
      <p>Welcome, ${who}. Your Hub account has been checked.</p>
      <p class="email-note" role="status">
        The writing workspace is not enabled yet. Integration is being prepared
        separately to ensure student drafts stay private on shared school devices.
      </p>
      <a class="button button--primary" href="${hubHref}">Return to the Hub</a>
    </section>
  </div>`;
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
