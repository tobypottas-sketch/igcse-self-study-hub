import { getSupabaseClient } from '../supabase.js';
import { issueClassCredentials } from './accounts.js';
import { escapeHtml } from '../views/html.js';

function hubUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

export function renderLoginCards(credentials = [], className = '', url = '', failed = []) {
  const rows = credentials.map(row => `
    <article class="student-login-card">
      <p class="student-login-card__brand">iGCSE Self-Study Hub</p>
      <h3>${escapeHtml(row.displayName ?? 'Student')}</h3>
      <dl>
        <div><dt>Email</dt><dd>${escapeHtml(row.email ?? '')}</dd></div>
        <div><dt>Password</dt><dd class="student-login-card__password">${escapeHtml(row.temporaryPassword ?? '')}</dd></div>
        <div><dt>Website</dt><dd>${escapeHtml(url)}</dd></div>
      </dl>
      <p class="student-login-card__instruction">Sign in with the details above. Keep this card safe.</p>
    </article>`).join('');
  const failures = failed.length ? `<aside class="admin-import-errors student-login-failures" data-credential-failures><h3>${credentials.length} login card${credentials.length === 1 ? '' : 's'} created; ${failed.length} student${failed.length === 1 ? '' : 's'} failed</h3><p>Do not assume the pack is complete. These students did not receive a new password:</p><ul>${failed.map(row => `<li><strong>${escapeHtml(row.displayName || row.email || 'Student')}</strong> — ${escapeHtml(row.reason || 'Credential update failed.')}</li>`).join('')}</ul></aside>` : '';
  return `${failures}<section class="admin-credential-sheet student-login-sheet" data-credential-sheet data-generated-login-sheet>
    <div class="admin-list-header student-login-sheet__screen-head">
      <div><p class="eyebrow">Class login cards</p><h2>${escapeHtml(className || 'Student logins')}</h2><p class="muted">Save or print this master sheet now. These passwords cannot be recovered from the app later.</p></div>
      <div class="admin-actions"><button class="button admin-button" data-action="admin-print-credentials">Print class login cards</button></div>
    </div>
    <div class="student-login-grid">${rows}</div>
  </section>`;
}

function enhanceExistingCredentialSheet(sheet) {
  if (!sheet || sheet.dataset.loginCardsEnhanced === 'true') return;
  sheet.dataset.loginCardsEnhanced = 'true';
  sheet.classList.add('student-login-sheet');
  const printButton = sheet.querySelector?.('[data-action="admin-print-credentials"]');
  if (printButton) printButton.textContent = 'Print class login cards';
  const heading = sheet.querySelector?.('h2');
  if (heading) heading.textContent = 'Save or print class login cards';
  const eyebrow = sheet.querySelector?.('.eyebrow');
  if (eyebrow) eyebrow.textContent = 'Class login cards';
  const table = sheet.querySelector?.('table');
  if (!table) return;
  table.classList.add('student-login-table');
  const url = hubUrl();
  for (const row of table.querySelectorAll?.('tbody tr') ?? []) {
    row.classList.add('student-login-card-row');
    const cells = row.querySelectorAll?.('td') ?? [];
    if (cells[0]) cells[0].dataset.label = 'Student';
    if (cells[1]) cells[1].dataset.label = 'Email';
    if (cells[2]) cells[2].dataset.label = 'Password';
    if (!row.querySelector?.('.student-login-card-url')) {
      const cell = row.ownerDocument.createElement('td');
      cell.className = 'student-login-card-url';
      cell.dataset.label = 'Website';
      cell.textContent = url;
      row.append(cell);
    }
  }
}

function enhanceClassCards(root) {
  for (const card of root.querySelectorAll?.('.admin-class-card') ?? []) {
    if (card.querySelector?.('[data-action="admin-issue-class-credentials"]')) continue;
    const deleteButton = card.querySelector?.('[data-action="admin-delete-class"]');
    if (!deleteButton) continue;
    const button = card.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'button admin-button';
    button.dataset.action = 'admin-issue-class-credentials';
    button.dataset.classId = deleteButton.dataset.classId ?? '';
    button.dataset.className = deleteButton.dataset.className ?? '';
    button.textContent = 'Create login cards';
    deleteButton.before(button);
  }
}

function enhance(root) {
  for (const sheet of root.querySelectorAll?.('[data-credential-sheet]') ?? []) enhanceExistingCredentialSheet(sheet);
  enhanceClassCards(root);
}

async function issueForClass(target) {
  const classId = target?.dataset?.classId;
  const className = target?.dataset?.className || 'Class';
  if (!classId || target.disabled) return;
  const confirmed = typeof globalThis.confirm !== 'function' || globalThis.confirm(`Create a fresh permanent password for every active student in ${className}? Any previous password for those students will stop working.`);
  if (!confirmed) return;

  target.disabled = true;
  try {
    const client = await getSupabaseClient();
    const result = await issueClassCredentials(client, classId);
    const created = result?.created ?? [];
    const failed = result?.failed ?? [];
    const panel = document.querySelector?.('.admin-panel');
    if (!panel) return;
    panel.querySelector?.('[data-generated-login-sheet]')?.remove();
    panel.querySelector?.('[data-credential-failures]')?.remove();
    if (!created.length) {
      const notice = document.createElement('div');
      notice.className = 'notice';
      notice.textContent = failed.length ? 'No login cards were created. Check the failed accounts and try again.' : 'This class has no active students to issue credentials for.';
      panel.prepend(notice);
      return;
    }
    panel.insertAdjacentHTML('afterbegin', renderLoginCards(created, className, hubUrl(), failed));
    const sheet = panel.querySelector?.('[data-generated-login-sheet]');
    sheet?.scrollIntoView?.({ block:'start', behavior:'smooth' });
  } catch (error) {
    const panel = document.querySelector?.('.admin-panel');
    if (panel) {
      const notice = document.createElement('div');
      notice.className = 'notice';
      notice.textContent = error instanceof Error ? error.message : 'Unable to create class login cards.';
      panel.prepend(notice);
    }
  } finally {
    if (target.isConnected) target.disabled = false;
  }
}

export function startCredentialPrintEnhancements() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('app');
  if (!root) return;
  enhance(root);
  const observer = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => enhance(root)) : null;
  observer?.observe(root, { childList:true, subtree:true });
  document.addEventListener('click', event => {
    const target = event.target?.closest?.('[data-action]');
    if (target?.dataset?.action === 'admin-issue-class-credentials') issueForClass(target);
  });
}

startCredentialPrintEnhancements();
