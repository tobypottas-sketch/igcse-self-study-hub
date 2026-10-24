// Word Families data model and Mastery eligibility live in the shared module so the browser, readiness and the Edge Function
// use one derivation. This file keeps the original import path stable.
export * from '../../supabase/functions/_shared/vocabulary-word-family.js';
