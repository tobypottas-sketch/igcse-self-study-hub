import { openWritingActivity } from './writing/teacher-report.js?v=2';
import { openWritingAssessor } from './assessor/controller.js';
import { takeReturnPath, clearReturnTarget, getSessionStorage } from './return-target.js';
import { signIn, changePassword, getCurrentProfile } from './auth.js';
import { loadApps } from './api.js';
import { getSupabaseClient } from './supabase.js';
import { createStudentAccount, createTeacherAccount, resetAccountPassword, setAccountActive, deleteAccount } from './admin/accounts.js';
import { createClass, renameClass, assignTeacherToClass, unassignTeacherFromClass, transferStudent, retireClass } from './admin/classes.js';
import { loadAdminData } from './admin/data.js';
import { loadTeacherActivityData, markMeritAwarded } from './admin/activity-data.js';
import { applyActivityListFilters, newActivityListState } from './admin/activity-list-ui.js?v=focused-v1';
import { parseStudentCsv, validateStudentImport, bulkProvisionStudents } from './admin/import.js';
import { renderLogin } from './views/login.js';
import { renderChangePassword } from './views/change-password.js';
import { renderHome, resetMeritPopup, updateHomeMerits, renderExternalMerits } from './views/home.js';
import { renderAdmin } from './views/admin.js';
import { renderStudentProgress, updateProgressStudentRows } from './views/student-progress.js';
import { reportingPeriod, schoolDay } from './reporting/periods.js';
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
  let assessorController = null;
  let cachedHomeState = null;
  let adminLoadPromise = null;
  let activityLoadPromise = null;
  let activityGeneration = 0;
  let progressGeneration = 0;
  let progressState = null;
  let progressReturn = false;
  const staffProgress = () => ['admin','teacher'].includes(currentState.profile?.role) && currentState.profile.active === true && !currentState.profile.must_change_password;
  const drawProgress = options => { if (currentState.view === 'student-progress' && staffProgress() && progressState) renderStudentProgress(root,progressState,options); };
  const loadProgress = async () => {
    if (!staffProgress() || !progressState) return;
    activityGeneration++;
    progressReturn=false;
    let period;
    try { period = reportingPeriod(progressState.kind,{from:progressState.from,to:progressState.to}); if (progressState.kind==='custom' && period.end-period.start > 31*86400000) throw new RangeError('Choose at most 31 calendar days.'); }
    catch(error) { progressGeneration++; progressState={...progressState,error:error.message,snapshot:null,loading:false,period:null,awaitingDates:true}; drawProgress(); return; }
    const generation=++progressGeneration, actor=currentState.profile.id;
    progressState={...progressState,period,snapshot:null,loading:true,error:null,awaitingDates:false}; drawProgress();
    try {
      const snapshot=await loadTeacherActivityData(client,{now:new Date(period.asOf),selectedPeriod:period});
      if(generation!==progressGeneration || currentState.view!=='student-progress' || currentState.profile?.id!==actor || !staffProgress()) return;
      progressState={...progressState,snapshot,loading:false}; drawProgress();
    } catch { if(generation===progressGeneration && currentState.view==='student-progress' && staffProgress()){ progressState={...progressState,snapshot:null,loading:false}; drawProgress(); } }
  };
  const openProgress = async () => {
    if(!staffProgress()) return;
    activityGeneration++;
    progressReturn=false;
    const today=schoolDay(Date.now());
    progressState={kind:'thisWeek',from:today,to:today,classId:null,tab:'overview',search:'',sort:'name',meritsOnly:false};
    currentState={...currentState,view:'student-progress'};
    await loadProgress();
  };
  let adminRefreshGeneration = 0;
  let activityListState = newActivityListState();
  const restoreActivityList = () => {
    const filters=root.querySelectorAll?.('[data-activity-filter]')??[];
    for(const control of filters){
      const type=control.dataset.activityFilter;
      if(type==='search')control.value=activityListState.search;
      if(type==='class')control.value=activityListState.classId;
      if(type==='state')control.value=activityListState.state;
    }
    applyActivityListFilters(root,activityListState);
  };

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

  // Notifications are independent of the full Activity dashboard and of the current route.
  const meritMount = document.createElement?.('div');
  if (meritMount) {
    meritMount.className = 'live-merit-mount';
    meritMount.hidden = true;
    root.after(meritMount);
  }
  let meritSnapshot = null;
  let meritAccount = null;
  let meritGeneration = 0;
  let meritRequest = null;
  let meritTimer = null;
  let meritFirstLoad = true;
  const eligibleForMerits = () => ['teacher','admin'].includes(currentState.profile?.role)
    && currentState.profile.active === true && !currentState.profile.must_change_password
    && !['login','error','change-password'].includes(currentState.view);
  const syncMeritMount = () => {
    if (!meritMount) return;
    const external = eligibleForMerits() && currentState.view !== 'home' && meritSnapshot;
    if (!external) { meritMount.replaceChildren(); meritMount.hidden = true; return; }
    meritMount.hidden = false;
    renderExternalMerits(meritMount,currentState.profile,meritSnapshot);
  };
  const stopMerits = () => {
    meritGeneration++;
    meritRequest = null;
    if (meritTimer !== null) clearInterval(meritTimer);
    meritTimer = null;
    meritSnapshot = null;
    meritAccount = null;
    meritFirstLoad = true;
    if (meritMount) { meritMount.replaceChildren(); meritMount.hidden = true; }
  };
  const refreshMerits = async ({ immediate = false } = {}) => {
    if (!eligibleForMerits() || meritTimer === null || meritAccount !== currentState.profile.id || (!immediate && document.hidden)) return;
    if (meritRequest) return meritRequest;
    const generation = meritGeneration;
    const account = currentState.profile.id;
    const request = loadTeacherActivityData(client,{meritOnly:true})
      .then(snapshot => {
        if (generation !== meritGeneration || account !== currentState.profile?.id || !eligibleForMerits()) return;
        const previous = meritSnapshot;
        meritSnapshot = snapshot;
        const changed = JSON.stringify(previous) !== JSON.stringify(snapshot);
        if (changed) {
          activityLoadPromise = null;
          if (currentState.view === 'student-progress' && !progressReturn && progressState?.snapshot && !progressState.loading && !progressState.awaitingDates) {
            // Reload the authorised roster as well as merits; never merge an alert-only roster into reporting data.
            void loadProgress();
          }
        }
        if (cachedHomeState) cachedHomeState = {...cachedHomeState,meritSnapshot:snapshot};
        if (currentState.view === 'home') {
          if (changed || meritFirstLoad) updateHomeMerits(root,currentState.profile,snapshot,{autoOpen:meritFirstLoad});
        } else if (changed || meritFirstLoad) syncMeritMount();
        meritFirstLoad = false;
      })
      .catch(error => {
        if (generation !== meritGeneration) return;
        // A revoked session or permission error must not leave old student names visible.
        if (['42501','PGRST301','PGRST303'].includes(error?.code) || [401,403].includes(error?.status)) {
          meritSnapshot = null;
          activityLoadPromise = null;
          activityGeneration++;
          if (currentState.view === 'home') updateHomeMerits(root,currentState.profile,null);
          if (currentState.view === 'student-progress') { progressGeneration++; if(progressState){progressState={...progressState,snapshot:null,loading:false};drawProgress();} }
          if (currentState.view === 'admin' && currentState.section === 'activity') {
            currentState = { ...currentState, activityDashboard:null, notice:'Activity access is unavailable.' };
            renderAdmin(root,currentState);
          }
          syncMeritMount();
        }
      })
      .finally(() => { if (meritRequest === request) meritRequest = null; });
    meritRequest = request;
    return request;
  };
  const startMerits = () => {
    if (!eligibleForMerits()) { stopMerits(); return; }
    if (meritAccount !== currentState.profile.id || meritTimer === null) {
      stopMerits();
      meritAccount = currentState.profile.id;
      meritTimer = setInterval(() => { void refreshMerits(); },30000);
    }
    void refreshMerits({immediate:true});
  };
  // Root renders replace their shell. This observer never watches the notification mount.
  if (meritMount && typeof MutationObserver !== 'undefined') new MutationObserver(syncMeritMount).observe(root,{childList:true});
  document.addEventListener?.('visibilitychange',() => { if (!document.hidden) void refreshMerits({immediate:true}); });
  globalThis.addEventListener?.('focus',() => { if (!document.hidden) void refreshMerits({immediate:true}); });
  client.auth.onAuthStateChange?.((event, session) => {
    if (event === 'SIGNED_OUT' || (session?.user?.id && currentState.profile?.id && session.user.id !== currentState.profile.id)) {
      activityGeneration++;
      progressGeneration++; progressState=null; progressReturn=false;
      activityLoadPromise = null;
      stopMerits();
      if (currentState.view === 'home') updateHomeMerits(root,currentState.profile,null);
      if (currentState.view === 'student-progress' || (currentState.view === 'admin' && currentState.section === 'activity')) {
        currentState = { view:'login' };
        root.replaceChildren();
        setTimeout(() => { void renderCurrentState(); },0);
      }
    }
  });
  meritMount?.addEventListener('click',async event => {
    if (!event.target?.closest?.('[data-action="activity"]') || !eligibleForMerits()) return;
    meritMount.querySelector('[data-merit-dialog]')?.close();
    assessorController?.dispose(); assessorController = null;
    activityListState = newActivityListState();
    await renderActivitySection({selectedStudentId:null,notice:''},true);
  });

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
    if (!staff) { clearReturnTarget(getSessionStorage()); return; }
    const path = takeReturnPath(getSessionStorage());
    if (path) globalThis.location.replace(path);
  };

  const renderCurrentState = async () => {
    activityGeneration++;
    progressGeneration++; progressState=null; progressReturn=false;
    assessorController?.dispose(); assessorController = null;
    currentState = await loadAppState(client);
    if (currentState.view === 'login') { stopMerits(); cachedHomeState = null; adminLoadPromise = null; activityLoadPromise = null; renderLogin(root); return; }
    if (currentState.view === 'change-password') { stopMerits(); renderChangePassword(root, currentState.profile); return; }
    if (currentState.view === 'home') {
      currentState = { ...currentState, activityDashboard:null };
      cachedHomeState = { ...currentState };
      const retained = meritAccount === currentState.profile.id ? meritSnapshot : null;
      renderHome(root,currentState.profile,currentState.apps,retained,{autoOpenMerits:false});
      if (currentState.profile?.role === 'admin' && currentState.profile.active !== false) preloadAdminData().catch(() => {});
      startMerits();
      return;
    }
    stopMerits();
    renderError(root, currentState.error instanceof Error ? currentState.error.message : 'Unable to load your account.');
  };

  const renderActivitySection = async (extras = {}, refresh = false) => {
    if (!['admin','teacher'].includes(currentState?.profile?.role) || currentState.profile.active === false) return;
    const generation = ++activityGeneration;
    const actor = currentState.profile.id;
    const isCurrent = () => generation === activityGeneration && currentState.profile?.id === actor;
    try {
      const activityDashboard = await preloadActivityData(refresh);
      if (!isCurrent()) return;
      if (cachedHomeState) cachedHomeState = { ...cachedHomeState, activityDashboard };
      currentState = { ...currentState, ...extras, view:'admin', section:'activity', activityDashboard };
      renderAdmin(root, currentState);
      restoreActivityList();
    } catch {
      if (!isCurrent()) return;
      currentState = { ...currentState, ...extras, view:'admin', section:'activity', activityDashboard:null, notice:'Unable to load student activity.' };
      renderAdmin(root, currentState);
      restoreActivityList();
    }
  };

  const renderAdminSection = async (section = 'accounts', extras = {}, refresh = false) => {
    if (currentState?.profile?.role !== 'admin' || currentState.profile.active === false) return;
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
    if (currentState?.profile?.role !== 'admin' || currentState.profile.active === false) return;
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
      resetMeritPopup();
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

    if (currentState.profile?.role !== 'admin' || currentState.profile?.active !== true) return;
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
        renderCachedAdminSection('import', { importPreview:{ classId, fileName:String(file.name ?? 'students.csv'), ...validation }, bulkResult:null, lastImportClassId:null, notice:validation.errors.length ? 'Fix the validation errors before creating accounts.' : validation.validRows.length ? `CSV validated: ${validation.validRows.length} new student${validation.validRows.length === 1 ? '' : 's'} ready; ${validation.skippedRows.length} existing account${validation.skippedRows.length === 1 ? '' : 's'} will be skipped.` : 'All listed students already have accounts. No new accounts to create.' });
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
    if (action === 'toggle-login-password') {
      const field = root.querySelector('#hub-login-password');
      if (!field || !root.contains(target)) return;
      const visible = field.type === 'password';
      field.type = visible ? 'text' : 'password';
      target.textContent = visible ? 'Hide' : 'Show';
      target.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
      target.setAttribute('aria-pressed', String(visible));
      return;
    }
    if ((action === 'admin' || (action?.startsWith?.('admin-') && action !== 'admin-back' && action !== 'admin-section-activity')) && currentState.profile?.role !== 'admin') return;
    if (action && action !== 'writing-assessor' && assessorController) { assessorController.dispose(); assessorController = null; }
    if (action === 'student-progress') { await openProgress(); return; }
    if (action?.startsWith('sp-')) {
      if (!staffProgress() || currentState.view!=='student-progress' || !progressState) return;
      if (action==='sp-back') { activityGeneration++; if(progressState.studentId){progressState={...progressState,studentId:null};drawProgress();}else if(progressState.classId){progressState={...progressState,classId:null,tab:'overview',search:'',meritsOnly:false};drawProgress();}else await renderCurrentState(); return; }
      if (action==='sp-refresh' || action==='sp-apply') { await loadProgress(); return; }
      if (action==='sp-class' || action==='sp-merits') { const id=target.dataset.classId; if(!progressState.snapshot?.classes?.some(c=>c.classId===id) && !progressState.snapshot?.students?.some(s=>s.classId===id))return; progressState={...progressState,classId:id,tab:action==='sp-merits'?'students':'overview',search:'',meritsOnly:action==='sp-merits'};drawProgress();return; }
      if (action==='sp-tab' && ['overview','students','learning'].includes(target.dataset.tab)) {progressState={...progressState,tab:target.dataset.tab};drawProgress();return;}
      if (action==='sp-toggle-merits') {progressState={...progressState,meritsOnly:!progressState.meritsOnly};drawProgress();return;}
      if (action==='sp-student-back') {progressState={...progressState,studentId:null};drawProgress();return;}
      if (action==='sp-student' || action==='sp-full-student') {const id=target.dataset.studentId;if(!progressState.snapshot?.students?.some(s=>s.studentId===id && s.classId===progressState.classId))return;
        if(action==='sp-student'){progressState={...progressState,studentId:id};drawProgress();root.querySelector('.sp-shell')?.scrollIntoView({block:'start'});return;}
        progressGeneration++;progressReturn=true;await renderActivitySection({selectedStudentId:id,notice:''},true);return;}
      return;
    }
    if (action === 'writing-activity') {
      if (!['teacher','admin'].includes(currentState.profile?.role) || currentState.profile.active !== true || currentState.profile.must_change_password) return;
      activityGeneration++;
      progressGeneration++; progressState=null; progressReturn=false;
      currentState = { ...currentState, view:'writing-activity' };
      await openWritingActivity(root, client, {onBack:()=>renderCurrentState()});
    }
    else if (action === 'writing-assessor') {
      if (!['teacher','admin'].includes(currentState.profile?.role) || currentState.profile.active !== true || currentState.profile.must_change_password) return;
      assessorController?.dispose();
      currentState = { ...currentState, view:'assessor' };
      assessorController = openWritingAssessor(root, client, currentState.profile, { onBack:() => renderCurrentState() });
    }
    else if (action === 'logout') { stopMerits(); resetMeritPopup(); await client.auth.signOut(); clearReturnTarget(getSessionStorage()); cachedHomeState = null; adminLoadPromise = null; activityLoadPromise = null; await renderCurrentState(); }
    else if (action === 'retry') await renderCurrentState();
    else if (action === 'change-password') {
      if (['teacher','admin'].includes(currentState.profile?.role) && currentState.profile.active !== false) {
        stopMerits();
        currentState = { ...currentState, view:'change-password' };
        renderChangePassword(root, currentState.profile);
      }
    }
    else if (action === 'cancel-change-password') {
      if (['teacher','admin'].includes(currentState.profile?.role) && !currentState.profile.must_change_password) await renderCurrentState();
    }
    else if (action === 'activity') { activityListState=newActivityListState(); await renderActivitySection({ selectedStudentId:null, notice:'' },true); }
    else if (action === 'admin') await renderAdminSection('accounts', { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    else if (action === 'admin-back') {
      activityGeneration++; progressGeneration++; progressState=null; progressReturn=false;
      if (cachedHomeState) {
        currentState = { ...cachedHomeState };
        renderHome(root,currentState.profile,currentState.apps,meritSnapshot,{autoOpenMerits:false});
        void refreshMerits({immediate:true});
      } else await renderCurrentState();
    }
    else if (action?.startsWith?.('admin-section-')) {
      const section = action.slice('admin-section-'.length);
      if (section === 'activity') { activityListState=newActivityListState(); await renderActivitySection({ selectedStudentId:null, notice:'' },true); }
      else if (['accounts','classes','import'].includes(section)) await renderAdminSection(section, { credential:null, notice:'', importPreview:null, bulkResult:null, lastImportClassId:null });
    } else if (action === 'activity-student') {
      const studentId = target?.dataset?.studentId;
      if (!studentId || !currentState.activityDashboard) return;
      currentState = { ...currentState, selectedStudentId:studentId, notice:'' };
      renderAdmin(root,currentState);
    } else if (action === 'activity-back') {
      if(progressReturn && progressState && staffProgress()){progressReturn=false;currentState={...currentState,view:'student-progress'};await loadProgress();return;}
      currentState = { ...currentState, selectedStudentId:null, notice:'' };
      renderAdmin(root,currentState);
      restoreActivityList();
    } else if (action === 'activity-show-more') {
      activityListState.limit+=10;
      applyActivityListFilters(root,activityListState);
    } else if (action === 'activity-award-merit') {
      const studentId = target?.dataset?.studentId;
      const meritNumber = Number(target?.dataset?.meritNumber);
      if (!studentId || !Number.isInteger(meritNumber) || target.disabled) return;
      await runButtonAction(target, async () => {
        try {
          await markMeritAwarded(client,studentId,meritNumber);
          // Invalidate any response started before the successful award.
          meritGeneration++; meritRequest = null;
          if (meritSnapshot) {
            const students = meritSnapshot.students.map(s => {
              if (s.studentId !== studentId) return s;
              const pendingMeritNumbers = (s.pendingMeritNumbers ?? []).filter(n => n !== meritNumber);
              return {...s,pendingMeritNumbers,pendingMerits:pendingMeritNumbers.length};
            }).filter(s=>s.pendingMerits);
            meritSnapshot = {students,pendingMerits:students.reduce((sum,s)=>sum+s.pendingMerits,0)};
            syncMeritMount();
          }
          void refreshMerits({immediate:true});
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
    const filtered = Boolean(search || status !== 'all' || role !== 'all');
    // Keep the staff directory independent of student search and filters.
    let anyStudentVisible = false;
    for (const group of root.querySelectorAll?.('[data-admin-student-group]') ?? []) {
      let visible = 0;
      for (const row of group.querySelectorAll('tbody tr[data-account-role]')) {
        const text = String(row.textContent ?? '').toLowerCase();
        const roleOk = role === 'all' || row.dataset.accountRole === role;
        const statusOk = status === 'all' || (status === 'active') === (row.dataset.accountActive === 'true');
        row.hidden = !(roleOk && statusOk && (!search || text.includes(search)));
        if (!row.hidden) {
          visible++;
          const numberCell=row.querySelector('[data-student-number]');
          if(numberCell)numberCell.textContent=String(visible);
        }
      }
      group.hidden = filtered && visible === 0;
      if (filtered && visible) group.open = true;
      anyStudentVisible ||= visible > 0;
    }
    const empty = root.querySelector?.('[data-admin-student-no-matches]');
    if (empty) empty.hidden = !filtered || anyStudentVisible;
  };

  const applyActivityFilters = (target) => {
    const type=target?.dataset?.activityFilter;
    if(!type)return;
    if(type==='search'){
      activityListState.search=String(target.value??'');
      if(activityListState.search.trim()){
        activityListState.state='all';
        const select=root.querySelector('[data-activity-filter="state"]');
        if(select)select.value='all';
      }
    }
    if(type==='class')activityListState.classId=target.value;
    if(type==='state')activityListState.state=target.value;
    activityListState.limit=10;
    applyActivityListFilters(root,activityListState);
  };

  // User-selected disclosure: keep one class open at a time.
  // Programmatic openings from search/status filtering can reveal several matching classes.
  root.addEventListener('click', event => {
    const summary = event.target?.closest?.('[data-admin-student-group] > summary');
    if (!summary) return;
    const selected = summary.parentElement;
    if (!selected) return;
    event.preventDefault();
    const willOpen = !selected.open;
    for (const group of root.querySelectorAll('[data-admin-student-group]')) {
      if (group !== selected) group.open = false;
    }
    selected.open = willOpen;
  });

  root.addEventListener('input', event => {
    if (event.target?.matches?.('[data-sp-search]') && currentState.view==='student-progress' && staffProgress() && progressState) {
      progressState.search=event.target.value;
      updateProgressStudentRows(root,progressState);
    }
    if (event.target?.dataset?.adminFilter) applyAccountFilters();
    if (event.target?.dataset?.activityFilter) applyActivityFilters(event.target);
  });
  root.addEventListener('change', async event => {
    if (currentState.view==='student-progress' && staffProgress() && progressState) {
      const target=event.target;
      if (target?.matches?.('[data-sp-period]')) {
        progressState={...progressState,kind:target.value,error:null};
        if (target.value==='custom') {
          progressGeneration++; activityGeneration++;
          progressState={...progressState,snapshot:null,loading:false,period:null,awaitingDates:true};
          drawProgress();
        } else await loadProgress();
        return;
      }
      if (target?.matches?.('[data-sp-from], [data-sp-to]')) {
        progressGeneration++; activityGeneration++;
        progressState={...progressState,[target.matches('[data-sp-from]')?'from':'to']:target.value,
          snapshot:null,loading:false,error:null,period:null,awaitingDates:true};
        drawProgress({resultsOnly:true});
        return;
      }
      if (target?.matches?.('[data-sp-sort]')) {
        progressState.sort=target.value;
        updateProgressStudentRows(root,progressState);
      }
    }
    if (event.target?.dataset?.adminFilter) applyAccountFilters();
    if (event.target?.dataset?.activityFilter) applyActivityFilters(event.target);
  });

  await renderCurrentState();
  if (currentState.view === 'home') clearReturnTarget(getSessionStorage());
}

if (typeof document !== 'undefined') bootApp();
