import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AVATAR_COLLECTIONS, avatarArtworkPath, renderAvatarArtwork} from '../src/vocabulary/rewards-avatars.js';
import {renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const migration=read('supabase/migrations/20261124120000_vocabulary_player_avatars.sql').toString();
const rows=[...migration.matchAll(/\('(avatar-[a-z-]+)','[^']+','avatars',(\d+),/g)];
const rewards=rows.map(([,reward_id])=>({reward_id,category:'avatars'}));

test('Avatar catalogue and both artwork formats agree on every reward ID',()=>{
  assert.equal(rows.length,28);
  assert.equal(new Set(rewards.map(row=>row.reward_id)).size,28);
  assert.equal(Object.keys(AVATAR_COLLECTIONS).length,28);
  for (const [,id,price] of rows) {
    assert.equal(Number(price),AVATAR_COLLECTIONS[id]==='Starter'?0:1200);
    assert.equal(read(avatarArtworkPath(id)).subarray(8,12).toString(),'WEBP');
    assert.equal(read('assets/vocabulary/rewards/'+id+'.png').subarray(1,4).toString(),'PNG');
  }
  assert.equal(rows.filter(row=>row[2]==='0').length,4);
  assert.equal(renderAvatarArtwork('../../untrusted'), '');
});

test('Equipped portrait requires matching catalogue ownership and retains initials',()=>{
  const avatar={...rewards[0],equipped:true};
  const production={shopMode:'production',rewards,owned:[avatar]};
  assert.match(renderIdentityShowcase(production,'Example Student'), /avatar-classic-explorer\.webp/);
  assert.match(renderIdentityShowcase(production,'Example Student'), />ES<\/span>/);
  assert.doesNotMatch(renderIdentityShowcase({...production,owned:[{...avatar,equipped:false}]}), /avatar-classic-explorer/);
  assert.doesNotMatch(renderIdentityShowcase({...production,shopMode:'sandbox',sandboxEnabled:false}), /avatar-classic-explorer/);
  assert.match(renderIdentityShowcase({...production,shopMode:'sandbox',sandboxEnabled:true}), /avatar-classic-explorer/);
});
