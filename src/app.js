import { signIn, changePassword, getCurrentProfile } from './auth.js';
import { loadApps } from './api.js';
import { getSupabaseClient } from './supabase.js';
import { createStudentAccount, createTeacherAccount, resetAccountPassword, setAccountActive, deleteAccount } from './admin/accounts.js';
import { createClass, assignTeacherToClass, unassignTeacherFromClass, transferStudent, retireClass } from './admin/classes.js';
import { loadAdminData } from './admin/data.js';
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
  let cachedHomeState = null;
  let adminLoadPromise = null;

  const preloadAdminData = (force = false) => {
    if (force) adminLoadPromise = null;
    if (!adminLoadPromise) {
      adminLoadPromise = loadAdminData(client)
        .catch(error => { adminLoadPromise = null; throw error; });
    }
    return adminLoadPromise;
  };

  const refreshAdminCacheInBackground = () => {
    preloadAdminData(true)
      .then(({ accounts, classes }) => {
        if (currentState.view === 'admin') currentState = { ...currentState, accounts, classes };
      })
      .catch(() => {});
  };

  const renderCurrentState = async () => {
    currentState = await loadAppState(client);
    if (currentState.view === 'login') { cachedHomeState = null; adminLoadPromise = null; renderLogin(root); return; }
    if (currentState.view === 'change-password') { renderChangePassword(root, currentState.profile); return; }
    if (currentState.view === 'home') {
      cachedHomeState = { ...currentState };
      renderHome(root, currentState.profile, currentState.apps);
      if (currentState.profile?.role === 'admin' && currentState.profile.active !== false) preloadAdminData().catch(() => {});
      return;
    }
    renderError(root, currentState.error instanceof Error ? currentState.error.message : 'Unable to load your account.');
  };

  const renderAdminSection = async (section = 'accounts', extras = {}, refresh = false) => {
    if (currentState?.profile?.role !== 'admin' || currentState.profile.active === false) return;
    try {
      const { accounts, classes } = await preloadAdminData(refresh);
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
        await renderAdminSection('accounts', { credential:{ displayName, email, temporaryPassword:result.temporaryPassword }, notice:`${kind === 'admin-create-student' ? 'Student' : 'Teacher'} account created.` }, true);
      } else if (kind === 'admin-create-class') {
        await createClass(client, String(data.get('className') ?? '').trim());
        await renderAdminSection('classes', { notice:'Class created.', credential:null }, true);
      } else if (kind === 'admin-assign-teacher') {
        await assignTeacherToClass(client, String(data.get('teacherId') ?? ''), String(data.get('classId') ?? ''));
        await renderAdminSection('classes', { notice:'Teacher assigned.', credential:null }, true);
      } else if (kind === 'admin-transfer-student') {
        const studentId = String(data.get('studentId') ?? '');
        const newClassId = String(data.get('newClassId') ?? '');
        const account = (currentState.accounts ?? []).find(item => item.id === studentId);
        if (account?.currentClassId === newClassId) throw new Error('Student is already in that class.');
        await transferStudent(client, studentId, newClassId);
        await renderAdminSection('classes', { notice:'Student moved. Previous class membership was retained in history.', credential:null }, true);
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
    if (action === 'logout') { await client.auth.signOut(); cachedHomeState = null; adminLoadPromise = null; await renderCurrentState(); }
    else if (action === 'retry') await renderCurrentState();
    else if (action === 'admin') await renderAdminSection('accounts', { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    else if (action === 'admin-back') {
      if (cachedHomeState) {
        currentState = { ...cachedHomeState };
        renderHome(root, currentState.profile, currentState.apps);
      } else await renderCurrentState();
    }
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
          await renderAdminSection('accounts', { credential:{ displayName:target.dataset.userName ?? 'Account', email:target.dataset.userEmail ?? '', temporaryPassword:result.temporaryPassword }, notice:'Password reset. Save the one-time credential now.' }, true);
        } catch (error) { await renderAdminSection('accounts', { notice:error instanceof Error ? error.message : 'Unable to reset password.' }); }
      });
    } else if (action === 'admin-set-active') {
      const userId = target?.dataset?.userId;
      const active = target?.dataset?.nextActive === 'true';
      if (!userId || target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm(`${active ? 'Reactivate' : 'Deactivate'} this account?`)) return;
      const previousAccounts = currentState.accounts ?? [];
      currentState = { ...currentState, accounts:previousAccounts.map(item => item.id === userId ? { ...item, active } : item) };
      renderCachedAdminSection('accounts', { credential:null, notice:`${active ? 'Reactivating' : 'Deactivating'} account…` });
      try {
        await setAccountActive(client, userId, active);
        renderCachedAdminSection('accounts', { credential:null, notice:`Account ${active ? 'reactivated' : 'deactivated'}.` });
        refreshAdminCacheInBackground();
      } catch (error) {
        currentState = { ...currentState, accounts:previousAccounts };
        renderCachedAdminSection('accounts', { notice:error instanceof Error ? error.message : 'Unable to update account.' });
      }
    } else if (action === 'admin-delete-account') {
      const userId = target?.dataset?.userId;
      const account = (currentState.accounts ?? []).find(item => item.id === userId);
      if (!userId || !account || target.disabled) return;
      const roleLabel = account.role === 'teacher' ? 'teacher' : 'student';
      const prompt = `Permanently delete ${account.displayName}? This removes the ${roleLabel} login and personal account details. Historical analytics are kept only as anonymised records.`;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm(prompt)) return;
      const previousAccounts = currentState.accounts ?? [];
      const previousClasses = currentState.classes ?? [];
      currentState = {
        ...currentState,
        accounts: previousAccounts.filter(item => item.id !== userId),
        classes: previousClasses.map(item => ({
          ...item,
          students:(item.students ?? []).filter(student => student.id !== userId),
          teachers:(item.teachers ?? []).filter(teacher => teacher.id !== userId)
        }))
      };
      renderCachedAdminSection('accounts', { credential:null, notice:`Deleting ${roleLabel}…` });
      try {
        await deleteAccount(client, userId);
        renderCachedAdminSection('accounts', { credential:null, notice:`${roleLabel === 'teacher' ? 'Teacher' : 'Student'} deleted permanently. Historical analytics were retained anonymously.` });
        refreshAdminCacheInBackground();
      } catch (error) {
        currentState = { ...currentState, accounts:previousAccounts, classes:previousClasses };
        renderCachedAdminSection('accounts', { notice:error instanceof Error ? error.message : `Unable to delete ${roleLabel}.` });
      }
    } else if (action === 'admin-unassign-teacher') {
      if (target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm('Remove this teacher from the class?')) return;
      await runButtonAction(target, async () => {
        try { await unassignTeacherFromClass(client, target.dataset.teacherId, target.dataset.classId); await renderAdminSection('classes', { notice:'Teacher removed from class.', credential:null }, true); }
        catch (error) { await renderAdminSection('classes', { notice:error instanceof Error ? error.message : 'Unable to remove teacher.' }); }
      });
    } else if (action === 'admin-delete-class') {
      const classId = target?.dataset?.classId;
      const className = target?.dataset?.className || 'this class';
      if (!classId || target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm(`Delete ${className}? Current student memberships will end, teacher assignments will be removed, and historical activity will be kept.`)) return;
      const previousClasses = currentState.classes ?? [];
      const previousAccounts = currentState.accounts ?? [];
      currentState = {
        ...currentState,
        classes: previousClasses.filter(item => item.id !== classId),
        accounts: previousAccounts.map(item => {
          if (item.role === 'student' && item.currentClassId === classId) return { ...item, currentClassId:null, currentClass:'' };
          if (item.role === 'teacher') return { ...item, assignedClasses:(item.assignedClasses ?? []).filter(link => link.id !== classId) };
          return item;
        })
      };
      renderCachedAdminSection('classes', { notice:'Deleting class…', credential:null });
      try {
        await retireClass(client, classId);
        renderCachedAdminSection('classes', { notice:'Class deleted.', credential:null });
        refreshAdminCacheInBackground();
      } catch (error) {
        currentState = { ...currentState, classes:previousClasses, accounts:previousAccounts };
        renderCachedAdminSection('classes', { notice:error instanceof Error ? error.message : 'Unable to delete class.' });
      }
    } else if (action === 'admin-run-import') {
      const preview = currentState.importPreview;
      if (target.disabled || !preview || preview.errors?.length || !preview.validRows?.length || preview.classId !== target.dataset.classId) return;
      await runButtonAction(target, async () => {
        try {
          const result = await bulkProvisionStudents(client, preview.classId, preview.validRows);
          await renderAdminSection('import', { importPreview:null, bulkResult:result, lastImportClassId:preview.classId, notice:`${result.created?.length ?? 0} student account${result.created?.length === 1 ? '' : 's'} created${result.failed?.length ? `; ${result.failed.length} failed.` : '.'}` }, true);
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
          await renderAdminSection('import', { importPreview:null, bulkResult, lastImportClassId:classId, notice:`Retry created ${result.created?.length ?? 0} account${result.created?.length === 1 ? '' : 's'}${result.failed?.length ? `; ${result.failed.length} still failed.` : '.'}` }, true);
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
