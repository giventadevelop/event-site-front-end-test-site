-- Migration: explicit hierarchy fields for official document uploads/tree rendering
-- Safe to run multiple times (PostgreSQL)

BEGIN;

ALTER TABLE IF EXISTS public.event_media
  ADD COLUMN IF NOT EXISTS hierarchy_path TEXT,
  ADD COLUMN IF NOT EXISTS hierarchy_category_label TEXT,
  ADD COLUMN IF NOT EXISTS display_priority INTEGER;

-- Recommended index for public downloads ordering/filtering
CREATE INDEX IF NOT EXISTS idx_event_media_official_tree_listing
  ON public.event_media (
    tenant_id,
    is_event_management_official_document,
    is_public,
    official_document_category_id,
    official_document_year,
    display_priority,
    priority_ranking,
    created_at
  );

-- Optional backfill from legacy description markers:
-- [[MOSC_CATEGORY_LABEL]] ...
-- [[MOSC_TREE_PATH]] ...
-- [[MOSC_PRIORITY]] ...
WITH parsed AS (
  SELECT
    id,
    NULLIF(substring(description FROM '\[\[MOSC_TREE_PATH\]\]\s*(.*)'), '') AS parsed_hierarchy_path,
    NULLIF(substring(description FROM '\[\[MOSC_CATEGORY_LABEL\]\]\s*(.*)'), '') AS parsed_category_label,
    NULLIF(substring(description FROM '\[\[MOSC_PRIORITY\]\]\s*([0-9]+)'), '')::INTEGER AS parsed_priority
  FROM public.event_media
  WHERE description IS NOT NULL
    AND is_event_management_official_document = TRUE
)
UPDATE public.event_media em
SET
  hierarchy_path = COALESCE(em.hierarchy_path, parsed.parsed_hierarchy_path),
  hierarchy_category_label = COALESCE(em.hierarchy_category_label, parsed.parsed_category_label),
  display_priority = COALESCE(em.display_priority, parsed.parsed_priority)
FROM parsed
WHERE em.id = parsed.id
  AND (
    em.hierarchy_path IS NULL
    OR em.hierarchy_category_label IS NULL
    OR em.display_priority IS NULL
  );

COMMIT;

