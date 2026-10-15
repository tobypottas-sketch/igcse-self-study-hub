import { escapeHtml } from './html.js';

const sections = [['accounts','Accounts'],['classes','Classes'],['import','Bulk Import']];
const option = (value, label) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;

function renderCredential(credential) {
  if (!credential?.temporaryPassword) return '';
  return `<aside class="admin-credential" role="status"><p class="eyebrow">One-time credential</p><h3>${escapeHtml(credential.displayName ?? 'Account created')}</h3><p><strong>Email:</strong> ${escapeHtml(credential.email ?? '')}</p><p><strong>Temporary password:</strong> <code>${escapeHtml(credential.temporaryPassword)}</code></p><p class="muted">Save or copy this now. The temporary password is not stored in plaintext and cannot be retrieved later.</p></aside>`;
}

function renderNotice(model) { return model.notice ? `<div class="notice" role="status">${escapeHtml(model.notice)}</div>` : ''; }

function renderAccountRows(accounts = []) {
  if (!accounts.length) return '<p class="admin-empty">No student or teacher accounts found yet.</p>';
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Class / classes</th><th>Status</th><th>Actions</th></tr></thead><tbody>${accounts.map(account => {
    const classes = account.role === 'student' ? (account.currentClass || 'Unassigned') : ((account.assignedClasses ?? []).map(item => item.className).filter(Boolean).join(', ') || 'Unassigned');
    return `<tr data-account-role="${escapeHtml(account.role)}" data-account-active="${account.active ? 'true' : 'false'}"><td>${escapeHtml(account.displayName)}</td><td>${escapeHtml(account.email)}</td><td>${escapeHtml(account.role)}</td><td>${escapeHtml(classes)}</td><td><span class="admin-status ${account.active ? 'is-active' : 'is-inactive'}">${account.active ? 'Active' : 'Inactive'}</span></td><td class="admin-actions"><button class="button admin-button" data-action="admin-reset-password" data-user-id="${escapeHtml(account.id)}" data-user-name="${escapeHtml(account.displayName)}" data-user-email="${escapeHtml(account.email)}">Reset password</button><button class="button admin-button" data-action="admin-set-active" data-user-id="${escapeHtml(account.id)}" data-next-active="${account.active ? 'false' : 'true'}">${account.active ? 'Deactivate' : 'Reactivate'}</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function renderAccounts(model) {
  const classOptions = (model.classes ?? []).filter(c => c.active !== false).map(c => option(c.id, c.className)).join('');
  return `${renderCredential(model.credential)}${renderNotice(model)}<div class="admin-create-grid"><form class="admin-card form-stack" data-form="admin-create-student"><div><p class="eyebrow">New account</p><h2>Add student</h2></div><label>Student name<input name="displayName" required maxlength="120" autocomplete="off"></label><label>School email<input name="email" type="email" required autocomplete="off"></label><label>Class<select name="classId" required><option value="">Choose a class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Create student</button></form><form class="admin-card form-stack" data-form="admin-create-teacher"><div><p class="eyebrow">New account</p><h2>Add teacher</h2></div><label>Teacher name<input name="displayName" required maxlength="120" autocomplete="off"></label><label>School email<input name="email" type="email" required autocomplete="off"></label><button class="button button--primary" type="submit">Create teacher</button></form></div><div class="admin-list-header"><div><p class="eyebrow">Directory</p><h2>Students and teachers</h2></div><div class="admin-filters"><input type="search" placeholder="Search accounts" data-admin-filter="account-search" aria-label="Search accounts"><select data-admin-filter="account-role" aria-label="Filter by role"><option value="all">All roles</option><option value="student">Students</option><option value="teacher">Teachers</option></select><select data-admin-filter="account-status" aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>${renderAccountRows(model.accounts ?? [])}`;
}

function renderClasses(model) {
  const classes = (model.classes ?? []).filter(c => c.active !== false);
  const teachers = (model.accounts ?? []).filter(a => a.role === 'teacher' && a.active);
  const students = (model.accounts ?? []).filter(a => a.role === 'student' && a.active);
  const classOptions = classes.map(c => option(c.id, c.className)).join('');
  const teacherOptions = teachers.map(t => option(t.id, `${t.displayName} — ${t.email}`)).join('');
  const studentOptions = students.map(s => option(s.id, `${s.displayName} — ${s.currentClass || 'Unassigned'}`)).join('');
  const cards = classes.length ? classes.map(c => `<article class="admin-class-card"><div class="admin-class-card__head"><div><h3>${escapeHtml(c.className)}</h3><p class="muted">${c.students.length} student${c.students.length === 1 ? '' : 's'}</p></div></div><div><strong>Teachers</strong>${c.teachers.length ? `<ul>${c.teachers.map(t => `<li>${escapeHtml(t.displayName)} <button class="admin-link-button" data-action="admin-unassign-teacher" data-teacher-id="${escapeHtml(t.id)}" data-class-id="${escapeHtml(c.id)}">Remove</button></li>`).join('')}</ul>` : '<p class="muted">No teachers assigned.</p>'}</div><div><strong>Students</strong>${c.students.length ? `<p class="muted">${c.students.map(s => escapeHtml(s.displayName)).join(', ')}</p>` : '<p class="muted">No students yet.</p>'}</div></article>`).join('') : '<p class="admin-empty">No classes yet.</p>';
  return `${renderNotice(model)}<div class="admin-create-grid"><form class="admin-card form-stack" data-form="admin-create-class"><div><p class="eyebrow">Class setup</p><h2>Create class</h2></div><label>Class name<input name="className" required maxlength="120" autocomplete="off"></label><button class="button button--primary" type="submit">Create class</button></form><form class="admin-card form-stack" data-form="admin-assign-teacher"><div><p class="eyebrow">Teaching team</p><h2>Assign teacher</h2></div><label>Teacher<select name="teacherId" required><option value="">Choose teacher</option>${teacherOptions}</select></label><label>Class<select name="classId" required><option value="">Choose class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Assign teacher</button></form><form class="admin-card form-stack" data-form="admin-transfer-student"><div><p class="eyebrow">Membership</p><h2>Move student</h2></div><label>Student<select name="studentId" required><option value="">Choose student</option>${studentOptions}</select></label><label>New class<select name="newClassId" required><option value="">Choose class</option>${classOptions}</select></label><button class="button button--primary" type="submit">Move student</button></form></div><div class="admin-list-header"><div><p class="eyebrow">Classes</p><h2>Current class structure</h2></div></div><div class="admin-class-grid">${cards}</div>`;
}

function renderPlaceholder(section) {
  const label = sections.find(([key]) => key === section)?.[1] ?? 'Accounts';
  return `<p class="eyebrow">${escapeHtml(label)}</p><h2>${escapeHtml(label)}</h2><p class="muted">Admin tools for this section will appear here.</p>`;
}

export function renderAdmin(root, model) {
  const profile = model?.profile ?? {};
  const section = sections.some(([key]) => key === model?.section) ? model.section : 'accounts';
  const tabs = sections.map(([key,label]) => `<button class="admin-tab" data-action="admin-section-${key}"${section === key ? ' aria-current="page"' : ''}>${label}</button>`).join('');
  const content = section === 'accounts' ? renderAccounts(model ?? {}) : section === 'classes' ? renderClasses(model ?? {}) : renderPlaceholder(section);
  root.innerHTML = `<section class="shell admin-shell"><header class="admin-header"><div><p class="eyebrow">iGCSE Self-Study Hub</p><h1>Admin</h1><p class="admin-subtitle">Signed in as ${escapeHtml(profile.display_name ?? 'Administrator')}</p></div><button class="button button--ghost" data-action="admin-back">Back to Hub</button></header><nav class="admin-tabs" aria-label="Admin sections">${tabs}</nav><section class="admin-panel" data-admin-section="${escapeHtml(section)}">${content}</section></section>`;
}
