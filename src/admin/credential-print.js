import { getSupabaseClient } from '../supabase.js';
import { issueClassCredentials } from './accounts.js';
import { escapeHtml } from '../views/html.js';

function loginCardMarkup({ displayName = 'Student', email = '', temporaryPassword = '' } = {}) {
  return `
    <article class="student-login-card">
      <div class="student-login-card__topline">
        <p class="student-login-card__brand">iGCSE Self-Study Hub</p>
        <span class="student-login-card__tag">Student login</span>
      </div>
      <h3>${escapeHtml(displayName)}</h3>
      <dl>
        <div><dt>Email</dt><dd>${escapeHtml(email)}</dd></div>
        <div class="student-login-card__password-row"><dt>Password</dt><dd class="student-login-card__password">${escapeHtml(temporaryPassword)}</dd></div>
      </dl>
      <p class="student-login-card__instruction">Keep this card safe. Use these details whenever you sign in.</p>
    </article>`;
}

export function renderLoginCards(credentials = [], className = '', _url = '', failed = []) {
  const rows = credentials.map(row => loginCardMarkup(row)).join('');
  const failures = failed.length ? `<aside class="admin-import-errors student-login-failures" data-credential-failures><h3>${credentials.length} login card${credentials.length === 1 ? '' : 's'} created; ${failed.length} student${failed.length === 1 ? '' : 's'} failed</h3><p>Do not assume the pack is complete. These students did not receive a new password:</p><ul>${failed.map(row => `<li><strong>${escapeHtml(row.displayName || row.email || 'Student')}</strong> — ${escapeHtml(row.reason || 'Credential update failed.')}</li>`).join('')}</ul></aside>` : '';
  return `${failures}<section class="admin-credential-sheet student-login-sheet" data-credential-sheet data-generated-login-sheet>
    <div class="admin-list-header student-login-sheet__screen-head">
      <div><p class="eyebrow">Class login cards</p><h2>${escapeHtml(className || 'Student logins')}</h2><p class="muted">Print this master sheet and cut along the card edges. Save a copy somewhere secure.</p></div>
      <div class="admin-actions"><button class="button admin-button" data-action="admin-print-credentials">Print class login cards</button><button class="button admin-button" data-action="admin-close-login-cards">Close</button></div>
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
  const actions = sheet.querySelector?.('.admin-actions');
  if (actions && !actions.querySelector?.('[data-action="admin-close-login-cards"]')) {
    const closeButton = sheet.ownerDocument.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'button admin-button';
    closeButton.dataset.action = 'admin-close-login-cards';
    closeButton.textContent = 'Close';
    actions.append(closeButton);
  }
  const heading = sheet.querySelector?.('h2');
  if (heading) heading.textContent = 'Save or print class login cards';
  const eyebrow = sheet.querySelector?.('.eyebrow');
  if (eyebrow) eyebrow.textContent = 'Class login cards';
  const table = sheet.querySelector?.('table');
  if (!table) return;
  table.classList.add('student-login-table');
  for (const row of table.querySelectorAll?.('tbody tr') ?? []) {
    row.classList.add('student-login-card-row');
    const cells = row.querySelectorAll?.('td') ?? [];
    if (cells[0]) cells[0].dataset.label = 'Student';
    if (cells[1]) cells[1].dataset.label = 'Email';
    if (cells[2]) cells[2].dataset.label = 'Password';
  }
}

function enhanceClassRoster(card) {
  if (!card || card.dataset.rosterEnhanced === 'true') return;
  const studentSection = [...card.children].find(section => section.querySelector?.(':scope > strong')?.textContent?.trim() === 'Students');
  if (!studentSection) return;
  const paragraph = studentSection.querySelector?.(':scope > p.muted');
  if (!paragraph || /No students yet/i.test(paragraph.textContent ?? '')) {
    card.dataset.rosterEnhanced = 'true';
    return;
  }

  const names = String(paragraph.textContent ?? '').split(',').map(name => name.trim()).filter(Boolean);
  if (!names.length) {
    card.dataset.rosterEnhanced = 'true';
    return;
  }

  const details = card.ownerDocument.createElement('details');
  details.className = 'admin-class-roster';
  const summary = card.ownerDocument.createElement('summary');
  summary.textContent = `View ${names.length} student${names.length === 1 ? '' : 's'}`;
  const list = card.ownerDocument.createElement('ul');
  list.className = 'admin-class-roster__list';
  for (const name of names) {
    const item = card.ownerDocument.createElement('li');
    item.textContent = name;
    list.append(item);
  }
  details.append(summary, list);
  paragraph.replaceWith(details);
  card.dataset.rosterEnhanced = 'true';
}

function enhanceClassCards(root) {
  for (const card of root.querySelectorAll?.('.admin-class-card') ?? []) {
    enhanceClassRoster(card);
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

function cardsFromSheet(sheet) {
  const cards = [...(sheet?.querySelectorAll?.('.student-login-card') ?? [])];
  if (cards.length) return cards.map(card => card.cloneNode(true));

  return [...(sheet?.querySelectorAll?.('.student-login-table tbody tr') ?? [])].map(row => {
    const cells = row.querySelectorAll?.('td') ?? [];
    const wrapper = document.createElement('div');
    wrapper.innerHTML = loginCardMarkup({
      displayName:cells[0]?.textContent?.trim() ?? 'Student',
      email:cells[1]?.textContent?.trim() ?? '',
      temporaryPassword:cells[2]?.textContent?.trim() ?? ''
    });
    return wrapper.firstElementChild;
  }).filter(Boolean);
}

function buildPrintRoot(sheet) {
  const cards = cardsFromSheet(sheet);
  if (!cards.length) return null;

  const printRoot = document.createElement('div');
  printRoot.className = 'credential-print-root';

  for (let start = 0; start < cards.length; start += 8) {
    const page = document.createElement('section');
    page.className = 'student-login-page';
    for (const card of cards.slice(start, start + 8)) page.append(card.cloneNode(true));
    printRoot.append(page);
  }
  return printRoot;
}

function printCredentialSheet(target) {
  const sheet = target?.closest?.('[data-credential-sheet]') ?? document.querySelector?.('[data-credential-sheet]');
  if (!sheet || typeof globalThis.print !== 'function') return;
  const printRoot = buildPrintRoot(sheet);
  if (!printRoot) return;
  document.body.append(printRoot);
  try {
    globalThis.print();
  } finally {
    printRoot.remove();
  }
}

function removeGeneratedLoginCards(target) {
  const sheet = target?.closest?.('[data-credential-sheet]');
  const panel = sheet?.closest?.('.admin-panel') ?? document.querySelector?.('.admin-panel');
  sheet?.remove();
  panel?.querySelector?.('[data-credential-failures]')?.remove();
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
    panel.insertAdjacentHTML('afterbegin', renderLoginCards(created, className, '', failed));
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
    if (target?.dataset?.action === 'admin-print-credentials') {
      event.preventDefault();
      event.stopPropagation();
      printCredentialSheet(target);
      return;
    }
    if (target?.dataset?.action === 'admin-close-login-cards') {
      event.preventDefault();
      event.stopPropagation();
      removeGeneratedLoginCards(target);
      return;
    }
    if (target?.dataset?.action === 'admin-issue-class-credentials') issueForClass(target);
  }, true);
}

startCredentialPrintEnhancements();
