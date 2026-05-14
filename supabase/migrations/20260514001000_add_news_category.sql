alter table public.news
add column if not exists category text;

create index if not exists news_category_idx on public.news (category);
