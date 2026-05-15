create or replace function public.normalize_profile_role(role_value text)
returns text
language sql
immutable
as $$
  select case
    when role_value is null then null
    when regexp_replace(trim(lower(role_value)), '[[:space:]-]+', '_', 'g') = 'superadmin' then 'super_admin'
    when regexp_replace(trim(lower(role_value)), '[[:space:]-]+', '_', 'g') in ('user', 'admin', 'super_admin')
      then regexp_replace(trim(lower(role_value)), '[[:space:]-]+', '_', 'g')
    else null
  end;
$$;

update public.profiles
set role = public.normalize_profile_role(role)
where public.normalize_profile_role(role) is not null
  and role is distinct from public.normalize_profile_role(role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and public.normalize_profile_role(role) in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and public.normalize_profile_role(role) = 'super_admin'
  );
$$;

create or replace function public.update_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_role text := public.normalize_profile_role(new_role);
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins can change user roles.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot change your own role.';
  end if;

  if normalized_role not in ('user', 'admin', 'super_admin') then
    raise exception 'Invalid role selected.';
  end if;

  update public.profiles
  set role = normalized_role
  where id = target_user_id;

  if not found then
    raise exception 'User profile not found.';
  end if;
end;
$$;

revoke all on function public.normalize_profile_role(text) from public;
grant execute on function public.normalize_profile_role(text) to authenticated;

revoke all on function public.update_user_role(uuid, text) from public;
grant execute on function public.update_user_role(uuid, text) to authenticated;
