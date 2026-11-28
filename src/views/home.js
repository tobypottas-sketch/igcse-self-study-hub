import { escapeHtml, safeHttpsUrl } from './html.js';
import { DEFAULT_REGISTRY, catalogueEntry, skillOf, orderApps, skillStyle, skillSummaries } from './app-registry.js';

const EH_SCHOOLS_LOGO = './assets/evidence-hub-schools-logo.webp';
const CAMBRIDGE_ENGLISH_LOGO = './assets/cambridge-assessment-english.webp';

export function buildHomeModel(profile, apps, activityDashboard = null) {
  const showAdminControls = profile.role === 'admin';
  const canSeeTeacherActivity = ['admin','teacher'].includes(profile.role);
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
    showStaffTools: canSeeTeacherActivity,
    pendingMerits,
    classroomLoaded:activityDashboard !== null && activityDashboard !== undefined,
    assignedClassCount:canSeeTeacherActivity && Number.isInteger(activityDashboard?.assignedClassCount) ? activityDashboard.assignedClassCount : null,
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
// Keep dismissal local to this page lifetime and account; pending awards remain authoritative.
const seenMeritAlerts = new Set();
export function resetMeritPopup() { seenMeritAlerts.clear(); }

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const meritBell = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>';

const meritRosette = '<svg viewBox="0 0 112 128" width="96" height="110" aria-hidden="true" focusable="false"><defs><linearGradient id="merit-rosette-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#45d4a1"/><stop offset=".46" stop-color="#00acac"/><stop offset="1" stop-color="#0963ca"/></linearGradient></defs><path d="M34 91 21 119l15-4 9 12 13-30M75 90l14 29-15-4-9 12-13-30" fill="#00a9a2" stroke="#fff" stroke-width="2"/><path d="M56 10C65 10 67 20 75 20S91 17 94 27 92 39 99 45 106 58 101 66 103 82 93 86 81 86 76 95 64 104 56 99 40 104 35 95 19 91 16 83 17 72 10 65 8 51 15 44 16 28 26 24 39 25 45 16 50 10 56 10Z" fill="url(#merit-rosette-gradient)" stroke="#fff" stroke-width="2.5"/><g fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M74 48c0-12-7-19-18-19s-18 7-18 19c0 12-7 14-7 21h50c0-7-7-9-7-21Z"/><path d="M51 78h10M56 25v4"/></g></svg>';

function renderMeritPopup(root, model, profile, autoOpen = true) {
  if (!model.showActivityControls || profile.active === false || profile.must_change_password) return;
  const dialog = root.querySelector?.('[data-merit-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const bell = root.querySelector?.('[data-merit-bell]');
  const key = JSON.stringify([profile.id ?? profile.display_name, model.meritAlerts.map(s => [s.studentId, [...s.meritNumbers].sort()]).sort()]);
  const open = () => {
    if (!dialog.open) dialog.showModal();
    if (model.pendingMerits && model.meritAlerts.length) seenMeritAlerts.add(key);
  };
  bell?.addEventListener('click', open);
  dialog.querySelector('[data-merit-dismiss]')?.addEventListener('click', () => dialog.close());
  if (autoOpen && model.pendingMerits && model.meritAlerts.length && !seenMeritAlerts.has(key)) open();
}

function meritPopupMarkup(model, profile, loaded) {
  if (!model.showActivityControls || profile.active === false || profile.must_change_password) return '';
  const pending = model.pendingMerits > 0;
  const heading = !loaded ? 'Merit notifications' : pending ? plural(model.pendingMerits, 'merit') + ' ready to award' : 'All caught up';
  return `<dialog id="merit-notifications" class="merit-dialog${pending && loaded ? ' merit-dialog--celebration' : ''}" data-merit-dialog aria-labelledby="merit-dialog-title">
    <div class="merit-dialog__header">
      <span class="merit-dialog__icon">${pending && loaded ? meritRosette : meritBell}</span>
      <div><p class="merit-dialog__eyebrow">Student recognition</p><h2 id="merit-dialog-title">${escapeHtml(heading)}</h2></div>
    </div>
    <p class="merit-dialog__intro">${!loaded ? 'Merit information is not available yet. Open Student Activity to check.' : pending ? 'Your students have earned recognition through independent practice.' : 'No outstanding merits for your students.'}</p>
    ${pending && model.meritAlerts.length ? `<ul class="merit-dialog__list">${model.meritAlerts.map(s => `<li><div><strong>${escapeHtml(s.displayName)}</strong><span>${escapeHtml(s.className)}</span></div><span class="merit-dialog__count">${escapeHtml(plural(s.meritNumbers.length, 'merit'))}</span></li>`).join('')}</ul>` : ''}
    ${pending ? '<p class="merit-dialog__note">Outstanding merits remain visible until awarded.</p>' : ''}
    <div class="merit-dialog__actions"><button type="button" class="button" data-merit-dismiss autofocus>${pending ? 'Later' : 'Close'}</button><button type="button" class="button button--primary" data-action="activity" data-review-mode="${pending?'merits':'classes'}">${pending ? 'Review merits' : 'View student progress'}</button></div>
  </dialog>`;
}

function meritBellMarkup(model, profile) {
  if (!model.showActivityControls || profile.active === false || profile.must_change_password) return '';
  const count = model.pendingMerits;
  return `<button type="button" class="home-merit-bell" data-merit-bell aria-haspopup="dialog" aria-controls="merit-notifications" aria-label="Merit notifications${count ? ': ' + escapeHtml(count) + ' pending' : ''}" title="Merit notifications">${meritBell}${count ? `<span class="home-merit-bell__count" aria-hidden="true">${escapeHtml(count > 99 ? '99+' : count)}</span>` : ''}</button>`;
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

function classroomSummary(model) {
  const loaded=model.classroomLoaded;
  const count=model.pendingMerits;
  return `<div class="home-classroom-summary"><p class="home-classroom-summary__eyebrow">MY CLASSROOM</p><div class="home-classroom-summary__metrics"><div class="home-classroom-summary__metric"><span class="home-classroom-summary__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 6a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/></svg></span><div><strong>${model.assignedClassCount??'—'}</strong><small>My classes</small></div></div><div class="home-classroom-summary__metric"><span class="home-classroom-summary__icon home-classroom-summary__icon--merit" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg></span><div><strong>${loaded?escapeHtml(count):'—'}</strong><small>Pending merits</small></div></div></div><button type="button" class="button button--primary home-classroom-summary__action" data-action="activity" data-review-mode="${loaded&&count===0?'classes':'merits'}">${loaded&&count===0?'View my classes':'Review merits'} <span aria-hidden="true">→</span></button></div>`;
}
export function renderHome(root, profile, apps, activityDashboard = null, { registry = DEFAULT_REGISTRY, autoOpenMerits = true } = {}) {
  const model = buildHomeModel(profile, apps, activityDashboard);
  const skills = skillSummaries(model.apps, registry);
  // A remembered skill that no longer has visible apps (or never existed) falls back to All apps rather than an empty page.
  if (selectedSkill !== 'all' && !skills.some(skill => skill.id === selectedSkill)) selectedSkill = 'all';
  const canChangePassword = ['student','teacher','admin'].includes(profile.role) && profile.active !== false;
  const cards = orderApps(model.apps, registry).map(app => {
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

  const staffWorkspace = model.showStaffTools && profile.active === true && !profile.must_change_password;
  const activityLabel = model.pendingMerits ? `Student Progress · ${model.pendingMerits} new` : 'Student Progress';
  const staffTile = (action, title, desc, glyph, extra = '') => `<button type="button" class="home-workspace-tile" data-action="${action}" aria-label="${escapeHtml(action === 'student-progress' ? 'Student Progress' : title)}"><span class="home-workspace-tile__icon" aria-hidden="true">${glyph}</span><span class="home-workspace-tile__copy"><strong ${extra}>${escapeHtml(title)}</strong><small>${escapeHtml(desc)}</small></span><span class="home-workspace-tile__arrow" aria-hidden="true">↗</span></button>`;
  const staffTools = staffWorkspace ? `<section class="home-workspace" aria-labelledby="staff-workspace-title"><div class="home-workspace__heading"><div><p class="eyebrow">TEACHER WORKSPACE</p><h2 id="staff-workspace-title">Your classroom</h2></div><span class="home-workspace__label">Staff access</span></div><div class="home-workspace__grid">${staffTile('student-progress',activityLabel,'Track learning and achievements', '<svg viewBox="0 0 24 24"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>','data-home-activity-label')}${staffTile('writing-activity','Writing Activity','Review student submissions',icon('pen'))}${staffTile('writing-assessor','Writing assessor','Assess and give feedback', '<svg viewBox="0 0 24 24"><path d="M5 3h14v18H5zM8 8h8M8 12h8m-8 4h4"/></svg>')}${model.showAdminControls?staffTile('admin','Manage accounts','Classes and user access','<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 6a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/></svg>'):''}</div></section>` : '';
  const accountControls = [
    model.showActivityControls ? `<button class="button button--primary" data-action="student-progress" data-home-activity-label>${escapeHtml(activityLabel)}</button>` : '',
    model.showAdminControls ? '<button class="button" data-action="admin">Manage accounts</button>' : '',
    model.showStaffTools && profile.active === true && !profile.must_change_password ? '<button class="button" data-action="writing-activity">Writing Activity</button>' : '',
    model.showStaffTools && profile.active === true && !profile.must_change_password ? '<button class="button" data-action="writing-assessor">Writing assessor</button>' : '',
    canChangePassword ? `<button class="button" data-action="change-password"${model.role === 'student' ? ' data-student-password-change' : ''}>Change password</button>` : ''
  ].filter(Boolean).join(' ');

  root.innerHTML = `
    <section class="shell shell--home${staffWorkspace?' shell--staff-home':''}">
      <header class="home-hero">
        <div class="home-hero__topbar">
          <div class="home-brand">
            <img class="home-brand__logo" src="${EH_SCHOOLS_LOGO}" alt="Evidence Hub Schools" width="230" style="display:block;max-width:min(52vw,230px);height:auto;">
          </div>
          <div class="home-account-controls">
            ${meritBellMarkup(model, profile)}
            ${staffWorkspace?'<details class="home-account-menu"><summary><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>My account <span aria-hidden="true">⌄</span></summary><div class="home-account-menu__panel"><button type="button" class="button button--ghost home-password" data-action="change-password">Change password</button><button type="button" class="button button--ghost home-logout" data-action="logout">Log out</button></div></details>':'<button class="button button--ghost home-logout" data-action="logout">Log out</button>'}
          </div>
        </div>
        <div class="home-hero__content">
          <div class="home-hero__welcome">
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
          <p class="home-hero__lead">${staffWorkspace?'Monitor progress. Recognise achievement.':'Choose a skill and continue your independent practice.'}</p>
          ${!staffWorkspace?'<div class="home-hero__note"><span class="home-hero__status" aria-hidden="true"></span>Your activity is linked securely to your account.</div>':''}
          </div>
          ${staffWorkspace?`<div data-home-classroom>${classroomSummary(model)}</div>`:''}
        </div>
      </header>

      ${!staffWorkspace?`<div data-merit-banner>${renderMeritAlert(model)}</div>`:''}
      ${staffTools}
      ${meritPopupMarkup(model, profile, activityDashboard !== null)}

      <section class="study-tools" aria-labelledby="study-tools-title">
        <div class="section-heading section-heading--home">
          <div>
            <p class="eyebrow">${staffWorkspace?'LEARNING LIBRARY':'Your study tools'}</p>
            <h2 id="study-tools-title">${staffWorkspace?'Explore learning apps':'Choose a skill'}</h2>
            <p>${staffWorkspace?'Open a subject skill to explore the student practice tools.':'Pick a skill, then open an app. Focused practice for Cambridge IGCSE English as a Second Language (0511).'}</p>
          </div>
          ${!staffWorkspace && accountControls ? `<div class="admin-actions">${accountControls}</div>` : ''}
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
  renderMeritPopup(root, model, profile, autoOpenMerits);
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
  const grid = root.querySelector('.app-grid');
  const choose = id => {
    // Hold the results area at its current height while the cards change, then give back everything the page does not need.
    // Without this, a shorter list can shorten the document below the current scroll position; the browser then clamps the scroll
    // and the skill buttons the student just pressed slide down the screen. Only the shortfall (if any) is kept, so there is no
    // blank area beyond what keeps the viewport filled. This is layout stability, not scroll control: nothing here scrolls.
    if (results) results.style.minHeight = `${Math.ceil(results.getBoundingClientRect().height)}px`;
    const held = results ? Math.ceil(results.getBoundingClientRect().height) : 0;
    selectedSkill = id;
    const skill = skills.find(candidate => candidate.id === id);
    let shown = 0;
    for (const card of cards) { const visible = id === 'all' || card.dataset.skill === id; card.hidden = !visible; if (visible) shown++; }
    for (const button of choices) button.setAttribute('aria-pressed', String(button.dataset.skillChoice === id));
    const label = id === 'all' ? 'All apps' : (skill?.name ?? '');
    if (title) title.textContent = label;
    if (count) count.textContent = id === 'all' ? '' : plural(shown, 'app');
    if (status) status.textContent = `${label}: showing ${plural(shown, 'app')}`;
    if (results && grid) {
      const natural = Math.ceil(grid.getBoundingClientRect().bottom - results.getBoundingClientRect().top);
      const documentIfNatural = document.documentElement.scrollHeight - held + natural;
      const needed = Math.ceil(window.scrollY + window.innerHeight);
      results.style.minHeight = documentIfNatural >= needed ? '' : `${natural + needed - documentIfNatural}px`;
    }
  };
  for (const button of choices) button.addEventListener('click', () => choose(button.dataset.skillChoice));
}

// A resize can change how many cards fit per row, so drop any reserved height and let it be measured afresh. Registered once.
if (typeof window !== 'undefined') window.addEventListener('resize', () => { const results = document.querySelector('[data-app-results]'); if (results) results.style.minHeight = ''; });

const deferredMeritUpdates = new WeakMap();

// Update only notification elements. Preserve the active page, scroll and input state.
export function updateHomeMerits(root, profile, dashboard, { autoOpen = false } = {}) {
  const model = buildHomeModel(profile, [], dashboard);
  const bell = root.querySelector?.('[data-merit-bell]');
  const dialog = root.querySelector?.('[data-merit-dialog]');
  if (!bell || !dialog) return;
  // Never destroy a dialog while the teacher is reading it; refresh on close.
  if (dialog.open && dashboard !== null) {
    if (!deferredMeritUpdates.has(dialog)) dialog.addEventListener('close', () => {
      const latest = deferredMeritUpdates.get(dialog);
      deferredMeritUpdates.delete(dialog);
      if (latest && root.contains(dialog)) updateHomeMerits(root,latest.profile,latest.dashboard);
    }, {once:true});
    deferredMeritUpdates.set(dialog,{profile,dashboard});
    return;
  }
  if (dialog.open) dialog.close();
  const focused = bell === root.ownerDocument?.activeElement;
  bell.outerHTML = meritBellMarkup(model,profile);
  dialog.outerHTML = meritPopupMarkup(model,profile,dashboard !== null);
  const banner = root.querySelector('[data-merit-banner]');
  if (banner) banner.innerHTML = renderMeritAlert(model);
  const classroom=root.querySelector('[data-home-classroom]');
  if(classroom) classroom.innerHTML=classroomSummary(model);
  const label = root.querySelector('[data-home-activity-label]');
  if (label) label.textContent = model.pendingMerits ? `Student Progress · ${model.pendingMerits} new` : 'Student Progress';
  renderMeritPopup(root,model,profile,autoOpen);
  if (focused) root.querySelector('[data-merit-bell]')?.focus({preventScroll:true});
}

export function renderExternalMerits(mount, profile, dashboard) {
  if (!profile || !dashboard || !['teacher','admin'].includes(profile.role) || profile.active === false || profile.must_change_password) {
    mount.replaceChildren(); return;
  }
  const dialog = mount.querySelector('[data-merit-dialog]');
  if (dialog?.open) {
    if (!deferredMeritUpdates.has(dialog)) dialog.addEventListener('close', () => {
      const latest = deferredMeritUpdates.get(dialog);
      deferredMeritUpdates.delete(dialog);
      if (latest && mount.contains(dialog)) renderExternalMerits(mount,latest.profile,latest.dashboard);
    }, {once:true});
    deferredMeritUpdates.set(dialog,{profile,dashboard});
    return;
  }
  const model = buildHomeModel(profile,[],dashboard);
  mount.innerHTML = meritBellMarkup(model,profile) + meritPopupMarkup(model,profile,true);
  renderMeritPopup(mount,model,profile,false);
}
