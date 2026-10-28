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
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB',{ day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

function renderCredential(credential) {
  if (!credential?.temporaryPassword) return '';
  return `<aside class="admin-credential" role="status"><p class="eyebrow">One-time credential</p><h3>${escapeHtml(credential.displayName ?? 'Account created')}</h3><p><strong>Email:</strong> ${escapeHtml(credential.email ?? '')}</p><p><strong>Temporary password:</strong> <code>${escapeHtml(credential.temporaryPassword)}</code></p><p class="muted">Save or copy this now. The temporary password is not stored in plaintext and cannot be retrieved later.</p></aside>`;
}

function renderAccountRows(accounts = [], emptyLabel = 'No accounts found yet.') {
  if (!accounts.length) return `<p class="admin-empty">${escapeHtml(emptyLabel)}</p>`;
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Class / classes</th><th>Status</th><th>Actions</th></tr></thead><tbody>${accounts.map(account => {
    const classes = account.role === 'student' ? (account.currentClass || 'Unassigned') : ((account.assignedClasses ?? []).map(item => item.className).filter(Boolean).join(', ') || 'Unassigned');
    const canDelete = account.role !== 'admin';
    const deleteLabel = account.role === 'teacher' ? 'Delete teacher' : 'Delete student';
    return `<tr data-account-role="${escapeHtml(account.role)}" data-account-active="${account.active ? 'true' : 'false'}"><td>${escapeHtml(account.displayName)}</td><td>${escapeHtml(account.email)}</td><td>${escapeHtml(accountRoleLabel(account.role))}</td><td>${escapeHtml(classes)}</td><td><span class="admin-status ${account.active ? 'is-active' : 'is-inactive'}">${account.active ? 'Active' : 'Inactive'}</span></td><td class="admin-actions"><button class="button admin-button" data-action="admin-reset-password" data-user-id="${escapeHtml(account.id)}" data-user-name="${escapeHtml(account.displayName)}" data-user-email="${escapeHtml(account.email)}">Reset password</button><button class="button admin-button" data-action="admin-set-active" data-user-id="${escapeHtml(account.id)}" data-next-active="${account.active ? 'false' : 'true'}">${account.active ? 'Deactivate' : 'Reactivate'}</button>${canDelete ? `<button class="button admin-button" data-action="admin-delete-account" data-user-id="${escapeHtml(account.id)}" data-user-name="${escapeHtml(account.displayName)}" data-user-role="${escapeHtml(account.role)}">${deleteLabel}</button>` : ''}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function renderAccounts(model) {
  const classOptions = (model.classes ?? []).filter(c => c.active !== false).map(c => option(c.id, c.className)).join('');
  const students = (model.accounts ?? []).filter(account => account.role === 'student').sort(compareStudentsByClass);
  const staff = [...(model.accounts ?? []).filter(account => account.role === 'teacher'), ...(model.teachingAdmins ?? [])]
    .filter((account, index, all) => all.findIndex(item => item.id === account.id) === index);
  return `${renderCredential(model.credential)}${notice(model)}<div class="admin-create-grid"><form class="admin-card form-stack" data-form="admin-create-student"><div><p class="eyebrow">New account</p><h2>Add student</h2></div><label>Student name<input name="displayName" required maxlength="120" autocomplete="off"></label><label>School email<input name="email" type="email" required autocomplete="off"></label><label>Class<select name="classId" required><option value="">Choose a class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Create student</button></form><form class="admin-card form-stack" data-form="admin-create-teacher"><div><p class="eyebrow">New staff account</p><h2>Add teacher</h2><p class="muted">Teachers receive staff administration access and can change their password later.</p></div><label>Teacher name<input name="displayName" required maxlength="120" autocomplete="off"></label><label>School email<input name="email" type="email" required autocomplete="off"></label><button class="button button--primary" type="submit">Create teacher</button></form></div><section class="admin-directory-section"><div class="admin-list-header"><div><p class="eyebrow">Directory</p><h2>Students</h2></div><div class="admin-filters"><input type="search" placeholder="Search accounts" data-admin-filter="account-search" aria-label="Search accounts"><select data-admin-filter="account-status" aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>${renderAccountRows(students, 'No student accounts found yet.')}</section><section class="admin-directory-section"><div class="admin-list-header"><div><p class="eyebrow">Staff directory</p><h2>Teachers / Admins</h2></div></div>${renderAccountRows(staff, 'No teacher or admin accounts found yet.')}</section>`;
}

function renderClasses(model) {
  const classes = (model.classes ?? []).filter(c => c.active !== false);
  const teachers = [...(model.accounts ?? []), ...(model.teachingAdmins ?? [])].filter(a => ['teacher','admin'].includes(a.role) && a.active);
  const students = (model.accounts ?? []).filter(a => a.role === 'student' && a.active).sort(compareStudentsByClass);
  const classOptions = classes.map(c => option(c.id, c.className)).join('');
  const teacherOptions = teachers.map(t => option(t.id, `${t.displayName} — ${t.email}${t.role === 'admin' ? ' (Admin)' : ''}`)).join('');
  const studentOptions = students.map(s => option(s.id, `${s.displayName} — ${s.currentClass || 'Unassigned'}`)).join('');
  const cards = classes.length ? classes.map(c => `<article class="admin-class-card"><div class="admin-class-card__head"><div><h3>${escapeHtml(c.className)}</h3><p class="muted">${c.students.length} student${c.students.length === 1 ? '' : 's'}</p></div><button class="button admin-button" data-action="admin-delete-class" data-class-id="${escapeHtml(c.id)}" data-class-name="${escapeHtml(c.className)}">Delete class</button></div><div><strong>Teachers</strong>${c.teachers.length ? `<ul>${c.teachers.map(t => `<li>${escapeHtml(t.displayName)} <button class="admin-link-button" data-action="admin-unassign-teacher" data-teacher-id="${escapeHtml(t.id)}" data-class-id="${escapeHtml(c.id)}">Remove</button></li>`).join('')}</ul>` : '<p class="muted">No teachers assigned.</p>'}</div><div><strong>Students</strong>${c.students.length ? `<p class="muted">${c.students.slice().sort(compareStudentNames).map(s => escapeHtml(s.displayName)).join(', ')}</p>` : '<p class="muted">No students yet.</p>'}</div></article>`).join('') : '<p class="admin-empty">No classes yet.</p>';
  return `${notice(model)}<div class="admin-create-grid"><form class="admin-card form-stack" data-form="admin-create-class"><div><p class="eyebrow">Class setup</p><h2>Create class</h2></div><label>Class name<input name="className" required maxlength="120" autocomplete="off"></label><button class="button button--primary" type="submit">Create class</button></form><form class="admin-card form-stack" data-form="admin-assign-teacher"><div><p class="eyebrow">Teaching team</p><h2>Assign teacher</h2></div><label>Teacher<select name="teacherId" required><option value="">Choose teacher</option>${teacherOptions}</select></label><label>Class<select name="classId" required><option value="">Choose class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Assign teacher</button></form><form class="admin-card form-stack" data-form="admin-transfer-student"><div><p class="eyebrow">Membership</p><h2>Move student</h2></div><label>Student<select name="studentId" required><option value="">Choose student</option>${studentOptions}</select></label><label>New class<select name="newClassId" required><option value="">Choose class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Move student</button></form></div><div class="admin-list-header"><div><p class="eyebrow">Classes</p><h2>Current class structure</h2></div></div><div class="admin-class-grid">${cards}</div>`;
}

function renderImportPreview(preview) {
  if (!preview) return '';
  const errors = preview.errors ?? [];
  const valid = preview.validRows ?? [];
  const errorRows = errors.length ? `<div class="admin-import-errors"><h3>Fix these rows before importing</h3><ul>${errors.map(e => `<li><strong>Row ${escapeHtml(e.sourceRow)}</strong> — ${escapeHtml(e.displayName || e.email || 'Incomplete row')}: ${escapeHtml(e.reason)}</li>`).join('')}</ul></div>` : '';
  const run = !errors.length && valid.length ? `<button class="button button--primary" data-action="admin-run-import" data-class-id="${escapeHtml(preview.classId)}">Create ${valid.length} student account${valid.length === 1 ? '' : 's'}</button>` : '';
  return `<section class="admin-card admin-import-preview"><p class="eyebrow">Validated preview</p><h2>${escapeHtml(preview.fileName || 'CSV')}</h2><p>${valid.length} valid row${valid.length === 1 ? '' : 's'} · ${errors.length} error${errors.length === 1 ? '' : 's'}</p>${errorRows}${run}</section>`;
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

function progressionText(pathways = {}, hasStarted = true) {
  if (!hasStarted) return 'Not started';
  return Object.entries(pathwayLabels).map(([id,label]) => `${label}: ${pathways?.[id]?.currentStage ?? 'recognise'}`).join(' · ');
}

function renderActivityRows(students = []) {
  if (!students.length) return '<p class="admin-empty">No students are available in your assigned classes.</p>';
  const sortedStudents = students.slice().sort((a, b) => studentCollator.compare(String(a.className ?? '').trim(), String(b.className ?? '').trim()) || compareStudentNames(a, b));
  return `<div class="admin-table-wrap"><table class="admin-table activity-table"><thead><tr><th>Student</th><th>Class</th><th>Last active</th><th>This week</th><th>Vocabulary progression</th><th>Unit Check</th><th>Merits</th><th>Attention</th></tr></thead><tbody>${sortedStudents.map(row => {
    const unit = row.unitCheck?.attemptsUsed ? `${row.unitCheck.latestScore}/10 latest · ${row.unitCheck.bestScore}/10 best · ${row.unitCheck.attemptsUsed}/3 attempts` : 'No Unit Check yet';
    const merits = row.pendingMerits ? `${row.pendingMerits} new` : 'None new';
    const attention = row.attention?.length ? row.attention.map(item => item.label).join('; ') : '—';
    const lastActive = row.hasStarted ? formatDate(row.lastActive) : 'Not started';
    return `<tr data-activity-row data-class-id="${escapeHtml(row.classId ?? '')}" data-needs-attention="${row.needsAttention ? 'true' : 'false'}" data-new-merits="${row.pendingMerits ? 'true' : 'false'}"><td><button class="admin-link-button activity-student-link" data-action="activity-student" data-student-id="${escapeHtml(row.studentId)}">${escapeHtml(row.displayName)}</button></td><td>${escapeHtml(row.className)}</td><td>${escapeHtml(lastActive)}</td><td>${escapeHtml(String(row.activityThisWeek))}</td><td class="activity-progression">${escapeHtml(progressionText(row.pathways, row.hasStarted))}</td><td>${escapeHtml(unit)}</td><td>${row.pendingMerits ? `<strong>${escapeHtml(merits)}</strong>` : escapeHtml(merits)}</td><td>${escapeHtml(attention)}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function renderStudentDetail(student) {
  const pathwayRows = student.hasStarted
    ? Object.entries(pathwayLabels).map(([id,label]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(student.pathways?.[id]?.currentStage ?? 'recognise')}</td></tr>`).join('')
    : '<tr><td colspan="2">Not started</td></tr>';
  const checkRows = student.unitCheck?.rows?.length ? student.unitCheck.rows.map(row => `<li>Attempt ${escapeHtml(row.attemptNumber ?? row.attempt_number)}: <strong>${escapeHtml(row.score)}/${escapeHtml(row.maxScore ?? row.max_score)}</strong> · ${escapeHtml(formatDate(row.completedAt ?? row.completed_at))}</li>`).join('') : '<li>No Unit Check attempts yet.</li>';
  const meritRows = student.pendingMeritNumbers?.length ? student.pendingMeritNumbers.map(number => `<li>Merit ${escapeHtml(number)} — earned for Vocabulary pathway progress <button class="button admin-button" data-action="activity-award-merit" data-student-id="${escapeHtml(student.studentId)}" data-merit-number="${escapeHtml(number)}">Mark awarded</button></li>`).join('') : '<li>No new merits waiting.</li>';
  const attention = student.attention?.length ? `<ul>${student.attention.map(item => `<li>${escapeHtml(item.label)}</li>`).join('')}</ul>` : '<p class="muted">No current flags.</p>';
  const activity = student.recentActivity?.length ? `<ol class="activity-feed">${student.recentActivity.map(item => `<li><strong>${escapeHtml(formatDate(item.occurredAt))}</strong> — ${escapeHtml(item.label)}${item.appKey ? ` <span class="muted">(${escapeHtml(item.appKey)})</span>` : ''}</li>`).join('')}</ol>` : '<p class="muted">No recent activity.</p>';
  const lastActive = student.hasStarted ? formatDate(student.lastActive) : 'Not started';
  return `${notice({ notice:'' })}<button class="button admin-button" data-action="activity-back">← Back to Activity</button><div class="activity-detail-head"><p class="eyebrow">Student activity</p><h2>${escapeHtml(student.displayName)}</h2><p class="muted">${escapeHtml(student.className)}</p></div><div class="activity-detail-grid"><section class="admin-card"><h3>Usage</h3><p><strong>Last active:</strong> ${escapeHtml(lastActive)}</p><p><strong>Activity this week:</strong> ${escapeHtml(student.activityThisWeek)}</p><p><strong>Recent app:</strong> ${escapeHtml(student.recentApp ?? '—')}</p><p><strong>Recent pathway:</strong> ${escapeHtml(student.recentPathway ?? '—')}</p></section><section class="admin-card"><h3>Vocabulary progression</h3><table class="admin-table"><tbody>${pathwayRows}</tbody></table></section><section class="admin-card"><h3>Unit Checks</h3><ul>${checkRows}</ul></section><section class="admin-card"><h3>Merits</h3><ul>${meritRows}</ul></section><section class="admin-card"><h3>Needs attention</h3>${attention}</section><section class="admin-card"><h3>Recent activity</h3>${activity}</section></div>`;
}

function renderActivity(model) {
  const dashboard = model.activityDashboard ?? { students:[], pendingMerits:0, needsAttention:0 };
  const selected = model.selectedStudentId ? dashboard.students.find(row => row.studentId === model.selectedStudentId) : null;
  if (selected) return `${notice(model)}${renderStudentDetail(selected)}`;
  const classes = [...new Map(dashboard.students.map(row => [row.classId,row.className])).entries()].filter(([id]) => id);
  return `${notice(model)}<div class="admin-list-header"><div><p class="eyebrow">Student activity</p><h2>What students are doing</h2><p class="muted">${dashboard.pendingMerits} new merit${dashboard.pendingMerits === 1 ? '' : 's'} · ${dashboard.needsAttention} student${dashboard.needsAttention === 1 ? '' : 's'} need attention</p></div><div class="admin-filters"><input type="search" placeholder="Search students" data-activity-filter="search" aria-label="Search students"><select data-activity-filter="class" aria-label="Filter by class"><option value="all">All classes</option>${classes.map(([id,name]) => option(id,name)).join('')}</select><select data-activity-filter="state" aria-label="Filter by state"><option value="all">All students</option><option value="attention">Needs attention</option><option value="merits">New merits</option></select></div></div>${renderActivityRows(dashboard.students)}`;
}

export function renderAdmin(root, model) {
  const profile = model?.profile ?? {};
  const isStaff = ['admin','teacher'].includes(profile.role);
  const sections = isStaff ? adminSections : [['activity','Activity']];
  const section = sections.some(([key]) => key === model?.section) ? model.section : 'activity';
  const tabs = sections.map(([key,label]) => `<button class="admin-tab" data-action="admin-section-${key}"${section === key ? ' aria-current="page"' : ''}>${label}${key === 'activity' && model.activityDashboard?.pendingMerits ? ` <span class="admin-status is-active">${escapeHtml(model.activityDashboard.pendingMerits)}</span>` : ''}</button>`).join('');
  const content = section === 'activity' ? renderActivity(model ?? {}) : section === 'accounts' ? renderAccounts(model ?? {}) : section === 'classes' ? renderClasses(model ?? {}) : renderImport(model ?? {});
  root.innerHTML = `<section class="shell admin-shell"><header class="admin-header"><div><p class="eyebrow">iGCSE Self-Study Hub</p><h1>Staff administration</h1><p class="admin-subtitle">Signed in as ${escapeHtml(profile.display_name ?? 'Staff')}</p></div><button class="button button--ghost" data-action="admin-back">Back to Hub</button></header><nav class="admin-tabs" aria-label="Staff administration sections">${tabs}</nav><section class="admin-panel" data-admin-section="${escapeHtml(section)}">${content}</section></section>`;
  if (section === 'activity' && model?.selectedStudentId) root.ownerDocument?.defaultView?.scrollTo?.(0,0);
}
