import { escapeHtml, safeHttpsUrl } from './html.js';

const EH_SCHOOLS_LOGO = 'https://raw.githubusercontent.com/tobypottas-sketch/evidence-hub-schools-showcase/main/01_FRONTEND/images/evidence-hub-schools-logo-approved.webp';

export function buildHomeModel(profile, apps) {
  return {
    displayName: profile.display_name,
    role: profile.role,
    apps: apps.filter(app => app.enabled),
    showAdminControls: profile.role === 'admin'
  };
}

function appVisual(appKey) {
  const key = String(appKey ?? '').toLowerCase();
  if (key.includes('read')) return 'R';
  if (key.includes('listen')) return 'L';
  if (key.includes('paraphr')) return 'P';
  if (key.includes('essay') || key.includes('writ')) return 'E';
  return 'S';
}

export function renderHome(root, profile, apps) {
  const model = buildHomeModel(profile, apps);
  const cards = model.apps.map(app => `
    <a class="app-card" href="${safeHttpsUrl(app.launch_url)}" data-app="${escapeHtml(app.app_key)}">
      <span class="app-card__topline">
        <span class="app-card__icon" aria-hidden="true">${appVisual(app.app_key)}</span>
        <span class="app-card__arrow" aria-hidden="true">→</span>
      </span>
      <span class="app-card__content">
        <span class="app-card__title">${escapeHtml(app.display_name)}</span>
        <span class="app-card__description">Independent iGCSE practice</span>
      </span>
      <span class="app-card__meta">Open practice →</span>
    </a>`).join('');

  root.innerHTML = `
    <section class="shell shell--home">
      <header class="home-hero">
        <div class="home-hero__topbar">
          <div class="home-brand">
            <img class="home-brand__logo" src="${EH_SCHOOLS_LOGO}" alt="Evidence Hub Schools" width="230" style="display:block;max-width:min(52vw,230px);height:auto;">
          </div>
          <button class="button button--ghost home-logout" data-action="logout">Log out</button>
        </div>
        <div class="home-hero__content">
          <p class="eyebrow eyebrow--hero">iGCSE Self-Study Hub</p>
          <h1>Welcome, ${escapeHtml(model.displayName)}</h1>
          <p class="home-hero__lead">Choose a skill and continue your independent practice.</p>
          <div class="home-hero__note">
            <span class="home-hero__status" aria-hidden="true"></span>
            Your activity is linked securely to your account.
          </div>
        </div>
      </header>

      <section class="study-tools" aria-labelledby="study-tools-title">
        <div class="section-heading section-heading--home">
          <div>
            <p class="eyebrow">Your study tools</p>
            <h2 id="study-tools-title">Choose a study app</h2>
            <p>Focused practice for the core skills you need in Cambridge iGCSE English.</p>
          </div>
          ${model.showAdminControls ? '<button class="button" data-action="admin">Manage accounts</button>' : ''}
        </div>
        <div class="app-grid">${cards}</div>
      </section>
    </section>`;
}
