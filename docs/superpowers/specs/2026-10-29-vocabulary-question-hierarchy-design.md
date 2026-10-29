# Vocabulary question hierarchy

Approved: shared renderer + CSS, 2026-10-29.

Use the existing question renderer across Meaning, Context, Word Families, Paraphrasing, Precision & Use, and Spelling & Recall. Put a smaller, lighter instruction before the stimulus. Give context/original sentences a calm padded panel with larger type, use consistent restrained teal emphasis for already-visible target language, and give missing words a visible bordered slot. Keep answer controls and their labels below with clear spacing.

Approaches: CSS alone is smaller but cannot separate embedded source phrases and definitions; shared view helpers plus scoped CSS also cover those cases and were approved. Preserve exact stimulus wording, safe fallback rendering for unrecognised prompts, and all existing target-hiding rules. Never derive visible language from answer keys. Keep question objects, controls, event hooks, answers, marking, progression, content banks, other apps, admin and Supabase unchanged.

Check real published examples from all six pathways before and after. Add synthetic rendering regression tests and browser checks for desktop/mobile hierarchy, gaps, input behaviour, and no horizontal overflow. Run focused Vocabulary tests then full suite; compare failures to unchanged current main.
