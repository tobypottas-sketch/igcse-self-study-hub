import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../vocabulary-reward-identity.css',import.meta.url),'utf8');
const graphics=fs.readFileSync(new URL('../vocabulary-graphics.css',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/vocabulary/graphics-runtime.js',import.meta.url),'utf8');
test('all four reward themes use a high contrast kicker on the navy badge',()=>{
 assert.match(css,/\.vocab-hero--home \.vocab-kicker\s*\{\s*color:#ffe19a!important/);
 assert.doesNotMatch(css,/\.vocab-unit-card__number,\.vocab-kicker,\.vocab-student-identity__eyebrow/);
});
test('Midnight labels and white navigation chips have contrasting text',()=>{
 assert.match(css,/\.vocab-real-theme--midnight \.vocab-topbar :is\(\.vocab-back,\.vocab-link,\.vocab-back--chip\)/);
 assert.match(css,/background:#fff!important;color:#203563!important/);
 assert.match(css,/\.vocab-real-theme--midnight \.vocab-hero--home :is\(h1,h2,p,strong\)/);
 assert.match(css,/color:#f8faff!important/);
});
test('theming never substitutes generic backgrounds for image-bearing unit cards',()=>{
 assert.doesNotMatch(css,/\.vocab-unit-card,\.vocab-pathway-card,\.vocab-summary-card,\.vocab-progress-entry,\.vocab-engage-home,[\s\S]{0,290}background:linear-gradient\(130deg,var\(--reward-card\)/);
 assert.match(css,/Paint only the outer card surface/);
 assert.match(css,/\.vocab-unit-card__art\.is-png-ready \.study-art__png/);
});
test('PNG SVG fallback stays visible until loaded, then yields to PNG',()=>{
 assert.match(graphics,/\[data-art-slot\]\.has-png\.is-png-ready \.study-art__svg\{visibility:hidden\}/);
 assert.doesNotMatch(graphics,/\[data-art-slot\]\.has-png \.study-art__svg\{visibility:hidden\}/);
});
test('runtime reveals already-complete cached image after SPA rebuild',()=>{
 assert.match(runtime,/reveal\(root\)/);
 assert.match(runtime,/image\.complete && image\.naturalWidth>0/);
 assert.match(runtime,/markReady\(image\)/);
 assert.match(runtime,/new MutationObserver/);
 assert.match(runtime,/removeBroken\(image\)/);
});
