-- Seed global amenity library from the SOLANDGE charter reference.
-- Forward seed migration only. Safe to re-run without duplicating rows.

with seed_categories(name, slug, display_order) as (
  values
    ('General', 'general', 0),
    ('Toys', 'toys', 1),
    ('Tenders', 'tenders', 2),
    ('Diving', 'diving', 3)
)
insert into public.amenity_categories (name, slug, display_order, status)
select name, slug, display_order, 'active'
from seed_categories
on conflict (slug) do nothing;

with seed_amenities(category_slug, name, display_order) as (
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
    ('toys', 'Jet Ski (standup)', 0),
    ('toys', 'Kayak', 1),
    ('toys', 'Paddleboards', 2),
    ('toys', 'Surf board', 3),
    ('toys', 'Tube - towable', 4),
    ('toys', 'Wakeboard', 5),
    ('toys', 'Waverunners (Sit Down)', 6),
    ('tenders', '1x 32ft Naiad Diesel tender', 0),
    ('tenders', '1x 23'' Centurion Wake Boat', 1),
    ('diving', '1 Compressors', 0),
    ('diving', 'Brownies third lung', 1),
    ('diving', 'Snorkeling Gear', 2)
)
insert into public.amenities (category_id, name, icon, status)
select
  amenity_categories.id,
  seed_amenities.name,
  'src/assets/icons/navigation/ico-arrow-right-small.svg',
  'active'
from seed_amenities
join public.amenity_categories
  on amenity_categories.slug = seed_amenities.category_slug
on conflict (category_id, name) do nothing;
