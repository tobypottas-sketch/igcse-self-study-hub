import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url), 'utf8');
const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');

test('pathway evidence shell is present in initial card markup before hydration', () => {
  const renderer = views.match(/function\s+renderPathwayCard\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(renderer,/data-pathway-evidence-shell/);
  assert.match(renderer,/vocab-pathway-card__evidence-copy/);
  assert.match(renderer,/vocab-pathway-card__evidence-meter/);
  assert.match(renderer,/No saved evidence yet/);
});

test('runtime keeps a fallback evidence-shell guard before saved evidence hydration', () => {
  assert.match(runtime,/function\s+ensurePathwayEvidenceShell\s*\(/);
  const decorator = runtime.match(/function\s+decoratePathwayEvidence\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const shellIndex = decorator.indexOf('ensurePathwayEvidenceShell(card)');
  const evidenceIndex = decorator.indexOf('state?.stageEvidence');
  assert.ok(shellIndex >= 0,'evidence decorator should ensure the shell for a legacy/stale card');
  assert.ok(evidenceIndex >= 0,'evidence decorator should still read authoritative saved evidence');
  assert.ok(shellIndex < evidenceIndex,'the stable shell must exist before saved evidence hydration is considered');
});

test('pathway evidence hydration does not retrigger the childList observer forever', () => {
  assert.match(runtime,/if\s*\(title\s*&&\s*title\.textContent\s*!==\s*nextTitle\)\s*title\.textContent\s*=\s*nextTitle/);
  assert.match(runtime,/if\s*\(detail\s*&&\s*detail\.textContent\s*!==\s*nextDetail\)\s*detail\.textContent\s*=\s*nextDetail/);
  assert.doesNotMatch(runtime,/if\s*\(title\)\s*title\.textContent\s*=/);
  assert.doesNotMatch(runtime,/if\s*\(detail\)\s*detail\.textContent\s*=/);
});

test('study-art observer cannot observe mutations caused by its own decoration pass', () => {
  assert.match(runtime,/observer\.disconnect\(\)/);
  assert.match(runtime,/try\s*\{\s*enhanceStudyArtwork\(root\);\s*\}\s*finally\s*\{\s*observer\.observe\(root,\{\s*childList:true,\s*subtree:true\s*\}\);\s*\}/s);
});

test('pathway cards reserve a dedicated evidence row from first paint', () => {
  assert.match(css, /grid-template-areas:\s*"identity status"\s*"coverage coverage"\s*"evidence evidence"\s*"ladder ladder"\s*"cta cta"/s);
  assert.match(css, /grid-template-rows:\s*auto\s+auto\s+minmax\(60px,auto\)/s);
  assert.match(css, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*width:100%[^}]*min-height:60px/s);
});

test('pathway card header uses explicit regions with generous spacing', () => {
  assert.match(css, /\.vocab-pathway-card\s*\{[^}]*column-gap:28px[^}]*row-gap:16px[^}]*padding:28px 30px 24px/s);
  assert.match(css, /\.vocab-pathway-card__identity\s*\{[^}]*grid-area:identity[^}]*display:flex/s);
  assert.match(css, /\.vocab-pathway-card__status\s*\{[^}]*grid-area:status[^}]*justify-self:end/s);
  assert.match(css, /\.vocab-pathway-card__coverage\s*\{[^}]*grid-area:coverage[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder/s);
  assert.match(css, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta/s);
});

test('decorative pathway artwork is visibly restored without participating in card layout', () => {
  assert.doesNotMatch(css, /\.vocab-pathway-card__art\s*\{[^}]*display:none!important/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*position:absolute/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*pointer-events:none/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*top:88px/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*opacity:\.34/s);
  assert.doesNotMatch(css, /mask-image:/);
  assert.match(css, /\.vocab-pathway-card\s*>\s*:not\(\.vocab-pathway-card__art\)\s*\{[^}]*z-index:2/s);
  assert.match(css,/\.vocab-pathway-card\.has-study-art\s*\{[^}]*padding:28px 30px 24px!important[^}]*min-height:340px/s);
});
