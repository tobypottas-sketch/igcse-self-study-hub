// Live cosmetic preview must reflect real equipped animation, not a static PNG.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const shop=fs.readFileSync(path.join(root,'src/vocabulary/rewards-sandbox-view.js'),'utf8');
const app=fs.readFileSync(path.join(root,'src/vocabulary/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'vocabulary-effect-shop-previews.css'),'utf8');
const animations=fs.readFileSync(path.join(root,'vocabulary-effects-animated.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');

test('only real, published animated effects have Preview animation control',()=>{
 for(const id of ['forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight',
  'rainbow-aura','sparkle','stardust-trail','electric-pulse'])
   assert.ok(shop.includes("'"+id+"'"),id);
 assert.match(shop,/item\?\.category!=='effects'/);
 assert.match(shop,/LIVE_EFFECT_IDS\.has\(item\.reward_id\)/);
 assert.match(shop,/const image=rewardArtworkPath\(item\.reward_id\)/);
 assert.doesNotMatch(shop,/['"]pixel-burst['"],['"]golden-sunrays/);
});

test('demo contains the equipped-avatar effect classes and six actual particles',()=>{
 for(const k of ['vocab-effect-demo-stage','vocab-effect-preview','data-cosmetic-effect',
  'vocab-student-identity__avatar has-animated-effect','vocab-student-identity__effect',
  'vocab-cosmetic-particles','vocab-cosmetic-particle--','vocab-student-identity__initials',
  'aria-pressed="false"','data-action="sandbox-preview-effect"'])
    assert.ok(shop.includes(k),k);
 for(const id of ['forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight','rainbow-aura'])
    assert.ok(animations.includes('data-cosmetic-effect="'+id+'"'),id);
 assert.ok(css.includes('data-preview-effect="sparkle"'));
 assert.ok(css.includes('data-preview-effect="stardust-trail"'));
 assert.ok(css.includes('data-preview-effect="electric-pulse"'));
});

test('preview toggles locally, never purchases or equips',()=>{
 assert.match(app,/action === 'sandbox-preview-effect'/);
 assert.match(app,/stage\.hidden=!opening/);
 assert.match(app,/art\.hidden=opening/);
 assert.match(app,/target\.setAttribute\('aria-pressed',String\(opening\)\)/);
 assert.match(css,/\.vocab-shop-illustration\[hidden\]\{display:none!important\}/);
 assert.match(css,/\.vocab-effect-demo-stage\[hidden\]\{display:none!important\}/);
});

test('cache version and reduced motion are safe',()=>{
 assert.match(app,/rewards-sandbox-view\.js\?v=live-effect-preview-v3/);
 assert.match(html,/vocabulary-effect-shop-previews\.css\?v=live-effect-previews-v2/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(animations,/prefers-reduced-motion:reduce/);
});
