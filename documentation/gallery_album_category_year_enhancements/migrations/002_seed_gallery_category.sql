-- =============================================
-- Seed: gallery_category per tenant (M2)
-- PRD: data_migration_enhancements_prd.html §2
-- Run after: 001_gallery_category_schema.sql
--
-- Usage (psql):
--   \set tenant_id 'tenant_demo_002'
--   \i 002_seed_gallery_category.sql
--
-- Or replace :tenant_id with your NEXT_PUBLIC_TENANT_ID value.
-- =============================================

INSERT INTO public.gallery_category
    (tenant_id, slug, display_name, description, sort_order, is_active, created_at, updated_at)
VALUES
    (:tenant_id, 'ecumenical-visits', 'Ecumenical Visits', 'Ecumenical and inter-church visits', 10, true, now(), now()),
    (:tenant_id, 'major-events', 'Major Events', 'Enthronements, ordinations, and major church events', 20, true, now(), now()),
    (:tenant_id, 'receptions', 'Receptions', 'Official receptions and welcome ceremonies', 30, true, now(), now()),
    (:tenant_id, 'liturgical-events', 'Liturgical Events', 'Liturgical services and sacred ceremonies', 40, true, now(), now()),
    (:tenant_id, 'special-events', 'Special Events', 'Commemorations, inaugurations, and special occasions', 50, true, now(), now()),
    (:tenant_id, 'private-audiences', 'Private Audiences', 'Private audiences with church leaders', 60, true, now(), now()),
    (:tenant_id, 'church-visits', 'Church Visits', 'Parish and regional church visits', 70, true, now(), now()),
    (:tenant_id, 'conferences', 'Conferences', 'Conferences and formal gatherings', 80, true, now(), now())
ON CONFLICT (tenant_id, slug) DO NOTHING;
