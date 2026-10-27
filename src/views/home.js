import { escapeHtml, safeHttpsUrl } from './html.js';

const EH_SCHOOLS_LOGO = './assets/evidence-hub-schools-logo.webp';
const CAMBRIDGE_ENGLISH_LOGO = './assets/cambridge-assessment-english.webp';

export function buildHomeModel(profile, apps, activityDashboard = null) {
  const canSeeTeacherActivity = profile.role === 'admin' || profile.role === 'teacher';
  const meritAlerts = canSeeTeacherActivity
    ? (activityDashboard?.students ?? [])
      .filter(student => Number(student.pendingMerits ?? 0) > 0)
      .map(student => ({
        studentId:student.studentId,
        displayName:student.displayName,
        className:student.className,
        meritNumbers:[...(student.pendingMeritNumbers ?? [])]
      }))
    : [];
  const pendingMerits = canSeeTeacherActivity
    ? Number(activityDashboard?.pendingMerits ?? meritAlerts.reduce((total, student) => total + student.meritNumbers.length, 0))
    : 0;

  return {
    displayName: profile.display_name,
    role: profile.role,
    apps: (apps ?? []).filter(app => app.enabled),
    showAdminControls: profile.role === 'admin',
    showActivityControls: canSeeTeacherActivity,
    pendingMerits,
    meritAlerts
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

function renderMeritAlert(model) {
  if (!model.pendingMerits) return '';
  const shown = model.meritAlerts.slice(0, 3);
  const summary = shown.map(student => `${escapeHtml(student.displayName)} · ${escapeHtml(student.className)} (${student.meritNumbers.length})`).join(' · ');
  const more = model.meritAlerts.length > shown.length ? ` · +${model.meritAlerts.length - shown.length} more student${model.meritAlerts.length - shown.length === 1 ? '' : 's'}` : '';
  return `
    <aside class="notice home-merit-alert" role="status">
      <div>
        <strong>🏅 ${escapeHtml(model.pendingMerits)} new merit${model.pendingMerits === 1 ? '' : 's'} waiting</strong>
        <p>${summary}${more}</p>
      </div>
      <button class="button button--primary" data-action="activity">Review merits</button>
    </aside>`;
}

export function renderHome(root, profile, apps, activityDashboard = null) {
  const model = buildHomeModel(profile, apps, activityDashboard);
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

  const activityLabel = model.pendingMerits ? `Student activity · ${model.pendingMerits} new` : 'Student activity';
  const teacherControls = [
    model.showActivityControls ? `<button class="button button--primary" data-action="activity">${escapeHtml(activityLabel)}</button>` : '',
    model.showAdminControls ? '<button class="button" data-action="admin">Manage accounts</button>' : ''
  ].filter(Boolean).join(' ');

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

      ${renderMeritAlert(model)}

      <section class="study-tools" aria-labelledby="study-tools-title">
        <div class="section-heading section-heading--home">
          <div>
            <p class="eyebrow">Your study tools</p>
            <h2 id="study-tools-title">Choose a study app</h2>
            <p>Focused practice for Cambridge IGCSE English as a Second Language (0511).</p>
          </div>
          ${teacherControls ? `<div class="admin-actions">${teacherControls}</div>` : ''}
        </div>
        <div class="app-grid">${cards}</div>
      </section>
    </section>`;
}
