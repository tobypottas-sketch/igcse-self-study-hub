# Vocabulary timing browser integration
The app now imports the lifecycle bridge and calls its stop/sync hooks. The compile-time flag is false and no transport is configured, so this commit cannot collect V2 data. Legacy tracking remains unchanged.
The adapter supports canonical pathway IDs (word_families, precision_use, spelling_recall); earlier prototype used hyphenated IDs incorrectly.
The bridge observes question DOM, listens to trusted input inside question cards, visibility/focus/page lifecycle, and flushes periodically. It is tested using simulated browser dependencies, not actual Chromium.
Before activation: supply authenticated transport and durable user-scoped outbox, verify actual activity catalogue IDs and source type, auth change teardown, bfcache behavior, storage limits, failed save UX, and native browser regressions. Never enable both legacy and V2 time as a combined total. The gate must stay false until release approval.
