import { signIn, changePassword, getCurrentProfile } from './auth.js';
import { loadApps } from './api.js';
import { getSupabaseClient } from './supabase.js';
import { createStudentAccount, createTeacherAccount, loadAdminAccounts, resetAccountPassword, setAccountActive } from './admin/accounts.js';
import { createClass, assignTeacherToClass, unassignTeacherFromClass, transferStudent, loadAdminClasses } from './admin/classes.js';
import { parseStudentCsv, validateStudentImport, bulkProvisionStudents } from './admin/import.js';
import { renderLogin } from './views/login.js';
import { renderChangePassword } from './views/change-password.js';
import { renderHome } from './views/home.js';
import { renderAdmin } from './views/admin.js';
import { escapeHtml } from './views/html.js';

export function routeForProfile(profile) {
  if (!profile) return 'login';
  if (profile.must_change_password) return 'change-password';
  return 'home';
}

export async function loadAppState(client) {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return { view:'login' };
  try {
    const profile = await getCurrentProfile(client);
    if (profile.must_change_password) return { view:'change-password', profile };
    const apps = await loadApps(client);
    return { view:'home', profile, apps };
  } catch (error) { return { view:'error', error }; }
}

function renderError(root, message) {
  root.innerHTML = `<section class="auth-shell"><div class="auth-card"><p class="eyebrow">iGCSE Self-Study</p><h1>Unable to continue</h1><div class="notice" role="alert">${escapeHtml(message)}</div><button class="button" data-action="retry">Try again</button></div></section>`;
}

export async function bootApp(clientOverride = null) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('app');
  if (!root) return;
  root.innerHTML = '<div class="loading">Loading Self-Study Hub…</div>';
  let client;
  try { client = clientOverride ?? await getSupabaseClient(); }
  catch { renderError(root, 'The Self-Study service is unavailable right now.'); return; }

  let currentState = { view:'login' };

  const renderCurrentState = async () => {
    currentState = await loadAppState(client);
    if (currentState.view === 'login') { renderLogin(root); return; }
    if (currentState.view === 'change-password') { renderChangePassword(root, currentState.profile); return; }
    if (currentState.view === 'home') { renderHome(root, currentState.profile, currentState.apps); return; }
    renderError(root, currentState.error instanceof Error ? currentState.error.message : 'Unable to load your account.');
  };

  const renderAdminSection = async (section = 'accounts', extras = {}) => {
    if (currentState?.profile?.role !== 'admin' || currentState.profile.active === false) return;
    try {
      const [accounts, classes] = await Promise.all([loadAdminAccounts(client), loadAdminClasses(client)]);
      currentState = { ...currentState, ...extras, view:'admin', section, accounts, classes };
      renderAdmin(root, currentState);
    } catch (error) {
      currentState = { ...currentState, ...extras, view:'admin', section, accounts:currentState.accounts ?? [], classes:currentState.classes ?? [], notice:error instanceof Error ? error.message : 'Unable to load admin data.' };
      renderAdmin(root, currentState);
    }
  };

  const renderCachedAdminSection = (section = 'accounts', extras = {}) => {
    if (currentState?.profile?.role !== 'admin' || currentState.profile.active === false) return;
    currentState = { ...currentState, ...extras, view:'admin', section };
    renderAdmin(root, currentState);
  };

  const setFormBusy = (form, busy) => { const button = form?.querySelector?.('button[type="submit"]'); if (button) button.disabled = busy; };
  const runButtonAction = async (target, task) => {
    if (!target || target.disabled) return;
    target.disabled = true;
    try { await task(); }
    finally { if (target.isConnected) target.disabled = false; }
  };

  root.addEventListener('submit', async (event) => {
    const form = event.target;
    const kind = form?.dataset?.form;
    const supported = ['login','change-password','admin-create-student','admin-create-teacher','admin-create-class','admin-assign-teacher','admin-transfer-student','admin-preview-import'];
    if (!supported.includes(kind)) return;
    event.preventDefault();
    const data = new FormData(form);

    if (kind === 'login') {
      try { await signIn(client, String(data.get('email') ?? '').trim(), String(data.get('password') ?? '')); await renderCurrentState(); }
      catch (error) { renderLogin(root, error instanceof Error ? error.message : 'Unable to sign in.'); }
      return;
    }
    if (kind === 'change-password') {
      const password = String(data.get('password') ?? '');
      if (password !== String(data.get('confirmPassword') ?? '')) { renderChangePassword(root, currentState.profile, 'The two passwords do not match.'); return; }
      try { await changePassword(client, password); await renderCurrentState(); }
      catch (error) { renderChangePassword(root, currentState.profile, error instanceof Error ? error.message : 'Unable to change password.'); }
      return;
    }

    setFormBusy(form, true);
    try {
      if (kind === 'admin-create-student' || kind === 'admin-create-teacher') {
        const displayName = String(data.get('displayName') ?? '').trim();
        const email = String(data.get('email') ?? '').trim();
        const result = kind === 'admin-create-student' ? await createStudentAccount(client, { displayName, email, classId:String(data.get('classId') ?? '') }) : await createTeacherAccount(client, { displayName, email });
        await renderAdminSection('accounts', { credential:{ displayName, email, temporaryPassword:result.temporaryPassword }, notice:`${kind === 'admin-create-student' ? 'Student' : 'Teacher'} account created.` });
      } else if (kind === 'admin-create-class') {
        await createClass(client, String(data.get('className') ?? '').trim());
        await renderAdminSection('classes', { notice:'Class created.', credential:null });
      } else if (kind === 'admin-assign-teacher') {
        await assignTeacherToClass(client, String(data.get('teacherId') ?? ''), String(data.get('classId') ?? ''));
        await renderAdminSection('classes', { notice:'Teacher assigned.', credential:null });
      } else if (kind === 'admin-transfer-student') {
        const studentId = String(data.get('studentId') ?? '');
        const newClassId = String(data.get('newClassId') ?? '');
        const account = (currentState.accounts ?? []).find(item => item.id === studentId);
        if (account?.currentClassId === newClassId) throw new Error('Student is already in that class.');
        await transferStudent(client, studentId, newClassId);
        await renderAdminSection('classes', { notice:'Student moved. Previous class membership was retained in history.', credential:null });
      } else if (kind === 'admin-preview-import') {
        const classId = String(data.get('classId') ?? '');
        const file = data.get('csvFile');
        if (!file || typeof file.text !== 'function') throw new Error('Choose a CSV file.');
        const rows = parseStudentCsv(await file.text());
        const existingEmails = new Set((currentState.accounts ?? []).map(item => String(item.email ?? '').toLowerCase()));
        const validation = validateStudentImport(rows, existingEmails);
        renderCachedAdminSection('import', { importPreview:{ classId, fileName:String(file.name ?? 'students.csv'), ...validation }, bulkResult:null, lastImportClassId:null, notice:validation.errors.length ? 'Fix the validation errors before creating accounts.' : 'CSV validated. Review the students, then create the accounts.' });
      }
    } catch (error) {
      const section = kind === 'admin-preview-import' ? 'import' : (kind.includes('class') || kind.includes('assign') || kind.includes('transfer')) ? 'classes' : 'accounts';
      if (kind === 'admin-preview-import') renderCachedAdminSection(section, { notice:error instanceof Error ? error.message : 'Admin action failed.' });
      else await renderAdminSection(section, { notice:error instanceof Error ? error.message : 'Admin action failed.' });
    } finally { setFormBusy(form, false); }
  });

  root.addEventListener('click', async (event) => {
    const target = event.target?.closest?.('[data-action]') ?? event.target;
    const action = target?.dataset?.action;
    if (action === 'logout') { await client.auth.signOut(); await renderCurrentState(); }
    else if (action === 'retry') await renderCurrentState();
    else if (action === 'admin') await renderAdminSection('accounts', { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    else if (action === 'admin-back') await renderCurrentState();
    else if (action?.startsWith?.('admin-section-')) {
      const section = action.slice('admin-section-'.length);
      if (['accounts','classes','import'].includes(section)) renderCachedAdminSection(section, { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    } else if (action === 'admin-reset-password') {
      const userId = target?.dataset?.userId;
      if (!userId || target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm('Reset this account password? The old password will stop working.')) return;
      await runButtonAction(target, async () => {
        try {
          const result = await resetAccountPassword(client, userId);
          await renderAdminSection('accounts', { credential:{ displayName:target.dataset.userName ?? 'Account', email:target.dataset.userEmail ?? '', temporaryPassword:result.temporaryPassword }, notice:'Password reset. Save the one-time credential now.' });
        } catch (error) { await renderAdminSection('accounts', { notice:error instanceof Error ? error.message : 'Unable to reset password.' }); }
      });
    } else if (action === 'admin-set-active') {
      const userId = target?.dataset?.userId;
      const active = target?.dataset?.nextActive === 'true';
      if (!userId || target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm(`${active ? 'Reactivate' : 'Deactivate'} this account?`)) return;
      await runButtonAction(target, async () => {
        try { await setAccountActive(client, userId, active); await renderAdminSection('accounts', { credential:null, notice:`Account ${active ? 'reactivated' : 'deactivated'}.` }); }
        catch (error) { await renderAdminSection('accounts', { notice:error instanceof Error ? error.message : 'Unable to update account.' }); }
      });
    } else if (action === 'admin-unassign-teacher') {
      if (target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm('Remove this teacher from the class?')) return;
      await runButtonAction(target, async () => {
        try { await unassignTeacherFromClass(client, target.dataset.teacherId, target.dataset.classId); await renderAdminSection('classes', { notice:'Teacher removed from class.', credential:null }); }
        catch (error) { await renderAdminSection('classes', { notice:error instanceof Error ? error.message : 'Unable to remove teacher.' }); }
      });
    } else if (action === 'admin-run-import') {
      const preview = currentState.importPreview;
      if (target.disabled || !preview || preview.errors?.length || !preview.validRows?.length || preview.classId !== target.dataset.classId) return;
      await runButtonAction(target, async () => {
        try {
          const result = await bulkProvisionStudents(client, preview.classId, preview.validRows);
          await renderAdminSection('import', { importPreview:null, bulkResult:result, lastImportClassId:preview.classId, notice:`${result.created?.length ?? 0} student account${result.created?.length === 1 ? '' : 's'} created${result.failed?.length ? `; ${result.failed.length} failed.` : '.'}` });
        } catch (error) { await renderAdminSection('import', { notice:error instanceof Error ? error.message : 'Bulk import failed.' }); }
      });
    } else if (action === 'admin-retry-failed') {
      const classId = currentState.lastImportClassId;
      const failedRows = currentState.bulkResult?.failed ?? [];
      if (target.disabled || !classId || classId !== target.dataset.classId || !failedRows.length) return;
      await runButtonAction(target, async () => {
        try {
          const priorCreated = currentState.bulkResult?.created ?? [];
          const result = await bulkProvisionStudents(client, classId, failedRows.map(row => ({ displayName:row.displayName, email:row.email })));
          const bulkResult = { created:[...priorCreated, ...(result.created ?? [])], failed:result.failed ?? [] };
          await renderAdminSection('import', { importPreview:null, bulkResult, lastImportClassId:classId, notice:`Retry created ${result.created?.length ?? 0} account${result.created?.length === 1 ? '' : 's'}${result.failed?.length ? `; ${result.failed.length} still failed.` : '.'}` });
        } catch (error) { await renderAdminSection('import', { notice:error instanceof Error ? error.message : 'Retry failed.' }); }
      });
    } else if (action === 'admin-copy-credentials') {
      const created = currentState.bulkResult?.created ?? [];
      const text = created.map(row => `${row.displayName}\t${row.email}\t${row.temporaryPassword}`).join('\n');
      if (text && globalThis.navigator?.clipboard?.writeText) await globalThis.navigator.clipboard.writeText(text);
    } else if (action === 'admin-print-credentials') {
      if (typeof globalThis.print === 'function') globalThis.print();
    }
  });

  const applyAccountFilters = () => {
    const search = String(root.querySelector?.('[data-admin-filter="account-search"]')?.value ?? '').trim().toLowerCase();
    const role = root.querySelector?.('[data-admin-filter="account-role"]')?.value ?? 'all';
    const status = root.querySelector?.('[data-admin-filter="account-status"]')?.value ?? 'all';
    for (const row of root.querySelectorAll?.('.admin-table tbody tr[data-account-role]') ?? []) {
      const text = String(row.textContent ?? '').toLowerCase();
      const roleOk = role === 'all' || row.dataset.accountRole === role;
      const statusOk = status === 'all' || (status === 'active') === (row.dataset.accountActive === 'true');
      row.hidden = !(roleOk && statusOk && (!search || text.includes(search)));
    }
  };
  root.addEventListener('input', event => { if (event.target?.dataset?.adminFilter) applyAccountFilters(); });
  root.addEventListener('change', event => { if (event.target?.dataset?.adminFilter) applyAccountFilters(); });

  await renderCurrentState();
}

if (typeof document !== 'undefined') bootApp();
