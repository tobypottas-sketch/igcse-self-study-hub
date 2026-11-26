import {getSupabaseClient} from '../../supabase.js';
import {getCurrentProfile} from '../../auth.js';
import {createStructureProgressPilot} from '../engine/structure-progress-pilot.js';
import {renderStructure} from './structure-20261125.js?v=7';
import {el} from './lesson-shell.js?v=15';

const root = document.getElementById('writingAcademy');

function showMessage(message) {
  root.replaceChildren();
  const status=el(root,'p','wa-loading',message);
  status.setAttribute('role','alert');
  el(status,'a','',' Return to Hub').href='./';
}

async function boot() {
  try {
    const client = await getSupabaseClient();
    let signedOut = false;
    client.auth.onAuthStateChange(event=>{
      if (event==='SIGNED_OUT') {
        signedOut = true;
        showMessage('Sign in to continue.');
      }
    });
    const profile = await getCurrentProfile(client);
    if (profile.role!=='student' || profile.must_change_password) {
      showMessage('This account is not enrolled in the Structure pilot.');
      return;
    }
    const pilot = createStructureProgressPilot(client);
    let checkpoint = await pilot.load();
    if (signedOut) return;
    if (!checkpoint) {
      showMessage('This account is not enrolled in the Structure pilot.');
      return;
    }

    const layout=el(root,'div','');
    const lesson=el(layout,'div','');
    const status=el(layout,'p','wa-muted','Your last stage is saved to your Hub account. Activity answers and drafts stay in this visit.');
    status.setAttribute('role','status');
    let queue=Promise.resolve();
    let paused=false;
    renderStructure(lesson,()=>location.assign('./'),()=>location.assign('./review-writing.html'),null,{
      initialStage:checkpoint.current_stage,
      previewLabel:'Student pilot',
      backLabel:'← Self-Study Hub',
      onStageChange(stage) {
        queue=queue.then(async ()=>{
          if (signedOut || paused || stage===checkpoint.current_stage) return;
          status.textContent='Saving your place…';
          try {
            checkpoint=await pilot.save(stage,checkpoint.revision_number);
            status.textContent='Your place is saved.';
          } catch (error) {
            paused=true;
            status.textContent=error?.code==='PT409'
              ? 'Your place changed in another window. Reload to get the latest saved stage.'
              : 'Your place could not be saved. Reload to reconnect and try again.';
          }
        });
      }
    });
    lesson.querySelector('.wa-nav')?.after(status);
  } catch {
    showMessage('Unable to open the Structure pilot. Check your Hub sign-in and try again.');
  } finally {
    root.setAttribute('aria-busy','false');
  }
}

void boot();
