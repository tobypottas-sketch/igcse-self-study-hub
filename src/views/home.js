import { escapeHtml, safeHttpsUrl } from './html.js';

const EH_SCHOOLS_LOGO = './assets/evidence-hub-schools-logo.webp';
const CAMBRIDGE_ENGLISH_LOGO = './assets/cambridge-assessment-english.webp';

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
  if (key.includes('vocabulary')) return 'V';
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
          <div class="home-hero__kicker">
            <p class="eyebrow eyebrow--hero">iGCSE Self-Study Hub</p>
            <div class="course-identity" aria-label="Cambridge IGCSE English as a Second Language course 0511" style="margin-left:16px;min-height:38px;">
              <img src="${CAMBRIDGE_ENGLISH_LOGO}" alt="Cambridge Assessment English" width="126" style="display:block;width:126px;max-width:30vw;height:auto;padding:4px 8px;background:#fff;">
              <span class="course-identity__board">Cambridge IGCSE</span>
              <span class="course-identity__subject">English as a Second Language</span>
              <span class="course-code">0511</span>
            </div>
          </div>
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
            <p>Focused practice for Cambridge IGCSE English as a Second Language (0511).</p>
          </div>
          ${model.showAdminControls ? '<button class="button" data-action="admin">Manage accounts</button>' : ''}
        </div>
        <div class="app-grid">${cards}</div>
      </section>
    </section>`;
}
