-- =============================================
-- Verify: gallery category + album year migration (M5)
-- PRD: data_migration_enhancements_prd.html §8
--
-- Usage (psql):
--   \set tenant_id 'tenant_demo_002'
--   \i 005_verify_gallery_category_migration.sql
-- =============================================

\echo '--- Categories per tenant (active, sorted) ---'
SELECT slug, display_name, sort_order, is_active
FROM public.gallery_category
WHERE tenant_id = :tenant_id
  AND is_active = true
ORDER BY sort_order;

\echo '--- Public albums missing year or category ---'
SELECT id, title, album_year, gallery_category_id
FROM public.gallery_album
WHERE tenant_id = :tenant_id
  AND is_public = true
  AND (album_year IS NULL OR gallery_category_id IS NULL)
ORDER BY display_order, title;

\echo '--- Public albums with category join ---'
SELECT ga.id,
       ga.title,
       ga.album_year,
       gc.display_name AS category_name,
       gc.slug AS category_slug,
       ga.cover_image_url,
       ga.description
FROM public.gallery_album ga
LEFT JOIN public.gallery_category gc ON gc.id = ga.gallery_category_id
WHERE ga.tenant_id = :tenant_id
  AND ga.is_public = true
ORDER BY ga.display_order, ga.title;

\echo '--- Category counts ---'
SELECT gc.slug,
       gc.display_name,
       COUNT(ga.id) AS album_count
FROM public.gallery_category gc
LEFT JOIN public.gallery_album ga
    ON ga.gallery_category_id = gc.id
   AND ga.tenant_id = gc.tenant_id
   AND ga.is_public = true
WHERE gc.tenant_id = :tenant_id
GROUP BY gc.id, gc.slug, gc.display_name, gc.sort_order
ORDER BY gc.sort_order;

\echo '--- Schema columns present ---'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'gallery_album'
  AND column_name IN ('gallery_category_id', 'album_year')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'gallery_category'
ORDER BY ordinal_position;
