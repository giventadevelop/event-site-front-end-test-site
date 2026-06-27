import type { OfficialDocumentCategoryDTO } from '@/types';

/**
 * Used when GET /api/official-document-categories is missing (404) on the backend.
 * Align slugs with `public.official_document_category` seed data (e.g. tenant_demo_002).
 * Disable via NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK=false
 */
export const OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK: OfficialDocumentCategoryDTO[] = [
  {
    slug: 'photos',
    displayName: 'Photos',
    description: 'Election photos, merit evening, general downloads',
    sortOrder: 10,
    isActive: true,
  },
  {
    slug: 'brochures',
    displayName: 'Brochures',
    description: 'Catholicate day book cover, brochures',
    sortOrder: 20,
    isActive: true,
  },
  {
    slug: 'calendars',
    displayName: 'Calendars',
    description: 'Panjangom and yearly calendars',
    sortOrder: 30,
    isActive: true,
  },
  {
    slug: 'insurance-benefits',
    displayName: 'Insurance & benefits',
    description: 'Medical insurance TPA and similar',
    sortOrder: 40,
    isActive: true,
  },
  {
    slug: 'official-circulars',
    displayName: 'Official circulars',
    description: 'Kalpana and official notices',
    sortOrder: 50,
    isActive: true,
  },
  {
    slug: 'financial-statements',
    displayName: 'Financial statements',
    description: 'Covering notes, MOSC financial statement formats',
    sortOrder: 60,
    isActive: true,
  },
  {
    slug: 'magazines',
    displayName: 'Magazines',
    description: 'Malankara Sabha magazine and periodicals',
    sortOrder: 70,
    isActive: true,
  },
  {
    slug: 'scholarships',
    displayName: 'Scholarships',
    description: 'Educational scholarship materials',
    sortOrder: 80,
    isActive: true,
  },
  {
    slug: 'awards-events',
    displayName: 'Awards & merit events',
    description: 'Merit awards, merit evening',
    sortOrder: 90,
    isActive: true,
  },
];
