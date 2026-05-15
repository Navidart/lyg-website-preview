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
  order by p.created_at desc;
$$;

revoke all on function public.get_admin_users() from public;
grant execute on function public.get_admin_users() to authenticated;
