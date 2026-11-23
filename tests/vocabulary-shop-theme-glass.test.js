import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('vocabulary-shop-theme-glass.css');
const html=read('vocabulary.html');

test('theme glass loads after the premium shop and Blockverse overrides',()=>{
 const glass=html.indexOf('vocabulary-shop-theme-glass.css?v=shop-theme-glass-v1');
 assert.ok(glass>0);
 for(const file of ['vocabulary-shop-header-premium.css','vocabulary-premium-afterlight.css','vocabulary-premium-blockverse.css','vocabulary-blockverse-legibility-v3.css']){
   assert.ok(html.indexOf(file)>=0&&html.indexOf(file)<glass,file+' must load before theme glass');
 }
});

test('both shop header surfaces become translucent and retain theme-specific palette',()=>{
 assert.match(css,/\.vocab-shop-redesign > \.vocab-topbar/);
 assert.match(css,/\.vocab-shop-redesign > \.vocab-shop-hero/);
 assert.match(css,/data-equipped-theme="afterlight"/);
 assert.match(css,/data-equipped-theme="blockverse"/);
 assert.match(css,/color-mix\(in srgb,var\(--shop-header-surface\) 87%,transparent\)/);
 assert.match(css,/color-mix\(in srgb,var\(--shop-header-surface-2\) 74%,transparent\)/);
 assert.match(css,/backdrop-filter:blur\(3px\)/);
});

test('transparency reveals actual equipped wallpaper without affecting cards or wallet',()=>{
 const theme=read('vocabulary-immersive-shop-backgrounds.css');
 assert.match(theme,/--immersive-shop-art/);
 assert.match(theme,/\.vocab-shop-redesign\{/);
 assert.match(theme,/background-image:/);
 assert.doesNotMatch(css,/vocab-shop-hero__balance|vocab-reward-card|vocab-shop-hero__counter|vocab-shop-hero__intro/);
 assert.match(css,/@media print,\(forced-colors:active\)/);
 assert.match(css,/background:Canvas!important/);
});
