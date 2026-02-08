-- RPC function to get auth user id by email
-- Used by LINE Login callback to find existing auth user

create or replace function public.get_auth_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = auth, public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

-- Grant execute permission to service role
grant execute on function public.get_auth_user_id_by_email(text) to service_role;
