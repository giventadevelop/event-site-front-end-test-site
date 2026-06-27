'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import AdminHelpDialog from '@/components/admin/AdminHelpDialog';
import {
  type DefaultHeroDisplayMode,
  type DefaultHeroSlide,
  MAX_ACTIVE_SLIDES,
  MAX_HERO_DISPLAY_COUNT,
  MAX_TENANT_HERO_SLIDES,
  mergeHeroUrlLinesForSlides,
  normalizeMaxDisplayCount,
  parseTenantDefaultHeroSlides,
  resolveTenantDefaultHeroUrlsForPreview,
  serializeDefaultHeroSlides,
} from '@/lib/hero/defaultHeroImages';
import { uploadDefaultHeroImageClient } from '@/app/admin/tenant-management/settings/ApiServerActions';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const PREVIEW_ROTATION_MS = 4000;
const GUIDELINES_URL =
  '/documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_ADMIN_GUIDELINES.html';

export interface HeroSlide extends DefaultHeroSlide {
  id: string;
}

function slideId(): string {
  return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toHeroSlides(slides: DefaultHeroSlide[]): HeroSlide[] {
  return slides.map((s) => ({ id: slideId(), ...s }));
}

interface TenantDefaultHeroManagerProps {
  settingsId?: number;
  mode: 'create' | 'edit';
  tenantIdForUpload?: string;
  initialUrlsJson?: string;
  displayMode: DefaultHeroDisplayMode;
  includeWithEvents: boolean;
  maxDisplayCount: number;
  onUrlsJsonChange: (json: string) => void;
  onDisplayModeChange: (mode: DefaultHeroDisplayMode) => void;
  onIncludeWithEventsChange: (value: boolean) => void;
  onMaxDisplayCountChange: (count: number) => void;
  onPersistSlides: (json: string) => Promise<void>;
}

export default function TenantDefaultHeroManager({
  settingsId,
  mode,
  tenantIdForUpload,
  initialUrlsJson,
  displayMode,
  includeWithEvents,
  maxDisplayCount,
  onUrlsJsonChange,
  onDisplayModeChange,
  onIncludeWithEventsChange,
  onMaxDisplayCountChange,
  onPersistSlides,
}: TenantDefaultHeroManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    toHeroSlides(parseTenantDefaultHeroSlides(initialUrlsJson ?? null))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showManualUrls, setShowManualUrls] = useState(false);
  const [manualUrlText, setManualUrlText] = useState('');

  const uploadEnabled = mode === 'edit' && !!settingsId;
  const normalizedMaxDisplay = normalizeMaxDisplayCount(maxDisplayCount);

  const walkthroughKey = settingsId
    ? `tenantHeroWalkthroughDismissed:${settingsId}`
    : 'tenantHeroWalkthroughDismissed:new';

  useEffect(() => {
    const incoming = initialUrlsJson ?? '';
    const current = serializeDefaultHeroSlides(heroSlides);
    if (incoming === current) return;
    setHeroSlides(toHeroSlides(parseTenantDefaultHeroSlides(incoming || null)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync external JSON only when prop diverges
  }, [initialUrlsJson]);

  useEffect(() => {
    if (mode !== 'edit' || heroSlides.length > 0) {
      setShowWalkthrough(false);
      return;
    }
    try {
      const dismissed = localStorage.getItem(walkthroughKey) === '1';
      setShowWalkthrough(!dismissed);
    } catch {
      setShowWalkthrough(true);
    }
  }, [mode, heroSlides.length, walkthroughKey]);

  const activeCount = useMemo(() => heroSlides.filter((s) => s.active).length, [heroSlides]);

  const activeOrderByIndex = useMemo(() => {
    const map = new Map<number, number>();
    let n = 0;
    heroSlides.forEach((slide, i) => {
      if (slide.active) {
        n += 1;
        map.set(i, n);
      }
    });
    return map;
  }, [heroSlides]);

  const slidesJson = useMemo(() => serializeDefaultHeroSlides(heroSlides), [heroSlides]);

  const previewResult = useMemo(
    () =>
      resolveTenantDefaultHeroUrlsForPreview(
        slidesJson,
        normalizedMaxDisplay,
        settingsId ?? 0
      ),
    [slidesJson, normalizedMaxDisplay, settingsId]
  );

  const previewUrls = previewResult.urls;

  useEffect(() => {
    if (displayMode !== 'slideshow' || previewUrls.length < 2) {
      setPreviewIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setPreviewIndex((i) => (i + 1) % previewUrls.length);
    }, PREVIEW_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [displayMode, previewUrls.length]);

  const syncSlides = useCallback(
    async (slides: HeroSlide[], persist: boolean) => {
      const json = serializeDefaultHeroSlides(slides);
      onUrlsJsonChange(json);
      if (persist && settingsId) {
        await onPersistSlides(json);
      }
    },
    [onPersistSlides, onUrlsJsonChange, settingsId]
  );

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];
    const remaining = MAX_TENANT_HERO_SLIDES - heroSlides.length;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: not an image file`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: exceeds 10 MB limit`);
        continue;
      }
      if (valid.length >= remaining) {
        errors.push(`Maximum ${MAX_TENANT_HERO_SLIDES} slides allowed`);
        break;
      }
      valid.push(file);
    }
    return { valid, errors };
  };

  const processUpload = async (files: File[]) => {
    if (!uploadEnabled) return;
    const { valid, errors } = validateFiles(files);
    if (errors.length > 0) {
      setUploadMessage({ type: 'error', text: errors.join('; ') });
    }
    if (valid.length === 0) return;

    setUploading(true);
    setUploadMessage(null);
    const newSlides: HeroSlide[] = [];
    let failed = 0;

    try {
      for (let i = 0; i < valid.length; i++) {
        setUploadProgress({ current: i + 1, total: valid.length });
        try {
          const { url } = await uploadDefaultHeroImageClient(valid[i], tenantIdForUpload);
          if (!url) throw new Error('No URL returned');
          newSlides.push({
            id: slideId(),
            url,
            active: false,
            fileName: valid[i].name,
          });
        } catch (err) {
          failed += 1;
          console.error('[TenantDefaultHeroManager] upload failed:', err);
        }
      }

      if (newSlides.length > 0) {
        const merged = [...heroSlides, ...newSlides];
        setHeroSlides(merged);
        await syncSlides(merged, true);
        setUploadMessage({
          type: failed > 0 ? 'error' : 'success',
          text:
            failed > 0
              ? `Uploaded ${newSlides.length} of ${valid.length} image(s). ${failed} failed. New slides are inactive until you mark them active.`
              : `Successfully uploaded ${newSlides.length} image(s). Mark slides active to include them on the homepage.`,
        });
      } else {
        setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' });
      }
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list?.length) void processUpload(Array.from(list));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!uploadEnabled || uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) void processUpload(files);
  };

  const handleRemove = async (index: number) => {
    const next = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(next);
    try {
      await syncSlides(next, true);
      setUploadMessage({ type: 'success', text: 'Slide removed.' });
    } catch {
      setUploadMessage({ type: 'error', text: 'Failed to save after remove.' });
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...heroSlides];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setHeroSlides(next);
    await syncSlides(next, true);
  };

  const handleToggleActive = async (index: number) => {
    const slide = heroSlides[index];
    if (!slide.active && activeCount >= MAX_ACTIVE_SLIDES) {
      setUploadMessage({ type: 'error', text: 'Maximum 10 active slides' });
      return;
    }
    const next = heroSlides.map((s, i) =>
      i === index ? { ...s, active: !s.active } : s
    );
    setHeroSlides(next);
    await syncSlides(next, true);
  };

  const handleMergeManualUrls = async () => {
    const merged = mergeHeroUrlLinesForSlides(heroSlides, manualUrlText);
    const withIds: HeroSlide[] = merged.map((s) => ({
      id: slideId(),
      ...s,
    }));
    setHeroSlides(withIds);
    setManualUrlText('');
    await syncSlides(withIds, true);
    setUploadMessage({
      type: 'success',
      text: 'URLs merged into slide library as inactive slides.',
    });
  };

  const dismissWalkthrough = (permanent: boolean) => {
    setShowWalkthrough(false);
    if (permanent) {
      try {
        localStorage.setItem(walkthroughKey, '1');
      } catch {
        /* ignore */
      }
    }
  };

  const rotatingLabel =
    activeCount === 0
      ? 'Random 3 from library'
      : `Rotating: ${Math.min(activeCount, normalizedMaxDisplay)}`;

  const largePreviewUrl =
    displayMode === 'single'
      ? previewUrls[0]
      : (previewUrls[previewIndex] ?? previewUrls[0]);

  const previewLabel =
    previewResult.mode === 'random-fallback'
      ? 'Preview: 3 random from library'
      : previewResult.mode === 'legacy'
        ? 'Preview: legacy — all library URLs (save to migrate active selection)'
        : 'Live preview';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-lg font-medium text-gray-900">Default Homepage Hero Images</h3>
        <AdminHelpDialog
          title="Default Hero Images — Guidelines & Assistance"
          documentationUrl={GUIDELINES_URL}
          ariaLabel="Default hero images guidelines and assistance"
          iconClassName="text-teal-600 hover:text-teal-800"
          headerGradientClass="from-teal-500 to-teal-600"
          borderClass="border-teal-500"
        />
      </div>

      {showWalkthrough && (
        <div className="rounded-lg border-2 border-teal-300 bg-teal-50 p-4">
          <h4 className="font-semibold text-teal-800 mb-2">Get started with homepage hero slides</h4>
          <ol className="list-decimal pl-5 text-sm text-teal-900 space-y-1 mb-3">
            <li>Upload one or more landscape images (recommended 2000×800, 5:2 ratio).</li>
            <li>Mark slides <strong>Active</strong> (up to 10) and set display count.</li>
            <li>Choose display mode: slideshow, random, or single — then view your homepage.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dismissWalkthrough(true)}
              className="px-4 py-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 text-sm font-semibold transition-all"
            >
              Don&apos;t show again
            </button>
            <button
              type="button"
              onClick={() => dismissWalkthrough(false)}
              className="px-4 py-2 rounded-lg border border-teal-300 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-4 text-sm text-teal-900">
        <strong>Homepage fallback chain:</strong> Upcoming event hero media → tenant default slides
        (active selection rules below) → bundled emergency image at{' '}
        <code className="text-xs bg-white/80 px-1 rounded">/images/hero_section/hero_images/fallback/default-hero.webp</code>
      </div>

      {!uploadEnabled && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Save tenant settings first, then return to edit mode to upload homepage hero images.
        </div>
      )}

      {activeCount === 0 && heroSlides.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          No slides marked active — homepage will show <strong>3 random</strong> images from your
          library on each visit.
        </div>
      )}

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-2">Upload hero slides</h4>
        <p className="text-sm text-gray-500 mb-3">
          Upload one or more images. Drag and drop or click to browse. PNG, JPG, JPEG, WEBP, GIF;
          up to {MAX_TENANT_HERO_SLIDES} images, 10 MB each. Recommended 2000×800 (5:2 landscape).
          New uploads are <strong>inactive</strong> until you mark them active.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={!uploadEnabled || uploading}
          className="hidden"
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (uploadEnabled && !uploading) fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (uploadEnabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => uploadEnabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full ${
            isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
          } ${!uploadEnabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Upload hero images"
          aria-label="Upload hero images — click or drag and drop"
        >
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center ${
              isDragging ? 'bg-teal-100' : 'bg-gray-100'
            }`}
          >
            <svg
              className={`w-10 h-10 ${isDragging ? 'text-teal-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <p className={`text-sm ${isDragging ? 'text-teal-700 font-semibold' : 'text-gray-600'}`}>
            {uploading && uploadProgress
              ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}…`
              : isDragging
                ? 'Drop images here'
                : heroSlides.length === 0
                  ? 'No default hero images yet. Homepage will use the platform emergency image until you upload slides or upcoming events provide hero media.'
                  : 'Click or drag and drop one or more hero images'}
          </p>
        </div>
        {uploadMessage && (
          <div
            className={`mt-2 p-2 rounded text-sm ${
              uploadMessage.type === 'success'
                ? 'bg-green-100 text-green-800'
                : uploadMessage.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {uploadMessage.text}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 font-medium text-gray-800">
          Library: {heroSlides.length}/{MAX_TENANT_HERO_SLIDES}
        </span>
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 font-medium text-green-800">
          Active: {activeCount}/{MAX_ACTIVE_SLIDES}
        </span>
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 font-medium text-teal-800">
          {rotatingLabel}
        </span>
      </div>

      {heroSlides.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Slide library — drag to reorder
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {heroSlides.map((slide, index) => {
              const activeOrder = activeOrderByIndex.get(index);
              return (
                <div
                  key={slide.id}
                  draggable={!uploading}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) {
                      void handleReorder(dragIndex, index);
                      setDragIndex(null);
                    }
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={`relative bg-white rounded-lg border-2 shadow-sm overflow-hidden transition-opacity ${
                    dragIndex === index ? 'border-teal-500 opacity-70' : 'border-gray-200'
                  } ${slide.active ? '' : 'opacity-60'}`}
                >
                  {activeOrder != null && (
                    <span className="absolute top-1 left-1 z-10 bg-teal-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {activeOrder}
                    </span>
                  )}
                  {!slide.active && (
                    <span className="absolute top-1 right-1 z-10 bg-gray-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                  <div className="relative w-full h-20 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.url}
                      alt={slide.fileName || `Hero slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-2 space-y-2">
                    <span
                      className="text-xs text-gray-500 truncate block cursor-grab"
                      title="Drag to reorder"
                    >
                      {slide.fileName || 'Slide'}
                    </span>
                    <div className="flex justify-between items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(index)}
                        className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all ${
                          slide.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={slide.active ? 'Mark inactive' : 'Mark active'}
                        aria-label={slide.active ? 'Mark slide inactive' : 'Mark slide active'}
                      >
                        {slide.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemove(index)}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="Remove slide"
                        aria-label={`Remove slide ${index + 1}`}
                      >
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display mode</label>
          <select
            value={displayMode}
            onChange={(e) => onDisplayModeChange(e.target.value as DefaultHeroDisplayMode)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base"
          >
            <option value="slideshow">Slideshow (ordered rotation)</option>
            <option value="random">Random (shuffle each visit)</option>
            <option value="single">Single (first slide only)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images in homepage rotation
          </label>
          <select
            value={normalizedMaxDisplay}
            onChange={(e) => {
              const count = normalizeMaxDisplayCount(Number(e.target.value));
              onMaxDisplayCountChange(count);
            }}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base"
          >
            {Array.from({ length: MAX_HERO_DISPLAY_COUNT }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'image' : 'images'}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            When slides are active, show up to this many in order (max 6).
          </p>
        </div>
        <div className="flex items-start md:pt-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWithEvents}
              onChange={(e) => onIncludeWithEventsChange(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-400 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              Include default hero slides when upcoming events also have hero images (appended after
              event heroes).
            </span>
          </label>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-1">{previewLabel}</h4>
          <div
            className="relative w-full rounded-lg overflow-hidden"
            style={{ background: '#1a0a2e', aspectRatio: '5 / 2' }}
          >
            {largePreviewUrl && (
              <Image
                src={largePreviewUrl}
                alt="Hero preview"
                fill
                className="object-contain"
                sizes="(min-width: 768px) 800px, 100vw"
                unoptimized
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {previewUrls.map((url, i) => (
              <div
                key={url + i}
                className="relative w-32 h-20 rounded border border-gray-200 overflow-hidden bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowManualUrls((v) => !v)}
          className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-2"
          aria-expanded={showManualUrls}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Add URLs manually (advanced)
        </button>
        {showManualUrls && (
          <div className="mt-3 space-y-2">
            <textarea
              value={manualUrlText}
              onChange={(e) => setManualUrlText(e.target.value)}
              rows={4}
              placeholder="One HTTPS URL per line (merged as inactive)"
              className="w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => void handleMergeManualUrls()}
              className="px-4 py-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 font-semibold text-sm transition-all"
            >
              Merge URLs into slides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
