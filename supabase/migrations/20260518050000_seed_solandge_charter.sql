-- Seed SOLANDGE charter record from the public charter reference page.
-- Forward seed migration only. Safe to re-run without duplicating the charter.

insert into public.charters (
  title,
  slug,
  weekly_rate,
  currency,
  destination,
  short_description,
  content,
  featured_image,
  status,
  full_description,
  featured,
  hero_image,
  price_from,
  price_unit,
  seasonal_pricing_notes,
  primary_region,
  available_regions,
  embarkation_notes,
  cruising_area_notes,
  guests,
  cabins,
  crew_count,
  length,
  length_unit,
  beam,
  draft,
  builder,
  designer,
  year_built,
  year_refit,
  cruising_speed,
  max_speed,
  engines,
  flag,
  hull_type,
  gross_tonnage,
  highlighted_specs
)
values (
  'SOLANDGE',
  'solandge',
  1150000,
  'EUR',
  'West Mediterranean',
  'Luxury 85.1m Lürssen motor yacht for charter in the Mediterranean.',
  'SOLANDGE is an 85.1m Lürssen motor yacht available for Mediterranean charter, offering expansive guest accommodation, a large professional crew, refined interior spaces, and substantial wellness, entertainment, and water-sports facilities. Built in 2013 and refit in 2024, she combines pedigree German construction with updated charter presentation across the East and West Mediterranean.',
  null,
  'draft',
  'SOLANDGE is an 85.1m Lürssen motor yacht available for Mediterranean charter, offering expansive guest accommodation, a large professional crew, refined interior spaces, and substantial wellness, entertainment, and water-sports facilities. Built in 2013 and refit in 2024, she combines pedigree German construction with updated charter presentation across the East and West Mediterranean.',
  true,
  null,
  1150000,
  'per week',
  null,
  'West Mediterranean',
  array['East Mediterranean', 'West Mediterranean']::text[],
  null,
  'Chartering in the East Mediterranean and West Mediterranean.',
  12,
  6,
  34,
  85.1,
  'm',
  13.8,
  3.9,
  'Lürssen',
  'Espen Oeino',
  2013,
  2024,
  15,
  18,
  '2 x Caterpillar 3516C',
  'Malta',
  null,
  null,
  array['guests', 'cabins', 'length', 'builder', 'year_built', 'year_refit', 'price_from']::text[]
)
on conflict (slug) do update
set
  title = excluded.title,
  weekly_rate = excluded.weekly_rate,
  currency = excluded.currency,
  destination = excluded.destination,
  short_description = excluded.short_description,
  content = excluded.content,
  featured_image = excluded.featured_image,
  status = excluded.status,
  full_description = excluded.full_description,
  featured = excluded.featured,
  hero_image = excluded.hero_image,
  price_from = excluded.price_from,
  price_unit = excluded.price_unit,
  seasonal_pricing_notes = excluded.seasonal_pricing_notes,
  primary_region = excluded.primary_region,
  available_regions = excluded.available_regions,
  embarkation_notes = excluded.embarkation_notes,
  cruising_area_notes = excluded.cruising_area_notes,
  guests = excluded.guests,
  cabins = excluded.cabins,
  crew_count = excluded.crew_count,
  length = excluded.length,
  length_unit = excluded.length_unit,
  beam = excluded.beam,
  draft = excluded.draft,
  builder = excluded.builder,
  designer = excluded.designer,
  year_built = excluded.year_built,
  year_refit = excluded.year_refit,
  cruising_speed = excluded.cruising_speed,
  max_speed = excluded.max_speed,
  engines = excluded.engines,
  flag = excluded.flag,
  hull_type = excluded.hull_type,
  gross_tonnage = excluded.gross_tonnage,
  highlighted_specs = excluded.highlighted_specs,
  updated_at = now();

delete from public.charter_amenities
where charter_id = (select id from public.charters where slug = 'solandge');

with selected_amenities(category_slug, name, display_order) as (
  values
    ('general', 'Air Conditioning', 0),
    ('general', 'Beauty salon', 1),
    ('general', 'Movie Theatre', 2),
    ('general', 'Dance floor', 3),
    ('general', 'Elevator', 4),
    ('general', 'Exercise equipment', 5),
    ('general', 'Light fishing gear', 6),
    ('general', 'Gym', 7),
    ('general', 'Helipad', 8),
    ('general', 'iPod dock', 9),
    ('general', 'Jacuzzi on deck', 10),
    ('general', 'Karaoke', 11),
    ('general', 'Media movie server', 12),
    ('general', 'Outdoor audio system', 13),
    ('general', 'Satellite Communications', 14),
    ('general', 'Satellite TV', 15),
    ('general', 'Sauna', 16),
    ('general', 'Spa', 17),
    ('general', 'Stabilizers At Anchor', 18),
    ('general', 'Steam room', 19),
    ('general', 'Swimming pool', 20),
    ('general', 'TV outdoor', 21),
    ('general', 'Wi-Fi', 22),
    ('toys', 'Jet Ski (standup)', 23),
    ('toys', 'Kayak', 24),
    ('toys', 'Paddleboards', 25),
    ('toys', 'Surf board', 26),
    ('toys', 'Tube - towable', 27),
    ('toys', 'Wakeboard', 28),
    ('toys', 'Waverunners (Sit Down)', 29),
    ('tenders', '1x 32ft Naiad Diesel tender', 30),
    ('tenders', '1x 23'' Centurion Wake Boat', 31),
    ('diving', '1 Compressors', 32),
    ('diving', 'Brownies third lung', 33),
    ('diving', 'Snorkeling Gear', 34)
)
insert into public.charter_amenities (
  charter_id,
  amenity_id,
  category,
  name,
  icon,
  display_order
)
select
  charters.id,
  amenities.id,
  amenity_categories.slug,
  amenities.name,
  amenities.icon,
  selected_amenities.display_order
from selected_amenities
join public.amenity_categories
  on amenity_categories.slug = selected_amenities.category_slug
join public.amenities
  on amenities.category_id = amenity_categories.id
 and amenities.name = selected_amenities.name
join public.charters
  on charters.slug = 'solandge';

delete from public.charter_crew_profiles
where charter_id = (select id from public.charters where slug = 'solandge');

with crew_profiles(crew_name, role, bio, display_order) as (
  values
    ('Ben Webb', 'Captain', 'Commercial Master with deep large-yacht command experience and a background across offshore, survey, cruise, and yacht operations.', 0),
    ('Dimitris Tzikas', 'Captain (Rotational)', 'Merchant Marine Academy graduate and Captain Class A holder with naval, cargo, and charter yacht command experience.', 1),
    ('Flemming Eliasen', 'Chief Officer (Rotational)', 'Faroe Islands seafarer with deck and engineering credentials, commercial maritime experience, and Master Mariner progression in yachting.', 2),
    ('Andy Shilton', 'Chief Officer (Rotational)', 'Experienced deck officer whose yachting career spans major yachts, bridge operations, tender work, training, and crew leadership.', 3),
    ('Brian De Saint Pern', 'Second Officer', 'Bridge and deck professional with yachting experience since 2016 and a strong focus on navigation, safety, and crew coordination.', 4),
    ('Asimina Paspaliari', 'Purser (Primary)', 'Experienced purser from private and commercial vessels, bringing organized administration, flexibility, and a warm team-focused approach.', 5),
    ('Samantha Morris', 'Purser (Relief)', 'Purser with cruise ship and superyacht experience, financial management expertise, coaching studies, and crew welfare credentials.', 6),
    ('Travis Ludbrook', 'Chief Engineer (Rotational)', 'Australian engineer involved with SOLANDGE from build, bringing major project knowledge and long-standing technical familiarity with the yacht.', 7),
    ('Colm Fitzsimmons-Wilson', 'Chief Engineer (Rotational)', 'Y1-certified marine engineer with Royal Navy background and more than two decades of engineering experience across naval and yacht operations.', 8),
    ('Bryan Fay', 'Second Engineer (Rotational)', 'Engineering graduate and marine engineer who moved into yachting after consulting work, with broad travel and hands-on technical experience.', 9),
    ('Dean James', 'Second Engineer (Rotational)', 'South African engineer shaped by a coastal upbringing, water sports, and a practical interest in fixing and building systems.', 10),
    ('Jack Gunstone Smith', 'Third Engineer', 'Welsh engineer with traditional boatbuilding and shipwright training, yacht delivery experience, and ongoing officer-of-the-watch ambitions.', 11)
)
insert into public.charter_crew_profiles (
  charter_id,
  avatar_image,
  crew_name,
  role,
  bio,
  display_order
)
select
  charters.id,
  null,
  crew_profiles.crew_name,
  crew_profiles.role,
  crew_profiles.bio,
  crew_profiles.display_order
from crew_profiles
join public.charters
  on charters.slug = 'solandge';
