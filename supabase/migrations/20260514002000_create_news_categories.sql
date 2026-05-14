-- News category management for LYG CMS.

create table if not exists public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_news_categories_updated_at on public.news_categories;
create trigger set_news_categories_updated_at
before update on public.news_categories
for each row execute function public.set_updated_at();

insert into public.news_categories (name, slug)
values
  ('Charter', 'charter'),
  ('Crew', 'crew'),
  ('Management', 'management'),
  ('Sales', 'sales')
on conflict (slug) do nothing;

alter table public.news
add column if not exists category_id uuid references public.news_categories(id) on delete set null;

update public.news as news
set category_id = categories.id
from public.news_categories as categories
where news.category_id is null
  and news.category is not null
  and trim(lower(news.category)) = trim(lower(categories.name));

create index if not exists news_category_id_idx on public.news (category_id);
create index if not exists news_categories_slug_idx on public.news_categories (slug);

alter table public.news_categories enable row level security;

drop policy if exists "Public can read news categories" on public.news_categories;
create policy "Public can read news categories"
on public.news_categories
for select
using (true);

drop policy if exists "Admins can manage news categories" on public.news_categories;
create policy "Admins can manage news categories"
on public.news_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
