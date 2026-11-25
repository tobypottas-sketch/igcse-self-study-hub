import { getSupabaseClient } from '../supabase.js';
import { issueClassCredentials } from './accounts.js';
import { escapeHtml } from '../views/html.js';

function loginCardMarkup({ displayName = 'Student', email = '', temporaryPassword = '' } = {}) {
  return `
    <article class="student-login-card">
      <h3>${escapeHtml(displayName)}</h3>
      <div class="student-login-field">
        <span>Email / username</span>
        <strong>${escapeHtml(email)}</strong>
      </div>
      <div class="student-login-field student-login-field--password">
        <span>Password</span>
        <strong>${escapeHtml(temporaryPassword)}</strong>
      </div>
    </article>`;
}

function pageMarkup(credentials = []) {
  const pages = [];
  for (let start = 0; start < credentials.length; start += 10) {
    pages.push(`<section class="student-login-page">${credentials.slice(start, start + 10).map(loginCardMarkup).join('')}</section>`);
  }
  return pages.join('');
}

export function renderLoginCards(credentials = [], className = '', _url = '', failed = []) {
  const failures = failed.length ? `<aside class="student-login-modal__warning" data-credential-failures><strong>${failed.length} student${failed.length === 1 ? '' : 's'} could not be updated.</strong><span>Check those accounts before treating this pack as complete.</span></aside>` : '';
  return `<div class="student-login-modal" data-card-count="${credentials.length === 1 ? 'single' : 'multiple'}" data-generated-login-modal role="dialog" aria-modal="true" aria-labelledby="student-login-modal-title">
    <div class="student-login-modal__panel">
      <header class="student-login-modal__header">
        <div>
          <p class="eyebrow">${credentials.length === 1 ? 'Student login card' : 'Class login cards'}</p>
          <h2 id="student-login-modal-title">${escapeHtml(className || 'Student logins')}</h2>
          <p class="student-login-modal__count">${credentials.length} login card${credentials.length === 1 ? '' : 's'} ready to print</p>
        </div>
        <div class="student-login-modal__actions">
          <button type="button" class="button admin-button student-login-modal__print" data-action="admin-print-credentials"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6zM18 12h.01"/></svg>Print / Save PDF</button>
          <button class="student-login-modal__close" type="button" data-action="admin-close-login-cards" aria-label="Close login cards">×</button>
        </div>
      </header>
      ${failures}
      <div class="student-login-modal__body">${pageMarkup(credentials)}</div>
    </div>
  </div>`;
}

function credentialRowsFromSheet(sheet) {
  return [...(sheet?.querySelectorAll?.('tbody tr') ?? [])].map(row => {
    const cells = row.querySelectorAll?.('td') ?? [];
    return {
      displayName:cells[0]?.textContent?.trim() ?? 'Student',
      email:cells[1]?.textContent?.trim() ?? '',
      temporaryPassword:cells[2]?.textContent?.trim() ?? ''
    };
  }).filter(row => row.email && row.temporaryPassword);
}

function removeGeneratedLoginCards() {
  document.querySelector?.('[data-generated-login-modal]')?.remove();
}

function openLoginModal(credentials, className = 'Student logins', failed = []) {
  removeGeneratedLoginCards();
  document.body.insertAdjacentHTML('beforeend', renderLoginCards(credentials, className, '', failed));
  document.querySelector?.('[data-generated-login-modal] .student-login-modal__close')?.focus?.();
}

function enhanceExistingCredentialSheet(sheet) {
  if (!sheet || sheet.dataset.loginCardsEnhanced === 'true') return;
  sheet.dataset.loginCardsEnhanced = 'true';
  const printButton = sheet.querySelector?.('[data-action="admin-print-credentials"]');
  if (printButton) printButton.textContent = 'Open login cards';
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
    if (!created.length) {
      const panel = document.querySelector?.('.admin-panel');
      if (panel) {
        const notice = document.createElement('div');
        notice.className = 'notice';
        notice.textContent = failed.length ? 'No login cards were created. Check the failed accounts and try again.' : 'This class has no active students to issue credentials for.';
        panel.prepend(notice);
      }
      return;
    }
    openLoginModal(created, className, failed);
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
    const action = target?.dataset?.action;
    if (action === 'admin-close-login-cards') {
      event.preventDefault();
      removeGeneratedLoginCards();
      return;
    }
    if (action === 'admin-print-credentials') {
      event.preventDefault();
      event.stopPropagation();
      const modal = target.closest?.('[data-generated-login-modal]');
      if (modal) {
        globalThis.print?.();
        return;
      }
      const sheet = target.closest?.('[data-credential-sheet]');
      const rows = credentialRowsFromSheet(sheet);
      if (rows.length) openLoginModal(rows, 'Student logins');
      return;
    }
    if (action === 'admin-issue-class-credentials') issueForClass(target);
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.querySelector?.('[data-generated-login-modal]')) removeGeneratedLoginCards();
  });
}

startCredentialPrintEnhancements();
