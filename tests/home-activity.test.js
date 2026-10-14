import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../src/views/home.js';
function html(role){ const root={innerHTML:''}; renderHome(root,{display_name:'T',role},[]); return root.innerHTML; }
test('admin sees Activity and Manage accounts',()=>{assert.match(html('admin'),/>Activity</);assert.match(html('admin'),/>Manage accounts</);});
test('teacher sees Activity only',()=>{const out=html('teacher');assert.match(out,/>Activity</);assert.doesNotMatch(out,/>Manage accounts</);});
test('student sees neither control',()=>{const out=html('student');assert.doesNotMatch(out,/>Activity</);assert.doesNotMatch(out,/>Manage accounts</);});
