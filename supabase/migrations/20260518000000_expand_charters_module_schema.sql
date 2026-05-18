-- Expand charter data model for future public charter pages and admin management.
-- Forward migration only. Keeps legacy charter fields for UI compatibility.

create extension if not exists pgcrypto;

alter table public.charters
add column if not exists full_description text,
add column if not exists featured boolean not null default false,
add column if not exists hero_image text,
add column if not exists price_from numeric(14, 2),
add column if not exists price_unit text not null default 'per week',
add column if not exists seasonal_pricing_notes text,
add column if not exists primary_region text,
add column if not exists available_regions text[],
add column if not exists embarkation_notes text,
add column if not exists cruising_area_notes text,
add column if not exists guests integer,
add column if not exists cabins integer,
add column if not exists crew_count integer,
add column if not exists length numeric(8, 2),
add column if not exists length_unit text not null default 'm',
add column if not exists beam numeric(8, 2),
add column if not exists draft numeric(8, 2),
add column if not exists builder text,
add column if not exists designer text,
add column if not exists year_built integer,
add column if not exists year_refit integer,
add column if not exists cruising_speed numeric(8, 2),
add column if not exists max_speed numeric(8, 2),
add column if not exists engines text,
add column if not exists flag text,
add column if not exists hull_type text,
add column if not exists gross_tonnage numeric(10, 2);

update public.charters
set
  price_from = coalesce(price_from, weekly_rate),
  full_description = coalesce(full_description, content),
  hero_image = coalesce(hero_image, featured_image),
  primary_region = coalesce(primary_region, destination);

do $$
declare
  status_constraint record;
begin
  for status_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.charters'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
      and pg_get_constraintdef(oid) ilike '%draft%'
      and pg_get_constraintdef(oid) ilike '%published%'
  loop
    execute format('alter table public.charters drop constraint %I', status_constraint.conname);
  end loop;

  alter table public.charters
    add constraint charters_status_check
    check (status in ('draft', 'published', 'unpublished'));
end $$;

create table if not exists public.charter_gallery_images (
  id uuid primary key default gen_random_uuid(),
  charter_id uuid not null references public.charters(id) on delete cascade,
  image_url text not null,
  alt_text text,
  caption text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charter_amenities (
  id uuid primary key default gen_random_uuid(),
  charter_id uuid not null references public.charters(id) on delete cascade,
  category text not null,
  name text not null,
  icon text,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.charter_amenities'::regclass
      and conname = 'charter_amenities_category_check'
  ) then
    alter table public.charter_amenities
      add constraint charter_amenities_category_check
      check (category in ('general', 'toys', 'tenders', 'diving'));
  end if;
end $$;

create table if not exists public.charter_crew_profiles (
  id uuid primary key default gen_random_uuid(),
  charter_id uuid not null references public.charters(id) on delete cascade,
  avatar_image text,
  crew_name text not null,
  role text,
  bio text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_charter_gallery_images_updated_at on public.charter_gallery_images;
create trigger set_charter_gallery_images_updated_at
before update on public.charter_gallery_images
for each row execute function public.set_updated_at();

drop trigger if exists set_charter_amenities_updated_at on public.charter_amenities;
create trigger set_charter_amenities_updated_at
before update on public.charter_amenities
for each row execute function public.set_updated_at();

drop trigger if exists set_charter_crew_profiles_updated_at on public.charter_crew_profiles;
create trigger set_charter_crew_profiles_updated_at
before update on public.charter_crew_profiles
for each row execute function public.set_updated_at();

create index if not exists charters_featured_idx on public.charters (featured);
create index if not exists charters_primary_region_idx on public.charters (primary_region);
create index if not exists charters_price_from_idx on public.charters (price_from);

create index if not exists charter_gallery_images_charter_id_idx on public.charter_gallery_images (charter_id);
create index if not exists charter_gallery_images_display_order_idx on public.charter_gallery_images (display_order);
create index if not exists charter_gallery_images_charter_order_idx on public.charter_gallery_images (charter_id, display_order);

create index if not exists charter_amenities_charter_id_idx on public.charter_amenities (charter_id);
create index if not exists charter_amenities_display_order_idx on public.charter_amenities (display_order);
create index if not exists charter_amenities_charter_order_idx on public.charter_amenities (charter_id, display_order);

create index if not exists charter_crew_profiles_charter_id_idx on public.charter_crew_profiles (charter_id);
create index if not exists charter_crew_profiles_display_order_idx on public.charter_crew_profiles (display_order);
create index if not exists charter_crew_profiles_charter_order_idx on public.charter_crew_profiles (charter_id, display_order);

alter table public.charter_gallery_images enable row level security;
alter table public.charter_amenities enable row level security;
alter table public.charter_crew_profiles enable row level security;

drop policy if exists "Public can read published charter gallery images" on public.charter_gallery_images;
create policy "Public can read published charter gallery images"
on public.charter_gallery_images
for select
using (
  exists (
    select 1
    from public.charters
    where charters.id = charter_gallery_images.charter_id
      and charters.status = 'published'
  )
);

drop policy if exists "Admins can manage charter gallery images" on public.charter_gallery_images;
create policy "Admins can manage charter gallery images"
on public.charter_gallery_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published charter amenities" on public.charter_amenities;
create policy "Public can read published charter amenities"
on public.charter_amenities
for select
using (
  exists (
    select 1
    from public.charters
    where charters.id = charter_amenities.charter_id
      and charters.status = 'published'
  )
);

drop policy if exists "Admins can manage charter amenities" on public.charter_amenities;
create policy "Admins can manage charter amenities"
on public.charter_amenities
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published charter crew profiles" on public.charter_crew_profiles;
create policy "Public can read published charter crew profiles"
on public.charter_crew_profiles
for select
using (
  exists (
    select 1
    from public.charters
    where charters.id = charter_crew_profiles.charter_id
      and charters.status = 'published'
  )
);

drop policy if exists "Admins can manage charter crew profiles" on public.charter_crew_profiles;
create policy "Admins can manage charter crew profiles"
on public.charter_crew_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
