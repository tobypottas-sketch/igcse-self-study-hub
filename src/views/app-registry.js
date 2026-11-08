// Presentation registry for the student homepage.
//
// What lives where:
//  - Supabase `public.apps` stays the source of truth for WHICH apps a student can see (enabled flag, row-level security),
//    their display name and their destination URL. Nothing here grants access or holds a URL.
//  - This file says how each app is PRESENTED: which skill it belongs to, its card artwork and badge letter.
//
// To add an app: insert its `public.apps` row as usual, then add one entry to APP_CATALOGUE below with `skill` set.
// To add a skill (e.g. Speaking): add one entry to SKILLS. Skills with no visible apps are hidden automatically.
// An app whose key is in no catalogue entry (or names an unknown skill) is never hidden: it appears under All apps.

// `color` drives the whole identity of a skill (icon tile, selected state, card accent) through CSS variables, so a new skill
// needs no new CSS: accent = icon and bars, ink = text on the tint (>= 4.5:1), tint = soft background, line = borders.
export const SKILLS = Object.freeze([
  { id: 'writing',   name: 'Writing',         description: 'Plan, draft and polish essays, emails and reviews.', icon: 'pen',
    color: { accent: '#137e80', ink: '#0e5f61', tint: '#e8f6f5', line: '#9fcbd0' } },
  { id: 'reading',   name: 'Reading',         description: 'Read exam-style texts and answer questions.',          icon: 'book',
    color: { accent: '#2e73d6', ink: '#1d4f9f', tint: '#edf4ff', line: '#b9d2f2' } },
  { id: 'listening', name: 'Listening',       description: 'Listen closely and practise exam tasks.',              icon: 'headphones',
    color: { accent: '#6556c9', ink: '#4a3da8', tint: '#f2efff', line: '#cbc4ee' } },
  { id: 'language',  name: 'Language Skills', description: 'Build vocabulary and rephrase ideas.',                  icon: 'letters',
    color: { accent: '#b56a18', ink: '#7a4a0c', tint: '#fff6e5', line: '#eacb8f' } }
]);

// Each entry lists the exact `public.apps.app_key` values it covers (compared case-insensitively, never as a substring), so a future
// key such as "reading_club" or "essay_planner" is NOT silently classified: it shows under All apps until it gets its own entry.
// Production keys (checked against public.apps): email_writing, essay_writing, listening, paraphrasing, reading, review_writing, vocabulary_paraphrase.
export const APP_CATALOGUE = Object.freeze([
  { id: 'essay',        keys: ['essay_writing'],         skill: 'writing',   badge: 'E', art: './assets/launcher/essay-writing.svg' },
  { id: 'email',        keys: ['email_writing'],         skill: 'writing',   badge: 'E', art: './assets/launcher/essay-writing.svg' },
  { id: 'review',       keys: ['review_writing'],        skill: 'writing',   badge: 'R', art: './assets/launcher/essay-writing.svg' },
  { id: 'reading',      keys: ['reading'],               skill: 'reading',   badge: 'R', art: './assets/launcher/reading.svg' },
  { id: 'listening',    keys: ['listening'],             skill: 'listening', badge: 'L', art: './assets/launcher/listening.svg' },
  { id: 'paraphrasing', keys: ['paraphrasing'],          skill: 'language',  badge: 'P', art: './assets/launcher/paraphrasing.svg' },
  { id: 'vocabulary',   keys: ['vocabulary_paraphrase'], skill: 'language',  badge: 'V', art: './assets/launcher/vocabulary.svg' }
]);

export const DEFAULT_REGISTRY = Object.freeze({ skills: SKILLS, catalogue: APP_CATALOGUE });

export function catalogueEntry(appKey, registry = DEFAULT_REGISTRY) {
  const key = String(appKey ?? '').toLowerCase();
  return registry.catalogue.find(entry => entry.keys.some(candidate => candidate.toLowerCase() === key)) ?? null;
}

// The skill id an app belongs to, or null when it is unclassified (or names a skill that does not exist).
export function skillOf(appKey, registry = DEFAULT_REGISTRY) {
  const skill = catalogueEntry(appKey, registry)?.skill;
  return registry.skills.some(candidate => candidate.id === skill) ? skill : null;
}

// Skills that currently have at least one visible app, in registry order, with live counts.
export function skillSummaries(apps, registry = DEFAULT_REGISTRY) {
  return registry.skills
    .map(skill => ({ ...skill, count: apps.filter(app => skillOf(app.app_key, registry) === skill.id).length }))
    .filter(skill => skill.count > 0);
}

// Inline CSS variables for a skill's colours (empty when a skill defines none, so the default teal applies).
export function skillStyle(skill) {
  const c = skill?.color;
  return c ? `--sk:${c.accent};--sk-ink:${c.ink};--sk-tint:${c.tint};--sk-line:${c.line}` : '';
}
