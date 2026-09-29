'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  normalizeDefaultHeroDisplayMode,
  normalizeMaxDisplayCount,
  parseTenantDefaultHeroSlides,
  resolveTenantDefaultHeroUrlsForPreview,
  type DefaultHeroDisplayMode,
} from '@/lib/hero/defaultHeroImages';

interface TenantDefaultHeroViewProps {
  settingsId: number;
  displayEventHeroImages?: boolean;
  defaultHeroImageUrlsJson?: string | null;
  defaultHeroDisplayMode?: DefaultHeroDisplayMode | string | null;
  defaultHeroIncludeWithEvents?: boolean;
  defaultHeroMaxDisplayCount?: number | null;
}

function displayModeLabel(mode: DefaultHeroDisplayMode): string {
  switch (mode) {
    case 'slideshow':
      return 'Slideshow (ordered rotation)';
    case 'random':
      return 'Random (shuffle each visit)';
    case 'single':
      return 'Single (first slide only)';
    default:
      return mode;
  }
}

function StatusBadge({ enabled, enabledLabel, disabledLabel }: { enabled: boolean; enabledLabel: string; disabledLabel: string }) {
  return enabled ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {enabledLabel}
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      {disabledLabel}
    </span>
  );
}

export default function TenantDefaultHeroView({
  settingsId,
  displayEventHeroImages,
  defaultHeroImageUrlsJson,
  defaultHeroDisplayMode,
  defaultHeroIncludeWithEvents,
  defaultHeroMaxDisplayCount,
}: TenantDefaultHeroViewProps) {
  const slides = parseTenantDefaultHeroSlides(defaultHeroImageUrlsJson ?? null);
  const activeCount = slides.filter((s) => s.active).length;
  const displayMode = normalizeDefaultHeroDisplayMode(defaultHeroDisplayMode);
  const maxDisplay = normalizeMaxDisplayCount(defaultHeroMaxDisplayCount);
  const preview = resolveTenantDefaultHeroUrlsForPreview(defaultHeroImageUrlsJson, maxDisplay);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium text-gray-900">Homepage Hero</h3>
        <Link
          href={`/admin/tenant-management/settings/${settingsId}/edit?tab=homepageHero`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-100 hover:bg-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 transition-all duration-300 hover:scale-105"
          title="Edit homepage hero settings"
          aria-label="Edit homepage hero settings"
        >
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit hero settings
        </Link>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Show event hero images</dt>
            <dd className="mt-1">
              <StatusBadge
                enabled={displayEventHeroImages ?? true}
                enabledLabel="Enabled"
                disabledLabel="Disabled"
              />
            </dd>
            <p className="mt-1 text-xs text-gray-600">
              When enabled, upcoming events with hero media appear in the homepage slideshow.
            </p>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Show default hero slides</dt>
            <dd className="mt-1">
              <StatusBadge
                enabled={defaultHeroIncludeWithEvents ?? true}
                enabledLabel="Enabled"
                disabledLabel="Disabled"
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Display mode</dt>
            <dd className="mt-1 text-sm text-gray-900">{displayModeLabel(displayMode)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Images in homepage rotation</dt>
            <dd className="mt-1 text-sm text-gray-900">
              Up to {maxDisplay} {maxDisplay === 1 ? 'image' : 'images'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slide library</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {slides.length} total · {activeCount} active
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Homepage preview pool</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {preview.urls.length} {preview.urls.length === 1 ? 'image' : 'images'} ({preview.mode})
            </dd>
          </div>
        </dl>
      </div>

      {slides.length > 0 ? (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Default hero slides</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide, index) => (
              <div
                key={`${slide.url}-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm"
              >
                <div className="relative w-full aspect-[5/2] bg-gray-200">
                  <Image
                    src={slide.url}
                    alt={slide.fileName || `Hero slide ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                    unoptimized
                  />
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">Slide {index + 1}</span>
                    <StatusBadge
                      enabled={slide.active}
                      enabledLabel="Active"
                      disabledLabel="Inactive"
                    />
                  </div>
                  {slide.fileName && (
                    <p className="text-xs text-gray-600 truncate" title={slide.fileName}>
                      {slide.fileName}
                    </p>
                  )}
                  <a
                    href={slide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {slide.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No default hero slides configured. The homepage uses event hero media or the platform fallback image.
        </p>
      )}
    </div>
  );
}
