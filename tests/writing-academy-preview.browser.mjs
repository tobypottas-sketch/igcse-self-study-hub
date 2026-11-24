import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';
const screenshotDir = process.env.WRITING_SCREENSHOT_DIR || '.';
await mkdir(screenshotDir, {recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
const exam = '0511 · Paper 1 Exercise 6 · 120–160 words · Content /6 · Language /9';

async function checkArtwork(page, placement, name) {
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
 assert.ok(Math.abs(info.width/info.height - 1.5) < .03,JSON.stringify(info));
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
  assert.match(await page.locator('.wa-stage-progress').innerText(),/1 of 5/);
  await page.getByText('Review blueprint & exam checklist',{exact:true}).click();
  assert.match(await page.locator('.wa-exam-reference').innerText(),/why you visited/);
  await page.getByText('Review blueprint & exam checklist',{exact:true}).click();
  await page.getByRole('button',{name:/02 · Explore/}).press('Enter');
  assert.ok(await page.locator('.wa-stage-title').evaluate(node=>node===document.activeElement));
  await captureStage(page,'Explore','stage-explore',width,height);
  await page.locator('#wa-model-select').selectOption('1');
  assert.equal(await page.locator('.wa-model-text').count(),1);
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
  await page.getByRole('button',{name:'Bronze',exact:true}).click();
  assert.equal(await page.locator('.wa-plan-card').count(),5);
  await page.locator('#wa-note-reason').fill('To celebrate with friends');
  await capture(page,'studio-plan',width,height);
  await page.getByRole('button',{name:'Continue to Write →'}).click();
  const original=Array(120).fill('word').join(' ');await page.locator('#wa-answer-editor').fill(original);
  assert.match(await page.locator('.wa-count').innerText(),/120 words.*Within target/);
  assert.ok(await page.locator('.wa-brief').isVisible());
  assert.equal(await page.locator('.wa-word-meter').getAttribute('data-status'),'within');
  await page.getByRole('button',{name:'Focus mode',exact:true}).click();
  assert.equal(await page.locator('.wa-workspace-sidebar').isVisible(),false);
  await page.getByRole('button',{name:'Exit focus mode',exact:true}).click();
  await capture(page,'studio-write',width,height);
  await page.getByRole('button',{name:'Review my writing →'}).click();
  await page.getByRole('button',{name:'Revise my writing →'}).click();
  await page.locator('#wa-answer-editor').fill(original+' revised');
  await page.getByRole('button',{name:'Gold',exact:true}).click();
  assert.equal(await page.locator('#wa-answer-editor').inputValue(),original+' revised');
  await page.reload();await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  await page.locator('#wa-task').selectOption('review-community-sports');
  await page.getByRole('button',{name:'Write',exact:true}).click();
  assert.equal(await page.locator('#wa-answer-editor').inputValue(),original+' revised');
  await page.getByRole('button',{name:'Review my writing →'}).click();
  assert.match(await page.locator('.wa-compare').innerText(),/Original draft/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await capture(page,'studio',width,height);
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
