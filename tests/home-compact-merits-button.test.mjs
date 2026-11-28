import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('classroom action is compact, right aligned and bounded on narrow screens',async()=>{const css=await readFile(new URL('../home-skills.css',import.meta.url),'utf8');const rule=css.match(/\.home-classroom-summary__action\.button\s*\{([^}]+)\}/)?.[1]??'';for(const property of ['width:190px','max-width:100%','min-height:40px','margin-left:auto','background:linear-gradient'])assert.ok(rule.includes(property),property);});
