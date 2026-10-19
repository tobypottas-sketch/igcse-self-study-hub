-- The per-word/per-pathway evidence stored in vocabulary_unit_mastery is the
-- single source of truth for ladder progression. Keep the historical journey
-- table/rows for compatibility, but stop activity events from maintaining a
-- second unit-level progression model.

drop trigger if exists trg_record_vocabulary_pathway_journey on public.activity_events;
drop function if exists public.record_vocabulary_pathway_journey_from_event();
