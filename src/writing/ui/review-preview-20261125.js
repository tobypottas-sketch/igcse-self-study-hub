import {getSupabaseClient} from '../../supabase.js';
import {getCurrentProfile} from '../../auth.js';
import {createCatalogue} from '../engine/catalogue.js';
import {reviewConfig} from '../content/review-v1.js';
import {renderReviewHome} from './review-home-20261125.js?v=12';

const root=document.getElementById('writingAcademy');
async function boot(){
 try{
  const client=await getSupabaseClient();
  const profile=await getCurrentProfile(client);
  if(!profile?.active||profile.must_change_password||!['teacher','admin'].includes(profile.role)){location.replace('./');return;}
  let revoked=false;
  client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){revoked=true;root.replaceChildren();location.replace('./');}});
  if(revoked)return;
  renderReviewHome(root,createCatalogue(reviewConfig),profile.id,{feedbackClient:client,feedbackRole:profile.role});
 }catch{
  root.replaceChildren();
  const p=document.createElement('p');p.className='wa-loading';p.setAttribute('role','alert');p.textContent='Unable to verify your Hub account.';
  const a=document.createElement('a');a.href='./';a.textContent='Return to Hub';p.append(' ',a);root.append(p);
 }finally{root.setAttribute('aria-busy','false');}
}
void boot();
