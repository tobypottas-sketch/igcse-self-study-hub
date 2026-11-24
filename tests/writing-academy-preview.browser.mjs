import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 for(const [width,height,columns] of [[1440,900,3],[768,1024,2],[390,844,1],[1024,600,3]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getSupabaseClient(){return {auth:{onAuthStateChange(){}}}}'}));
  await page.route('**/src/auth.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getCurrentProfile(){return {active:true,role:"teacher",must_change_password:false}}'}));
  await page.goto('http://127.0.0.1:8765/review-academy-preview.html');
  await page.locator('.wa-path').last().waitFor();
  assert.equal(await page.locator('.wa-path').count(),6);
  assert.equal(await page.locator('.wa-tool').count(),4);
  assert.equal(await page.locator('.wa-primary').getAttribute('href'),'./review-writing.html');
  const layout=await page.evaluate(()=>({columns:getComputedStyle(document.querySelector('.wa-pathways')).gridTemplateColumns.split(' ').length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,scrollHeight:document.documentElement.scrollHeight}));
  assert.equal(layout.columns,columns,JSON.stringify(layout));
  assert.ok(layout.scrollWidth<=layout.viewport+1,JSON.stringify(layout));
  await page.locator('.wa-footer').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('.wa-footer').isVisible());
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'writing-preview-'+width+'x'+height+'.png',fullPage:true});
  console.log(width,height,layout);
  await page.close();
 }
 const denied=await browser.newPage();
 await denied.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getSupabaseClient(){return {auth:{onAuthStateChange(){}}}}'}));
 await denied.route('**/src/auth.js',route=>route.fulfill({contentType:'application/javascript',body:'export async function getCurrentProfile(){return {active:true,role:"student",must_change_password:false}}'}));
 await denied.route('http://127.0.0.1:8765/',route=>route.fulfill({body:'Hub'}));
 await denied.goto('http://127.0.0.1:8765/review-academy-preview.html');
 await denied.waitForURL('http://127.0.0.1:8765/');
 assert.equal(await denied.locator('.wa-path').count(),0);
}finally{await browser.close();}
