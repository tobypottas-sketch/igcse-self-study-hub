import { getSupabaseClient } from '../supabase.js';

const DEFAULT = 2;
const MIN = 1;
const MAX = 6;
let cached = new Map();
let loading = null;

function normalise(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= MIN && n <= MAX ? n : DEFAULT;
}

async function loadThresholds() {
  if (loading) return loading;
  loading = (async () => {
    const client = await getSupabaseClient();
    const { data, error } = await client.from('classes').select('id, merit_pathways_required').eq('active', true);
    if (error) throw error;
    cached = new Map((data ?? []).map(row => [row.id, normalise(row.merit_pathways_required)]));
    return cached;
  })().finally(() => { loading = null; });
  return loading;
}

function controlMarkup(classId, value) {
  return `<div class="admin-merit-threshold" data-merit-threshold data-class-id="${classId}">
    <div class="admin-merit-threshold__copy"><strong>Merit pace</strong><span><b data-merit-threshold-value>${value}</b> completed ${value === 1 ? 'pathway' : 'pathways'} = 1 merit</span></div>
    <input type="range" min="1" max="6" step="1" value="${value}" aria-label="Completed pathways needed for one merit" data-merit-threshold-slider>
    <div class="admin-merit-threshold__scale" aria-hidden="true"><span>1</span><span>6</span></div>
    <p class="muted" data-merit-threshold-status>Saved for this class.</p>
  </div>`;
}

async function enhanceCards() {
  const cards = [...document.querySelectorAll('.admin-class-card')];
  if (!cards.length) return;
  try {
    await loadThresholds();
    for (const card of cards) {
      if (card.querySelector('[data-merit-threshold]')) continue;
      const classButton = card.querySelector('[data-class-id]');
      const classId = classButton?.dataset.classId;
      if (!classId) continue;
      const value = cached.get(classId) ?? DEFAULT;
      card.insertAdjacentHTML('beforeend', controlMarkup(classId, value));
    }
  } catch (error) {
    console.error('Unable to load class merit thresholds', error);
  }
}

async function save(control, value) {
  const classId = control.dataset.classId;
  const status = control.querySelector('[data-merit-threshold-status]');
  if (status) status.textContent = 'Saving…';
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.functions.invoke('admin-merit-settings', {
      body:{ classId, pathwaysPerMerit:value }
    });
    if (error) throw error;
    if (data?.ok !== true) throw new Error(data?.error || 'Save was not confirmed.');
    cached.set(classId, value);
    if (status) status.textContent = 'Saved for this class.';
  } catch (error) {
    const previous = cached.get(classId) ?? DEFAULT;
    const slider = control.querySelector('[data-merit-threshold-slider]');
    const valueNode = control.querySelector('[data-merit-threshold-value]');
    if (slider) slider.value = String(previous);
    if (valueNode) valueNode.textContent = String(previous);
    if (status) status.textContent = 'Could not save. Try again.';
    console.error('Unable to save class merit threshold', error);
  }
}

document.addEventListener('input', event => {
  const slider = event.target.closest?.('[data-merit-threshold-slider]');
  if (!slider) return;
  const control = slider.closest('[data-merit-threshold]');
  const value = normalise(slider.value);
  const valueNode = control?.querySelector('[data-merit-threshold-value]');
  if (valueNode) valueNode.textContent = String(value);
  const copy = control?.querySelector('.admin-merit-threshold__copy span');
  if (copy) copy.innerHTML = `<b data-merit-threshold-value>${value}</b> completed ${value === 1 ? 'pathway' : 'pathways'} = 1 merit`;
});

document.addEventListener('change', event => {
  const slider = event.target.closest?.('[data-merit-threshold-slider]');
  if (!slider) return;
  const control = slider.closest('[data-merit-threshold]');
  if (control) void save(control, normalise(slider.value));
});

const observer = new MutationObserver(() => { void enhanceCards(); });
observer.observe(document.documentElement, { childList:true, subtree:true });
void enhanceCards();
