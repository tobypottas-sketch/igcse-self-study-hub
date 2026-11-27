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

-- Entra assignment does not apply to tenant Global Administrators.
-- Limit Azure identity writes in Auth to explicitly approved existing Hub UUIDs.
create schema if not exists microsoft_pilot_private;
revoke all on schema microsoft_pilot_private from public, anon, authenticated, service_role;

create table microsoft_pilot_private.allowed_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  school_email text not null check (school_email <> '' and school_email = lower(btrim(school_email)))
);

create function microsoft_pilot_private.check_azure_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.provider = 'azure' and not exists (
    select 1
    from microsoft_pilot_private.allowed_accounts a
    join public.profiles p on p.id = a.user_id
    join auth.users u on u.id = a.user_id
    where a.user_id = new.user_id
      and p.active is true
      and p.role = 'admin'
      and p.must_change_password is false
      and u.email_confirmed_at is not null
      and lower(btrim(u.email)) = a.school_email
      and lower(btrim(p.school_email)) = a.school_email
      and lower(btrim(new.identity_data ->> 'email')) = a.school_email
      and new.identity_data -> 'email_verified' = 'true'::jsonb
  ) then
    raise exception 'Microsoft identity is outside the Hub administrator pilot' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function microsoft_pilot_private.check_azure_identity()
  from public, anon, authenticated, service_role;

create trigger microsoft_pilot_azure_identity
  before insert or update on auth.identities
  for each row
  when (new.provider = 'azure')
  execute function microsoft_pilot_private.check_azure_identity();
