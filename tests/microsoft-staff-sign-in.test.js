import test from 'node:test';
import assert from 'node:assert/strict';
import {bootMicrosoftPilot,finishMicrosoftStaffSignIn,microsoftCallbackUrl,startMicrosoftSignIn} from '../src/microsoft-sign-in.js';

const url='https://tobypottas-sketch.github.io/igcse-self-study-hub/microsoft-sign-in.html';
test('requests Azure and the email scope, and uses the fixed pilot callback',async()=>{
  const redirectTo=url+'?microsoft-return=1';
  assert.equal(microsoftCallbackUrl(url+'?redirect=https://example.invalid/#token'),redirectTo);
  await startMicrosoftSignIn({auth:{signInWithOAuth:async options=>{
    assert.deepEqual(options,{provider:'azure',options:{scopes:'email',redirectTo}});
    return {};
  }}},url);
});

test('a disabled pilot does not initialize auth or offer Microsoft sign-in',async()=>{
  const button={hidden:true};
  const status={textContent:''};
  const root={querySelector:selector=>selector.includes('status')?status:button};
  await bootMicrosoftPilot(root,{enabled:false,location:{href:url},getClient(){assert.fail('Auth was opened');}});
  assert.equal(button.hidden,true);
  assert.match(status.textContent,/not open yet/);
});

test('only the matching, active, fully set-up staff profile is accepted',async()=>{
  for(const [role,active,must_change_password,provider,expected] of [
    ['teacher',true,false,'azure',true],
    ['admin',true,false,'azure',true],
    ['student',true,false,'azure',false],
    ['teacher',false,false,'azure',false],
    ['teacher',true,true,'azure',false],
    ['teacher',true,false,'email',false]
  ]){
    let signedOut=0;
    const user={id:'staff-id',identities:[{provider}]};
    const profile={id:'staff-id',role,active,must_change_password};
    const client={
      auth:{getUser:async()=>({data:{user}}),signOut:async options=>{assert.deepEqual(options,{scope:'local'});signedOut++;}},
      from:table=>{
        assert.equal(table,'profiles');
        return {select:()=>({eq:(field,value)=>{
          assert.deepEqual([field,value],['id','staff-id']);
          return {single:async()=>({data:profile})};
        }})};
      }
    };
    assert.equal(await finishMicrosoftStaffSignIn(client),expected);
    assert.equal(signedOut,expected?0:1);
  }
});
