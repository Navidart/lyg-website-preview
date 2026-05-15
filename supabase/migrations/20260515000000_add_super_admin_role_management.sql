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
      and trim(lower(role)) in ('admin', 'super_admin')
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
      and trim(lower(role)) = 'super_admin'
  );
$$;

create or replace function public.update_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_role text := trim(lower(new_role));
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

revoke all on function public.update_user_role(uuid, text) from public;
grant execute on function public.update_user_role(uuid, text) to authenticated;
