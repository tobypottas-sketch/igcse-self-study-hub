import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderLogin} from '../src/views/login.js';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('login password starts masked and has an accessible Show button',()=>{
 const root={innerHTML:''};renderLogin(root);
 assert.match(root.innerHTML,/<input id="hub-login-password" name="password" type="password" autocomplete="current-password" required>/);
 assert.match(root.innerHTML,/<label for="hub-login-password">Password<\/label>/);
 assert.match(root.innerHTML,/type="button" class="auth-password-toggle" data-action="toggle-login-password"/);
 assert.match(root.innerHTML,/aria-controls="hub-login-password"/);
 assert.match(root.innerHTML,/aria-label="Show password"/);
 assert.match(root.innerHTML,/aria-pressed="false">Show<\/button>/);
});
test('show/hide updates only input masking, accessible state and button text',()=>{
 assert.match(app,/if \(action === 'toggle-login-password'\)/);
 assert.match(app,/field\.type = visible \? 'text' : 'password'/);
 assert.match(app,/target\.textContent = visible \? 'Hide' : 'Show'/);
 assert.match(app,/target\.setAttribute\('aria-label', visible \? 'Hide password' : 'Show password'\)/);
 assert.match(app,/target\.setAttribute\('aria-pressed', String\(visible\)\)/);
 assert.doesNotMatch(app.slice(app.indexOf("if (action === 'toggle-login-password')"),app.indexOf("if ((action === 'admin'")),/field\.value\s*=/);
});
test('visibility toggle cannot submit the login form, and is keyboard focusable',()=>{
 const root={innerHTML:''};renderLogin(root);
 assert.match(root.innerHTML,/type="button" class="auth-password-toggle"/);
 assert.match(css,/\.auth-password-toggle:focus-visible\s*\{/);
 assert.match(css,/\.auth-password-control input\{padding-right:78px\}/);
});
test('sign in still submits unchanged email and password credentials',()=>{
 assert.match(app,/await signIn\(client, String\(data\.get\('email'\) \?\? ''\)\.trim\(\), String\(data\.get\('password'\) \?\? ''\)\)/);
});
