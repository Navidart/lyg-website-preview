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

  -- Auth user deletion requires a service-role Edge Function or Admin API.
  -- This RPC securely removes the profile row without exposing service_role keys.
end;
$$;

revoke all on function public.remove_admin_user(uuid) from public;
grant execute on function public.remove_admin_user(uuid) to authenticated;

notify pgrst, 'reload schema';
