import { escapeHtml } from './html.js';

export function canAccessAdmin(profile) {
  return profile?.role === 'admin';
}

function classOptions(classes) {
  return classes.map(item => `
    <option value="${escapeHtml(item.class_id)}">${escapeHtml(item.class_name)}</option>`).join('');
}

export function renderAdminAccounts(root, profile, classes = [], feedback = {}) {
  if (!canAccessAdmin(profile)) {
    root.innerHTML = '';
    return;
  }

  const options = classOptions(classes);
  const message = feedback.message
    ? `<div class="notice${feedback.tone === 'success' ? ' notice--success' : ''}" role="status">${escapeHtml(feedback.message)}</div>`
    : '';

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">iGCSE Self-Study</p>
          <h1>Manage accounts</h1>
          <p class="muted">Create classes and controlled student accounts.</p>
        </div>
        <div class="button-row">
          <button class="button button--ghost" data-action="admin-home">Back to Hub</button>
          <button class="button button--ghost" data-action="logout">Log out</button>
        </div>
      </header>

      ${message}

      <div class="admin-grid">
        <section class="card-panel">
          <h2>Create class</h2>
          <p class="muted">Add a class before assigning student accounts.</p>
          <form class="form-stack" data-form="admin-create-class">
            <label>Class name
              <input name="className" type="text" maxlength="120" required>
            </label>
            <button class="button button--primary" type="submit">Create class</button>
          </form>
        </section>

        <section class="card-panel">
          <h2>Create student</h2>
          <p class="muted">Students will be asked to change the temporary password on first sign-in.</p>
          <form class="form-stack" data-form="admin-create-student">
            <label>Student name
              <input name="displayName" type="text" maxlength="120" autocomplete="off" required>
            </label>
            <label>School email
              <input name="email" type="email" autocomplete="off" required>
            </label>
            <label>Temporary password
              <input name="temporaryPassword" type="password" minlength="10" autocomplete="new-password" required>
            </label>
            <label>Class
              <select name="classId" required ${classes.length ? '' : 'disabled'}>
                ${classes.length ? options : '<option value="">Create a class first</option>'}
              </select>
            </label>
            <button class="button button--primary" type="submit" ${classes.length ? '' : 'disabled'}>Create student</button>
          </form>
        </section>
      </div>
    </section>`;
}
