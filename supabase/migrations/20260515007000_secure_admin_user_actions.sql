create or replace function public.update_user_status(target_user_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_status text := trim(lower(new_status));
  actor_role text;
  target_role text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can change user status.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot change your own status.';
  end if;

  if normalized_status not in ('active', 'blocked') then
    raise exception 'Invalid status selected.';
  end if;

  select public.normalize_profile_role(role)
  into actor_role
  from public.profiles
  where id = auth.uid();

  select public.normalize_profile_role(role)
  into target_role
  from public.profiles
  where id = target_user_id;

  if target_role is null then
    raise exception 'User profile not found.';
  end if;

  if actor_role = 'admin' and target_role in ('admin', 'super_admin') then
    raise exception 'Admins cannot change status of other admins or super admins.';
  end if;

  update public.profiles
  set status = normalized_status
  where id = target_user_id;

  if not found then
    raise exception 'User profile not found.';
  end if;
end;
$$;

create or replace function public.remove_admin_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins can remove users.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot remove yourself.';
  end if;

  delete from public.profiles
  where id = target_user_id;

  if not found then
    raise exception 'User profile not found.';
  end if;

  -- Auth user deletion should be handled by a service-role Edge Function or Admin API
  -- if full authentication account removal becomes required.
end;
$$;

revoke all on function public.update_user_status(uuid, text) from public;
grant execute on function public.update_user_status(uuid, text) to authenticated;

revoke all on function public.remove_admin_user(uuid) from public;
grant execute on function public.remove_admin_user(uuid) to authenticated;
