-- Existing administrator approvals retain their original role.
-- No student is approved by applying this migration alone.
alter table microsoft_pilot_private.allowed_accounts
  add column approved_role text not null default 'admin'
  check (approved_role in ('admin','student'));

create or replace function microsoft_pilot_private.check_azure_identity()
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
      and p.role::text = a.approved_role
      and p.must_change_password is false
      and u.email_confirmed_at is not null
      and lower(btrim(u.email)) = a.school_email
      and lower(btrim(p.school_email)) = a.school_email
      and lower(btrim(new.identity_data ->> 'email')) = a.school_email
      and new.identity_data -> 'email_verified' = 'true'::jsonb
      and (a.approved_role = 'admin' or a.school_email ~ '^[^@[:space:]]+@nkcswx[.]cn$')
  ) then
    raise exception 'Microsoft identity is outside the Hub approved account pilot' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function microsoft_pilot_private.check_azure_identity()
  from public, anon, authenticated, service_role;
-- The existing BEFORE INSERT/UPDATE trigger and Before User Created hook remain in place.
