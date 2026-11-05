import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './helpers/pathway-geometry-harness.mjs';
const modulePath=process.env.ASSESSOR_PLAYWRIGHT_MODULE;
const executablePath=process.env.CHROMIUM_PATH;
const ready=!!(modulePath&&executablePath);
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const result={contentMark:4,languageMark:6,totalMark:10,wordCount:20,contentReason:'Relevant, but needs development.',languageReason:'Clear vocabulary with some variety.',strengths:[{quote:'The museum was fascinating',advice:'Gives a clear opinion.'}],improvements:[{quote:'The museum was fascinating',advice:'Explain the reason in more detail.'}],nextStep:'Develop one exhibit example.',warning:'Experimental estimate.'};
async function open(t,{role='teacher',active=true,width=1280}={}){
 const {chromium}=await import(modulePath);const {server,origin}=await serve(root);
 const browser=await chromium.launch({executablePath,headless:true});t.after(async()=>{await browser.close();server.close();});
 const page=await browser.newPage({viewport:{width,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({role,active})=>{
  const profile={id:'11111111-1111-4111-8111-111111111111',display_name:'Synthetic Staff',school_email:'staff@example.invalid',role,active,must_change_password:false};let callback;
  window.__client={auth:{getUser:async()=>({data:{user:{id:profile.id}}}),getSession:async()=>({data:{session:{access_token:'synthetic-session-token'}}}),onAuthStateChange:fn=>{callback=fn;return{data:{subscription:{unsubscribe(){callback=null;}}}};},signOut:async()=>{}},from(table){const q={select(){return q;},eq(){return q;},order(){return q;},in(){return q;},single:async()=>({data:profile}),then(resolve){return Promise.resolve({data:table==='profiles'?[profile]:[],error:null}).then(resolve);}};return q;},rpc(){return{range:async()=>({data:[],error:null})};}};
  window.__logout=()=>callback?.('SIGNED_OUT');
 },{role,active});
 await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'text/javascript',body:'export async function getSupabaseClient(){return window.__client;}'}));
 let calls=[];let release;let mode='success';
 await page.route('https://igcse-writing-assessor.toby-pottas.workers.dev/assess',async route=>{
  calls.push({headers:route.request().headers(),body:route.request().postDataJSON()});
  if(mode==='hold')await new Promise(resolve=>{release=resolve;});
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({stages:2,result})}).catch(()=>{});
 });
 await page.goto(origin+'/index.html');await page.waitForSelector('.shell--home, .auth-card');
 return{page,calls,errors,hold:()=>{mode='hold';},release:()=>release?.()};
}
for(const width of [1280,390])test('real Hub assessor flow, cleanup and duplicate-submit guard at '+width+'px',{skip:!ready},async t=>{
 const h=await open(t,{width});const {page,calls}=h;
 await page.getByRole('button',{name:'Writing assessor',exact:true}).click();await page.waitForSelector('[data-assessor-form]');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.ok(await page.locator('[name=privacyConfirmed]').evaluate(el=>el.getBoundingClientRect().width<=24),'privacy checkbox must not stretch across the form');
 await page.locator('[data-assessor-practice]').selectOption('review');assert.match(await page.locator('[name=task]').inputValue(),/science museum/);
 await page.locator('[name=response]').fill('The museum was fascinating because the interactive exhibits explained science clearly. I recommend visiting with friends.');await page.locator('[name=privacyConfirmed]').check();
 h.hold();await page.locator('[data-assessor-form]').evaluate(form=>{form.requestSubmit();form.requestSubmit();});
 await page.waitForFunction(()=>document.querySelector('[type=submit]').disabled);await new Promise(resolve=>setTimeout(resolve,30));assert.equal(calls.length,1);
 assert.equal(calls[0].headers.authorization,'Bearer synthetic-session-token');assert.deepEqual(Object.keys(calls[0].body).sort(),['privacyConfirmed','response','task','taskType']);
 h.release();await page.getByRole('heading',{name:'Assessment estimate'}).waitFor();assert.match(await page.locator('[data-assessor-result]').innerText(),/10/);
 await page.screenshot({path:'/private/tmp/teacher-assessor-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'Clear writing and feedback'}).click();assert.equal(await page.locator('[name=response]').inputValue(),'');assert.equal(await page.locator('[data-assessor-result]').innerText(),'');
 await page.locator('[name=task]').fill('Describe a fictional museum and explain whether you recommend it.');await page.locator('[name=response]').fill('Synthetic draft must disappear on navigation.');
 await page.getByRole('button',{name:'Back to Hub',exact:true}).click();await page.waitForSelector('.shell--home');assert.ok(!(await page.locator('body').innerText()).includes('Synthetic draft must disappear'));
 await page.getByRole('button',{name:'Writing assessor',exact:true}).click();assert.equal(await page.locator('[name=response]').inputValue(),'');
 await page.locator('[name=response]').fill('Synthetic pagehide draft');await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));assert.equal(await page.locator('[name=response]').inputValue(),'');
 await page.locator('[data-assessor-practice]').selectOption('email');await page.locator('[name=response]').fill('The club was interesting and we learned how to build a simple model together.');await page.locator('[name=privacyConfirmed]').check();
 await page.locator('[data-assessor-form]').evaluate(form=>form.requestSubmit());await page.waitForFunction(()=>document.querySelector('[type=submit]').disabled);
 await page.getByRole('button',{name:'Clear writing and feedback'}).click();h.release();await new Promise(resolve=>setTimeout(resolve,40));assert.equal(await page.locator('[data-assessor-result]').innerText(),'');
 await page.locator('[name=response]').fill('Synthetic logout draft');await page.evaluate(()=>window.__logout());await page.waitForSelector('.shell--home');assert.ok(!(await page.locator('body').innerText()).includes('Synthetic logout draft'));
 assert.deepEqual(h.errors,[]);assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);
});
for(const [role,active] of [['admin',true],['student',true],['teacher',false]])test('real Hub permission boundary: '+role+' active='+active,{skip:!ready},async t=>{
 const {page,calls,errors}=await open(t,{role,active});
 assert.equal(await page.getByRole('button',{name:'Writing assessor',exact:true}).count(),role==='admin'?1:0);assert.equal(calls.length,0);assert.deepEqual(errors,[]);
});
