insert into public.apps(app_key, display_name, launch_url, enabled) values
('paraphrasing','Paraphrasing','https://tobypottas-sketch.github.io/igcse-self-study-hub/paraphrasing.html',true),
('reading','Reading','https://tobypottas-sketch.github.io/igcse-self-study-hub/reading.html',true),
('essay_writing','Essay Writing','https://tobypottas-sketch.github.io/igcse-essay-writing/',true),
('listening','Listening','https://tobypottas-sketch.github.io/igcse-listening/',true)
on conflict (app_key) do update set
  display_name=excluded.display_name,
  launch_url=excluded.launch_url,
  enabled=excluded.enabled,
  updated_at=now();
