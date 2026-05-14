-- One-time seed for existing static homepage newsroom cards.
-- Source: src/data.js -> articles
-- Images are remote Figma MCP asset URLs. They may expire and should be uploaded
-- to Supabase Storage later for permanent production use.

insert into public.news (
  title,
  slug,
  excerpt,
  content,
  category,
  category_id,
  featured_image,
  status,
  published_at,
  created_at,
  updated_at
)
values
  (
    'Top Mediterranean Destinations for 2024',
    'top-mediterranean-destinations-for-2024',
    'Top Mediterranean Destinations for 2024',
    'Top Mediterranean Destinations for 2024',
    'Charter',
    (select id from public.news_categories where slug = 'charter'),
    'https://www.figma.com/api/mcp/asset/4e3f7c12-2f3c-44eb-8c5f-371be15dc553',
    'published',
    '2026-05-08 00:00:00+00',
    now(),
    now()
  ),
  (
    'Chief Stewardess Duties and Salary Guide',
    'chief-stewardess-duties-and-salary-guide',
    'Chief Stewardess Duties and Salary Guide',
    'Chief Stewardess Duties and Salary Guide',
    'Crew',
    (select id from public.news_categories where slug = 'crew'),
    'https://www.figma.com/api/mcp/asset/434b8d5b-c535-40b9-b9d0-4bac1c9ccce6',
    'published',
    '2026-05-06 00:00:00+00',
    now(),
    now()
  ),
  (
    'Streamline Yacht Payroll and Stay Compliant',
    'streamline-yacht-payroll-and-stay-compliant',
    'Streamline Yacht Payroll and Stay Compliant',
    'Streamline Yacht Payroll and Stay Compliant',
    'Management',
    (select id from public.news_categories where slug = 'management'),
    'https://www.figma.com/api/mcp/asset/f27eacef-21da-4e72-87a7-5a11463ee8c8',
    'published',
    '2026-05-03 00:00:00+00',
    now(),
    now()
  ),
  (
    'Buying a Yacht: A Step-by-Step Guide',
    'buying-a-yacht-a-step-by-step-guide',
    'Buying a Yacht: A Step-by-Step Guide',
    'Buying a Yacht: A Step-by-Step Guide',
    'Sales',
    (select id from public.news_categories where slug = 'sales'),
    'https://www.figma.com/api/mcp/asset/91d5dc27-6a34-4da2-b6c9-223f550bf386',
    'published',
    '2026-05-01 00:00:00+00',
    now(),
    now()
  ),
  (
    'A Guide to Yacht Operating Costs',
    'a-guide-to-yacht-operating-costs',
    'A Guide to Yacht Operating Costs',
    'A Guide to Yacht Operating Costs',
    'Management',
    (select id from public.news_categories where slug = 'management'),
    'https://www.figma.com/api/mcp/asset/e49f9899-75d5-4104-bc53-6e20ede1a2c3',
    'published',
    '2026-04-29 00:00:00+00',
    now(),
    now()
  )
on conflict (slug) do nothing;
