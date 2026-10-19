import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { renderSessionSummary, renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit } from '../src/vocabulary/views.js';
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

test('unit cards and selected-unit hero render dedicated artwork', () => {
  const home = root();
  renderVocabularyHome(home,{units:[
    {unitNumber:1,unitTitle:'Sports and free time',mastered:7,total:50},
    {unitNumber:2,unitTitle:'Digital life',mastered:4,total:50}
  ]});
  assert.match(home.innerHTML,/data-unit-art="1"/);
  assert.match(home.innerHTML,/assets\/vocabulary-study\/sports-free-time\.svg/);
  assert.match(home.innerHTML,/data-unit-art="2"/);
  assert.match(home.innerHTML,/assets\/vocabulary-study\/digital-life\.svg/);

  const unit = root();
  renderVocabularyUnit(unit,{unitNumber:3,unitTitle:'Travel and tourism',progress:{mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{}},pathwayStates:{},contentReady:true});
  assert.match(unit.innerHTML,/data-unit-hero-art="3"/);
  assert.match(unit.innerHTML,/assets\/vocabulary-study\/travel-tourism\.svg/);
});

test('completion screen uses dedicated trophy artwork and celebratory framing', () => {
  const target = root();
  renderSessionSummary(target,{pathwayId:'meaning',summary:{practised:10,strengthened:8,advanced:2,mastered:1,needsAnotherLook:2}});
  assert.match(target.innerHTML,/data-study-completion-art/);
  assert.match(target.innerHTML,/assets\/vocabulary-study\/achievement-trophy\.svg/);
  assert.match(target.innerHTML,/Great work!/);
  assert.match(target.innerHTML,/vocab-completion-rays/);
  assert.ok(existsSync(new URL('../assets/vocabulary-study/achievement-trophy.svg', import.meta.url)));
});

test('stage advancement and mastery use distinct visual artwork', () => {
  const stage = root();
  renderVocabularyQuestion(stage,{unitNumber:1,unitTitle:'Sports and free time',pathwayId:'meaning',pathwayStage:'match',sessionPosition:4,sessionTotal:10,feedback:{correct:true,message:'Correct!'},milestone:{kind:'stage_advanced',title:'Match complete · Apply unlocked'},question:{type:'word_definition_match',responseMode:'matching',prompt:'Choose the correct definition.',matchCue:'leisure',matchOptions:['free time','a crowd']}});
  assert.match(stage.innerHTML,/assets\/vocabulary-study\/achievement-stage\.svg/);
  assert.match(stage.innerHTML,/data-study-milestone-art="stage_advanced"/);

  const mastery = root();
  renderVocabularyQuestion(mastery,{unitNumber:1,unitTitle:'Sports and free time',pathwayId:'meaning',pathwayStage:'mastery',sessionPosition:10,sessionTotal:10,feedback:{correct:true,message:'Correct!'},milestone:{kind:'mastered',title:'Meaning mastered · leisure'},question:{type:'meaning_in_context',responseMode:'choice',prompt:'Choose the meaning.',options:['free time','money']}});
  assert.match(mastery.innerHTML,/assets\/vocabulary-study\/achievement-mastery\.svg/);
  assert.match(mastery.innerHTML,/data-study-milestone-art="mastered"/);
});

test('achievement artwork helper maps only known celebration types', () => {
  assert.equal(achievementArtwork('completion').src,'assets/vocabulary-study/achievement-trophy.svg');
  assert.equal(achievementArtwork('stage_advanced').src,'assets/vocabulary-study/achievement-stage.svg');
  assert.equal(achievementArtwork('mastered').src,'assets/vocabulary-study/achievement-mastery.svg');
  assert.equal(achievementArtwork('unknown'),null);
});

test('study artwork CSS contains dedicated composition and animation hooks', () => {
  const css = readFileSync(new URL('../vocabulary-study-app.css', import.meta.url),'utf8');
  for (const selector of ['.vocab-unit-card__art','.vocab-unit-hero__art','.vocab-completion-art','.vocab-completion-rays','.study-milestone-art']) {
    assert.match(css,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  assert.match(css,/@keyframes\s+study-trophy-pop/);
  assert.match(css,/@keyframes\s+study-rays-in/);
  assert.match(css,/@keyframes\s+study-stage-sweep/);
}
);
