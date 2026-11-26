-- Register as the Before User Created hook separately, after checking for an existing hook.
-- Sign-in to existing Auth accounts does not invoke this hook.
create or replace function public.microsoft_pilot_before_user_created(event jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when event #>> '{user,app_metadata,provider}' = 'azure'
      or coalesce(event #> '{user,app_metadata,providers}', '[]'::jsonb) ? 'azure'
    then jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'Microsoft sign-in is available for existing pilot accounts only.'
    ))
    else '{}'::jsonb
  end;
$$;

revoke all on function public.microsoft_pilot_before_user_created(jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.microsoft_pilot_before_user_created(jsonb)
  to supabase_auth_admin;
