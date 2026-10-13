update public.apps
set launch_url = 'https://tobypottas-sketch.github.io/igcse-self-study-hub/reading.html',
    updated_at = now()
where app_key = 'reading';
