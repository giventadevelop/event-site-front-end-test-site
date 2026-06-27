/**
 * Tenant default homepage hero image helpers.
 * @see documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md
 */

export type DefaultHeroDisplayMode = 'slideshow' | 'random' | 'single';

export interface DefaultHeroSlide {
  url: string;
  active: boolean;
  fileName?: string;
}

export const BUNDLED_EMERGENCY_HERO_IMAGE =
  '/images/hero_section/hero_images/fallback/default-hero.webp';

export const DEFAULT_HERO_DISPLAY_MODES: DefaultHeroDisplayMode[] = [
  'slideshow',
  'random',
  'single',
];

export const MAX_TENANT_HERO_SLIDES = 20;
export const MAX_ACTIVE_SLIDES = 10;
export const RANDOM_FALLBACK_COUNT = 3;
export const DEFAULT_HERO_MAX_DISPLAY_COUNT = 6;
export const MAX_HERO_DISPLAY_COUNT = 6;

type HeroUrlSource = {
  defaultHeroImageUrls?: string[] | null;
  defaultHeroImageUrlsJson?: string | null;
};

function isHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseJsonArray(raw: string): unknown[] | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * True when JSON is a legacy plain URL array (all URLs shown on homepage until admin saves enriched format).
 */
export function isLegacyPlainHeroUrlJson(json?: string | null): boolean {
  const arr = json ? parseJsonArray(json) : null;
  if (!arr || arr.length === 0) return false;
  return arr.every((item) => typeof item === 'string');
}

/**
 * Parse tenant hero slides from API DTO, JSON string, or legacy plain URL array.
 */
export function parseTenantDefaultHeroSlides(
  source?: HeroUrlSource | string | null
): DefaultHeroSlide[] {
  if (!source) return [];

  if (typeof source === 'string') {
    const arr = parseJsonArray(source);
    if (arr) {
      if (isLegacyPlainHeroUrlJson(source)) {
        return arr
          .filter((item): item is string => typeof item === 'string')
          .map((url) => url.trim())
          .filter((url) => url.length > 0 && isHttpsUrl(url))
          .map((url) => ({ url, active: true }));
      }
      const slides: DefaultHeroSlide[] = [];
      for (const item of arr) {
        if (typeof item === 'string') {
          const url = item.trim();
          if (url && isHttpsUrl(url)) slides.push({ url, active: true });
        } else if (item && typeof item === 'object' && 'url' in item) {
          const rec = item as { url?: unknown; active?: unknown; fileName?: unknown };
          const url = typeof rec.url === 'string' ? rec.url.trim() : '';
          if (!url || !isHttpsUrl(url)) continue;
          slides.push({
            url,
            active: typeof rec.active === 'boolean' ? rec.active : false,
            fileName: typeof rec.fileName === 'string' ? rec.fileName : undefined,
          });
        }
      }
      return slides;
    }
    return source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && isHttpsUrl(line))
      .map((url) => ({ url, active: false }));
  }

  if (Array.isArray(source.defaultHeroImageUrls) && source.defaultHeroImageUrls.length > 0) {
    return source.defaultHeroImageUrls
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && isHttpsUrl(url))
      .map((url) => ({ url, active: true }));
  }

  return parseTenantDefaultHeroSlides(source.defaultHeroImageUrlsJson ?? null);
}

/**
 * @deprecated Prefer parseTenantDefaultHeroSlides — returns flat URL list for legacy callers.
 */
export function parseTenantDefaultHeroUrls(
  source?: HeroUrlSource | string | null
): string[] {
  return parseTenantDefaultHeroSlides(source).map((s) => s.url);
}

/**
 * Serialize enriched slides for tenant_settings.default_hero_image_urls_json.
 */
export function serializeDefaultHeroSlides(slides: DefaultHeroSlide[]): string {
  const cleaned = slides
    .filter((s) => s.url.trim().length > 0 && isHttpsUrl(s.url.trim()))
    .slice(0, MAX_TENANT_HERO_SLIDES)
    .map((s) => ({
      url: s.url.trim(),
      active: !!s.active,
      ...(s.fileName ? { fileName: s.fileName } : {}),
    }));
  return JSON.stringify(cleaned);
}

/**
 * @deprecated Prefer serializeDefaultHeroSlides.
 */
export function serializeDefaultHeroImageUrls(urls: string[]): string {
  return serializeDefaultHeroSlides(urls.map((url) => ({ url, active: true })));
}

export function normalizeDefaultHeroDisplayMode(
  value?: string | null
): DefaultHeroDisplayMode {
  if (value === 'random' || value === 'single' || value === 'slideshow') {
    return value;
  }
  return 'slideshow';
}

export function normalizeMaxDisplayCount(value?: number | null): number {
  if (value == null || Number.isNaN(value)) return DEFAULT_HERO_MAX_DISPLAY_COUNT;
  return Math.min(MAX_HERO_DISPLAY_COUNT, Math.max(1, Math.floor(value)));
}

function pickRandomUrls(urls: string[], count: number): string[] {
  if (urls.length === 0) return [];
  const pool = [...urls];
  const picked: string[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

/**
 * Resolve tenant-default hero URLs for homepage display (before display-mode shuffle/slideshow).
 */
export function resolveTenantDefaultHeroUrlsForDisplay(
  json?: string | null,
  maxDisplayCount?: number | null
): string[] {
  if (!json?.trim()) return [BUNDLED_EMERGENCY_HERO_IMAGE];

  const slides = parseTenantDefaultHeroSlides(json);
  if (slides.length === 0) return [BUNDLED_EMERGENCY_HERO_IMAGE];

  if (isLegacyPlainHeroUrlJson(json)) {
    return slides.map((s) => s.url);
  }

  const cap = normalizeMaxDisplayCount(maxDisplayCount);
  const activeSlides = slides.filter((s) => s.active);

  if (activeSlides.length === 0) {
    const library = slides.map((s) => s.url);
    const random = pickRandomUrls(library, RANDOM_FALLBACK_COUNT);
    return random.length > 0 ? random : [BUNDLED_EMERGENCY_HERO_IMAGE];
  }

  return activeSlides
    .slice(0, Math.min(activeSlides.length, cap))
    .map((s) => s.url);
}

/**
 * Admin preview — same resolver rules as homepage; optional stable random seed for zero-active state.
 */
export function resolveTenantDefaultHeroUrlsForPreview(
  json?: string | null,
  maxDisplayCount?: number | null,
  previewSeed?: number
): { urls: string[]; mode: 'active' | 'random-fallback' | 'legacy' | 'empty' } {
  if (!json?.trim()) {
    return { urls: [BUNDLED_EMERGENCY_HERO_IMAGE], mode: 'empty' };
  }

  const slides = parseTenantDefaultHeroSlides(json);
  if (slides.length === 0) {
    return { urls: [BUNDLED_EMERGENCY_HERO_IMAGE], mode: 'empty' };
  }

  if (isLegacyPlainHeroUrlJson(json)) {
    return { urls: slides.map((s) => s.url), mode: 'legacy' };
  }

  const cap = normalizeMaxDisplayCount(maxDisplayCount);
  const activeSlides = slides.filter((s) => s.active);

  if (activeSlides.length === 0) {
    const library = slides.map((s) => s.url);
    if (previewSeed != null) {
      const shuffled = [...library].sort(
        (a, b) =>
          (a.charCodeAt(0) + previewSeed) % 97 - (b.charCodeAt(0) + previewSeed) % 97
      );
      return {
        urls: shuffled.slice(0, Math.min(RANDOM_FALLBACK_COUNT, shuffled.length)),
        mode: 'random-fallback',
      };
    }
    return {
      urls: pickRandomUrls(library, RANDOM_FALLBACK_COUNT),
      mode: 'random-fallback',
    };
  }

  return {
    urls: activeSlides.slice(0, Math.min(activeSlides.length, cap)).map((s) => s.url),
    mode: 'active',
  };
}

/**
 * Merge manual URL lines into slide library (inactive, deduped by URL).
 */
export function mergeHeroUrlLinesForSlides(
  existing: DefaultHeroSlide[],
  lines: string
): DefaultHeroSlide[] {
  const parsed = parseTenantDefaultHeroSlides(lines);
  const seen = new Set(existing.map((s) => s.url.trim()));
  const merged = [...existing];
  for (const slide of parsed) {
    const url = slide.url.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    merged.push({ url, active: false, fileName: slide.fileName });
  }
  return merged.slice(0, MAX_TENANT_HERO_SLIDES);
}

/**
 * @deprecated Prefer mergeHeroUrlLinesForSlides.
 */
export function mergeHeroUrlLines(existing: string[], lines: string): string[] {
  return mergeHeroUrlLinesForSlides(
    existing.map((url) => ({ url, active: false })),
    lines
  ).map((s) => s.url);
}
