import test from 'node:test';
import assert from 'node:assert/strict';
import { findChromium, loadPlaywright, serve } from './helpers/pathway-geometry-harness.mjs';

const executablePath=await findChromium();
const playwright=loadPlaywright();
const browserTest=executablePath && playwright ? test : test.skip;

// Drives the real app and its authentication UI gates with a synthetic session.
// Database permissions are tested separately against isolated PostgreSQL.
function fixture(role, active, reset) {
  let user={ id:'fixture-user', role, display_name:'Fixture teacher', active, must_change_password:reset };
  let failEvidence=false, deferred=null, authChange=null;
  const learners=[['a','Alex Fixture','00123'],['b','Bela Fixture','00456']];
  const classes=[{id:'assigned',class_name:'Assigned class',merit_pathways_required:2},
    {id:'empty',class_name:'Empty assigned class',merit_pathways_required:2}];
  const roster=learners.map(([id,name])=>({record_type:'student',payload:{
    student_id:id,display_name:name,class_id:'assigned',class_name:'Assigned class'
  }}));
  window.progressFixture={
    failures(value){failEvidence=value;},
    hold(){let release;deferred=new Promise(resolve=>{release=resolve});this.release=release;},
    signOut(){user=null;authChange?.('SIGNED_OUT');},
    queries:0
  };
  const client={
    auth:{
      getUser:async()=>({data:{user}}),
      onAuthStateChange(callback){authChange=callback;},
      signOut:async()=>window.progressFixture.signOut()
    },
    from(table){return query(table);},
    rpc(){return query('rpc');}
  };
  function query(table) {
    let columns='', params={};
    const q={
      select(value){columns=value;return q;},
      eq(){return q;}, is(){return q;}, order(){return q;},
      in(key,value){params[key]=value;return q;},
      lt(){return q;}, lte(){return q;}, gte(){return q;},
      then(resolve,reject){return execute().then(resolve,reject);},
      single(){return execute();}, range(){return execute();}
    };
    async function execute() {
      let data=[];
      if(table==='profiles') data=columns.includes('display_name')?user:learners.map(([id,,number])=>({id,school_email:number+'@example.invalid'}));
      if(table==='classes') data=classes;
      if(table==='rpc'){
        window.progressFixture.queries++;
        data=params.record_type?.includes('student') ? roster : [];
      }
      if(table==='student_class_memberships') data=learners.map(([student_id])=>({student_id,class_id:'assigned',started_at:'2026-01-01T00:00:00Z'}));
      if(table==='activity_events'){
        await deferred;
        if(failEvidence) return {error:{message:'Fixture unavailable'}};
        data=[{id:'fixture-event',user_id:'a',class_id:'assigned',app_key:'reading',
          event_type:'question_attempt',occurred_at:new Date(Date.now()-1000).toISOString()}];
      }
      return {data,error:null,count:Array.isArray(data)?data.length:null};
    }
    return q;
  }
  return client;
}

browserTest('staff flows preserve controls, dates, sorting and navigation at desktop, tablet and mobile widths', async()=>{
  const {server,origin}=await serve(process.cwd());
  let browser;
  try {
    browser=await playwright.chromium.launch({executablePath});
    for(const width of [1440,820,390]){
      const page=await browser.newPage({viewport:{width,height:900}});
      page.setDefaultTimeout(7000);
      try {
        await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'text/javascript',
          body:`const client=(${fixture})('teacher',true,false); export async function getSupabaseClient(){return client;}`}));
        await page.goto(origin);
        await page.getByRole('button',{name:'Student Progress',exact:true}).click();
        await page.getByRole('button',{name:'Empty assigned class'}).click();
        await page.getByText('No enrolled students.').waitFor();
        await page.getByRole('button',{name:'‹ All classes'}).click();
        await page.getByRole('button',{name:'Assigned class',exact:false}).filter({hasText:/^Assigned class/}).first().click();
        await page.getByRole('button',{name:'Students',exact:true}).click();
        const search=page.getByLabel('Search students');
        await search.pressSequentially('123');
        await page.getByRole('button',{name:'Alex Fixture'}).waitFor();
        assert.equal(await page.getByRole('button',{name:'Bela Fixture'}).count(),0);
        await page.locator('[data-sp-sort]').selectOption('days');
        assert.equal(await search.inputValue(),'123');
        await search.fill('');
        assert.equal(await page.locator('.sp-table tbody tr').count(),2);
        await page.getByRole('button',{name:'Learning areas',exact:true}).click();
        assert.equal(await page.locator('.sp-module-grid article').count(),7);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        await page.getByLabel('Reporting period').selectOption('custom');
        await page.getByLabel('From',{exact:true}).fill('2026-11-24');
        await page.getByLabel('To',{exact:true}).fill('2026-11-26');
        await page.getByRole('button',{name:'Apply dates'}).click();
        await page.getByRole('button',{name:'Learning areas',exact:true}).waitFor();
        assert.equal(await page.getByLabel('From',{exact:true}).inputValue(),'2026-11-24');

        if(width===1440) {
          await page.evaluate(()=>window.progressFixture.failures(true));
          await page.getByRole('button',{name:'Refresh'}).click();
          await page.getByText('Unavailable / 2',{exact:true}).first().waitFor();
          await page.evaluate(()=>{window.progressFixture.failures(false);window.progressFixture.hold();});
          await page.getByRole('button',{name:'Refresh'}).click();
          await page.getByText('Refreshing… showing the previous snapshot.').waitFor();
          await page.getByRole('button',{name:'‹ All classes'}).click();
          await page.getByRole('button',{name:'‹ Back to Hub'}).click();
          await page.evaluate(()=>window.progressFixture.release());
          await page.waitForFunction(()=>!!document.querySelector('[data-action="student-progress"]'));
          assert.equal(await page.locator('.sp-shell').count(),0);
        }
      } finally { await page.close(); }
    }
    for(const [role,active,reset] of [['student',true,false],['teacher',false,false],['teacher',true,true]]){
      const page=await browser.newPage();
      page.setDefaultTimeout(7000);
      try {
        await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'text/javascript',
          body:`const client=(${fixture})(${JSON.stringify(role)},${active},${reset}); export async function getSupabaseClient(){return client;}`}));
        await page.goto(origin);
        await page.locator('#app .loading').waitFor({state:'hidden'});
        assert.equal(await page.locator('[data-action="student-progress"]').count(),0);
        assert.equal(await page.evaluate(()=>window.progressFixture.queries),0);
      } finally {await page.close();}
    }
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
