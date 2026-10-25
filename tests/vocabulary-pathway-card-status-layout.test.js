// Pathway cards: the "N of 50 words available" chip and the "N words wait for a full Set of 10" chip must never share a grid cell.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { openMission } from './helpers/question-latency-harness.mjs';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const boxesOverlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

for (const width of [1280, 820, 390, 320]) {
  test(`${width}px: every pathway card shows its status chips side by side or stacked, never overlapping, and the page does not overflow`, async t => {
    const api = await openMission({ root:rootDir, width });
    if (!api) { t.skip('no browser available'); return; }
    try {
      const report = await api.page.evaluate(() => {
        const rect = el => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, w:r.width, h:r.height }; };
        const cards = [...document.querySelectorAll('.vocab-pathway-card')].map(card => {
          const chips = [...card.querySelectorAll('.vocab-pathway-card__coverage')].map(el => ({ text:el.textContent.trim(), ...rect(el), lines:Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight || 16)), clipped:el.scrollWidth > el.clientWidth + 1 }));
          const cardBox = rect(card);
          return { pathway:card.dataset.pathway, chips, cardBox, chipsInsideCard:chips.every(c => c.left >= cardBox.left - 1 && c.right <= cardBox.right + 1) };
        });
        const d = document.documentElement;
        return { cards, overflow:d.scrollWidth > d.clientWidth + 1 };
      });
      const held = report.cards.filter(card => card.chips.some(chip => /wait for a full Set of 10/.test(chip.text)));
      assert.ok(held.length > 0, 'Unit 1 has at least one pathway card in the held-back state');
      for (const card of report.cards) {
        for (let i = 0; i < card.chips.length; i += 1) for (let j = i + 1; j < card.chips.length; j += 1) assert.equal(boxesOverlap(card.chips[i], card.chips[j]), false, `${card.pathway}: "${card.chips[i].text}" overlaps "${card.chips[j].text}"`);
        assert.ok(card.chipsInsideCard, `${card.pathway}: chips stay inside the card`);
        for (const chip of card.chips) { assert.equal(chip.clipped, false, `${card.pathway}: "${chip.text}" is not clipped`); assert.ok(chip.lines <= 3, `${card.pathway}: "${chip.text}" does not wrap into a tall stack`); }
      }
      assert.equal(report.overflow, false, 'no horizontal page overflow');
    } finally { await api.close(); }
  });
}
test('the held-back and coverage chips are rendered inside one shared wrapper owned by the card grid', async () => {
  const { renderVocabularyUnit } = await import('../src/vocabulary/views.js');
  const host = { innerHTML:'' };
  renderVocabularyUnit(host, { unitNumber:1, unitTitle:'T', progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} }, contentReady:true,
    pathwayStates:{ meaning:{ status:'ready', ready:true, coverageCount:48, totalCount:50, set:{ heldBack:8, setNumber:1, setCount:4 } } } });
  const card = host.innerHTML.match(/<button[^>]*data-pathway="meaning"[\s\S]*?<\/button>/)?.[0] ?? '';
  const group = card.match(/<span class="vocab-pathway-card__chips">((?:<span class="vocab-pathway-card__coverage[^"]*"[^>]*>[^<]*<\/span>)+)<\/span>/)?.[1] ?? '';
  assert.equal((group.match(/vocab-pathway-card__coverage/g) ?? []).length, 2, 'both chips sit inside the wrapper');
  assert.match(group, /48 of 50 words available/); assert.match(group, /8 words wait for a full Set of 10/);
});
