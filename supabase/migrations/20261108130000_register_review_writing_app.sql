-- Registers Review Writing on the Hub dashboard (the dashboard lists rows of public.apps).
-- NOT EXECUTED by this change: apply only after explicit approval.
-- review-writing.html performs its own sign-in check and uses the existing student feedback route; nothing else is touched.
insert into public.apps (app_key, display_name, launch_url, enabled)
values (
  'review_writing',
  'Review Writing',
  'https://tobypottas-sketch.github.io/igcse-self-study-hub/review-writing.html',
  true
)
on conflict (app_key) do update
set display_name = excluded.display_name,
    launch_url = excluded.launch_url,
    enabled = excluded.enabled,
    updated_at = now();
