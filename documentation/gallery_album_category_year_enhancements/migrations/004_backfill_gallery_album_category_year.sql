-- =============================================
-- Backfill: gallery_album category + year (M3)
-- For albums that already exist in DB — match by title or static_slug in description.
-- Run after: 002_seed_gallery_category.sql
--
-- Usage (psql):
--   \set tenant_id 'tenant_demo_002'
--   \i 004_backfill_gallery_album_category_year.sql
-- =============================================

-- Match by title (case-insensitive substring) for known static albums already in DB
UPDATE public.gallery_album ga
SET album_year = 2019,
    gallery_category_id = (
        SELECT id FROM public.gallery_category gc
        WHERE gc.tenant_id = ga.tenant_id AND gc.slug = 'ecumenical-visits'
    ),
    updated_at = now()
WHERE ga.tenant_id = :tenant_id
  AND ga.title ILIKE '%Russia visit%'
  AND ga.album_year IS NULL;

UPDATE public.gallery_album ga
SET album_year = 2023,
    gallery_category_id = (
        SELECT id FROM public.gallery_category gc
        WHERE gc.tenant_id = ga.tenant_id AND gc.slug = 'ecumenical-visits'
    ),
    updated_at = now()
WHERE ga.tenant_id = :tenant_id
  AND ga.title ILIKE '%VATICAN VISIT%'
  AND ga.album_year IS NULL;

UPDATE public.gallery_album ga
SET album_year = 2021,
    gallery_category_id = (
        SELECT id FROM public.gallery_category gc
        WHERE gc.tenant_id = ga.tenant_id AND gc.slug = 'major-events'
    ),
    updated_at = now()
WHERE ga.tenant_id = :tenant_id
  AND ga.title ILIKE '%ENTHRONEMENT CEREMONY%MATHEWS III%'
  AND ga.album_year IS NULL;

UPDATE public.gallery_album ga
SET album_year = 2021,
    gallery_category_id = (
        SELECT id FROM public.gallery_category gc
        WHERE gc.tenant_id = ga.tenant_id AND gc.slug = 'receptions'
    ),
    updated_at = now()
WHERE ga.tenant_id = :tenant_id
  AND ga.title ILIKE '%RECEPTION TO HIS HOLINESS BASELIOS%'
  AND ga.album_year IS NULL;

-- Backfill imported rows that have static_slug= in description but missing category/year
UPDATE public.gallery_album ga
SET album_year = v.album_year,
    gallery_category_id = gc.id,
    updated_at = now()
FROM (
    VALUES
        ('russia-visit', 2019, 'ecumenical-visits'),
        ('vatican-visit', 2023, 'ecumenical-visits'),
        ('enthronement-mathews-iii', 2021, 'major-events'),
        ('reception-mathews-iii', 2021, 'receptions'),
        ('paulose-ii-with-kiril', 2019, 'ecumenical-visits'),
        ('st-matrona-relics', 2019, 'liturgical-events'),
        ('st-cyril-methodius', 2019, 'receptions'),
        ('metropolitan-hilarion', 2019, 'ecumenical-visits'),
        ('pokrovsky-monastery', 2019, 'liturgical-events'),
        ('mother-feofania', 2019, 'special-events'),
        ('ceremonial-reception-russian-orthodox', 2019, 'ecumenical-visits'),
        ('offering-incense-st-thomas', 2016, 'liturgical-events'),
        ('order-st-thomas-abune-mathias', 2016, 'major-events'),
        ('visit-abune-mathias', 2016, 'ecumenical-visits'),
        ('reception-tikon-puthupally', 2015, 'receptions'),
        ('website-inauguration', 2015, 'special-events'),
        ('private-audience-tikon-devalokam', 2015, 'private-audiences'),
        ('canberra-visit', 2015, 'church-visits'),
        ('dharma-dhamma-conference', 2015, 'conferences'),
        ('vienna-fraternity', 2013, 'special-events'),
        ('armenian-genocide-canonization', 2015, 'special-events'),
        ('armenian-president', 2015, 'special-events'),
        ('private-audience-karekin', 2015, 'private-audiences'),
        ('enthronement-coptic-pope', 2012, 'ecumenical-visits'),
        ('blessing-holy-myron', 2015, 'liturgical-events'),
        ('private-audience-aram', 2015, 'private-audiences'),
        ('armenian-genocide-100th', 2015, 'special-events'),
        ('ethiopian-visit', 2013, 'ecumenical-visits'),
        ('rome-visit', 2013, 'ecumenical-visits')
) AS v(static_slug, album_year, category_slug)
JOIN public.gallery_category gc
    ON gc.tenant_id = ga.tenant_id
   AND gc.slug = v.category_slug
WHERE ga.tenant_id = :tenant_id
  AND ga.description = 'static_slug=' || v.static_slug
  AND (ga.album_year IS NULL OR ga.gallery_category_id IS NULL);

-- Optional demo tenant QA: assign a category to sample albums without year semantics
-- UPDATE public.gallery_album ga
-- SET gallery_category_id = (
--         SELECT id FROM public.gallery_category gc
--         WHERE gc.tenant_id = ga.tenant_id AND gc.slug = 'major-events'
--     ),
--     album_year = EXTRACT(YEAR FROM ga.created_at)::integer,
--     updated_at = now()
-- WHERE ga.tenant_id = :tenant_id
--   AND ga.title IN ('Chicago Malayalee Association', 'Malayalees US')
--   AND ga.gallery_category_id IS NULL;
