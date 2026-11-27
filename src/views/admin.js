import { SCHOOL_TIME_ZONE } from '../reporting/periods.js';
import { escapeHtml } from './html.js';

const adminSections = [['activity','Activity'],['accounts','Accounts'],['classes','Classes'],['import','Bulk Import']];
const option = (value, label) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
const notice = model => model.notice ? `<div class="notice" role="status">${escapeHtml(model.notice)}</div>` : '';
const pathwayLabels = { meaning:'Meaning', context:'Context', word_families:'Word Families', paraphrasing:'Paraphrasing', precision_use:'Precision & Use', spelling_recall:'Spelling & Recall' };
const accountRoleLabel = role => role === 'teacher' ? 'Teacher / Admin' : role === 'admin' ? 'Admin' : role;
const studentCollator = new Intl.Collator('en', { numeric:true, sensitivity:'base' });
const compareStudentNames = (a, b) => studentCollator.compare(String(a.displayName ?? '').trim(), String(b.displayName ?? '').trim());
function compareStudentsByClass(a, b) {
  const classA = String(a.currentClass ?? '').trim();
  const classB = String(b.currentClass ?? '').trim();
  if (Boolean(classA) !== Boolean(classB)) return classA ? -1 : 1;
  return studentCollator.compare(classA, classB) || compareStudentNames(a, b);
}

function formatDate(value) {
  if (!value) return 'No activity yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB',{ timeZone:SCHOOL_TIME_ZONE, day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

function renderCredential(credential) {
  if (!credential?.temporaryPassword) return '';
  return `<aside class="admin-credential" role="status"><p class="eyebrow">One-time credential</p><h3>${escapeHtml(credential.displayName ?? 'Account created')}</h3><p><strong>Email:</strong> ${escapeHtml(credential.email ?? '')}</p><p><strong>Temporary password:</strong> <code>${escapeHtml(credential.temporaryPassword)}</code></p><p class="muted">Save or copy this now. The temporary password is not stored in plaintext and cannot be retrieved later.</p></aside>`;
}

function renderAccountRows(accounts = [], emptyLabel = 'No accounts found yet.', numberStudents = false) {
  if (!accounts.length) return `<p class="admin-empty">${escapeHtml(emptyLabel)}</p>`;
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr>${numberStudents ? '<th scope="col" class="student-row-number">#</th>' : ''}<th>Name</th><th>Email</th><th>Role</th><th>Class / classes</th><th>Status</th><th>Actions</th></tr></thead><tbody>${accounts.map((account, index) => {
    const classes = account.role === 'student' ? (account.currentClass || 'Unassigned') : ((account.assignedClasses ?? []).map(item => item.className).filter(Boolean).join(', ') || 'Unassigned');
    const canDelete = account.role !== 'admin';
    const deleteLabel = account.role === 'teacher' ? 'Delete teacher' : 'Delete student';
    return `<tr data-account-role="${escapeHtml(account.role)}" data-account-active="${account.active ? 'true' : 'false'}">${numberStudents ? `<td class="student-row-number" data-student-number>${index+1}</td>` : ''}<td>${escapeHtml(account.displayName)}</td><td>${escapeHtml(account.email)}</td><td>${escapeHtml(accountRoleLabel(account.role))}</td><td>${escapeHtml(classes)}</td><td><span class="admin-status ${account.active ? 'is-active' : 'is-inactive'}">${account.active ? 'Active' : 'Inactive'}</span></td><td class="admin-actions"><button class="button admin-button" data-action="admin-reset-password" data-user-id="${escapeHtml(account.id)}" data-user-name="${escapeHtml(account.displayName)}" data-user-email="${escapeHtml(account.email)}">Reset password</button><button class="button admin-button" data-action="admin-set-active" data-user-id="${escapeHtml(account.id)}" data-next-active="${account.active ? 'false' : 'true'}">${account.active ? 'Deactivate' : 'Reactivate'}</button>${canDelete ? `<button class="button admin-button" data-action="admin-delete-account" data-user-id="${escapeHtml(account.id)}" data-user-name="${escapeHtml(account.displayName)}" data-user-role="${escapeHtml(account.role)}">${deleteLabel}</button>` : ''}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

// Keep account actions in their existing rows; group students by their current class.
// Native details/summary provides keyboard and screen-reader accessible disclosure.
function renderStudentDirectory(students = []) {
  if (!students.length) return '<p class="admin-empty">No student accounts found yet.</p>';
  const groups = new Map();
  for (const student of students) {
    const className = String(student.currentClass ?? '').trim() || 'Unassigned';
    if (!groups.has(className)) groups.set(className, []);
    groups.get(className).push(student);
  }
  return `<div class="admin-student-groups" data-admin-student-groups>${[...groups].map(([className, members]) => `
    <details class="admin-student-group" data-admin-student-group>
      <summary class="admin-student-group__summary">
        <span class="admin-student-group__heading"><span class="admin-student-group__icon" aria-hidden="true">▤</span><strong>${escapeHtml(className)}</strong><span class="admin-student-group__count">${members.length} student${members.length === 1 ? '' : 's'}</span></span>
        <span class="admin-student-group__chevron" aria-hidden="true"></span>
      </summary>
      <div class="admin-student-group__content">${renderAccountRows(members, undefined, true)}</div>
    </details>`).join('')}</div><p class="admin-student-filter-empty" data-admin-student-no-matches hidden>No students match your search or status filter.</p>`;
}

function renderAccounts(model) {
  const classOptions = (model.classes ?? []).filter(c => c.active !== false).map(c => option(c.id, c.className)).join('');
  const students = (model.accounts ?? []).filter(account => account.role === 'student').sort(compareStudentsByClass);
  const staff = [...(model.accounts ?? []).filter(account => account.role === 'teacher'), ...(model.teachingAdmins ?? [])]
    .filter((account, index, all) => all.findIndex(item => item.id === account.id) === index);
  return `${renderCredential(model.credential)}${notice(model)}<div class="admin-create-grid"><form class="admin-card form-stack" data-form="admin-create-student"><div><p class="eyebrow">New account</p><h2>Add student</h2></div><label>Student name<input name="displayName" required maxlength="120" autocomplete="off"></label><label>School email<input name="email" type="email" required autocomplete="off"></label><label>Class<select name="classId" required><option value="">Choose a class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Create student</button></form><form class="admin-card form-stack" data-form="admin-create-teacher"><div><p class="eyebrow">New staff account</p><h2>Add teacher</h2><p class="muted">Teachers receive staff administration access and can change their password later.</p></div><label>Teacher name<input name="displayName" required maxlength="120" autocomplete="off"></label><label>School email<input name="email" type="email" required autocomplete="off"></label><button class="button button--primary" type="submit">Create teacher</button></form></div><section class="admin-directory-section"><div class="admin-list-header"><div><p class="eyebrow">Directory</p><h2>Students</h2></div><div class="admin-filters"><input type="search" placeholder="Search accounts" data-admin-filter="account-search" aria-label="Search accounts"><select data-admin-filter="account-status" aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>${renderStudentDirectory(students)}</section><section class="admin-directory-section"><div class="admin-list-header"><div><p class="eyebrow">Staff directory</p><h2>Teachers / Admins</h2></div></div>${renderAccountRows(staff, 'No teacher or admin accounts found yet.')}</section>`;
}

function renderClasses(model) {
  const classes = (model.classes ?? []).filter(c => c.active !== false);
  const teachers = [...(model.accounts ?? []), ...(model.teachingAdmins ?? [])].filter(a => ['teacher','admin'].includes(a.role) && a.active);
  const students = (model.accounts ?? []).filter(a => a.role === 'student' && a.active).sort(compareStudentsByClass);
  const classOptions = classes.map(c => option(c.id, c.className)).join('');
  const teacherOptions = teachers.map(t => option(t.id, `${t.displayName} — ${t.email}${t.role === 'admin' ? ' (Admin)' : ''}`)).join('');
  const studentOptions = students.map(s => option(s.id, `${s.displayName} — ${s.currentClass || 'Unassigned'}`)).join('');
  const cards = classes.length ? classes.map(c => `<article class="admin-class-card"><div class="admin-class-card__head"><div><h3>${escapeHtml(c.className)}</h3><p class="muted">${c.students.length} student${c.students.length === 1 ? '' : 's'}</p></div><button class="button admin-button" data-action="admin-delete-class" data-class-id="${escapeHtml(c.id)}" data-class-name="${escapeHtml(c.className)}">Delete class</button></div><div><strong>Teachers</strong>${c.teachers.length ? `<ul>${c.teachers.map(t => `<li>${escapeHtml(t.displayName)} <button class="admin-link-button" data-action="admin-unassign-teacher" data-teacher-id="${escapeHtml(t.id)}" data-class-id="${escapeHtml(c.id)}">Remove</button></li>`).join('')}</ul>` : '<p class="muted">No teachers assigned.</p>'}</div><div><strong>Students</strong>${c.students.length ? `<details class="admin-class-roster"><summary>View ${c.students.length} student${c.students.length === 1 ? '' : 's'}</summary><ul class="admin-class-roster__list">${c.students.slice().sort(compareStudentNames).map(student => `<li data-student-id="${escapeHtml(student.id)}">${escapeHtml(student.displayName)}</li>`).join('')}</ul></details>` : '<p class="muted">No students yet.</p>'}</div></article>`).join('') : '<p class="admin-empty">No classes yet.</p>';
  return `${notice(model)}<div class="admin-create-grid"><form class="admin-card form-stack" data-form="admin-create-class"><div><p class="eyebrow">Class setup</p><h2>Create class</h2></div><label>Class name<input name="className" required maxlength="120" autocomplete="off"></label><button class="button button--primary" type="submit">Create class</button></form><form class="admin-card form-stack" data-form="admin-assign-teacher"><div><p class="eyebrow">Teaching team</p><h2>Assign teacher</h2></div><label>Teacher<select name="teacherId" required><option value="">Choose teacher</option>${teacherOptions}</select></label><label>Class<select name="classId" required><option value="">Choose class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Assign teacher</button></form><form class="admin-card form-stack" data-form="admin-transfer-student"><div><p class="eyebrow">Membership</p><h2>Move student</h2></div><label>Student<select name="studentId" required><option value="">Choose student</option>${studentOptions}</select></label><label>New class<select name="newClassId" required><option value="">Choose class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Move student</button></form></div><div class="admin-list-header"><div><p class="eyebrow">Classes</p><h2>Current class structure</h2></div></div><div class="admin-class-grid">${cards}</div>`;
}

function renderImportPreview(preview) {
  if (!preview) return '';
  const errors = preview.errors ?? [];
  const valid = preview.validRows ?? [];
  const skipped = preview.skippedRows ?? [];
  const errorRows = errors.length ? `<div class="admin-import-errors"><h3>Fix these rows before importing</h3><ul>${errors.map(e => `<li><strong>Row ${escapeHtml(e.sourceRow)}</strong> — ${escapeHtml(e.displayName || e.email || 'Incomplete row')}: ${escapeHtml(e.reason)}</li>`).join('')}</ul></div>` : '';
  const skippedRows = skipped.length ? `<details class="admin-import-skipped"><summary><strong>${skipped.length} existing account${skipped.length === 1 ? '' : 's'} skipped</strong> — no passwords, progress, XP or class memberships changed</summary><ul>${skipped.map(row => `<li>${escapeHtml(row.displayName)} — ${escapeHtml(row.email)}</li>`).join('')}</ul></details>` : '';
  const run = !errors.length && valid.length ? `<button class="button button--primary" data-action="admin-run-import" data-class-id="${escapeHtml(preview.classId)}">Create ${valid.length} new student account${valid.length === 1 ? '' : 's'}</button>` : '';
  const allExisting = !errors.length && !valid.length && skipped.length ? '<p role="status">All students in this file already have accounts. Nothing needs importing.</p>' : '';
  return `<section class="admin-card admin-import-preview"><p class="eyebrow">Validated preview</p><h2>${escapeHtml(preview.fileName || 'CSV')}</h2><p><strong>${valid.length} new</strong> · <strong>${skipped.length} skipped (already exist)</strong> · ${errors.length} error${errors.length === 1 ? '' : 's'}</p>${skippedRows}${errorRows}${allExisting}${run}</section>`;
}

function renderBulkResult(result, lastImportClassId) {
  if (!result) return '';
  const created = result.created ?? [];
  const failed = result.failed ?? [];
  const credentials = created.length ? `<div class="admin-credential-sheet" data-credential-sheet><div class="admin-list-header"><div><p class="eyebrow">One-time credential sheet</p><h2>Save or print before leaving</h2></div><div class="admin-actions"><button class="button admin-button" data-action="admin-copy-credentials">Copy all</button><button class="button admin-button" data-action="admin-print-credentials">Print</button></div></div><table class="admin-table"><thead><tr><th>Student</th><th>Email</th><th>Temporary password</th></tr></thead><tbody>${created.map(row => `<tr><td>${escapeHtml(row.displayName)}</td><td>${escapeHtml(row.email)}</td><td><code>${escapeHtml(row.temporaryPassword)}</code></td></tr>`).join('')}</tbody></table><p class="muted">These passwords are shown from this one-time response only and are not stored in plaintext.</p></div>` : '<p>No accounts were created.</p>';
  const retry = failed.length && lastImportClassId ? `<button class="button admin-button" data-action="admin-retry-failed" data-class-id="${escapeHtml(lastImportClassId)}">Retry failed rows</button>` : '';
  const failures = failed.length ? `<div class="admin-import-errors"><div class="admin-list-header"><div><h3>Failed rows</h3><p class="muted">Fix the cause where needed, then retry only these rows.</p></div>${retry}</div><ul>${failed.map(row => `<li>${escapeHtml(row.displayName || row.email || 'Row')}: ${escapeHtml(row.reason)}</li>`).join('')}</ul></div>` : '';
  return `<section class="admin-card admin-bulk-result">${credentials}${failures}</section>`;
}

function renderImport(model) {
  const classOptions = (model.classes ?? []).filter(c => c.active !== false).map(c => option(c.id, c.className)).join('');
  return `${notice(model)}${renderBulkResult(model.bulkResult, model.lastImportClassId)}<form class="admin-card form-stack admin-import-form" data-form="admin-preview-import"><div><p class="eyebrow">Bulk onboarding</p><h2>Import a class from CSV</h2><p class="muted">Choose the destination class once. The CSV only needs Student name and School email columns.</p></div><label>Destination class<select name="classId" required><option value="">Choose a class</option>${classOptions}</select></label><label>CSV file<input name="csvFile" type="file" accept=".csv,text/csv" required></label><button class="button button--primary" type="submit">Validate CSV</button></form>${renderImportPreview(model.importPreview)}`;
}

// Status pills share the teacher-admin vocabulary (vocab-pill + data-tone); default/boring states render quiet, genuine issues render warn.
const stageLabels = { recognise:'Recognise', match:'Match', apply:'Apply', recall:'Recall', mastery:'Mastery' };
const stageTones = { match:'start', apply:'mid', recall:'mid', mastery:'done' };
function pill(text, tone = 'quiet', title = '') { return `<span class="vocab-pill" data-tone="${tone}"${title ? ` title="${escapeHtml(title)}"` : ''}>${escapeHtml(text)}</span>`; }
function unitCheckCell(checks = []) {
  if (!checks.length) return '—';
  const title = checks.map(unit => `Unit ${unit.unitNumber}: latest ${unit.latestScore}/10, ${unit.attemptsUsed}/3 attempts`).join(' · ');
  return `<span title="${escapeHtml(title)}">${checks.length} unit${checks.length === 1 ? '' : 's'}</span>`;
}

function renderActivityRows(students = []) {
  if (!students.length) return '<p class="admin-empty">No students are available in your assigned classes.</p>';
  const sortedStudents = students.slice().sort((a, b) => studentCollator.compare(String(a.className ?? '').trim(), String(b.className ?? '').trim()) || compareStudentNames(a, b));
  const singleClass = new Set(sortedStudents.map(row => row.classId ?? row.className)).size <= 1;
  let initialVisible=0;
  const classNumbers = new Map();
  return `<div class="admin-table-wrap"><table class="admin-table activity-table" data-single-class="${singleClass ? 'true' : 'false'}"><thead><tr><th scope="col" class="student-row-number">#</th><th>Student</th><th data-col="class">Class</th><th>Last recorded practice</th><th>Active days this week</th><th>Vocabulary units</th><th>Unit Checks</th><th>Merits</th></tr></thead><tbody>${sortedStudents.map(row => {
    const classKey=String(row.classId ?? row.className ?? '');
    classNumbers.set(classKey,(classNumbers.get(classKey)??0)+1);
    const classNumber=classNumbers.get(classKey);
    const lastActive = row.lastPractice ? formatDate(row.lastPractice) : '—';
    const progression = row.unitPathways?.length || '—';
    const initiallyShown = initialVisible++ < 10;
    return `<tr data-activity-row data-class-id="${escapeHtml(row.classId ?? '')}" data-student-name="${escapeHtml(String(row.displayName??'').toLowerCase())}" data-started="${row.practiceState === 'recorded' ? 'true' : 'false'}" data-practice-state="${escapeHtml(row.practiceState ?? '')}" data-new-merits="${row.pendingMerits ? 'true' : 'false'}"${initiallyShown?'':' hidden'}><td class="student-row-number" data-label="#" data-student-number>${classNumber}</td><td data-label="Student"><button class="admin-link-button activity-student-link" data-action="activity-student" data-student-id="${escapeHtml(row.studentId)}">${escapeHtml(row.displayName)}</button></td><td data-col="class" data-label="Class">${escapeHtml(row.className)}</td><td data-label="Last recorded practice">${escapeHtml(lastActive)}</td><td data-label="Active days this week">${escapeHtml(String(row.activeDays ?? 'Unavailable'))}</td><td class="activity-progression" data-label="Progress" data-default="${row.unitPathways?.length ? 'false' : 'true'}">${progression}</td><td data-label="Unit Check">${unitCheckCell(row.unitChecks)}</td><td data-label="Merits">${row.pendingMerits ? pill(`${row.pendingMerits} pending`, 'done') : '—'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function detailPathways(pathways = {}) {
  return `<ul class="activity-rows">${Object.entries(pathwayLabels).map(([id,label]) => {
    const state = pathways?.[id] ?? {};
    const stage = state.currentStage ?? 'recognise';
    if (state.available === false) return `<li><span>${escapeHtml(label)}</span><span>Unavailable</span></li>`;
    return `<li data-pathway="${escapeHtml(id)}" data-stage="${escapeHtml(stage)}"><span>${escapeHtml(label)}</span><span>${pill(stageLabels[stage] ?? stage, stageTones[stage] ?? 'quiet')}</span></li>`;
  }).join('')}</ul>`;
}

function renderStudentDetail(student) {
  const lastActive = student.lastPractice ? formatDate(student.lastPractice) : '—';
  const pathways = student.unitPathways?.length
    ? student.unitPathways.map(unit => `<h4>Unit ${unit.unitNumber}</h4>${unit.pathways ? detailPathways(unit.pathways) : 'Coverage unavailable'}`).join('')
    : '<p class="activity-quiet">No contextual pathway evidence.</p>';
  const checkRows = student.unitChecks?.length ? student.unitChecks.map(unit =>
    `<li><div><strong>Unit ${unit.unitNumber}</strong> · Latest ${unit.latestScore}/10 · Best ${unit.bestScore}/10<br>${unit.attemptsUsed}/3 attempts used · ${unit.attemptsRemaining} remaining
    <ul>${unit.rows.map(row => `<li>Attempt ${row.attemptNumber}${row.formId ? ` · Form ${escapeHtml(row.formId)}` : ''} · ${row.score}/${row.maxScore} · ${escapeHtml(formatDate(row.completedAt))}</li>`).join('')}</ul></div></li>`).join('')
    : '<li class="activity-quiet">No recorded Unit Check attempts.</li>';
  const meritRows = student.pendingMeritNumbers?.length ? student.pendingMeritNumbers.map(number => `<li><span>Merit ${escapeHtml(number)} ${pill('Waiting', 'warn')}</span><button class="button admin-button button--primary" data-action="activity-award-merit" data-student-id="${escapeHtml(student.studentId)}" data-merit-number="${escapeHtml(number)}">Mark awarded</button></li>`).join('') : '<li class="activity-quiet">No new merits waiting.</li>';
  const activity = student.recentActivity?.length ? `<ol class="activity-feed">${student.recentActivity.map(item => `<li><span class="activity-quiet">${escapeHtml(formatDate(item.occurredAt))}</span> ${escapeHtml(item.label)}${item.appKey ? ` <span class="activity-quiet">(${escapeHtml(item.appKey)})</span>` : ''}</li>`).join('')}</ol>` : '<p class="activity-quiet">No recent activity.</p>';
  return `${notice({ notice:'' })}<button class="button admin-button admin-button--quiet" data-action="activity-back">← Back to Activity</button><div class="activity-detail-head"><p class="eyebrow">Student activity</p><h2>${escapeHtml(student.displayName)}</h2><p>${escapeHtml(student.className)}${student.studentNumber ? ` <span aria-hidden="true">·</span> Student ID: ${escapeHtml(student.studentNumber)}` : ''}</p></div><div class="activity-detail-grid"><section class="admin-card activity-card"><h3>Recorded engagement</h3><p class="activity-quiet">Current enrolment · 30-day lookback for activity logs · China time</p><ul class="activity-rows"><li><span>Last recorded practice</span><strong>${escapeHtml(lastActive)}</strong></li><li><span>Active days this week</span><strong>${escapeHtml(student.activeDays ?? 'Unavailable')}</strong></li><li><span>Last recorded interaction</span><strong>${escapeHtml(student.lastInteraction ? formatDate(student.lastInteraction) : '—')}</strong></li></ul></section><section class="admin-card activity-card"><h3>Vocabulary progression</h3>${pathways}</section><section class="admin-card activity-card"><h3>Vocabulary merits</h3><p>${student.eligibleMerits ?? '—'} eligible at current threshold · ${student.pendingMerits ?? '—'} pending · ${student.awardedMerits ?? '—'} awarded</p><ul class="activity-rows">${meritRows}</ul></section><section class="admin-card activity-card"><h3>Unit Checks</h3><ul class="activity-rows">${checkRows}</ul></section><section class="admin-card activity-card"><h3>Recent activity</h3>${student.practiceState === 'retrieval-failure' ? '<p>Activity records could not be loaded.</p>' : activity}</section></div>`;
}

function renderActivity(model) {
  if (!model.activityDashboard) return notice({ notice:'Student Activity could not be loaded. Reopen Activity to retry.' });
  const dashboard = model.activityDashboard;
  const selected = model.selectedStudentId ? dashboard.students.find(row => row.studentId === model.selectedStudentId) : null;
  if (selected) return `${notice(model)}${renderStudentDetail(selected)}`;
  const classes = [...new Map(dashboard.students.map(row => [row.classId,row.className])).entries()].filter(([id]) => id);
  return `${notice(model)}<div class="admin-list-header"><div><p class="eyebrow">Student activity</p><h2>What students are doing</h2><p class="muted">${dashboard.pendingMerits} new merit${dashboard.pendingMerits === 1 ? '' : 's'}</p></div><div class="admin-filters"><input type="search" placeholder="Search students" data-activity-filter="search" aria-label="Search students"><select data-activity-filter="class" aria-label="Filter by class"><option value="all">All classes</option>${classes.map(([id,name]) => option(id,name)).join('')}</select><select data-activity-filter="state" aria-label="Filter by activity"><option value="all" selected>All students</option><option value="started">Recorded practice this week</option><option value="notstarted">No recorded practice this week</option><option value="merits">New merits</option></select></div></div><div class="activity-list-status"><span data-activity-list-count role="status" aria-live="polite"></span><span>Use the filters to find a class or student</span></div>${renderActivityRows(dashboard.students)}<p class="admin-empty activity-list-empty" data-activity-list-empty hidden>No students match these filters.</p><div class="activity-list-footer"><button type="button" class="button admin-button activity-list-more" data-action="activity-show-more" hidden>Show next 10 students</button></div>`;
}

export function renderAdmin(root, model) {
  const profile = model?.profile ?? {};
  const isStaff = ['admin','teacher'].includes(profile.role);
  const sections = profile.role === 'admin' ? adminSections : [['activity','Activity']];
  const section = sections.some(([key]) => key === model?.section) ? model.section : 'activity';
  const tabs = sections.map(([key,label]) => `<button class="admin-tab" data-action="admin-section-${key}"${section === key ? ' aria-current="page"' : ''}>${label}${key === 'activity' && model.activityDashboard?.pendingMerits ? ` <span class="admin-status is-active">${escapeHtml(model.activityDashboard.pendingMerits)}</span>` : ''}</button>`).join('');
  const content = section === 'activity' ? renderActivity(model ?? {}) : section === 'accounts' ? renderAccounts(model ?? {}) : section === 'classes' ? renderClasses(model ?? {}) : renderImport(model ?? {});
  root.innerHTML = `<section class="shell admin-shell"><header class="admin-header"><div><p class="eyebrow">iGCSE Self-Study Hub</p><h1>Staff administration</h1><p class="admin-subtitle">Signed in as ${escapeHtml(profile.display_name ?? 'Staff')}</p></div><button class="button button--ghost" data-action="admin-back">Back to Hub</button></header><nav class="admin-tabs" aria-label="Staff administration sections">${tabs}</nav><section class="admin-panel" data-admin-section="${escapeHtml(section)}">${content}</section></section>`;
  if (section === 'activity' && model?.selectedStudentId) root.ownerDocument?.defaultView?.scrollTo?.(0,0);
}
