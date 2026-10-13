import { escapeHtml, safeHttpsUrl } from './html.js';

export function buildHomeModel(profile, apps) {
  return {
    displayName: profile.display_name,
    role: profile.role,
    apps: apps.filter(app => app.enabled),
    showAdminControls: profile.role === 'admin'
  };
}

export function renderHome(root, profile, apps) {
  const model = buildHomeModel(profile, apps);
  const cards = model.apps.map(app => `
    <a class="app-card" href="${safeHttpsUrl(app.launch_url)}" data-app="${escapeHtml(app.app_key)}">
      <span class="app-card__title">${escapeHtml(app.display_name)}</span>
      <span class="app-card__meta">Open practice</span>
    </a>`).join('');

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">iGCSE Self-Study</p>
          <h1>Welcome, ${escapeHtml(model.displayName)}</h1>
        </div>
        <button class="button button--ghost" data-action="logout">Log out</button>
      </header>
      <div class="section-heading">
        <div>
          <h2>Choose a study app</h2>
          <p>Your activity will be linked to your account.</p>
        </div>
        ${model.showAdminControls ? '<button class="button" data-action="admin">Manage accounts</button>' : ''}
      </div>
      <div class="app-grid">${cards}</div>
    </section>`;
}
