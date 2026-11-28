# Vocabulary V2 integration boundary
Prototype adapter only: no app.js wiring, no endpoint or production writes.
Call sync after successful question render (including feedback); stop before loading,
session finish, leave, unit selection, error and account change. Bind trusted task
events, visibility/focus/pagehide, 5-second ticks and 30-second flushes in a browser
adapter. Never use home or shop interactions. Mixed practice requires a resolved
pathway; unclassified modes, games and unit checks are deliberately excluded for now.
Confirm actual catalogue IDs for contentId (item, context and unit activity) and
pathway identifiers against server catalogue before enabling. Same-content repeated
questions are intentionally one timing context. Rendering a question provides the
initial engagement grace period. This is an estimate, not verified attention.
