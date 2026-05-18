create table if not exists public.amenity_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint amenity_categories_status_check check (status in ('active', 'inactive'))
);

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.amenity_categories(id) on delete set null,
  name text not null,
  icon text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint amenities_status_check check (status in ('active', 'inactive')),
  constraint amenities_category_name_unique unique (category_id, name)
);

insert into public.amenity_categories (name, slug, display_order, status)
values
  ('General', 'general', 0, 'active'),
  ('Toys', 'toys', 1, 'active'),
  ('Tenders', 'tenders', 2, 'active'),
  ('Diving', 'diving', 3, 'active')
on conflict (slug) do nothing;

alter table public.charter_amenities
drop constraint if exists charter_amenities_category_check;

alter table public.charter_amenities
add column if not exists amenity_id uuid references public.amenities(id) on delete cascade;

alter table public.charter_amenities
alter column category drop not null,
alter column name drop not null;

insert into public.amenity_categories (name, slug, status)
select distinct
  initcap(replace(category, '-', ' ')) as name,
  lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  'active'
from public.charter_amenities
where amenity_id is null
  and category is not null
on conflict (slug) do nothing;

insert into public.amenities (category_id, name, icon, status)
select distinct on (amenity_categories.id, charter_amenities.name)
  amenity_categories.id,
  charter_amenities.name,
  charter_amenities.icon,
  'active'
from public.charter_amenities
join public.amenity_categories
  on amenity_categories.slug = lower(regexp_replace(charter_amenities.category, '[^a-zA-Z0-9]+', '-', 'g'))
where charter_amenities.amenity_id is null
  and charter_amenities.name is not null
on conflict (category_id, name) do nothing;

update public.charter_amenities
set amenity_id = amenities.id
from public.amenities
join public.amenity_categories
  on amenity_categories.id = amenities.category_id
where charter_amenities.amenity_id is null
  and charter_amenities.name = amenities.name
  and amenity_categories.slug = lower(regexp_replace(charter_amenities.category, '[^a-zA-Z0-9]+', '-', 'g'));

create unique index if not exists charter_amenities_charter_amenity_unique_idx
on public.charter_amenities (charter_id, amenity_id)
where amenity_id is not null;

create index if not exists charter_amenities_amenity_id_idx on public.charter_amenities (amenity_id);
create index if not exists amenity_categories_status_idx on public.amenity_categories (status);
create index if not exists amenities_category_id_idx on public.amenities (category_id);
create index if not exists amenities_status_idx on public.amenities (status);
create index if not exists amenities_name_idx on public.amenities (name);

drop trigger if exists set_amenity_categories_updated_at on public.amenity_categories;
create trigger set_amenity_categories_updated_at
before update on public.amenity_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_amenities_updated_at on public.amenities;
create trigger set_amenities_updated_at
before update on public.amenities
for each row execute function public.set_updated_at();

alter table public.amenity_categories enable row level security;
alter table public.amenities enable row level security;

drop policy if exists "Public can read active amenity categories" on public.amenity_categories;
create policy "Public can read active amenity categories"
on public.amenity_categories
for select
using (status = 'active');

drop policy if exists "Admins can manage amenity categories" on public.amenity_categories;
create policy "Admins can manage amenity categories"
on public.amenity_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active amenities" on public.amenities;
create policy "Public can read active amenities"
on public.amenities
for select
using (status = 'active');

drop policy if exists "Admins can manage amenities" on public.amenities;
create policy "Admins can manage amenities"
on public.amenities
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
