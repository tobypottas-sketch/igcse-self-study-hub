import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { REWARDS, REWARD_CATEGORIES, rewardsForCategory } from '../src/vocabulary/rewards-catalog.js';
import { renderRewardsPreview } from '../src/vocabulary/rewards-view.js';

const read = path => fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Twelve rewards have stable unique IDs and plausible cosmetic-only metadata',() => {
  assert.equal(REWARDS.length,12);
  assert.equal(new Set(REWARDS.map(r=>r.id)).size,12);
  const categories = new Set(REWARD_CATEGORIES.map(c=>c.id));
  for(const r of REWARDS){
    assert.equal(r.kind,'cosmetic');
    assert.ok(r.id && r.name && r.description && r.icon);
    assert.ok(categories.has(r.category));
    assert.ok(Number.isInteger(r.price) && r.price>0);
    assert.ok(Object.isFrozen(r));
  }
});
test('Each category filter returns only its rewards; unknown categories are empty', () => {
  assert.deepEqual(rewardsForCategory('all'),REWARDS);
  for(const c of REWARD_CATEGORIES.filter(c=>c.id!=='all')){
    assert.ok(rewardsForCategory(c.id).length>=(c.id==='badges'?1:2));
    assert.ok(rewardsForCategory(c.id).every(r=>r.category===c.id));
  }
  assert.deepEqual(rewardsForCategory('wrong-category'),[]);
});
test('Preview shows disabled purchase controls, sample balance labels and 12 items',()=>{
  const root={innerHTML:''};
  renderRewardsPreview(root);
  assert.match(root.innerHTML,/Sample balance/);
  assert.match(root.innerHTML,/Illustrative only/);
  assert.match(root.innerHTML,/Purchasing, ownership and equipping are not enabled yet/);
  assert.equal((root.innerHTML.match(/data-reward-id="/g)||[]).length,12);
  assert.equal((root.innerHTML.match(/disabled title="Purchases are not enabled/g)||[]).length,12);
  renderRewardsPreview(root,{category:'frames'});
  assert.equal((root.innerHTML.match(/data-reward-id="/g)||[]).length,3);
  assert.match(root.innerHTML,/aria-pressed="true"/);
});
test('Preview link is staff-only and no reward purchase is wired',()=>{
  const views=read('src/vocabulary/views.js');
  const app=read('src/vocabulary/app.js');
  const html=read('vocabulary.html');
  assert.match(views,/preview \? `<section class="vocab-rewards-preview-entry"/);
  assert.match(app,/if \(!state.preview\) return;/);
  assert.match(app,/action === 'filter-rewards' && state.preview/);
  assert.match(app,/action === 'back-rewards-home' && state.preview/);
  assert.doesNotMatch(app,/action === 'buy-reward'/);
  assert.match(html,/vocabulary-rewards\.css/);
});
