import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? '';
}

test('desktop home hero stays compact so study tools appear sooner', () => {
  const hero = rule('.home-hero');
  const content = rule('.home-hero__content');
  const heading = rule('.home-hero h1');
  const lead = rule('.home-hero__lead');
  const note = rule('.home-hero__note');

  assert.match(hero, /min-height:\s*230px/);
  assert.match(hero, /padding:\s*20px 28px 24px/);
  assert.match(content, /padding:\s*28px 4px 6px/);
  assert.match(heading, /font-size:\s*clamp\(2\.35rem,\s*4\.6vw,\s*3\.5rem\)/);
  assert.match(lead, /margin:\s*12px 0 0/);
  assert.match(note, /margin-top:\s*14px/);
});
