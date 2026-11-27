import {structureR1} from '../src/writing/content/review-structure-r1.js';
import {structureDiscover,structureExplore} from '../src/writing/content/review-structure-recognition.js';
import {exam,examModels} from '../src/writing/content/review-exam.js';
import {editing,editingModels} from '../src/writing/content/review-editing.js';
import {cohesion} from '../src/writing/content/review-cohesion.js';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {pathways} from '../src/writing/content/review-pedagogy.js';
const screenshotDir = process.env.WRITING_SCREENSHOT_DIR || '.';
await mkdir(screenshotDir, {recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
const expressionRatio = 1672 / 941;

async function checkArtwork(host, placement, name, ratio = 1.5) {
 const art = host.locator('.wa-art--'+placement);
 await art.scrollIntoViewIfNeeded();
 const info = await art.evaluate(async img => {
  await img.decode();
  const {width,height} = img.getBoundingClientRect();
  const source = new URL(img.currentSrc).pathname.split('/').pop();
  const style = getComputedStyle(img);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  return {source,width,height,ratio:(width-paddingX)/(height-paddingY),fit:style.objectFit,intrinsicWidth:img.naturalWidth};
 });
 assert.match(info.source,new RegExp('^'+name+'-\\d+\\.webp$'));
 assert.ok(info.intrinsicWidth > 0);
 assert.ok(Math.abs((ratio === expressionRatio ? info.ratio : info.width/info.height) - ratio) < .03,JSON.stringify(info));
 assert.equal(info.fit,'contain');
}

const homeCardArtwork = {
 structure:'structure-organisation',
 expression:'expression-card',
 development:'idea-development-banner',
 cohesion:'grammar-cohesion-card',
 editing:'editing-improvement-card',
 exam:'exam-mastery-card'
};

async function checkHomeCardArtwork(page) {
 for (const [pathway, name] of Object.entries(homeCardArtwork)) {
  await checkArtwork(page.locator('.wa-path.wa-'+pathway),'card',name);
 }
 assert.equal(await page.locator('.wa-card-top .wa-motif').count(),0);
 assert.equal(await page.locator('#writingAcademy').getAttribute('aria-busy'),'false');
}

async function capture(page, name, width, height) {
 await page.evaluate(() => scrollTo(0,0));
 assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1),name+' overflow');
 await page.screenshot({path:join(screenshotDir,`writing-preview-${name}-${width}x${height}.png`),fullPage:true});
}

async function captureStage(page, stage, artwork, width, height, expression = false) {
 assert.equal(await page.locator('.wa-stage-title').innerText(),stage);
 const colours=await page.locator('.wa-stage-tab').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));
 assert.deepEqual(colours,['rgb(8, 118, 110)','rgb(121, 83, 199)','rgb(245, 179, 53)','rgb(168, 63, 41)','rgb(20, 45, 72)']);
 const contrast=await page.locator('.wa-stage-tab[aria-current=step]').evaluate(n=>{
  const s=getComputedStyle(n);const rgb=v=>v.match(/[\d.]+/g).map(Number);const lum=a=>a.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
  const bg=rgb(s.backgroundColor),fg=rgb(s.color);if(bg.length===4&&bg[3]!==1)return 0;const l=[lum(bg),lum(fg)].sort((a,b)=>b-a);return (l[0]+.05)/(l[1]+.05);
 });assert.ok(contrast>=4.5,stage+' active tab contrast '+contrast);
 assert.equal(await page.locator('.wa-lesson-reference strong').innerText(),'Paper 1 · Exercise 6');
 assert.deepEqual(await page.locator('.wa-reference-fact b').allTextContents(),['120–160','6','9']);
 await checkArtwork(page,'stage',artwork,expression ? expressionRatio : 1.5);
 const companion=await page.locator('.wa-learning-companion').evaluate(n=>{
 const image=n.querySelector('.wa-art--stage').getBoundingClientRect(),guide=n.querySelector('.wa-companion-guide').getBoundingClientRect(),side=n.getBoundingClientRect();
 return {stacked:guide.top>=image.bottom,centered:Math.abs((image.left+image.right)/2-(guide.left+guide.right)/2)<2,width:image.width,sideWidth:side.width,contained:image.left>=side.left-1&&image.right<=side.right+1};
 });assert.ok(companion.stacked&&companion.centered&&companion.contained&&companion.width>=Math.min(240,companion.sideWidth)-2,JSON.stringify(companion));
 await capture(page,expression ? artwork : stage.toLowerCase(),width,height);
}
async function checkBlueprint(page) {
 const summary=page.locator('.wa-lesson-reference .wa-reference-disclosure > summary');
 await summary.click();
 assert.deepEqual(await page.locator('.wa-lesson-reference .wa-reference-move h4').allTextContents(),
  ['Introduce','Describe','Evaluate','Recommend']);
 assert.ok(await page.getByText('Before you finish',{exact:true}).isVisible());
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await summary.click();
}
async function workshop(page, task) {
 const reveal=page.getByRole('button',{name:/Compare with an example/});
 await reveal.click();
 assert.equal(await page.locator('.wa-apply-model').count(),0);
 const draft=page.locator('.wa-apply-editor textarea');
 await draft.fill(task.example);
 await reveal.click();
 assert.equal(await draft.getAttribute('readonly'),'');
 const revision=page.getByRole('textbox',{name:'Revise your response'});
 assert.equal(await revision.inputValue(),task.example);
 const revised=task.example+' I would share this advice with other students.';
 await revision.fill(revised);
 for(const check of await page.locator('.wa-apply-check input').all())await check.check();
 assert.match(await page.locator('.wa-apply-comparison .wa-answer').innerText(),/Writing and reflection complete/);
 return revised;
}

async function finishAnalysis(page, item) {
 await page.locator('.wa-master-question [data-option="'+item.answer+'"]').click();
 await page.getByRole('button',{name:'Check answer'}).click();
 assert.equal(await page.locator('.wa-master-question .wa-answer').getAttribute('data-result'),'correct');
 await page.getByRole('button',{name:'Finish analysis'}).click();
 assert.equal(await page.locator('.wa-stage-tab[data-stage=master]').getAttribute('data-complete'),'false');
}

async function checkR21Development(page){
 const quiz=page.locator('.wa-practise-question');
 const expected=new Map([
  ['Which advice uses today’s service time to help students decide whether to go?', [/seven minutes is enough/, /leaves seven minutes/]],
  ['Which evaluation explains what these beginners gain and what they give up?', [/only ten minutes to practise/, /ten minutes at the bench/]],
  ['Which recommendation weighs both points for this club?', [/Give it a try/, /club can accept/]]
 ]);
 await page.locator('.wa-stage-tab[data-stage=practise]').click();
 for(const name of [/Explain the impact/,/Weigh a strength and drawback/]){
  await page.getByRole('button',{name}).click();
  for(let i=0;i<4;i++){
   const question=await quiz.locator('.wa-question-prompt').innerText();
   const match=expected.get(question);
   if(match){
    assert.ok(await quiz.locator('.wa-question-source').isVisible());
    await quiz.getByRole('button',{name:match[0]}).click();
   }else await quiz.locator('.wa-option').first().click();
   await quiz.getByRole('button',{name:'Check answer'}).click();
   if(match){
    assert.equal(await quiz.locator('.wa-answer').getAttribute('data-result'),'correct');
    assert.match(await quiz.locator('.wa-answer').innerText(),match[1]);
    expected.delete(question);
   }
   await quiz.getByRole('button',{name:/Next question|Finish analysis/}).click();
  }
 }
 assert.equal(expected.size,0);
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
  const structureCard=page.locator('.wa-path.wa-structure');
  const expressionCard=page.locator('.wa-path.wa-expression');
  await checkHomeCardArtwork(page);
  await capture(page,'home',width,height);
  await expressionCard.getByRole('button',{name:'Start pathway →'}).click();
  await checkArtwork(page,'banner','vocabulary-expression',expressionRatio);
  await checkBlueprint(page);
  const vocabulary=page.locator('.wa-discovery');
  await vocabulary.getByRole('button',{name:'Next contrast',exact:false}).click();
  await vocabulary.getByRole('button',{name:'Next contrast',exact:false}).click();
  assert.match(await vocabulary.locator('.wa-question-prompt').innerText(),/Which detail do both versions give/);
  await vocabulary.locator('[data-option-id="frequency-v2"]').click();
  await vocabulary.getByRole('button',{name:'Check answer'}).click();
  assert.match(await vocabulary.locator('.wa-answer').innerText(),/Try another answer/);
  await vocabulary.locator('[data-option-id="time-v2"]').click();
  await vocabulary.getByRole('button',{name:'Check answer'}).click();
  assert.match(await vocabulary.locator('.wa-answer').innerText(),/Correct after a retry/);
  await capture(page,'r21-vocabulary-discover',width,height);
  const tabs=page.locator('.wa-stage-tab');
  const navigation=page.locator('.wa-stage-nav');
  for (const [index,stage] of ['Discover','Explore','Practise','Apply','Master'].entries()) {
   if(index>0){
    await navigation.scrollIntoViewIfNeeded();
    const top=await navigation.evaluate(n=>n.getBoundingClientRect().top);
    await tabs.nth(index).click();
    const nextTop=await navigation.evaluate(n=>n.getBoundingClientRect().top);
    assert.ok(Math.abs(top-nextTop)<=1,stage+' moved the stage navigation');
   }
   await captureStage(page,stage,'expression-'+stage.toLowerCase(),width,height,true);
  }
  const go = stage => page.locator('.wa-stage-tab[data-stage="'+stage+'"]').press('Enter');
  await go('practise');
  await page.getByRole('button',{name:/Rewrite the cinema review/}).click();
  const expressionFirst=await workshop(page,pathways.expression.gold[0]);
  await page.getByRole('button',{name:'Next Gold task →'}).press('Enter');
  await workshop(page,pathways.expression.gold[1]);
  await page.getByRole('button',{name:'← Previous Gold task'}).press('Enter');
  assert.equal(await page.getByRole('textbox',{name:'Revise your response'}).inputValue(),expressionFirst);
  await capture(page,'expression-gold-revision',width,height);

  await page.getByRole('button',{name:'← All pathways'}).click();
  await page.locator('.wa-path.wa-development').getByRole('button',{name:'Start pathway →'}).click();
  await checkArtwork(page,'banner','idea-development-banner',3);
  await checkBlueprint(page);
  const developmentStages = ['discover','explore','practise','apply','master'];
  for (const stage of developmentStages) {
   if (stage !== 'discover') await go(stage);
   assert.equal(await page.locator('.wa-stage-tab[aria-current=step]').getAttribute('data-stage'),stage);
   await checkArtwork(page,'stage','idea-development-'+stage,4/3);
   await capture(page,'development-'+stage,width,height);
  }
  await go('explore');
  await page.locator('.wa-explore-question textarea').fill('The writer gives readers a detail to explain what happened during the visit.');
  await page.getByRole('button',{name:'Compare with the editor’s note'}).click();
  await page.locator('.wa-phrase').first().press('Enter');
  assert.equal(await page.locator('.wa-phrase').first().getAttribute('aria-pressed'),'true');
  await capture(page,'development-editorial-note',width,height);
  await go('practise');
  await page.getByRole('button',{name:/Develop and justify a verdict/}).click();
  await workshop(page,pathways.development.gold[0]);
  await page.getByRole('button',{name:'Next Gold task →'}).press('Enter');
  await workshop(page,pathways.development.gold[1]);
  await go('master');
  await checkR21Development(page);
  await go('master');
  assert.match(await page.locator('.wa-master-question .wa-question-source').innerText(),/5:15 to 5:40/);
  await finishAnalysis(page,pathways.development.analysis);
  assert.match(await page.locator('.wa-master-question .wa-score').innerText(),/^1 \/ 1/);
  await workshop(page,pathways.development.master);
  assert.equal(await page.locator('.wa-stage-tab[data-stage=master]').getAttribute('data-complete'),'true');
  await capture(page,'development-master-revision',width,height);

  await page.getByRole('button',{name:'← All pathways'}).click();
  await structureCard.getByRole('button',{name:'Start pathway →'}).click();
  assert.equal(await page.locator('.wa-discovery textarea').count(),0);
  assert.equal(await page.locator('.wa-stage-body').count(),1);
  await checkArtwork(page,'banner','structure-organisation');
  await captureStage(page,'Discover','stage-discover',width,height);
  for(const [index,item] of structureDiscover.entries()){
   const check=page.getByRole('button',{name:'Check answer',exact:true});
   assert.ok(await check.isDisabled());
   if(index===0){
    await page.locator('[data-option-id="first"]').press('Enter');
    await check.press('Enter');
    const feedback=page.locator('.wa-recognition-feedback');
    assert.match(await feedback.innerText(),/Try another answer/);
    assert.match(await feedback.innerText(),/opinions about queues/);
    assert.doesNotMatch(await feedback.innerText(),/Best answer/);
    assert.equal(await page.locator('.wa-stage-tab[data-stage=discover]').getAttribute('data-complete'),'false');
    await capture(page,'structure-discover-retry',width,height);
   }
   const choices=index===2?item.optionIds.filter((_,n)=>n!==item.answer):[item.optionIds[item.answer]];
   for(const key of choices){
    await page.locator('[data-option-id="'+key+'"]').click();
    await check.click();
   }
   assert.match(await page.locator('.wa-recognition-feedback').innerText(),
    [/Correct after a retry/,/Correct on your first try/,/Completed with an explanation/][index]);
   if(index<2)await page.getByRole('button',{name:'Next contrast →'}).click();
  }
  await page.locator('.wa-stage-tab[data-stage=discover][data-complete=true]').waitFor();
  assert.equal(await page.locator('.wa-lesson-reference').evaluate(n=>getComputedStyle(n).position),'static');
  await checkBlueprint(page);
  await go('explore');
  assert.ok(await page.locator('.wa-stage-title').evaluate(node=>node===document.activeElement));
  if(width===390){
   const fillsColumn=await page.locator('.wa-stage-body').evaluate(body=>{
    const style=getComputedStyle(body);
    const contentWidth=body.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
    return body.querySelector('.wa-stage-activity').clientWidth>=contentWidth-2;
   });
   assert.ok(fillsColumn,'Explore should use the full activity column on a phone');
  }
  await captureStage(page,'Explore','stage-explore',width,height);
  await page.locator('.wa-explore-picker-trigger').click();
  await page.getByRole('button',{name:/Willow Kitchen/}).click();
  assert.equal(await page.locator('.wa-model-text').count(),1);
  assert.equal(await page.locator('.wa-explore-question textarea').count(),0);
  await page.locator('.wa-phrase').first().press('Enter');
  assert.equal(await page.locator('.wa-phrase').first().getAttribute('aria-pressed'),'true');
  for(const [modelIndex,items] of Object.values(structureExplore).entries()){
   await page.locator('.wa-explore-picker-trigger').click();
   await page.locator('.wa-explore-model-choice').nth(modelIndex).click();
   for(const [index,item] of items.entries()){
    assert.equal(await page.locator('.wa-explore-question h3').innerText(),item.prompt);
    await page.locator('[data-option-id="'+item.optionIds[item.answer]+'"]').click();
    await page.getByRole('button',{name:'Check answer',exact:true}).click();
    assert.match(await page.locator('.wa-recognition-feedback').innerText(),/Correct on your first try/);
    if(index<items.length-1)await page.getByRole('button',{name:'Next paragraph →'}).click();
   }
   await page.getByRole('button',{name:'Previous paragraph'}).click();
   assert.match(await page.locator('.wa-recognition-feedback').innerText(),/Correct on your first try/);
   await page.getByText('Read complete model',{exact:true}).click();
   assert.equal(await page.locator('.wa-explore-full-prose:visible').count(),items.length);
  }
  await page.locator('.wa-stage-tab[data-stage=explore][data-complete=true]').waitFor();
  await capture(page,'structure-explore-feedback',width,height);
  await go('practise');
  await page.getByRole('button',{name:/Match details to the main idea/}).click();
  await captureStage(page,'Practise','stage-practise',width,height);
  const orderBefore=await page.locator('.wa-option').evaluateAll(nodes=>nodes.map(node=>node.dataset.option));
  await page.locator('.wa-option[data-option="0"]').click();
  assert.deepEqual(await page.locator('.wa-option').evaluateAll(nodes=>nodes.map(node=>node.dataset.option)),orderBefore);
  await page.getByRole('button',{name:'Check answer'}).click();
  assert.equal(await page.locator('.wa-question .wa-answer').getAttribute('data-result'),'retry');
  await page.getByRole('button',{name:/Put the sentences in order/}).click();
  const first=structureR1.practice[1].items[0];
  await page.locator('.wa-option[data-option="'+first.answer[0]+'"]').press('Enter');
  await page.getByRole('button',{name:'Undo last selection'}).press('Enter');
  for(const index of first.answer)await page.locator('.wa-option[data-option="'+index+'"]').press('Enter');
  await page.getByRole('button',{name:'Check answer'}).press('Enter');
  assert.equal(await page.locator('.wa-question .wa-answer').getAttribute('data-result'),'correct');
  await capture(page,'structure-order-feedback',width,height);
  await page.getByRole('button',{name:/Group details in a hall review/}).click();
  await workshop(page,structureR1.gold[0]);
  await page.getByRole('button',{name:'Next Gold task →'}).press('Enter');
  await workshop(page,structureR1.gold[1]);
  if(width===1440){
   for(const challenge of structureR1.practice){
    await page.locator('.wa-practise-card').filter({hasText:challenge.title}).click();
    for(const item of challenge.items){
     const check=page.getByRole('button',{name:'Check answer',exact:true});
     if(await check.isVisible()){
      for(const option of [item.answer].flat())await page.locator('[data-option="'+option+'"]').click();
      await check.click();
      assert.equal(await page.locator('.wa-practise-question .wa-answer').getAttribute('data-result'),'correct');
     }
     await page.getByRole('button',{name:/^(Next question|Finish analysis)$/}).click();
    }
   }
   await page.locator('.wa-stage-tab[data-stage=practise][data-complete=true]').waitFor();
  }
  await go('apply');
  const applied=await workshop(page,structureR1.apply[0]);
  await go('master');
  await go('apply');
  assert.equal(await page.getByRole('textbox',{name:'Revise your response'}).inputValue(),applied);
  await captureStage(page,'Apply','stage-practise',width,height);
  if(width===1440){
   for(const task of structureR1.apply.slice(1)){
    await page.getByRole('button',{name:'Next task →'}).click();
    await workshop(page,task);
   }
   await page.locator('.wa-stage-tab[data-stage=apply][data-complete=true]').waitFor();
  }
  await go('master');
  await captureStage(page,'Master','stage-master',width,height);
  await finishAnalysis(page,structureR1.analysis);
  await workshop(page,structureR1.master);
  if(width===1440)assert.match(await page.locator('.wa-stage-progress').innerText(),/^5 of 5 stages completed/);
  await page.getByText('Write a full review in Writing Studio',{exact:true}).click();
  await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  const companion = page.locator('.wa-companion');
  if (await companion.getAttribute('open') === null) await companion.locator(':scope > summary').press('Enter');
  await page.locator('#wa-task').selectOption({index:0});
  await page.getByRole('button',{name:'Silver',exact:true}).press('Enter');
  assert.equal(await page.locator('#wa-note-reason').getAttribute('placeholder'),'');
  assert.equal(await page.locator('.wa-plan-card p').count(),5);
  await page.getByRole('button',{name:'Gold',exact:true}).press('Enter');
  assert.equal(await page.locator('.wa-plan-guidance[aria-hidden=true]').count(),5);
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
  await page.locator('.wa-studio-resource > summary').filter({hasText:'Full exam task'}).press('Enter');
  assert.ok(await page.locator('.wa-studio-resource[open]').filter({hasText:'Full exam task'}).locator('p').isVisible());
  await page.locator('.wa-studio-resource > summary').filter({hasText:'Full exam task'}).press('Enter');
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
  await page.getByRole('button',{name:'Focus',exact:true}).press('Enter');
  assert.equal(await companion.isVisible(),false);
  await page.getByRole('button',{name:'Exam task',exact:true}).press('Enter');
  assert.ok(await page.locator('.wa-write-quick-reference section:not([hidden])').isVisible());
  await page.getByRole('button',{name:'Exit focus',exact:true}).press('Enter');
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
  await page.getByRole('button',{name:/02\s*Write/}).click();
  assert.equal(await editor.inputValue(),revised);
  await page.getByText('My planning notes',{exact:true}).click();
  assert.match(await companion.innerText(),/To celebrate with friends/);
  await page.getByRole('button',{name:'Review my writing →'}).click();
  assert.equal(await page.locator('.wa-review-prose').textContent(),revised);
  await page.getByRole('button',{name:'Original',exact:true}).click();
  assert.equal(await page.locator('.wa-review-prose').textContent(),original);
  await page.getByRole('button',{name:'Revised',exact:true}).click();
  assert.equal(await page.locator('.wa-quick-check input').count(),6);
  await checkArtwork(page,'studio-context','studio-creative-flow',1);
  if(width<700) await companion.locator(':scope > summary').click();
  await capture(page,'studio-review',width,height);
  await page.getByText('Manage draft',{exact:true}).click();
  const clear=page.getByRole('button',{name:/Clear this task/});
  page.once('dialog',dialog=>dialog.dismiss());
  await clear.click();
  assert.equal(await page.locator('.wa-review-prose').textContent(),revised);
  page.once('dialog',dialog=>dialog.accept());
  await clear.click();
  assert.equal(await page.locator('#wa-note-reason').inputValue(),'');
  await page.getByRole('button',{name:/02\s*Write/}).click();
  assert.equal(await editor.inputValue(),'');
  assert.deepEqual(errors,[]);
  await page.reload();
  const cohesionCard=page.locator('.wa-path.wa-cohesion');
  await cohesionCard.getByRole('button',{name:'Start pathway →'}).press('Enter');
  await checkArtwork(page,'banner','grammar-cohesion-banner');
  await checkBlueprint(page);
  await page.getByRole('button',{name:'Check what changed'}).click();
  assert.match(await page.locator('.wa-discovery .wa-answer').innerText(),/three words/);
  for(let index=0;index<5;index++){
   await page.locator('.wa-discovery textarea').fill('The new version makes the connection clearer.');
   await page.getByRole('button',{name:'Check what changed'}).press('Enter');
   assert.equal(await page.locator('.wa-discovery textarea').getAttribute('readonly'),'');
   if(index<4)await page.getByRole('button',{name:'Next contrast →'}).press('Enter');
  }
  assert.equal(await page.locator('.wa-stage-tab[data-stage=discover]').getAttribute('data-complete'),'true');
  await checkArtwork(page,'stage','grammar-cohesion-discover');
  await capture(page,'cohesion-discover',width,height);
  const cohesionNav=page.locator('.wa-stage-nav');
  await cohesionNav.scrollIntoViewIfNeeded();
  const navTop=await cohesionNav.evaluate(node=>node.getBoundingClientRect().top);
  await go('explore');
  assert.ok(Math.abs(navTop-await cohesionNav.evaluate(node=>node.getBoundingClientRect().top))<=1);
  await checkArtwork(page,'stage','grammar-cohesion-explore');
  await page.locator('.wa-explore-picker-trigger').press('Enter');
  assert.equal(await page.locator('.wa-explore-model-choice').count(),8);
  await page.getByRole('button',{name:/Beyond the Stars/}).click();
  await page.getByRole('button',{name:'Next paragraph →'}).click();
  await page.getByRole('button',{name:'Next paragraph →'}).click();
  await page.getByRole('button',{name:'Next paragraph →'}).click();
  const target=page.locator('.wa-explore-sentence').filter({hasText:'Anyone expecting constant action'});
  assert.equal(await target.getAttribute('aria-disabled'),'true');
  await page.locator('.wa-explore-question textarea').fill('However, anyone expecting constant action might prefer something faster.');
  await page.getByRole('button',{name:'Compare with the editor’s note'}).press('Enter');
  await target.press('Enter');
  assert.match(await page.locator('.wa-explore-note').innerText(),/a comma follows/);
  await capture(page,'cohesion-explore-annotation',width,height);
  await go('practise');
  await checkArtwork(page,'stage','grammar-cohesion-practise');
  for(const challenge of [cohesion.practice[0],cohesion.practice[2]]){
   await page.getByRole('button',{name:new RegExp(challenge.title)}).click();
   const item=challenge.items[0];
   const options=page.locator('.wa-option');
   const order=await options.evaluateAll(nodes=>nodes.map(node=>node.dataset.option));
   await options.filter({hasText:item.options[(item.answer+1)%item.options.length]}).press('Enter');
   assert.deepEqual(await options.evaluateAll(nodes=>nodes.map(node=>node.dataset.option)),order);
   await page.getByRole('button',{name:'Check answer'}).press('Enter');
   assert.equal(await page.locator('.wa-practise-question .wa-answer').getAttribute('data-result'),'retry');
   for(const explanation of item.explanations)assert.ok(await page.locator('.wa-practise-question .wa-answer li').filter({hasText:explanation}).isVisible());
  }
  await capture(page,'cohesion-silver-feedback',width,height);
  await page.getByRole('button',{name:/Rewrite for accuracy and fluency/}).press('Enter');
  const goldRevision=await workshop(page,cohesion.gold[0]);
  await page.getByRole('button',{name:'Next Gold task →'}).press('Enter');
  await page.locator('.wa-apply-editor textarea').fill(cohesion.gold[1].example);
  await go('apply');
  await checkArtwork(page,'stage','grammar-cohesion-apply');
  await workshop(page,cohesion.apply[0]);
  await capture(page,'cohesion-apply-workshop',width,height);
  await go('practise');
  assert.equal(await page.locator('.wa-apply-editor textarea').inputValue(),cohesion.gold[1].example);
  await page.getByRole('button',{name:/Compare with an example/}).press('Enter');
  await page.locator('.wa-apply-comparison textarea').nth(1).fill('The relative clause clearly links the new rules to the challenge.');
  for(const check of await page.locator('.wa-apply-check input').all())await check.check();
  assert.match(await page.locator('.wa-practise-card[data-level=gold]').innerText(),/Complete/);
  await page.getByRole('button',{name:'← Previous Gold task'}).press('Enter');
  assert.equal(await page.getByRole('textbox',{name:'Revise your response'}).inputValue(),goldRevision);
  await capture(page,'cohesion-gold-revision',width,height);
  await go('master');
  await checkArtwork(page,'stage','grammar-cohesion-master');
  await finishAnalysis(page,cohesion.analysis);
  assert.match(await page.locator('.wa-master-question').innerText(),/1 \/ 1 objective decisions correct/);
  await workshop(page,cohesion.master);
  assert.equal(await page.locator('.wa-stage-tab[data-stage=master]').getAttribute('data-complete'),'true');
  await capture(page,'cohesion-master-transfer',width,height);
  await page.getByText('Write a full review in Writing Studio',{exact:true}).click();
  await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  await page.locator('.wa-workspace').waitFor();
  assert.deepEqual(errors,[]);
  await page.getByRole('button',{name:'← Academy'}).click();
  const editingCard=page.locator('.wa-path.wa-editing');
  await editingCard.getByRole('button',{name:'Start pathway →'}).press('Enter');
  assert.equal(await page.locator('.wa-lesson-banner h1').innerText(),'Editing & Improvement');
  await checkArtwork(page,'banner','editing-improvement-banner');
  await checkBlueprint(page);
  await checkArtwork(page,'stage','editing-improvement-discover');
  await page.getByText('Four-pass editing strategy',{exact:true}).click();
  assert.equal(await page.locator('.wa-editing-passes li').count(),4);
  await page.getByRole('button',{name:'Check what changed'}).press('Enter');
  assert.match(await page.locator('.wa-discovery .wa-answer').innerText(),/three words/);
  for(let index=0;index<editing.discover.length;index++){
   await page.locator('.wa-discovery textarea').fill('The change gives the reader a more specific judgement.');
   await page.getByRole('button',{name:'Check what changed'}).press('Enter');
   assert.equal(await page.locator('.wa-discovery textarea').getAttribute('readonly'),'');
   if(index<editing.discover.length-1) await page.getByRole('button',{name:'Next contrast →'}).press('Enter');
  }
  assert.equal(await page.locator('.wa-stage-tab[data-stage=discover]').getAttribute('data-complete'),'true');
  await capture(page,'editing-discover',width,height);
  await go('explore');
  await checkArtwork(page,'stage','editing-improvement-explore');
  for(const title of Object.keys(editingModels)){
   await page.locator('.wa-explore-picker-trigger').press('Enter');
   await page.locator('.wa-explore-model-choice').filter({hasText:title}).click();
   assert.equal(await page.locator('.wa-explore-headline').innerText(),title);
   const item=editingModels[title][0];
   const sentence=page.locator('.wa-explore-sentence').filter({hasText:item.phrase});
   assert.equal(await sentence.getAttribute('aria-disabled'),'true');
   await page.locator('.wa-explore-question textarea').fill('I would keep the specific detail because it helps the review audience.');
   await page.getByRole('button',{name:'Compare with the editor’s note'}).press('Enter');
   await sentence.press('Enter');
   assert.ok((await page.locator('.wa-explore-note').innerText()).includes(item.rationale));
  }
  await capture(page,'editing-explore',width,height);
  await go('practise');
  await checkArtwork(page,'stage','editing-improvement-practise');
  for(const challenge of editing.practice){
   await page.getByRole('button',{name:new RegExp(challenge.title)}).press('Enter');
   const item=challenge.items[0];
   const options=page.locator('.wa-option');
   const order=await options.evaluateAll(nodes=>nodes.map(node=>node.dataset.option));
   await options.filter({hasText:item.options[(item.answer+1)%item.options.length]}).press('Enter');
   assert.deepEqual(await options.evaluateAll(nodes=>nodes.map(node=>node.dataset.option)),order);
   await page.getByRole('button',{name:'Check answer'}).press('Enter');
   for(const explanation of item.explanations)assert.ok(await page.locator('.wa-practise-question .wa-answer li').filter({hasText:explanation}).isVisible());
  }
  await capture(page,'editing-silver',width,height);
  await page.getByRole('button',{name:/Work as an editor/}).press('Enter');
  const editingGoldRevision=await workshop(page,editing.gold[0]);
  await page.getByRole('button',{name:'Next Gold task →'}).press('Enter');
  await page.locator('.wa-apply-editor textarea').fill(editing.gold[1].example);
  await go('apply');
  await checkArtwork(page,'stage','editing-improvement-apply');
  for(const [i,task] of editing.apply.entries()){
   await workshop(page,task);
   if(i<editing.apply.length-1)await page.getByRole('button',{name:'Next task →'}).press('Enter');
  }
  assert.equal(await page.locator('.wa-stage-tab[data-stage=apply]').getAttribute('data-complete'),'true');
  await capture(page,'editing-apply',width,height);
  await go('practise');
  assert.equal(await page.locator('.wa-apply-editor textarea').inputValue(),editing.gold[1].example);
  await page.getByRole('button',{name:/Compare with an example/}).press('Enter');
  await page.locator('.wa-apply-comparison textarea').nth(1).fill('The recommendation connects the clear strengths and the later difficulty.');
  for(const check of await page.locator('.wa-apply-check input').all())await check.check();
  assert.match(await page.locator('.wa-practise-card[data-level=gold]').innerText(),/Complete/);
  await page.getByRole('button',{name:'← Previous Gold task'}).press('Enter');
  assert.equal(await page.getByRole('textbox',{name:'Revise your response'}).inputValue(),editingGoldRevision);
  await capture(page,'editing-gold',width,height);
  await go('master');
  await checkArtwork(page,'stage','editing-improvement-master');
  await finishAnalysis(page,editing.analysis);
  assert.match(await page.locator('.wa-master-question').innerText(),/1 \/ 1 objective decisions correct/);
  const masterRevision=await workshop(page,editing.master);
  assert.equal(await page.locator('.wa-stage-tab[data-stage=master]').getAttribute('data-complete'),'true');
  await go('discover');
  await go('master');
  assert.equal(await page.getByRole('textbox',{name:'Revise your response'}).inputValue(),masterRevision);
  await capture(page,'editing-master',width,height);
  await page.getByText('Write a full review in Writing Studio',{exact:true}).click();
  await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  await page.locator('.wa-workspace').waitFor();
  assert.deepEqual(errors,[]);
  await page.getByRole('button',{name:'← Academy'}).click();
  await page.locator('.wa-path.wa-exam').getByRole('button',{name:'Start pathway →'}).press('Enter');
  assert.equal(await page.locator('.wa-lesson-banner h1').innerText(),'Exam Mastery');
  await checkArtwork(page,'banner','exam-mastery-banner');
  await checkBlueprint(page);
  await checkArtwork(page,'stage','exam-mastery-discover');
  await capture(page,'exam-discover',width,height);
  for(let index=0;index<exam.discover.length;index++){
   await page.locator('.wa-discovery textarea').fill('The second version relates its evidence to the audience.');
   await page.getByRole('button',{name:'Check what changed'}).press('Enter');
   if(index<exam.discover.length-1)await page.getByRole('button',{name:'Next contrast →'}).press('Enter');
  }
  await go('explore');
  await checkArtwork(page,'stage','exam-mastery-explore');
  await capture(page,'exam-explore',width,height);
  for(const title of Object.keys(examModels)){
   await page.locator('.wa-explore-picker-trigger').press('Enter');
   await page.locator('.wa-explore-model-choice').filter({hasText:title}).click();
   assert.equal(await page.locator('.wa-explore-headline').innerText(),title);
   assert.match(await page.locator('.wa-explore-brief').innerText(),/Audience:/);
   await page.locator('.wa-explore-question textarea').fill('The opening establishes a specific subject relevant to school readers.');
   await page.getByRole('button',{name:'Compare with the editor’s note'}).press('Enter');
  }
  assert.equal(await page.locator('.wa-stage-tab[data-stage=explore]').getAttribute('data-complete'),'true');
  await go('practise');
  await checkArtwork(page,'stage','exam-mastery-practise');
  await capture(page,'exam-practise',width,height);
  for(const card of exam.practice){
   await page.getByRole('button',{name:new RegExp(card.title)}).press('Enter');
   for(const [index,item] of card.items.entries()){
    await page.locator('.wa-practise-question [data-option="'+item.answer+'"]').press('Enter');
    await page.getByRole('button',{name:'Check answer'}).press('Enter');
    assert.ok(await page.locator('.wa-practise-question .wa-answer li').filter({hasText:item.rationale}).isVisible());
    await page.getByRole('button',{name:index===card.items.length-1?'Finish analysis':'Next question'}).press('Enter');
   }
  }
  await page.getByRole('button',{name:/Plan independently/}).press('Enter');
  for(const [index,task] of exam.gold.entries()){
   await page.locator('.wa-apply-editor textarea').fill(task.example);
   await page.getByRole('button',{name:/Compare with an example/}).press('Enter');
   assert.ok(await page.getByRole('heading',{name:'One possible plan'}).isVisible());
   await page.getByRole('textbox',{name:'Revise your response'}).fill(task.example+'\nCheck recommendation against evidence');
   for(const check of await page.locator('.wa-apply-check input').all())await check.check();
   if(index===0)await page.getByRole('button',{name:'Next Gold task →'}).press('Enter');
  }
  assert.equal(await page.locator('.wa-stage-tab[data-stage=practise]').getAttribute('data-complete'),'true');
  await capture(page,'exam-planning',width,height);
  await go('apply');
  await checkArtwork(page,'stage','exam-mastery-apply');
  await capture(page,'exam-apply',width,height);
  const reflection=['One strength in your content','One improvement to your language or organisation','One specific target for your next review'];
  async function reflect(){
   for(const label of reflection)await page.getByRole('textbox',{name:label}).fill('Use specific details');
   for(const check of await page.locator('.wa-exam-review input[type=checkbox]').all())await check.check();
  }
  for(const [index,task] of exam.apply.entries()){
   assert.equal(await page.getByText('Planning checklist',{exact:true}).count(),index===0?1:0);
   if(task.timer)await page.getByRole('button',{name:'Start untimed practice'}).press('Enter');
   await page.getByRole('textbox',{name:'Planning notes (optional)'}).fill('price and evidence');
   await page.getByRole('textbox',{name:'Your review'}).fill(task.example);
   await page.getByRole('button',{name:'Submit response'}).press('Enter');
   assert.ok(await page.getByRole('heading',{name:'Submitted response'}).isVisible());
   await reflect();
   if(index<exam.apply.length-1)await page.getByRole('button',{name:'Next task →',exact:true}).press('Enter');
  }
  assert.equal(await page.locator('.wa-stage-tab[data-stage=apply]').getAttribute('data-complete'),'true');
  await go('master');
  await checkArtwork(page,'stage','exam-mastery-master');
  await capture(page,'exam-master',width,height);
  for(const [index,item] of exam.analysis.entries()){
   await page.locator('.wa-master-question [data-option="'+item.answer+'"]').press('Enter');
   await page.getByRole('button',{name:'Check answer'}).press('Enter');
   await page.getByRole('button',{name:index===exam.analysis.length-1?'Finish analysis':'Next question'}).press('Enter');
  }
  assert.match(await page.locator('.wa-master-question').innerText(),/3 \/ 3 objective decisions correct/);
  await page.clock.install();
  await page.getByRole('button',{name:'Start 20-minute practice'}).press('Enter');
  const mockText='I visited a market with my friends.';
  await page.getByRole('textbox',{name:'Your review'}).fill(mockText);
  assert.equal(await page.locator('.wa-apply-model').count(),0);
  assert.equal(await page.locator('.wa-reference-disclosure').isVisible(),false);
  assert.equal(await page.locator('.wa-companion-guide').isVisible(),false);
  await capture(page,'exam-mock-writing',width,height);
  await go('discover');
  await page.clock.fastForward(1200000);
  await go('master');
  assert.equal(await page.getByRole('textbox',{name:'Your review'}).inputValue(),mockText);
  assert.equal(await page.getByRole('textbox',{name:'Your review'}).getAttribute('readonly'),'');
  assert.equal(await page.getByRole('textbox',{name:'Planning notes (optional)'}).getAttribute('readonly'),'');
  await page.getByRole('button',{name:'Continue in overtime'}).press('Enter');
  assert.equal(await page.getByRole('textbox',{name:'Planning notes (optional)'}).getAttribute('readonly'),null);
  assert.equal(await page.getByRole('textbox',{name:'Your review'}).getAttribute('readonly'),null);
  await page.getByRole('button',{name:'Submit response'}).press('Enter');
  assert.equal(await page.locator('.wa-apply-model').count(),0);
  await page.getByRole('button',{name:'Submit anyway'}).press('Enter');
  assert.ok(await page.getByText('Submitted after practice time elapsed',{exact:false}).isVisible());
  await reflect();
  assert.match(await page.locator('.wa-exam-review').innerText(),/Academy learning programme complete/);
  assert.equal(await page.locator('.wa-stage-tab[data-stage=master]').getAttribute('data-complete'),'true');
  await page.getByText('Revise your response (optional)',{exact:true}).press('Enter');
  await page.getByRole('textbox',{name:'Revised response'}).fill('My revised draft.');
  assert.ok(await page.getByText(mockText,{exact:true}).isVisible());
  await capture(page,'exam-mock-reflection',width,height);
  await page.getByRole('combobox',{name:'Mock review task'}).selectOption('1');
  await page.getByRole('button',{name:'Start untimed practice'}).press('Enter');
  assert.equal(await page.getByRole('textbox',{name:'Your review'}).inputValue(),'');
  await page.getByRole('combobox',{name:'Mock review task'}).selectOption('0');
  assert.ok(await page.getByText(mockText,{exact:true}).isVisible());
  await page.getByRole('button',{name:'Open Writing Studio →'}).press('Enter');
  await page.locator('.wa-workspace').waitFor();
  assert.deepEqual(errors,[]);
  console.log(width,height,layout);
  await page.goto('http://127.0.0.1:8765/review-academy-recovery.html');
  await page.locator('.wa-path').last().waitFor();
  await checkHomeCardArtwork(page);
  await page.locator('.wa-path.wa-structure button').click();
  await go('discover');
  assert.match(await page.locator('.wa-recognition-feedback').innerText(),/Completed with an explanation/);
  await go('explore');
  assert.match(await page.locator('.wa-recognition-feedback').innerText(),/Correct on your first try/);
  await capture(page,'recovery-structure-explore',width,height);
  await page.getByRole('button',{name:'All pathways'}).click();
  await page.getByRole('button',{name:'Open Writing Studio →'}).click();
  await page.locator('.wa-workspace').waitFor();
  assert.deepEqual(errors,[]);
  await page.close();
 }
 const resumePage=await browser.newPage();
 await resumePage.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getSupabaseClient(){return {auth:{onAuthStateChange(){}}}}'}));
 let account='checkpoint-staff';
 await resumePage.route('**/src/auth.js',route=>route.fulfill({contentType:'application/javascript',body:`export async function getCurrentProfile(){return {id:${JSON.stringify(account)},active:true,role:"teacher",must_change_password:false}}`}));
 const preview='http://127.0.0.1:8765/review-academy-preview.html';
 const recovery='http://127.0.0.1:8765/review-academy-recovery.html';
 const card=resumePage.locator('.wa-path.wa-structure');
 await resumePage.goto(preview);
 await card.getByRole('button',{name:'Start pathway →'}).click();
 await resumePage.locator('[data-option-id=second]').click();
 await resumePage.getByRole('button',{name:'Check answer',exact:true}).click();
 await resumePage.locator('.wa-stage-tab[data-stage="apply"]').click();
 await resumePage.locator('.wa-apply-desk textarea').fill('My workshop draft survives a reload.');
 await resumePage.getByRole('button',{name:'All pathways'}).click();
 await card.getByRole('button',{name:'Resume pathway →'}).click();
 assert.equal(await resumePage.locator('.wa-apply-desk textarea').inputValue(),'My workshop draft survives a reload.');
 await resumePage.goto(recovery);
 await card.getByRole('button',{name:'Resume pathway →'}).click();
 assert.equal(await resumePage.locator('.wa-stage-tab[aria-current="step"]').getAttribute('data-stage'),'apply');
 assert.equal(await resumePage.locator('.wa-apply-desk textarea').inputValue(),'My workshop draft survives a reload.');
 await resumePage.locator('.wa-stage-tab[data-stage="discover"]').click();
 assert.match(await resumePage.locator('.wa-recognition-feedback').innerText(),/Correct on your first try/);
 account='other-staff';
 await resumePage.goto(preview);
 await card.getByRole('button',{name:'Start pathway →'}).click();
 assert.equal(await resumePage.locator('.wa-recognition-feedback').innerText(),'');
 await resumePage.close();
 for (const entry of ['review-academy-preview.html','review-academy-recovery.html'])
 for (const profile of [null,{active:true,role:'student'},{active:false,role:'teacher'},{active:true,role:'admin',must_change_password:true}]) {
  const denied=await browser.newPage();
  await denied.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getSupabaseClient(){return {auth:{onAuthStateChange(){}}}}'}));
  await denied.route('**/src/auth.js',route=>route.fulfill({contentType:'application/javascript',body:`export async function getCurrentProfile(){return ${JSON.stringify(profile)}}`}));
  await denied.route('http://127.0.0.1:8765/',route=>route.fulfill({body:'Hub'}));
  await denied.goto('http://127.0.0.1:8765/'+entry);
  await denied.waitForURL('http://127.0.0.1:8765/');
  assert.equal(await denied.locator('.wa-path').count(),0);
  await denied.close();
 }
}finally{await browser.close();}
