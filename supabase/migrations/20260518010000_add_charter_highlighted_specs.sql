-- Add highlighted specification keys for the Charters admin form.
-- Values remain stored once in the existing specification columns.

alter table public.charters
add column if not exists highlighted_specs text[] not null default array['guests', 'cabins', 'crew_count', 'length']::text[];

update public.charters
set highlighted_specs = array['guests', 'cabins', 'crew_count', 'length']::text[]
where highlighted_specs is null
   or cardinality(highlighted_specs) = 0;
