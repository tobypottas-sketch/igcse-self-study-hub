import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rewards=fs.readFileSync(new URL('../vocabulary-rewards.css',import.meta.url),'utf8');
const global=fs.readFileSync(new URL('../vocabulary-button-feedback.css',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('../src/vocabulary/rewards-sandbox-view.js',import.meta.url),'utf8');

test('Reward Shop overrides global prohibited cursor for temporarily disabled buttons',()=>{
 assert.match(global,/#vocabularyApp :is\(button,\[role="button"\]\):is\(:disabled,\[aria-disabled="true"\]\)\s*\{\s*cursor:\s*not-allowed/);
 assert.match(rewards,/#vocabularyApp \.vocab-shop-redesign button:is\(:disabled,\[aria-disabled="true"\]\)\s*\{\s*cursor:\s*default/);
 const overrideAt=rewards.lastIndexOf('#vocabularyApp .vocab-shop-redesign button:is(:disabled');
 assert.ok(overrideAt>rewards.indexOf('.vocab-reward-card__bottom button{'));
});
test('purchase busy state still disables the button to prevent duplicate actions',()=>{
 assert.match(view,/busy\|\|!action\?'disabled'/);
});
test('global disabled-button behavior remains unchanged outside the shop',()=>{
 assert.match(global,/cursor:\s*not-allowed/);
 assert.doesNotMatch(rewards,/#vocabularyApp\s+:is\(button/);
});
