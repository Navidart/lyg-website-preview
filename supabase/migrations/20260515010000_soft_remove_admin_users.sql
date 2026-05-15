alter table public.profiles
add column if not exists status text not null default 'active';

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

  update public.profiles
  set status = 'removed'
  where id = target_user_id;

  if not found then
    raise exception 'User profile not found.';
  end if;

  -- Auth user deletion requires a service-role Edge Function or Admin API.
  -- This soft removal keeps the auth user out of normal access without exposing service_role keys.
end;
$$;

revoke all on function public.remove_admin_user(uuid) from public;
grant execute on function public.remove_admin_user(uuid) to authenticated;

create or replace function public.get_admin_users()
returns setof jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    to_jsonb(p) ||
    jsonb_build_object(
      'last_sign_in_at', u.last_sign_in_at,
      'email', u.email,
      'phone', coalesce(p.phone, u.phone),
      'app_metadata', u.raw_app_meta_data,
      'user_metadata', u.raw_user_meta_data,
      'identities', coalesce(auth_identities.identities, '[]'::jsonb),
      'auth_avatar_url', coalesce(
        nullif(u.raw_user_meta_data->>'avatar_url', ''),
        nullif(u.raw_user_meta_data->>'picture', ''),
        auth_identities.avatar_url,
        auth_identities.picture
      ),
      'avatar_url', coalesce(
        nullif(u.raw_user_meta_data->>'avatar_url', ''),
        nullif(u.raw_user_meta_data->>'picture', ''),
        auth_identities.avatar_url,
        auth_identities.picture,
        nullif(p.avatar_url, '')
      )
    )
  from public.profiles p
  left join auth.users u on u.id = p.id
  left join lateral (
    select
      jsonb_agg(
        jsonb_build_object(
          'provider', i.provider,
          'identity_data', i.identity_data
        )
        order by i.created_at
      ) as identities,
      (
        array_remove(array_agg(nullif(i.identity_data->>'avatar_url', '') order by i.created_at), null)
      )[1] as avatar_url,
      (
        array_remove(array_agg(nullif(i.identity_data->>'picture', '') order by i.created_at), null)
      )[1] as picture
    from auth.identities i
    where i.user_id = u.id
  ) auth_identities on true
  where public.is_admin()
    and coalesce(p.status, 'active') <> 'removed'
  order by p.created_at desc;
$$;

notify pgrst, 'reload schema';
