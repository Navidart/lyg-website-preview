alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text;

update public.profiles
set
  first_name = coalesce(nullif(trim(first_name), ''), nullif(split_part(trim(full_name), ' ', 1), '')),
  last_name = coalesce(
    nullif(trim(last_name), ''),
    nullif(trim(regexp_replace(trim(full_name), '^[^[:space:]]+[[:space:]]*', '')), '')
  )
where full_name is not null
  and (
    first_name is null
    or trim(first_name) = ''
    or last_name is null
    or trim(last_name) = ''
  );

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
      'first_name',
      'last_name',
      'phone',
      'full_name',
      'updated_at'
    );

  if update_columns is not null then
    execute format('grant update (%s) on public.profiles to authenticated', update_columns);
  end if;
end;
$$;
