export const charterRegions = [
  { label: 'Amalfi Coast', shortLabel: 'Amalfi', slug: 'amalfi-coast', group: 'Mediterranean' },
  { label: 'Bahamas', shortLabel: 'Bahamas', slug: 'bahamas', group: 'Caribbean' },
  { label: 'Balearic Islands', shortLabel: 'Balearics', slug: 'balearic-islands', group: 'Mediterranean' },
  { label: 'Caribbean', shortLabel: 'Caribbean', slug: 'caribbean', group: 'Caribbean' },
  { label: 'Croatia', shortLabel: 'Croatia', slug: 'croatia', group: 'Mediterranean' },
  { label: 'East Mediterranean', shortLabel: 'East Med', slug: 'east-mediterranean', group: 'Mediterranean' },
  { label: 'Florida', shortLabel: 'Florida', slug: 'florida', group: 'USA' },
  { label: 'French Riviera', shortLabel: 'Riviera', slug: 'french-riviera', group: 'Mediterranean' },
  { label: 'Greek Islands', shortLabel: 'Greek Is.', slug: 'greek-islands', group: 'Mediterranean' },
  { label: 'Maldives', shortLabel: 'Maldives', slug: 'maldives', group: 'Indian Ocean' },
  { label: 'Mediterranean', shortLabel: 'Med', slug: 'mediterranean', group: 'Mediterranean' },
  { label: 'New England', shortLabel: 'New England', slug: 'new-england', group: 'USA' },
  { label: 'Pacific Northwest', shortLabel: 'PNW', slug: 'pacific-northwest', group: 'USA' },
  { label: 'SE USA / Bahamas', shortLabel: 'SE USA/BHS', slug: 'se-usa-bahamas', group: 'USA' },
  { label: 'Seychelles', shortLabel: 'Seychelles', slug: 'seychelles', group: 'Indian Ocean' },
  { label: 'South Pacific', shortLabel: 'South Pacific', slug: 'south-pacific', group: 'Pacific' },
  { label: 'Thailand', shortLabel: 'Thailand', slug: 'thailand', group: 'Asia' },
  { label: 'Turkey', shortLabel: 'Turkey', slug: 'turkey', group: 'Mediterranean' },
  { label: 'UAE', shortLabel: 'UAE', slug: 'uae', group: 'Middle East' },
  { label: 'West Mediterranean', shortLabel: 'West Med', slug: 'west-mediterranean', group: 'Mediterranean' },
];

export const charterRegionOptions = charterRegions.map((region) => ({
  ...region,
  value: region.label,
}));
