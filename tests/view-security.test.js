import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../src/views/home.js';
import { renderLogin } from '../src/views/login.js';
import { renderChangePassword } from '../src/views/change-password.js';

function root() { return { innerHTML: '' }; }

test('home escapes profile and app labels and rejects unsafe launch URLs', () => {
  const target = root();
  renderHome(target,
    { display_name: '<img src=x onerror=alert(1)>', role: 'student' },
    [{ app_key: 'reading" onclick="alert(1)', display_name: '<script>alert(1)</script>', launch_url: 'javascript:alert(1)', enabled: true }]
  );
  assert.doesNotMatch(target.innerHTML, /<script>|<img|href="javascript:|data-app="reading" onclick=/i);
  assert.match(target.innerHTML, /&lt;script&gt;/);
  assert.match(target.innerHTML, /href="#"/);
});

test('login escapes backend error messages', () => {
  const target = root();
  renderLogin(target, '<img src=x onerror=alert(1)>');
  assert.doesNotMatch(target.innerHTML, /<img/i);
  assert.match(target.innerHTML, /&lt;img/);
});

test('change-password escapes student display name and error message', () => {
  const target = root();
  renderChangePassword(target, { display_name: '<b>Toby</b>' }, '<script>bad()</script>');
  assert.doesNotMatch(target.innerHTML, /<b>|<script>/i);
  assert.match(target.innerHTML, /&lt;b&gt;Toby&lt;\/b&gt;/);
  assert.match(target.innerHTML, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
});
