import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';
import {rewardArtworkPath} from '../src/vocabulary/rewards-art.js';
import {renderProductionShop,renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {applyRewardTheme,renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';

const originals={
  blockverse:'cbfb97966db52aa909f53859aab5e7af7939481882524a4da36a694e18d2ea7a',
  'voxel-master-frame':'11db6f4af18ef5d2f1ee8b51f4492b056a185392d87abce1edf95d56ac404599',
  'diamond-block-badge':'fb12c4a409ed426088d3e22ccf7a4c156db3787453e7fcfc21779a0848859cb0',
  'master-builder':'a5dc0fc7f837a86371e824ec83fb9e7f3307a0c4774b5eea0494cb609aeb520b',
  'pixel-burst':'47e421897657e6ab638b4a4929d1399edcefdca5f97e4e07906b5f447d1790b8'
};
const rewards=PREMIUM_COLLECTIONS.find(collection=>collection.id==='blockverse').rewards.map(
  ([reward_id,category,name,xp_price])=>({reward_id,category,name,xp_price,description:name})
);
const shop={shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available:5600},rewards,owned:[]};
const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const equipped=rewards.map(({reward_id,category})=>({reward_id,category,equipped:true}));

test('Blockverse ships the five original PNGs and catalogue rows for the registered prices',()=>{
  assert.deepEqual(rewards.map(item=>item.xp_price),[2000,800,600,1200,1000]);
  const migration=read('supabase/migrations/20261121124500_vocabulary_blockverse_catalog.sql').toString();
  assert.match(migration,/on conflict \(reward_id\) do nothing/);
  for(const {reward_id,name,category,xp_price} of rewards){
    const path=rewardArtworkPath(reward_id);
    assert.equal(path,`assets/vocabulary/rewards/${reward_id}.png`);
    assert.equal(createHash('sha256').update(read(path)).digest('hex'),originals[reward_id]);
    assert.ok(migration.includes(`('${reward_id}','${name}','${category}',${xp_price},`));
  }
});

test('both shops use verified catalogue data and the same Blockverse card actions',()=>{
  for(const [render,data,prefix] of [
    [renderProductionShop,shop,'real'],
    [renderSandboxShop,{...shop,shopMode:'sandbox',sandboxEnabled:true},'sandbox']
  ]){
    const root={innerHTML:''};
    render(root,{...data,rewards:[]});
    assert.doesNotMatch(root.innerHTML,/vocab-shop-blockverse/);
    render(root,data);
    assert.match(root.innerHTML,/class="vocab-shop-blockverse"/);
    for(const item of rewards){
      assert.ok(root.innerHTML.includes(`data-action="${prefix}-buy" data-reward-id="${item.reward_id}"`));
    }
    for(const item of rewards){
      render(root,{...data,owned:equipped},{category:item.category});
      assert.doesNotMatch(root.innerHTML,/vocab-shop-blockverse/);
      assert.match(root.innerHTML,/class="is-owned">Equipped/);
      assert.ok(root.innerHTML.includes(`data-action="${prefix}-unequip" data-category="${item.category}"`));
    }
    assert.ok(root.innerHTML.includes(`data-action="${prefix}-preview-effect" data-reward-id="pixel-burst"`));
    assert.equal((root.innerHTML.match(/<i class="vocab-cosmetic-particle /g)||[]).length,6);
  }
});

test('the profile places accessible Master Builder artwork below the name and restores the default theme',()=>{
  const active={...shop,owned:equipped};
  const profile=renderIdentityShowcase(active,'Test Student');
  assert.match(profile,/<h2>Test Student<\/h2>\s*<span[^>]*__title-art"><img[^>]*master-builder\.png" alt="Master Builder title artwork"/);
  for(const id of ['voxel-master-frame','diamond-block-badge','pixel-burst']) assert.ok(profile.includes(rewardArtworkPath(id)));
  assert.match(profile,/data-cosmetic-effect="pixel-burst"/);
  const state=new Set(['vocab-real-theme--forest']);
  const root={classList:{add:id=>state.add(id),remove:(...ids)=>ids.forEach(id=>state.delete(id))}};
  applyRewardTheme(root,active);
  assert.deepEqual([...state],['vocab-real-theme--blockverse','vocab-real-effect--pixel-burst']);
  applyRewardTheme(root,{...active,owned:equipped.map(item=>({...item,equipped:false}))});
  assert.equal(state.size,0);
});
