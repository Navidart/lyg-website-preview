insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'charter-gallery',
  'charter-gallery',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Charter gallery images are publicly readable'
  ) then
    create policy "Charter gallery images are publicly readable"
      on storage.objects
      for select
      using (bucket_id = 'charter-gallery');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can upload charter gallery images'
  ) then
    create policy "Admins can upload charter gallery images"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'charter-gallery'
        and public.is_admin()
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can update charter gallery images'
  ) then
    create policy "Admins can update charter gallery images"
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'charter-gallery'
        and public.is_admin()
      )
      with check (
        bucket_id = 'charter-gallery'
        and public.is_admin()
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can delete charter gallery images'
  ) then
    create policy "Admins can delete charter gallery images"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'charter-gallery'
        and public.is_admin()
      );
  end if;
end $$;
