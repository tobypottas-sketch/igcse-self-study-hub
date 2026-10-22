const root = document.getElementById('vocabularyApp');

function answerInput(node) {
  const form = node?.closest?.('[data-form="vocabulary-answer"]');
  return form?.querySelector?.('input[name="answer"]') ?? null;
}

function selectMatchCard(card) {
  const form = card?.closest?.('[data-form="vocabulary-answer"]');
  const input = answerInput(card);
  if (!form || !input) return;
  const value = String(card.dataset.matchCard ?? '').trim();
  input.value = value;
  for (const candidate of form.querySelectorAll?.('[data-match-card]') ?? []) {
    const selected = candidate === card;
    candidate.classList.toggle('is-selected',selected);
    candidate.setAttribute('aria-pressed',selected ? 'true' : 'false');
  }
  input.dispatchEvent(new Event('change',{ bubbles:true }));
}

const GAP = /_{2,}/;

// Tap-to-fill gap: the chosen word goes into the answer field and into the blank of the sentence shown above. Tapping another word swaps it.
function fillGap(chip) {
  const form = chip?.closest?.('[data-form="vocabulary-answer"]');
  const input = answerInput(chip);
  if (!form || !input) return;
  const value = String(chip.dataset.gapChoice ?? '').trim();
  if (!value) return;
  input.value = value;
  for (const candidate of form.querySelectorAll?.('[data-gap-choice]') ?? []) {
    const selected = candidate === chip;
    candidate.classList.toggle('is-selected',selected);
    candidate.setAttribute('aria-pressed',selected ? 'true' : 'false');
  }
  const submit = form.querySelector?.('[data-gap-submit]');
  if (submit) { submit.disabled = false; submit.removeAttribute('aria-disabled'); }
  const sentence = form.querySelector?.('.vocab-source-text p') ?? form.closest?.('.vocab-question-card')?.querySelector?.('.vocab-source-text p');
  if (!sentence) return;
  if (sentence.dataset.gapOriginal === undefined) sentence.dataset.gapOriginal = sentence.textContent;
  const original = sentence.dataset.gapOriginal;
  const at = original.search(GAP);
  if (at < 0) return;
  const gap = original.match(GAP)[0];
  sentence.textContent = '';
  sentence.append(original.slice(0, at));
  const filled = document.createElement('strong');
  filled.className = 'vocab-gap-filled';
  filled.textContent = value;
  sentence.append(filled, original.slice(at + gap.length));
}

root?.addEventListener('click', event => {
  const card = event.target?.closest?.('[data-match-card]');
  if (card) {
    selectMatchCard(card);
    return;
  }
  const chip = event.target?.closest?.('[data-gap-choice]');
  if (chip) fillGap(chip);
});
