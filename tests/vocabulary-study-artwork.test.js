import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { renderSessionSummary } from '../src/vocabulary/views.js';
import { unitArtwork, achievementArtwork } from '../src/vocabulary/study-art.js';

function root(){ return { innerHTML:'' }; }

const expectedUnitArt = [
  [1,'sports-free-time.svg'],
  [2,'digital-life.svg'],
  [3,'travel-tourism.svg'],
  [4,'environment.svg'],
  [5,'education.svg']
];

test('first five units have dedicated artwork assets', () => {
  for (const [unit, file] of expectedUnitArt) {
    const art = unitArtwork(unit);
    assert.equal(art.src, `assets/vocabulary-study/${file}`);
    assert.ok(art.alt.length > 0);
    assert.ok(existsSync(new URL(`../${art.src}`, import.meta.url)), `${file} should exist`);
  }
});

test('achievement artwork assets exist and remain distinct', () => {
  const expected = {
    completion:'achievement-trophy.svg',
    stage_advanced:'achievement-stage.svg',
    mastered:'achievement-mastery.svg'
  };
  for (const [kind,file] of Object.entries(expected)) {
    const art = achievementArtwork(kind);
    assert.equal(art.src,`assets/vocabulary-study/${file}`);
    assert.ok(art.alt.length > 0);
    assert.ok(existsSync(new URL(`../${art.src}`, import.meta.url)), `${file} should exist`);
  }
  assert.equal(achievementArtwork('unknown'),null);
});

test('artwork runtime decorates unit cards, unit hero, completion and real milestones', () => {
  const runtime = readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url),'utf8');
  assert.match(runtime,/\.vocab-unit-card\[data-unit\]/);
  assert.match(runtime,/dataset\.unitArt/);
  assert.match(runtime,/\.vocab-unit-hero/);
  assert.match(runtime,/dataset\.unitHeroArt/);
  assert.match(runtime,/\[data-study-completion\]/);
  assert.match(runtime,/dataset\.studyCompletionArt/);
  assert.match(runtime,/\[data-study-milestone\]/);
  assert.match(runtime,/dataset\.studyMilestoneArt/);
  assert.match(runtime,/MutationObserver/);
});

test('vocabulary page loads artwork CSS and runtime after the core study app layer', () => {
  const html = readFileSync(new URL('../vocabulary.html', import.meta.url),'utf8');
  assert.match(html,/vocabulary-study-art\.css/);
  assert.ok(html.indexOf('vocabulary-study-art.css') > html.indexOf('vocabulary-study-app.css'));
  assert.match(html,/src\/vocabulary\/study-art-runtime\.js/);
});

test('ten-question completion still exposes the real completion hook for trophy enhancement', () => {
  const target = root();
  renderSessionSummary(target,{pathwayId:'meaning',summary:{practised:10,strengthened:8,advanced:2,mastered:1,needsAnotherLook:2}});
  assert.match(target.innerHTML,/data-study-completion/);
  assert.match(target.innerHTML,/Great work!/);
  assert.match(target.innerHTML,/vocab-celebration/);
});

test('study artwork CSS contains dedicated composition and animation hooks', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  for (const selector of ['.vocab-unit-card__art','.vocab-unit-hero__art','.vocab-completion-art','.vocab-completion-rays','.study-milestone-art']) {
    assert.match(css,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  assert.match(css,/@keyframes\s+study-trophy-pop/);
  assert.match(css,/@keyframes\s+study-rays-in/);
  assert.match(css,/@keyframes\s+study-stage-sweep/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('pathway artwork is integrated into cards instead of reserving a fixed right-hand strip', () => {
  const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
  assert.doesNotMatch(css,/\.vocab-pathway-card\.has-study-art\{[^}]*padding-right:\s*132px/i);
  assert.doesNotMatch(css,/\.vocab-pathway-card__art\{[^}]*top:\s*12px;[^}]*bottom:\s*12px;[^}]*width:\s*108px/i);
  assert.match(css,/\.vocab-pathway-card__art\{[^}]*bottom:\s*-?\d+px/i);
  assert.match(css,/mask-image:\s*linear-gradient/i);
});

test('sports unit artwork contains recognisable sports equipment motifs', () => {
  const svg = readFileSync(new URL('../assets/vocabulary-study/sports-free-time.svg', import.meta.url),'utf8');
  assert.match(svg,/data-sport="football"/);
  assert.match(svg,/data-sport="racket"/);
});
