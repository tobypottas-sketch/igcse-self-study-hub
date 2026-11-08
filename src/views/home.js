import { escapeHtml, safeHttpsUrl } from './html.js';
import { DEFAULT_REGISTRY, catalogueEntry, skillOf, skillStyle, skillSummaries } from './app-registry.js';

const EH_SCHOOLS_LOGO = './assets/evidence-hub-schools-logo.webp';
const CAMBRIDGE_ENGLISH_LOGO = './assets/cambridge-assessment-english.webp';

export function buildHomeModel(profile, apps, activityDashboard = null) {
  const showAdminControls = ['admin','teacher'].includes(profile.role);
  const canSeeTeacherActivity = showAdminControls;
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
    showAdminControls,
    showActivityControls: canSeeTeacherActivity,
    pendingMerits,
    meritAlerts
  };
}

function appVisual(appKey, registry = DEFAULT_REGISTRY) {
  return catalogueEntry(appKey, registry)?.badge ?? 'S';
}

// Decorative card artwork. Unknown apps simply get no artwork.
function appArt(appKey, registry = DEFAULT_REGISTRY) {
  const art = catalogueEntry(appKey, registry)?.art;
  return art ? `<img class="app-card__art" src="${escapeHtml(art)}" alt="" width="300" height="200" loading="lazy" decoding="async" aria-hidden="true">` : '';
}

const ICONS = {
  pen: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1z"/><path d="M14 7l3 3"/>',
  book: '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2z"/><path d="M12 6.5v13"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  letters: '<path d="M3.5 18.5l4.5-12 4.5 12M5.2 14h5.6"/><path d="M14 8h6.5M17.2 6v2M15 18c2.6-1.5 4.2-4.2 4.6-8M16 12.5c.6 2.4 2.4 4.3 4.5 5"/>'
};
const icon = name => `<svg class="skill-card__svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] ?? ICONS.book}</svg>`;

// Which skill is showing survives re-renders (the dashboard re-renders when activity data arrives). 'all' is the default.
let selectedSkill = 'all';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

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

export function renderHome(root, profile, apps, activityDashboard = null, { registry = DEFAULT_REGISTRY } = {}) {
  const model = buildHomeModel(profile, apps, activityDashboard);
  const skills = skillSummaries(model.apps, registry);
  // A remembered skill that no longer has visible apps (or never existed) falls back to All apps rather than an empty page.
  if (selectedSkill !== 'all' && !skills.some(skill => skill.id === selectedSkill)) selectedSkill = 'all';
  const canChangePassword = ['student','teacher','admin'].includes(profile.role) && profile.active !== false;
  const cards = model.apps.map(app => {
    const skill = skillOf(app.app_key, registry);
    const shown = selectedSkill === 'all' || skill === selectedSkill;
    return `
    <a class="app-card" href="${safeHttpsUrl(app.launch_url)}" data-app="${escapeHtml(app.app_key)}"${skill ? ` data-skill="${escapeHtml(skill)}" style="${escapeHtml(skillStyle(registry.skills.find(candidate => candidate.id === skill)))}"` : ''}${shown ? '' : ' hidden'}>
      ${appArt(app.app_key, registry)}
      <span class="app-card__topline">
        <span class="app-card__icon" aria-hidden="true">${appVisual(app.app_key, registry)}</span>
        <span class="app-card__arrow" aria-hidden="true">→</span>
      </span>
      <span class="app-card__content">
        <span class="app-card__title">${escapeHtml(app.display_name)}</span>
        <span class="app-card__description"><span class="app-card__line">Independent iGCSE</span><span class="app-card__line">practice</span></span>
      </span>
      <span class="app-card__meta">Open practice →</span>
    </a>`;
  }).join('');

  const skillCards = skills.map(skill => `
    <button type="button" class="skill-card" data-skill-choice="${escapeHtml(skill.id)}" data-skill="${escapeHtml(skill.id)}" style="${escapeHtml(skillStyle(skill))}" aria-pressed="${selectedSkill === skill.id}">
      <span class="skill-card__icon">${icon(skill.icon)}</span>
      <span class="skill-card__text">
        <span class="skill-card__name">${escapeHtml(skill.name)}</span>
        <span class="skill-card__description">${escapeHtml(skill.description)}</span>
      </span>
      <span class="skill-card__count">${plural(skill.count, 'app')}</span>
    </button>`).join('');
  const heading = selectedSkill === 'all' ? 'All apps' : (skills.find(skill => skill.id === selectedSkill)?.name ?? '');
  const shownCount = selectedSkill === 'all' ? model.apps.length : (skills.find(skill => skill.id === selectedSkill)?.count ?? 0);

  const activityLabel = model.pendingMerits ? `Student activity · ${model.pendingMerits} new` : 'Student activity';
  const accountControls = [
    model.showActivityControls ? `<button class="button button--primary" data-action="activity">${escapeHtml(activityLabel)}</button>` : '',
    model.showAdminControls ? '<button class="button" data-action="admin">Manage accounts</button>' : '',
    model.showAdminControls && profile.active === true && !profile.must_change_password ? '<button class="button" data-action="writing-assessor">Writing assessor</button>' : '',
    canChangePassword ? `<button class="button" data-action="change-password"${model.role === 'student' ? ' data-student-password-change' : ''}>Change password</button>` : ''
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
            <h2 id="study-tools-title">Choose a skill</h2>
            <p>Pick a skill, then open an app. Focused practice for Cambridge IGCSE English as a Second Language (0511).</p>
          </div>
          ${accountControls ? `<div class="admin-actions">${accountControls}</div>` : ''}
        </div>
        ${skills.length ? `<div class="skill-picker" role="group" aria-label="Skills">${skillCards}</div>` : ''}
        <div class="app-results" data-app-results>
          <div class="app-results__bar">
            <h3 class="app-results__title" id="app-results-title" data-app-results-title>${escapeHtml(heading)}</h3>
            <span class="app-results__count" data-app-results-count>${selectedSkill === 'all' ? '' : plural(shownCount, 'app')}</span>
            ${skills.length ? `<button type="button" class="skill-all" data-skill-choice="all" aria-pressed="${selectedSkill === 'all'}">All apps <span class="skill-all__count">${model.apps.length}</span></button>` : ''}
          </div>
          <div class="app-grid" aria-labelledby="app-results-title">${cards}</div>
          <p class="sr-only" role="status" aria-live="polite" data-app-results-status></p>
        </div>
      </section>
    </section>`;

  wireSkillPicker(root, skills, model.apps.length);
}

// Filters the cards already on the page. No re-render, no navigation, no focus or scroll changes: the button the student
// pressed keeps focus and the document stays exactly where it is.
function wireSkillPicker(root, skills, totalApps) {
  const choices = root.querySelectorAll?.('[data-skill-choice]');
  if (!choices?.length) return;
  const cards = [...root.querySelectorAll('.app-card')];
  const title = root.querySelector('[data-app-results-title]');
  const count = root.querySelector('[data-app-results-count]');
  const status = root.querySelector('[data-app-results-status]');
  const results = root.querySelector('[data-app-results]');
  const choose = id => {
    // Keep the results area as tall as it has been, so a shorter list never shortens the page. Otherwise the browser clamps the
    // scroll position and the skill buttons the student just pressed slide down the screen. (Layout stability, not scroll control.)
    if (results) results.style.minHeight = `${Math.max(Math.ceil(results.getBoundingClientRect().height), parseFloat(results.style.minHeight) || 0)}px`;
    selectedSkill = id;
    const skill = skills.find(candidate => candidate.id === id);
    let shown = 0;
    for (const card of cards) { const visible = id === 'all' || card.dataset.skill === id; card.hidden = !visible; if (visible) shown++; }
    for (const button of choices) button.setAttribute('aria-pressed', String(button.dataset.skillChoice === id));
    const label = id === 'all' ? 'All apps' : (skill?.name ?? '');
    if (title) title.textContent = label;
    if (count) count.textContent = id === 'all' ? '' : plural(shown, 'app');
    if (status) status.textContent = `${label}: showing ${plural(shown, 'app')}`;
  };
  for (const button of choices) button.addEventListener('click', () => choose(button.dataset.skillChoice));
}

// A resize can change how many cards fit per row, so drop any reserved height and let it be measured afresh. Registered once.
if (typeof window !== 'undefined') window.addEventListener('resize', () => { const results = document.querySelector('[data-app-results]'); if (results) results.style.minHeight = ''; });
