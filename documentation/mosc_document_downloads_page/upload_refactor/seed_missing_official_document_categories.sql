-- Seed missing official document categories required by mirror upload
-- Default tenant used here: tenant_demo_002
-- Safe to rerun (UPSERT on unique (tenant_id, slug))

WITH seed(display_name, slug, sort_order) AS (
  VALUES
    ('Catholicate Day Book Cover, Brochure', 'catholicate-day-book-cover-brochure', 10),
    ('Panjangom', 'panjangom', 20),
    ('Medical Insurance', 'medical-insurance', 30),
    ('Covering Note to be submitted along with financial statements', 'covering-note-to-be-submitted-along-with-financial-statements', 40),
    ('Church Financial Statements format for the year ended 31March 2025 of MOSC', 'church-financial-statements-format-for-the-year-ended-31march-2025-of-mosc', 50),
    ('MALANKARA SABHA MAGAZINE', 'malankara-sabha-magazine', 60),
    ('EDUCATIONAL SPECIAL SCHOLARSHIP', 'educational-special-scholarship', 70),
    ('Merit Awards 2025', 'merit-awards-2025', 80),
    ('Marriage Marga Nirdesha Form', 'marriage-marga-nirdesha-form', 90),
    ('Budget format 2025-26', 'budget-format-2025-26', 100),
    ('GST', 'gst', 110),
    ('Tenders', 'tenders', 120),
    ('Mega Quiz qualified list', 'mega-quiz-qualified-list', 130),
    ('Charge handing over taking over Report for new Trustees and Secretary of the Parish', 'charge-handing-over-taking-over-report-for-new-trustees-and-secretary-of-the-par', 140),
    ('Account Statement Format', 'account-statement-format', 150),
    ('Malankara Association (2022 – 2027)', 'malankara-association-2022-2027', 160),
    ('Panjangom 2023', 'panjangom-2023', 170),
    ('Panjangom 2022', 'panjangom-2022', 180),
    ('ASSOCIATION SECRETARY ELECTION', 'association-secretary-election', 190),
    ('Catholicate Day 2022', 'catholicate-day-2022', 200),
    ('Malankara Association 2022', 'malankara-association-2022', 210),
    ('Application Forms', 'application-forms', 220),
    ('Malankara Association 2021', 'malankara-association-2021', 230),
    ('prayer', 'prayer', 240),
    ('Advertisement', 'advertisement', 250),
    ('FCRA Statements', 'fcra-statements', 260),
    ('Pratheeshetha Prameyam', 'pratheeshetha-prameyam', 270),
    ('Pdfs', 'pdfs', 280),
    ('Supreme Court Judgement, July 3, 2017', 'supreme-court-judgement-july-3-2017', 290),
    ('Priest Directory', 'priest-directory', 300),
    ('Malankara Association Association Secretary Election Final list 2017', 'malankara-association-association-secretary-election-final-list-2017', 310),
    ('Malankara Association 2017 – Agenda & Nominated Members List', 'malankara-association-2017-agenda-nominated-members-list', 320),
    ('Ministry of Human Empowernment', 'ministry-of-human-empowernment', 330),
    ('Guidelines for Preparing Church Accounts', 'guidelines-for-preparing-church-accounts', 340),
    ('Foreign Contributions', 'foreign-contributions', 350),
    ('local body Election winners award ceremony – Photos', 'local-body-election-winners-award-ceremony-photos', 360)
)
INSERT INTO public.official_document_category (
  id,
  tenant_id,
  slug,
  display_name,
  description,
  sort_order,
  is_active,
  created_at,
  updated_at
)
SELECT
  nextval('public.sequence_generator'::regclass),
  'tenant_demo_002',
  s.slug,
  s.display_name,
  'Auto-seeded for mirror upload refactor',
  s.sort_order,
  true,
  now(),
  now()
FROM seed s
ON CONFLICT (tenant_id, slug) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = now();

