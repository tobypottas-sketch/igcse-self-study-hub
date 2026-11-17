# Single NGSL 1.2 vocabulary diagnostic

This repository uses ONE 50-item vocabulary recognition assessment:
- Exactly 10 targets in each of the five NGSL 1.2 frequency bands.
- Private source items and answer keys in `private.ngsl_baseline_items` (never commit keys to this public repository).
- Secure RPCs: `public.vocabulary_ngsl_api` and `public.vocabulary_ngsl_teacher_form_preview`.
- Persistent, server-owned per-student random question ordering and shuffled choices.
- Resumable sessions, one-score-per-item, overall /50 and NGSL frequency-band scores /10.
- Teacher-only read-only question preview.
- Authenticated Edge Function: `supabase/functions/vocabulary-diagnostic/index.ts`.
- Compulsory rollout stays OFF until a real student-browser end-to-end test succeeds.

Source of current private SQL structure: `ngsl_single_50_engine.sql`.
Old CEFR draft forms, A/B bank, provisional scoring and review workflows have been retired.
Do not reintroduce a 40-question CEFR assessment or extra A/B forms.

Public bank-exposure scanner remains at `tools/diagnostic/check-public-exposure.mjs`.
