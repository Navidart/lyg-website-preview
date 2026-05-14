-- LYG CMS foundation tables and policies
-- Database structure only: news, destinations, yachts, charters, inquiries.

create extension if not exists pgcrypto;

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
      and trim(lower(role)) = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  region text,
  short_description text,
  content text,
  featured_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.yachts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  yacht_type text,
  builder text,
  year integer,
  length numeric(8, 2),
  price numeric(14, 2),
  currency text not null default 'USD',
  short_description text,
  content text,
  featured_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  weekly_rate numeric(14, 2),
  currency text not null default 'USD',
  destination text,
  short_description text,
  content text,
  featured_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  inquiry_type text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_review', 'assigned', 'closed')),
  created_at timestamptz not null default now()
);

drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists set_destinations_updated_at on public.destinations;
create trigger set_destinations_updated_at
before update on public.destinations
for each row execute function public.set_updated_at();

drop trigger if exists set_yachts_updated_at on public.yachts;
create trigger set_yachts_updated_at
before update on public.yachts
for each row execute function public.set_updated_at();

drop trigger if exists set_charters_updated_at on public.charters;
create trigger set_charters_updated_at
before update on public.charters
for each row execute function public.set_updated_at();

create index if not exists news_slug_idx on public.news (slug);
create index if not exists news_status_idx on public.news (status);
create index if not exists news_created_at_idx on public.news (created_at desc);
create index if not exists news_published_at_idx on public.news (published_at desc);

create index if not exists destinations_slug_idx on public.destinations (slug);
create index if not exists destinations_status_idx on public.destinations (status);
create index if not exists destinations_created_at_idx on public.destinations (created_at desc);
create index if not exists destinations_region_idx on public.destinations (region);

create index if not exists yachts_slug_idx on public.yachts (slug);
create index if not exists yachts_status_idx on public.yachts (status);
create index if not exists yachts_created_at_idx on public.yachts (created_at desc);
create index if not exists yachts_yacht_type_idx on public.yachts (yacht_type);
create index if not exists yachts_builder_idx on public.yachts (builder);

create index if not exists charters_slug_idx on public.charters (slug);
create index if not exists charters_status_idx on public.charters (status);
create index if not exists charters_created_at_idx on public.charters (created_at desc);
create index if not exists charters_destination_idx on public.charters (destination);

create index if not exists inquiries_user_id_idx on public.inquiries (user_id);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_inquiry_type_idx on public.inquiries (inquiry_type);

alter table public.news enable row level security;
alter table public.destinations enable row level security;
alter table public.yachts enable row level security;
alter table public.charters enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news
for select
using (status = 'published');

drop policy if exists "Admins can manage news" on public.news;
create policy "Admins can manage news"
on public.news
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published destinations" on public.destinations;
create policy "Public can read published destinations"
on public.destinations
for select
using (status = 'published');

drop policy if exists "Admins can manage destinations" on public.destinations;
create policy "Admins can manage destinations"
on public.destinations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published yachts" on public.yachts;
create policy "Public can read published yachts"
on public.yachts
for select
using (status = 'published');

drop policy if exists "Admins can manage yachts" on public.yachts;
create policy "Admins can manage yachts"
on public.yachts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published charters" on public.charters;
create policy "Public can read published charters"
on public.charters
for select
using (status = 'published');

drop policy if exists "Admins can manage charters" on public.charters;
create policy "Admins can manage charters"
on public.charters
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage inquiries" on public.inquiries;
create policy "Admins can manage inquiries"
on public.inquiries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can create inquiries" on public.inquiries;
create policy "Authenticated users can create inquiries"
on public.inquiries
for insert
to authenticated
with check (user_id = auth.uid());
