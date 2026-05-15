alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

revoke update on public.profiles from authenticated;

do $$
declare
  update_columns text;
begin
  select string_agg(format('%I', column_name), ', ')
  into update_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'profiles'
    and column_name in (
      'full_name',
      'display_name',
      'avatar_url',
      'phone',
      'title',
      'company',
      'location',
      'bio',
      'website',
      'updated_at'
    );

  if update_columns is not null then
    execute format('grant update (%s) on public.profiles to authenticated', update_columns);
  end if;
end;
$$;

revoke insert, delete on public.profiles from authenticated;

grant select on public.profiles to authenticated;
grant execute on function public.update_user_role(uuid, text) to authenticated;
