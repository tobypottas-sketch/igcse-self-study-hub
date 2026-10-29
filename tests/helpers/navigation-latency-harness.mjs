// Real student router, public Unit 1 curriculum and synthetic transport timings only.
// Request delays model end-to-end responses; they do not measure production database time.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {serve,findChromium,loadPlaywright} from './pathway-geometry-harness.mjs';
import {FAKE_SUPABASE,installRoutes} from './question-latency-harness.mjs';
const root=fileURLToPath(new URL('../..',import.meta.url));
export async function profileNavigation({ cpu=1,net=40,continueOnly=false }={}) {
const {chromium}=loadPlaywright();

const {server,origin}=await serve(root);const browser=await chromium.launch({executablePath:await findChromium()});
try {
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.__calls=[];window.__spans=[];window.__netMs=0;window.__cpuTasks=[];new PerformanceObserver(list=>window.__cpuTasks.push(...list.getEntries().map(e=>({start:e.startTime,ms:e.duration})))).observe({type:'longtask'});});
await installRoutes(page,root);
await page.unroute('**/src/vocabulary/router.js');
let fixture=FAKE_SUPABASE.replace('Promise.resolve(run(target)).then(resolve, reject)',"netCall('read:'+table,()=>run(target)).then(resolve,reject)")
.replace('from:builder, functions:{ invoke }','from:builder, functions:{ invoke:timedInvoke }, rpc');
fixture+=`\nlet stage='recognise',missionNumber=0;window.__attemptMs=0;
async function netCall(name,fn,delay=window.__netMs){const call={name,start:performance.now(),end:null};window.__calls.push(call);await new Promise(r=>setTimeout(r,delay));try{return await fn();}finally{call.end=performance.now();}}
async function timedInvoke(name,args){return netCall('invoke:'+name,()=>invoke(name,args), name==='vocabulary-attempt-action'?window.__attemptMs:window.__netMs);}
const originalRun=run;run=q=>q.table==='vocabulary_pathway_sets'?{data:[{pathway_id:'context',unit_number:1,set_number:1,stage,phase:'stage',status:'active',completed_stages:stage==='match'?['recognise']:[],weak_target_ids:[]}],error:null}:originalRun(q);
function rpc(name,args){return netCall('rpc:'+name,()=>{
if(name==='current_merit_pathways_required')return {data:2,error:null};
if(name==='start_vocabulary_mission'){missionNumber++;return {data:{mission_id:'synthetic-'+missionNumber,mission_seed:'synthetic-seed-'+missionNumber,pathway_stage:stage,set_number:1,set_phase:'stage',weak_target_ids:[]},error:null};}
if(name==='record_vocabulary_mission'||name==='record_vocabulary_mission_with_sets'){stage='match';return {data:{...(name==='record_vocabulary_mission_with_sets'?{pathway_sets:run({table:'vocabulary_pathway_sets'}).data}:{}),mission_id:args.p_mission_id,unit_number:1,mission_kind:'pathway',pathway_id:'context',pathway_stage:'recognise',mission_size:10,score:10,stars:3,best_streak:10,completed_at:new Date().toISOString()},error:null};}
return {data:null,error:{message:'Unsupported synthetic RPC'}};});}
`;
await page.route('**/src/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:fixture}));
for(const [file,names] of [['app.js',['openUnit','showHome','renderCurrentUnit','refreshSetRows','startPathwaySession','beginSession','commitSession','openFreshPracticeSheet','openPracticeSheet','continuePractice','advanceToNextQuestion','nextQuestion','finishSessionWhenSaved','finishSession','settleMission']],['pathway-choice.js',['pathwayPracticeOptions']],['engagement-model.js',['progressSnapshot']],['set-progress.js',['buildSetPathwayStates']],['pathway-planner.js',['planPathwayQuestion']]]){
let body=await readFile(`${root}/src/vocabulary/${file}`,'utf8');for(const name of names){let exported=false;body=body.replace(new RegExp(`(export )?(async )?function ${name}\\(`),(_,ex,as)=>{exported=Boolean(ex);return `${as??''}function __profile_${name}(`;});body+=`\n${exported?'export ':''}function ${name}(...args){const span={name:'${name}',start:performance.now(),end:null,syncMs:0};window.__spans.push(span);try{const result=__profile_${name}(...args);span.syncMs=performance.now()-span.start;if(result&&typeof result.then==='function')return result.finally(()=>{span.end=performance.now();});span.end=performance.now();return result;}catch(e){span.end=performance.now();throw e;}}\n`;}
await page.route(`**/src/vocabulary/${file}`,r=>r.fulfill({contentType:'text/javascript',body}));}
await page.goto(origin+'/vocabulary.html');await page.locator('.vocab-unit-card').waitFor();await page.waitForTimeout(100);
await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate',{rate:cpu});
await page.evaluate(ms=>{window.__netMs=ms;window.__attemptMs=ms;},continueOnly?0:net);
const results=[];
async function measure(name,selector,end){const start=await page.evaluate(sel=>{const t=performance.now();document.querySelector(sel).click();return t;},selector);await page.waitForFunction(end,{},{timeout:45000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const data=await page.evaluate(t=>({ms:performance.now()-t,spans:window.__spans.filter(x=>x.start>=t||x.end==null||x.end>=t).map(x=>({...x,start:x.start-t,end:x.end==null?null:x.end-t})),calls:window.__calls.filter(x=>x.start>=t||x.end==null||x.end>=t).map(x=>({...x,start:x.start-t,end:x.end==null?null:x.end-t})),longTasks:window.__cpuTasks.filter(x=>x.start>=t)}),start);results.push({name,...data});}
await measure('unit-open','.vocab-unit-card[data-unit="1"]',()=>Boolean(document.querySelector('.vocab-pathway-card')));
await measure('pathway-sheet','[data-action="open-pathway"][data-pathway="context"]',()=>Boolean(document.querySelector('[data-practice-sheet]')));
await measure('mission-start','[data-action="start-recommended"]',()=>Boolean(document.querySelector('.vocab-shell--session [data-choice-answer]')));
for(let i=0;i<10;i++){
if(continueOnly && i===9) await page.evaluate(ms=>{window.__netMs=ms;window.__attemptMs=ms;},net);
await page.evaluate(()=>{const q=window.__currentQuestion;const accepted=q.markingReference.acceptedAnswers;const button=[...document.querySelectorAll('[data-choice-answer]')].find(b=>accepted.includes(b.dataset.choiceAnswer));if(!button)throw new Error('no answer '+q.type);button.click();});
// Human-paced earlier answers: do not manufacture a queue of ten unsaved answers.
if(i<9){await page.waitForFunction(()=>window.__calls.filter(c=>c.name==='invoke:vocabulary-attempt-action').every(c=>c.end!=null));await measure('next-'+i,'[data-action="next-question"]',()=>!document.querySelector('.vocab-feedback'));}
else await measure('finish','[data-action="next-question"]',()=>Boolean(document.querySelector('[data-action="continue-practice"]')));
}
await measure('continue','[data-action="continue-practice"]',()=>Boolean(document.querySelector('.vocab-shell--session [data-form="vocabulary-answer"]')));
await measure('return-unit','[data-action="leave-session"]',()=>Boolean(document.querySelector('.vocab-pathway-card')));
await measure('return-home','[data-action="back-units"]',()=>Boolean(document.querySelector('.vocab-unit-card')));
await measure('cached-unit','.vocab-unit-card[data-unit="1"]',()=>Boolean(document.querySelector('.vocab-pathway-card')));
const stageText=await page.locator('.vocab-pathway-card[data-pathway="context"]').innerText();
return {cpu,net,errors,results,stageText};
}finally{await browser.close();server.close();}
}
