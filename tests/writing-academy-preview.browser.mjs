import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';
const screenshotDir = process.env.WRITING_SCREENSHOT_DIR || '.';
await mkdir(screenshotDir, {recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
const exam = '0511 · Paper 1 Exercise 6 · 120–160 words · Content /6 · Language /9';

async function checkArtwork(page, placement, name, ratio = 1.5) {
 const art = page.locator('.wa-art--'+placement);
 await art.scrollIntoViewIfNeeded();
 const info = await art.evaluate(async img => {
  await img.decode();
  const {width,height} = img.getBoundingClientRect();
  const source = new URL(img.currentSrc).pathname.split('/').pop();
  return {source,width,height,fit:getComputedStyle(img).objectFit,intrinsicWidth:img.naturalWidth};
 });
 assert.match(info.source,new RegExp('^'+name+'-\\d+\\.webp$'));
 assert.ok(info.intrinsicWidth > 0);
 assert.ok(Math.abs(info.width/info.height - ratio) < .03,JSON.stringify(info));
 assert.equal(info.fit,'contain');
}

async function capture(page, name, width, height) {
 await page.evaluate(() => scrollTo(0,0));
 assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1),name+' overflow');
 await page.screenshot({path:join(screenshotDir,`writing-preview-${name}-${width}x${height}.png`),fullPage:true});
}

async function captureStage(page, stage, artwork, width, height) {
 assert.equal(await page.locator('.wa-stage-title').innerText(),stage);
 assert.equal(await page.locator('.wa-lesson-reference strong').innerText(),exam);
 assert.match(await page.locator('.wa-lesson-reference').innerText(),/Introduce → Describe → Evaluate → Recommend/);
 await checkArtwork(page,'stage',artwork);
 await capture(page,stage.toLowerCase(),width,height);
}
try{
 for(const [width,height,columns] of [[1440,900,3],[768,1024,2],[390,844,1],[1024,600,3]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.request().resourceType()==='image')errors.push(r.url()+' '+r.status());});
  await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getSupabaseClient(){return {auth:{onAuthStateChange(){}}}}'}));
  await page.route('**/src/auth.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getCurrentProfile(){return {id:"qa-staff",active:true,role:"teacher",must_change_password:false}}'}));
  await page.goto('http://127.0.0.1:8765/review-academy-preview.html');
  await page.locator('.wa-path').last().waitFor();
  assert.equal(await page.locator('.wa-path').count(),6);
  assert.equal(await page.locator('.wa-tool').count(),4);
  assert.equal(await page.locator('.wa-legacy-link').getAttribute('href'),'./review-writing.html');
  const layout=await page.evaluate(()=>({columns:getComputedStyle(document.querySelector('.wa-pathways')).gridTemplateColumns.split(' ').length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,scrollHeight:document.documentElement.scrollHeight}));
  assert.equal(layout.columns,columns,JSON.stringify(layout));
  assert.ok(layout.scrollWidth<=layout.viewport+1,JSON.stringify(layout));
  await page.locator('.wa-footer').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('.wa-footer').isVisible());
  assert.deepEqual(errors,[]);
  await checkArtwork(page,'hero','academy-hero');
  await checkArtwork(page,'card','structure-organisation');
  await capture(page,'home',width,height);
  await page.getByRole('button',{name:'Start pathway →'}).click();
  assert.equal(await page.locator('.wa-stage-body').count(),1);
  await checkArtwork(page,'banner','structure-organisation');
  await captureStage(page,'Discover','stage-discover',width,height);
  await page.getByRole('button',{name:/B · Last Friday/}).click();
  assert.match(await page.locator('.wa-stage-progress').innerText(),/0 of 5/);
  for(const n of [0,2,0,1]){await page.getByRole('button',{name:'Next challenge →'}).click();await page.locator('.wa-discovery .wa-options button').nth(n).click();}
  assert.match(await page.locator('.wa-stage-progress').innerText(),/1 of 5/);
  assert.equal(await page.locator('.wa-lesson-reference').evaluate(n=>getComputedStyle(n).position),'static');
  await page.getByText('Review blueprint & exam checklist',{exact:true}).click();
  assert.match(await page.locator('.wa-exam-reference').innerText(),/why you visited/);
  await page.getByText('Review blueprint & exam checklist',{exact:true}).click();
  await page.getByRole('button',{name:/02 · Explore/}).press('Enter');
  assert.ok(await page.locator('.wa-stage-title').evaluate(node=>node===document.activeElement));
  await captureStage(page,'Explore','stage-explore',width,height);
  await page.locator('#wa-model-select').selectOption('1');
  assert.equal(await page.locator('.wa-model-text').count(),1);
  await page.locator('.wa-phrase').first().click();
  assert.equal(await page.locator('.wa-phrase').first().getAttribute('aria-pressed'),'true');
  await page.locator('.wa-move-options').getByRole('button',{name:'Introduction',exact:true}).click();
  assert.match(await page.locator('.wa-answer').innerText(),/^Correct/);
  await page.getByRole('button',{name:'Next paragraph →'}).click();
  assert.match(await page.locator('.wa-model-text').innerText(),/grilled chicken/);
  await page.getByRole('button',{name:/03 · Practise/}).click();
  await page.getByRole('button',{name:'Bronze · Match purpose to paragraph'}).click();
  await captureStage(page,'Practise','stage-practise',width,height);
  await page.locator('.wa-options').getByRole('button',{name:'Introduction',exact:true}).click();
  await page.getByRole('button',{name:'Check answer'}).click();
  assert.match(await page.locator('.wa-question .wa-answer').innerText(),/^Correct/);
  await page.getByRole('button',{name:'Bronze · Sequence a review'}).click();
  for(const n of [2,1,3,0])await page.locator('.wa-options button').nth(n).click();
  await page.getByRole('button',{name:'Check answer'}).click();
  assert.match(await page.locator('.wa-question .wa-answer').innerText(),/^Correct/);
  await page.getByRole('button',{name:/04 · Apply/}).click();
  await page.locator('#wa-improvement').fill('The noodles were freshly cooked and the portion was generous.');
  await page.getByRole('button',{name:'Compare with an example'}).click();
  assert.match(await page.locator('.wa-answer').innerText(),/Different well-supported answers/);
  await page.getByRole('button',{name:/05 · Master/}).click();
  await page.getByRole('button',{name:/04 · Apply/}).click();
  assert.match(await page.locator('#wa-improvement').inputValue(),/noodles/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await captureStage(page,'Apply','stage-practise',width,height);
  assert.deepEqual(errors,[]);
  await page.getByRole('button',{name:/05 · Master/}).click();
  await captureStage(page,'Master','stage-master',width,height);
  await page.getByText('Apply it in your own review',{exact:true}).click();
  await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  const companion = page.locator('.wa-companion');
  if (await companion.getAttribute('open') === null) await companion.locator(':scope > summary').press('Enter');
  await page.locator('#wa-task').selectOption({index:0});
  await page.getByRole('button',{name:'Silver',exact:true}).press('Enter');
  assert.equal(await page.locator('#wa-note-reason').getAttribute('placeholder'),'');
  assert.equal(await page.locator('.wa-plan-card p').count(),5);
  await page.getByRole('button',{name:'Gold',exact:true}).press('Enter');
  assert.equal(await page.locator('.wa-plan-card p').count(),0);
  await page.getByRole('button',{name:'Bronze',exact:true}).press('Enter');
  assert.equal(await page.locator('.wa-plan-card').count(),5);
  assert.match(await page.locator('#wa-note-reason').getAttribute('placeholder'),/I went because/);
  for(const [field,note] of Object.entries({
   audience:'Students looking for a place to eat near school',
   reason:'To celebrate with friends',
   feature1:'Juicy grilled chicken and a generous portion of chips',
   feature2:'Noisy dining room made it hard to talk',
   recommendation:'Good for groups. Book a courtyard table for a quieter meal.'
  })) await page.locator('#wa-note-'+field).fill(note);
  await page.locator('.wa-brief summary').filter({hasText:'Full exam task'}).press('Enter');
  assert.ok(await page.locator('.wa-brief details[open] p').isVisible());
  await page.locator('.wa-brief summary').filter({hasText:'Full exam task'}).press('Enter');
  await checkArtwork(page,'studio-hero','studio-neon-focus',1);
  await checkArtwork(page,'studio-context','studio-creative-flow',1);
  if(width<700) await companion.locator(':scope > summary').click();
  if(width<=520){
   const tabs=await page.locator('.wa-workspace-tabs').boundingBox();
   const toolbar=await page.locator('.wa-workspace-toolbar').boundingBox();
   assert.equal(tabs.width,toolbar.width);
  }
  await capture(page,'studio-plan',width,height);
  await page.getByRole('button',{name:'Continue to Write →'}).press('Enter');
  assert.ok(await page.locator('.wa-workspace-heading').evaluate(node=>node===document.activeElement));
  const editor=page.locator('#wa-answer-editor');
  assert.equal(await editor.inputValue(),'');
  for(const [count,status] of [[119,'below'],[120,'within'],[160,'within'],[161,'above']]){
   await editor.fill('word '.repeat(count));
   assert.match(await page.locator('.wa-count').innerText(),new RegExp('^'+count+' words'));
   assert.equal(await page.locator('.wa-word-meter').getAttribute('data-status'),status);
  }
  const original=`I visited Willow Kitchen last Saturday to celebrate my friend’s birthday. We wanted somewhere relaxed where we could share a meal and talk.

The grilled chicken was juicy and came with a generous portion of chips. Our server brought everything at the same time, which made it easy to share. The dining room was noisy, though, and we sometimes had to repeat ourselves.

I would recommend Willow Kitchen to groups of friends who want a lively meal at a reasonable price. If you prefer a quieter setting, ask for a table in the courtyard. The food was worth a second visit, and next time I would try to book an outdoor table before going. It is only a five-minute walk from the school gate.`;
  await editor.fill(original);
  await page.getByRole('button',{name:'Focus mode',exact:true}).press('Enter');
  assert.equal(await companion.isVisible(),false);
  await page.locator('.wa-focus-brief summary').press('Enter');
  assert.ok(await page.locator('.wa-focus-brief p').isVisible());
  await page.getByRole('button',{name:'Exit focus mode',exact:true}).press('Enter');
  await editor.evaluate(node=>{node.scrollTop=0;});
  await capture(page,'studio-write',width,height);
  await page.getByRole('button',{name:'Review my writing →'}).click();
  await page.getByRole('button',{name:'Revise my writing →'}).click();
  const revised=original.replace('was noisy, though','echoed whenever a large group arrived');
  await editor.fill(revised);
  if(width<700) await companion.locator(':scope > summary').click();
  await page.locator('#wa-task').selectOption('review-community-sports');
  assert.equal(await page.locator('#wa-note-reason').inputValue(),'');
  await page.locator('#wa-task').selectOption({index:0});
  assert.equal(await editor.inputValue(),revised);
  await page.reload();
  await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  if(width<700) await companion.locator(':scope > summary').click();
  await page.getByRole('button',{name:'Write',exact:true}).click();
  assert.equal(await editor.inputValue(),revised);
  await page.getByText('My planning notes',{exact:true}).click();
  assert.match(await companion.innerText(),/To celebrate with friends/);
  await page.getByRole('button',{name:'Review my writing →'}).click();
  assert.deepEqual(await page.locator('.wa-revision-card p').allTextContents(),[original,revised]);
  assert.equal(await page.locator('.wa-check input').count(),4);
  await checkArtwork(page,'studio-context','studio-creative-flow',1);
  if(width<700) await companion.locator(':scope > summary').click();
  await capture(page,'studio-review',width,height);
  await page.getByText('Manage draft',{exact:true}).click();
  const clear=page.getByRole('button',{name:/Clear this task/});
  page.once('dialog',dialog=>dialog.dismiss());
  await clear.click();
  assert.deepEqual(await page.locator('.wa-revision-card p').allTextContents(),[original,revised]);
  page.once('dialog',dialog=>dialog.accept());
  await clear.click();
  assert.equal(await page.locator('#wa-note-reason').inputValue(),'');
  await page.getByRole('button',{name:'Write',exact:true}).click();
  assert.equal(await editor.inputValue(),'');
  assert.deepEqual(errors,[]);
  console.log(width,height,layout);
  await page.close();
 }
 for (const profile of [null,{active:true,role:'student'},{active:false,role:'teacher'},{active:true,role:'admin',must_change_password:true}]) {
  const denied=await browser.newPage();
  await denied.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getSupabaseClient(){return {auth:{onAuthStateChange(){}}}}'}));
  await denied.route('**/src/auth.js',route=>route.fulfill({contentType:'application/javascript',body:`export async function getCurrentProfile(){return ${JSON.stringify(profile)}}`}));
  await denied.route('http://127.0.0.1:8765/',route=>route.fulfill({body:'Hub'}));
  await denied.goto('http://127.0.0.1:8765/review-academy-preview.html');
  await denied.waitForURL('http://127.0.0.1:8765/');
  assert.equal(await denied.locator('.wa-path').count(),0);
  await denied.close();
 }
}finally{await browser.close();}
