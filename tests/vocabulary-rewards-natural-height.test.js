import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const shop={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:1500},rewards:[
 {reward_id:'gold-frame',category:'frames',name:'Golden Frame',description:'Gold',xp_price:800},
 {reward_id:'aurora-frame',category:'frames',name:'Aurora Frame',description:'Aurora',xp_price:1800}
],owned:[{reward_id:'gold-frame',category:'frames',equipped:true}]};

for(const mode of ['sandbox','production'])test(mode+' shop keeps catalogue and collection in an independent right-hand stack',()=>{
 const root={innerHTML:''};
 if(mode==='sandbox')renderSandboxShop(root,shop,{category:'frames'});
 else renderProductionShop(root,{...shop,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'},{category:'frames'});
 const html=root.innerHTML;
 const right=html.indexOf('<div class="vocab-shop-right">');
 const main=html.indexOf('<section class="vocab-shop-main"');
 const equipped=html.indexOf('<section class="vocab-shop-equipped"');
 assert.ok(right>=0 && main>right && equipped>main,'catalogue and equipment share right stack');
 assert.ok(html.indexOf('vocab-shop-leaderboard-slot')<right,'left rail stays separate');
 assert.match(html,/Golden Frame/);
 assert.match(html,/Aurora Frame/);
 assert.match(html,new RegExp('data-action="'+(mode==='sandbox'?'sandbox':'real')+'-filter"'));
});
test('CSS stacks at natural height and folds to one column on narrow screens',()=>{
 const css=readFileSync(new URL('../vocabulary-rewards.css',import.meta.url),'utf8');
 assert.match(css,/\.vocab-shop-right\s*\{[^}]*display:flex;[^}]*flex-direction:column;[^}]*gap:20px;/s);
 assert.match(css,/\.vocab-shop-rail\s*\{[^}]*grid-column:1;[^}]*grid-row:1;/s);
 assert.match(css,/@media\(max-width:840px\)\s*\{\s*\.vocab-shop-redesign \.vocab-shop-rail,/s);
});
