import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('home release label and changed asset URLs agree',async()=>{const h=await readFile(new URL('../index.html',import.meta.url),'utf8');const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');const v=h.match(/Build (home-merits-[\w-]+)<\/footer>/)?.[1];assert.ok(v);assert.ok(h.includes('home-skills.css?v='+v));assert.ok(h.includes('src/app.js?v='+v));assert.ok(app.includes('./views/home.js?v='+v));});
