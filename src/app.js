import { takeReturnPath, clearReturnTarget } from './return-target.js';
import { signIn, changePassword, getCurrentProfile } from './auth.js';
import { loadApps } from './api.js';
import { getSupabaseClient } from './supabase.js';
import { createStudentAccount, createTeacherAccount, resetAccountPassword, setAccountActive, deleteAccount } from './admin/accounts.js';
import { createClass, renameClass, assignTeacherToClass, unassignTeacherFromClass, transferStudent, retireClass } from './admin/classes.js';
import { loadAdminData } from './admin/data.js';
import { loadTeacherActivityData, markMeritAwarded } from './admin/activity-data.js';
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
  let activityLoadPromise = null;
  let adminRefreshGeneration = 0;

  const preloadAdminData = (force = false) => {
    if (force) adminLoadPromise = null;
    if (!adminLoadPromise) {
      adminLoadPromise = loadAdminData(client)
        .catch(error => { adminLoadPromise = null; throw error; });
    }
    return adminLoadPromise;
  };

  const preloadActivityData = (force = false) => {
    if (force) activityLoadPromise = null;
    if (!activityLoadPromise) {
      activityLoadPromise = loadTeacherActivityData(client)
        .catch(error => { activityLoadPromise = null; throw error; });
    }
    return activityLoadPromise;
  };

  const invalidateAdminBackgroundRefreshes = () => { adminRefreshGeneration += 1; };

  const refreshAdminCacheInBackground = () => {
    const refreshGeneration = ++adminRefreshGeneration;
    preloadAdminData(true)
      .then(({ accounts, classes, teachingAdmins }) => {
        if (refreshGeneration !== adminRefreshGeneration) return;
        if (currentState.view === 'admin') currentState = { ...currentState, accounts, classes, teachingAdmins };
      })
      .catch(() => {});
  };

  const enhanceClassRenameControls = () => {
    const doc = root.ownerDocument ?? globalThis.document;
    if (!doc?.createElement) return;
    for (const head of root.querySelectorAll?.('.admin-class-card__head') ?? []) {
      if (head.querySelector?.('[data-action="admin-edit-class"]')) continue;
      const deleteButton = head.querySelector?.('[data-action="admin-delete-class"]');
      if (!deleteButton) continue;
      const editButton = doc.createElement('button');
      editButton.type = 'button';
      editButton.className = 'button admin-button';
      editButton.dataset.action = 'admin-edit-class';
      editButton.dataset.classId = deleteButton.dataset.classId ?? '';
      editButton.dataset.className = deleteButton.dataset.className ?? '';
      editButton.textContent = 'Edit name';
      deleteButton.before(editButton);
    }
  };

  // Follows a stored Vocabulary return target once, for active teachers/admins only.
  const resumeReturnTarget = () => {
    if (currentState.view !== 'home') return;
    const staff = ['teacher','admin'].includes(currentState.profile?.role) && currentState.profile.active !== false;
    if (!staff) { clearReturnTarget(globalThis.sessionStorage); return; }
    const path = takeReturnPath(globalThis.sessionStorage);
    if (path) globalThis.location.replace(path);
  };

  const renderCurrentState = async () => {
    currentState = await loadAppState(client);
    if (currentState.view === 'login') { cachedHomeState = null; adminLoadPromise = null; activityLoadPromise = null; renderLogin(root); return; }
    if (currentState.view === 'change-password') { renderChangePassword(root, currentState.profile); return; }
    if (currentState.view === 'home') {
      currentState = { ...currentState, activityDashboard:null };
      cachedHomeState = { ...currentState };
      renderHome(root, currentState.profile, currentState.apps, null);
      if (['admin','teacher'].includes(currentState.profile?.role) && currentState.profile.active !== false) preloadAdminData().catch(() => {});
      if (['admin','teacher'].includes(currentState.profile?.role) && currentState.profile.active !== false) {
        preloadActivityData()
          .then(activityDashboard => {
            if (cachedHomeState) cachedHomeState = { ...cachedHomeState, activityDashboard };
            if (currentState.view !== 'home') return;
            currentState = { ...currentState, activityDashboard };
            renderHome(root, currentState.profile, currentState.apps, activityDashboard);
          })
          .catch(() => {});
      }
      return;
    }
    renderError(root, currentState.error instanceof Error ? currentState.error.message : 'Unable to load your account.');
  };

  const renderActivitySection = async (extras = {}, refresh = false) => {
    if (!['admin','teacher'].includes(currentState?.profile?.role) || currentState.profile.active === false) return;
    try {
      const activityDashboard = await preloadActivityData(refresh);
      if (cachedHomeState) cachedHomeState = { ...cachedHomeState, activityDashboard };
      currentState = { ...currentState, ...extras, view:'admin', section:'activity', activityDashboard };
      renderAdmin(root, currentState);
    } catch (error) {
      currentState = { ...currentState, ...extras, view:'admin', section:'activity', activityDashboard:currentState.activityDashboard ?? { students:[], pendingMerits:0, needsAttention:0 }, notice:error instanceof Error ? error.message : 'Unable to load student activity.' };
      renderAdmin(root, currentState);
    }
  };

  const renderAdminSection = async (section = 'accounts', extras = {}, refresh = false) => {
    if (!['admin','teacher'].includes(currentState?.profile?.role) || currentState.profile.active === false) return;
    try {
      const { accounts, classes, teachingAdmins } = await preloadAdminData(refresh);
      currentState = { ...currentState, ...extras, view:'admin', section, accounts, classes, teachingAdmins };
      renderAdmin(root, currentState);
      enhanceClassRenameControls();
    } catch (error) {
      currentState = { ...currentState, ...extras, view:'admin', section, accounts:currentState.accounts ?? [], classes:currentState.classes ?? [], teachingAdmins:currentState.teachingAdmins ?? [], notice:error instanceof Error ? error.message : 'Unable to load admin data.' };
      renderAdmin(root, currentState);
      enhanceClassRenameControls();
    }
  };

  const renderCachedAdminSection = (section = 'accounts', extras = {}) => {
    if (!['admin','teacher'].includes(currentState?.profile?.role) || currentState.profile.active === false) return;
    currentState = { ...currentState, ...extras, view:'admin', section };
    renderAdmin(root, currentState);
    enhanceClassRenameControls();
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
      try { await signIn(client, String(data.get('email') ?? '').trim(), String(data.get('password') ?? '')); await renderCurrentState(); resumeReturnTarget(); }
      catch (error) { renderLogin(root, error instanceof Error ? error.message : 'Unable to sign in.'); }
      return;
    }
    if (kind === 'change-password') {
      if (currentState.profile?.active === false || (!['teacher','admin'].includes(currentState.profile?.role) && !(currentState.view === 'change-password' && currentState.profile?.must_change_password))) return;
      const password = String(data.get('password') ?? '');
      if (password !== String(data.get('confirmPassword') ?? '')) { renderChangePassword(root, currentState.profile, 'The two passwords do not match.'); return; }
      try { await changePassword(client, password); await renderCurrentState(); resumeReturnTarget(); }
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
        activityLoadPromise = null;
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
    if (action === 'logout') { await client.auth.signOut(); clearReturnTarget(globalThis.sessionStorage); cachedHomeState = null; adminLoadPromise = null; activityLoadPromise = null; await renderCurrentState(); }
    else if (action === 'retry') await renderCurrentState();
    else if (action === 'change-password') {
      if (['teacher','admin'].includes(currentState.profile?.role) && currentState.profile.active !== false) {
        currentState = { ...currentState, view:'change-password' };
        renderChangePassword(root, currentState.profile);
      }
    }
    else if (action === 'cancel-change-password') {
      if (['teacher','admin'].includes(currentState.profile?.role) && !currentState.profile.must_change_password) await renderCurrentState();
    }
    else if (action === 'activity') await renderActivitySection({ selectedStudentId:null, notice:'' });
    else if (action === 'admin') await renderAdminSection('accounts', { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    else if (action === 'admin-back') {
      if (cachedHomeState) {
        currentState = { ...cachedHomeState };
        renderHome(root, currentState.profile, currentState.apps, currentState.activityDashboard);
      } else await renderCurrentState();
    }
    else if (action?.startsWith?.('admin-section-')) {
      const section = action.slice('admin-section-'.length);
      if (section === 'activity') await renderActivitySection({ selectedStudentId:null, notice:'' });
      else if (['accounts','classes','import'].includes(section)) await renderAdminSection(section, { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    } else if (action === 'activity-student') {
      const studentId = target?.dataset?.studentId;
      if (!studentId || !currentState.activityDashboard) return;
      currentState = { ...currentState, selectedStudentId:studentId, notice:'' };
      renderAdmin(root,currentState);
    } else if (action === 'activity-back') {
      currentState = { ...currentState, selectedStudentId:null, notice:'' };
      renderAdmin(root,currentState);
    } else if (action === 'activity-award-merit') {
      const studentId = target?.dataset?.studentId;
      const meritNumber = Number(target?.dataset?.meritNumber);
      if (!studentId || !Number.isInteger(meritNumber) || target.disabled) return;
      await runButtonAction(target, async () => {
        try {
          await markMeritAwarded(client,studentId,meritNumber);
          await renderActivitySection({ selectedStudentId:studentId, notice:`Merit ${meritNumber} marked awarded.` },true);
        } catch (error) {
          currentState = { ...currentState, notice:error instanceof Error ? error.message : 'Unable to mark merit awarded.' };
          renderAdmin(root,currentState);
        }
      });
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
      invalidateAdminBackgroundRefreshes();
      const previousAccounts = currentState.accounts ?? [];
      const previousTeachingAdmins = currentState.teachingAdmins ?? [];
      currentState = { ...currentState, accounts:previousAccounts.map(item => item.id === userId ? { ...item, active } : item), teachingAdmins:previousTeachingAdmins.map(item => item.id === userId ? { ...item, active } : item) };
      renderCachedAdminSection('accounts', { credential:null, notice:`${active ? 'Reactivating' : 'Deactivating'} account…` });
      try {
        await setAccountActive(client, userId, active);
        renderCachedAdminSection('accounts', { credential:null, notice:`Account ${active ? 'reactivated' : 'deactivated'}.` });
        refreshAdminCacheInBackground();
      } catch (error) {
        currentState = { ...currentState, accounts:previousAccounts, teachingAdmins:previousTeachingAdmins };
        renderCachedAdminSection('accounts', { notice:error instanceof Error ? error.message : 'Unable to update account.' });
      }
    } else if (action === 'admin-delete-account') {
      const userId = target?.dataset?.userId;
      const account = (currentState.accounts ?? []).find(item => item.id === userId);
      if (!userId || !account || target.disabled) return;
      const roleLabel = account.role === 'teacher' ? 'teacher' : 'student';
      const prompt = `Permanently delete ${account.displayName}? This removes the ${roleLabel} login and personal account details. Historical analytics are kept only as anonymised records.`;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm(prompt)) return;
      invalidateAdminBackgroundRefreshes();
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
        activityLoadPromise = null;
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
        try { await unassignTeacherFromClass(client, target.dataset.teacherId, target.dataset.classId); activityLoadPromise = null; await renderAdminSection('classes', { notice:'Teacher removed from class.', credential:null }, true); }
        catch (error) { await renderAdminSection('classes', { notice:error instanceof Error ? error.message : 'Unable to remove teacher.' }); }
      });
    } else if (action === 'admin-edit-class') {
      const classId = target?.dataset?.classId;
      const currentClass = (currentState.classes ?? []).find(item => item.id === classId);
      const oldName = currentClass?.className ?? target?.dataset?.className ?? '';
      if (!classId || !oldName || target.disabled || typeof globalThis.prompt !== 'function') return;
      const proposed = globalThis.prompt('Edit class name', oldName);
      if (proposed == null) return;
      const className = String(proposed).trim();
      if (!className || className === oldName) return;
      invalidateAdminBackgroundRefreshes();
      const previousClasses = currentState.classes ?? [];
      const previousAccounts = currentState.accounts ?? [];
      currentState = {
        ...currentState,
        classes: previousClasses.map(item => item.id === classId ? { ...item, className } : item),
        accounts: previousAccounts.map(item => {
          if (item.role === 'student' && item.currentClassId === classId) return { ...item, currentClass:className };
          if (item.role === 'teacher') return { ...item, assignedClasses:(item.assignedClasses ?? []).map(link => link.id === classId ? { ...link, className } : link) };
          return item;
        })
      };
      renderCachedAdminSection('classes', { notice:'Renaming class…', credential:null });
      try {
        await renameClass(client, classId, className);
        activityLoadPromise = null;
        renderCachedAdminSection('classes', { notice:'Class name updated.', credential:null });
        refreshAdminCacheInBackground();
      } catch (error) {
        currentState = { ...currentState, classes:previousClasses, accounts:previousAccounts };
        renderCachedAdminSection('classes', { notice:error instanceof Error ? error.message : 'Unable to rename class.' });
      }
    } else if (action === 'admin-delete-class') {
      const classId = target?.dataset?.classId;
      const className = target?.dataset?.className || 'this class';
      if (!classId || target.disabled) return;
      if (typeof globalThis.confirm === 'function' && !globalThis.confirm(`Delete ${className}? Current student memberships will end, teacher assignments will be removed, and historical activity will be kept.`)) return;
      invalidateAdminBackgroundRefreshes();
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
        activityLoadPromise = null;
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
          activityLoadPromise = null;
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
          activityLoadPromise = null;
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

  const applyActivityFilters = () => {
    const search = String(root.querySelector?.('[data-activity-filter="search"]')?.value ?? '').trim().toLowerCase();
    const classId = root.querySelector?.('[data-activity-filter="class"]')?.value ?? 'all';
    const state = root.querySelector?.('[data-activity-filter="state"]')?.value ?? 'all';
    for (const row of root.querySelectorAll?.('[data-activity-row]') ?? []) {
      const text = String(row.textContent ?? '').toLowerCase();
      const classOk = classId === 'all' || row.dataset.classId === classId;
      const stateOk = state === 'all' || (state === 'attention' && row.dataset.needsAttention === 'true') || (state === 'merits' && row.dataset.newMerits === 'true');
      row.hidden = !(classOk && stateOk && (!search || text.includes(search)));
    }
    // Presentation only: the Class column is shown only while the visible rows span more than one class.
    const table = root.querySelector?.('.activity-table');
    if (table) table.dataset.singleClass = new Set([...table.querySelectorAll('[data-activity-row]')].filter(row => !row.hidden).map(row => row.dataset.classId)).size <= 1 ? 'true' : 'false';
  };

  root.addEventListener('input', event => {
    if (event.target?.dataset?.adminFilter) applyAccountFilters();
    if (event.target?.dataset?.activityFilter) applyActivityFilters();
  });
  root.addEventListener('change', event => {
    if (event.target?.dataset?.adminFilter) applyAccountFilters();
    if (event.target?.dataset?.activityFilter) applyActivityFilters();
  });

  await renderCurrentState();
  if (currentState.view === 'home') clearReturnTarget(globalThis.sessionStorage);
}

if (typeof document !== 'undefined') bootApp();
