'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SyroPageBanner from '../components/SyroPageBanner';
import {
  getOfficialDocumentCardThumbnailSrc,
  getOfficialDocumentPlaceholderKind,
  placeholderGradient,
} from '@/lib/officialDocumentThumbnail';
import type { PublicOfficialDocumentTreePage } from './ApiServerActions';
import DownloadsPagination from './DownloadsPagination';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDownloadCardTitle, getDownloadCardSubtitle } from '@/lib/downloads/formatDownloadCardTitle';

const BANNER_DESCRIPTION =
  'Official documents available for download. Browse, filter, and download.';

type Props = {
  officialTreePage: PublicOfficialDocumentTreePage;
  currentFilters: {
    page: number;
    categoryId: number | null;
    year: number | null;
  };
};

type TreeItem = PublicOfficialDocumentTreePage['content'][number];

type DownloadErrorState = {
  fileName: string;
  message: string;
};

function getFolderPath(item: TreeItem) {
  if (item.pathSegments.length <= 1) return 'Library Root';
  return item.pathSegments.slice(0, -1).join(' / ');
}

function getCardSubtitle(item: TreeItem) {
  return getDownloadCardSubtitle({
    pathSegments: item.pathSegments,
    fileName: item.fileName,
    title: item.title,
    categoryLabel: item.categoryLabel,
  });
}

const DIALOG_FOOTER_BUTTON_BASE =
  'inline-flex h-12 min-w-[140px] flex-1 sm:flex-none items-center justify-center rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-md border-0 transition-opacity hover:opacity-95 sm:min-w-[160px]';

function DialogFooterActions({
  onClose,
  okLabel,
  okClassName,
  closeClassName,
}: {
  onClose: () => void;
  okLabel: string;
  okClassName: string;
  closeClassName: string;
}) {
  return (
    <AlertDialogFooter className="flex flex-row flex-wrap items-stretch justify-center gap-3 border-t border-syro-gold/20 bg-white px-6 py-4 sm:justify-center">
      <button type="button" onClick={onClose} className={`${DIALOG_FOOTER_BUTTON_BASE} ${closeClassName}`}>
        Close
      </button>
      <button type="button" onClick={onClose} className={`${DIALOG_FOOTER_BUTTON_BASE} ${okClassName}`}>
        {okLabel}
      </button>
    </AlertDialogFooter>
  );
}

function DialogCloseButton({ onClose, className = '' }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-white transition-colors hover:bg-white/35 ${className}`}
      aria-label="Close"
      title="Close"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function DownloadErrorDialog({
  state,
  open,
  onClose,
}: {
  state: DownloadErrorState | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!state) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-2 border-red-300 shadow-2xl gap-0">
        <div className="relative px-6 py-5 pr-14 text-white bg-gradient-to-r from-red-600 via-syro-red to-orange-500">
          <DialogCloseButton onClose={onClose} />
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <AlertDialogTitle className="font-syro-display text-xl text-white font-semibold">
                Download could not start
              </AlertDialogTitle>
              <p className="text-sm text-white/90 mt-1">Please try again in a moment.</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 bg-gradient-to-b from-red-50 to-white">
          <p className="text-sm font-semibold text-red-800 mb-2 break-all">{state.fileName}</p>
          <AlertDialogDescription className="text-sm text-gray-700">{state.message}</AlertDialogDescription>
        </div>
        <DialogFooterActions
          onClose={onClose}
          okLabel="OK"
          okClassName="bg-gradient-to-r from-red-600 to-syro-red"
          closeClassName="bg-gradient-to-r from-gray-600 to-slate-700"
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function startOfficialDocumentDownload(downloadUrl: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function DownloadCard({
  file,
  index,
  onDownload,
  downloadingId,
}: {
  file: TreeItem;
  index: number;
  onDownload: (file: TreeItem) => void;
  downloadingId: number | null;
}) {
  const isDownloading = file.id != null && downloadingId === file.id;
  const thumbInput = {
    fileUrl: file.fileUrl,
    thumbnailUrl: file.thumbnailStorageUrl ?? file.thumbnailUrl,
    fileDataContentType: file.fileDataContentType,
    fileName: file.fileName,
    title: file.fileName,
  };
  const placeholderKind = getOfficialDocumentPlaceholderKind(thumbInput);
  const [thumbFailed, setThumbFailed] = React.useState(false);
  const displayThumb = getOfficialDocumentCardThumbnailSrc(file.id, thumbInput, {
    cacheKey: file.thumbnailCacheKey,
    hasStoredThumbnail: file.hasCustomThumbnail,
    // Stream the storage path the server already resolved, bypassing a stale by-id read.
    srcHint: file.thumbnailStorageUrl,
  });
  const showThumbnail = Boolean(displayThumb && !thumbFailed);

  React.useEffect(() => {
    setThumbFailed(false);
  }, [displayThumb]);

  const displayTitle = formatDownloadCardTitle(file.title?.trim() || file.fileName);
  const cardSubtitle = getCardSubtitle(file);
  const displayIndex = String(index + 1).padStart(2, '0');
  const metaLine = [file.categoryLabel, file.officialDocumentYear ? `Year ${file.officialDocumentYear}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="download-entry-card group grid h-full grid-rows-subgrid overflow-hidden rounded-xl border border-burgundy/15 bg-white shadow-[rgba(50,50,93,0.18)_0px_8px_20px_-4px,rgba(0,0,0,0.2)_0px_4px_10px_-4px] transition-all duration-300 hover:border-burgundy/30 hover:shadow-[rgba(50,50,93,0.22)_0px_12px_28px_-4px,rgba(0,0,0,0.22)_0px_6px_14px_-4px] [grid-row:span_4]">
      <header className="institution-entry-card__header download-entry-card__header flex h-full min-h-[5.25rem] items-start gap-3 self-stretch border-b border-burgundy/10 bg-gradient-to-r from-burgundy-dark to-burgundy px-4 py-3">
        <span
          className="institution-entry-card__index mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment-light/20 font-syro-display text-sm font-bold"
          aria-hidden
        >
          {displayIndex}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="institution-entry-card__title font-syro-display text-base font-semibold leading-snug break-words lg:text-lg">
            {displayTitle}
          </h3>
          <p className="institution-entry-card__location mt-1 font-syro-primary text-sm leading-snug break-words">{cardSubtitle}</p>
        </div>
      </header>

      <div className="download-entry-card__media h-[10.5rem] shrink-0 border-b border-burgundy/10 bg-syro-bg-gray/30 px-4 py-3">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-syro-bg-gray/20">
          {showThumbnail ? (
            <img
              key={displayThumb}
              src={displayThumb!}
              alt={file.fileName}
              className="download-entry-card__image h-full w-full object-contain"
              loading="lazy"
              decoding="async"
              onError={() => setThumbFailed(true)}
            />
          ) : (
            <div
              className={`flex h-full w-full flex-col items-center justify-center px-3 py-2 bg-gradient-to-br ${placeholderGradient(placeholderKind)}`}
              aria-label={file.fileName}
            >
              <p className="font-syro-display text-center text-sm font-semibold leading-tight text-syro-blue/90 sm:text-base line-clamp-4 break-words">
                {displayTitle}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="download-entry-card__details flex min-h-[4.75rem] flex-col justify-start px-4 py-2.5">
        {metaLine ? (
          <p className="font-syro-primary text-xs font-semibold uppercase tracking-wide leading-snug text-syro-blue line-clamp-2 break-words">
            {metaLine}
          </p>
        ) : null}
        {file.description ? (
          <p className={`font-syro-primary text-sm leading-snug text-syro-dark-gray lg:text-base ${metaLine ? 'mt-1' : ''} line-clamp-2`}>
            {file.description}
          </p>
        ) : (
          <p className={`font-syro-primary text-sm leading-snug text-gray-500 ${metaLine ? 'mt-1' : ''} line-clamp-2`}>
            Official document file ready for download.
          </p>
        )}
      </div>

      <footer className="border-t border-burgundy/10 bg-parchment/40 px-5 py-4">
        <p className="mb-3 font-syro-display text-xs font-semibold uppercase tracking-widest text-syro-blue">
          Download
        </p>
        {file.downloadUrl ? (
          <button
            type="button"
            onClick={() => onDownload(file)}
            disabled={isDownloading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-burgundy/15 bg-white px-3 py-2.5 font-syro-primary text-sm font-semibold text-syro-red transition-colors hover:border-burgundy/30 hover:bg-burgundy/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            aria-busy={isDownloading}
          >
            {isDownloading ? 'Preparing…' : 'Download file'}
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-400">
            No download link
          </span>
        )}
      </footer>
    </li>
  );
}

function DownloadsGrid({
  files,
  page,
  pageSize,
  onDownload,
  downloadingId,
}: {
  files: TreeItem[];
  page: number;
  pageSize: number;
  onDownload: (file: TreeItem) => void;
  downloadingId: number | null;
}) {
  return (
    <ul className="downloads-entry-grid m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {files.map((file, index) => (
        <DownloadCard
          key={`file-${file.id ?? file.treePath}`}
          file={file}
          index={page * pageSize + index}
          onDownload={onDownload}
          downloadingId={downloadingId}
        />
      ))}
    </ul>
  );
}

type CategoryFilterOption = { id: number; slug: string; displayName: string };

/**
 * Primary category chips (2–3 rows). Order matches the public downloads menu.
 * Any active API category not listed here goes in "More categories…".
 */
const FEATURED_CATEGORY_DISPLAY_NAMES = [
  'Photos',
  'Catholicate Day Book Cover, Brochure',
  'Brochures',
  'Panjangom',
  'Calendars',
  'Medical Insurance',
  'Insurance & benefits',
  'Covering Note to be submitted along with financial statements',
  'Official circulars',
  'Church Financial Statements format for the year ended 31March 2025 of MOSC',
  'Financial statements',
  'MALANKARA SABHA MAGAZINE',
  'Magazines',
  'EDUCATIONAL SPECIAL SCHOLARSHIP',
  'Scholarships',
  'Merit Awards 2025',
  'Awards & merit events',
  'Marriage Marga Nirdesha Form',
  'Budget format 2025-26',
  'GST',
  'Tenders',
  'Mega Quiz qualified list',
] as const;

function normalizeCategoryLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findCategoryForFeaturedLabel(
  label: string,
  categoryOptions: CategoryFilterOption[],
  usedIds: Set<number>
): CategoryFilterOption | undefined {
  const norm = normalizeCategoryLabel(label);
  return categoryOptions.find(
    (cat) => !usedIds.has(cat.id) && normalizeCategoryLabel(cat.displayName) === norm
  );
}

function partitionCategoryOptions(categoryOptions: CategoryFilterOption[]) {
  const featured: CategoryFilterOption[] = [];
  const featuredIds = new Set<number>();

  for (const label of FEATURED_CATEGORY_DISPLAY_NAMES) {
    const cat = findCategoryForFeaturedLabel(label, categoryOptions, featuredIds);
    if (cat) {
      featured.push(cat);
      featuredIds.add(cat.id);
    }
  }

  const dropdownOptions = categoryOptions.filter((cat) => !featuredIds.has(cat.id));
  return { featured, dropdownOptions };
}

function yearFilterChipClass(active: boolean) {
  return `px-3 py-1.5 rounded-md text-xs font-semibold ${
    active ? 'bg-syro-red text-white' : 'bg-syro-bg-gray text-syro-blue'
  }`;
}

function categoryFilterChipClass(active: boolean) {
  return `inline-block max-w-[14rem] truncate rounded-md px-3 py-1.5 text-xs font-semibold ${
    active ? 'bg-syro-blue text-white' : 'bg-syro-bg-gray text-syro-blue'
  }`;
}

const filterDropdownClass = (active: boolean, tone: 'year' | 'category') =>
  `min-w-[11rem] max-w-[22rem] rounded-md border-2 px-3 py-1.5 text-xs font-semibold text-syro-blue bg-white focus:outline-none focus:ring-2 focus:ring-syro-blue/30 ${
    active
      ? tone === 'year'
        ? 'border-syro-red bg-red-50'
        : 'border-syro-blue bg-blue-50'
      : 'border-syro-gold/40'
  }`;

const MAX_DROPDOWN_YEARS = 20;

function buildOlderYearDropdownOptions(
  allYearOptions: number[],
  currentCalendarYear: number,
  priorCalendarYear: number
): number[] {
  const pinned = new Set([currentCalendarYear, priorCalendarYear]);
  const fromData = [...new Set(allYearOptions)]
    .filter((y) => !pinned.has(y))
    .sort((a, b) => b - a);

  if (fromData.length > 0) {
    return fromData.slice(0, MAX_DROPDOWN_YEARS);
  }

  return Array.from({ length: MAX_DROPDOWN_YEARS }, (_, index) => currentCalendarYear - 2 - index);
}

function YearCombobox({
  years,
  selectedYear,
  categoryId,
  buildFilterHref,
}: {
  years: number[];
  selectedYear: number | null;
  categoryId: number | null;
  buildFilterHref: (categoryId: number | null, year: number | null) => string;
}) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();
  const currentCalendarYear = new Date().getFullYear();
  const priorCalendarYear = currentCalendarYear - 1;

  const dropdownYears = React.useMemo(
    () => buildOlderYearDropdownOptions(years, currentCalendarYear, priorCalendarYear),
    [years, currentCalendarYear, priorCalendarYear]
  );

  const isOlderYearSelected =
    selectedYear != null &&
    selectedYear !== currentCalendarYear &&
    selectedYear !== priorCalendarYear;

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    isOlderYearSelected && selectedYear != null ? String(selectedYear) : ''
  );

  React.useEffect(() => {
    if (isOlderYearSelected && selectedYear != null) {
      setInputValue(String(selectedYear));
    } else if (!open) {
      setInputValue('');
    }
  }, [isOlderYearSelected, selectedYear, open]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const filteredYears = React.useMemo(() => {
    const query = inputValue.trim();
    if (!query) return dropdownYears;
    return dropdownYears.filter((year) => String(year).includes(query));
  }, [dropdownYears, inputValue]);

  const applyYear = (year: number | null) => {
    setOpen(false);
    if (year != null && selectedYear === year) {
      router.push(buildFilterHref(categoryId, null));
      setInputValue('');
      return;
    }
    router.push(buildFilterHref(categoryId, year));
    if (year != null) {
      setInputValue(String(year));
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value.replace(/[^\d]/g, '').slice(0, 4));
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const parsed = parseInt(inputValue.trim(), 10);
      if (Number.isFinite(parsed) && parsed >= 1900 && parsed <= 2100) {
        applyYear(parsed);
      } else if (filteredYears.length === 1) {
        applyYear(filteredYears[0]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const comboboxActive = isOlderYearSelected || inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className="relative inline-flex min-w-[11rem] max-w-[14rem]">
      <label className="sr-only" htmlFor={listId}>
        Filter by other years (type to search)
      </label>
      <input
        id={listId}
        type="text"
        inputMode="numeric"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-listbox`}
        aria-autocomplete="list"
        aria-label="Filter by other years (type to search)"
        placeholder="More years…"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-md border-2 px-3 py-1.5 text-xs font-semibold text-syro-blue bg-white focus:outline-none focus:ring-2 focus:ring-syro-blue/30 ${
          comboboxActive ? 'border-syro-red bg-red-50' : 'border-syro-gold/40'
        }`}
      />
      {open ? (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-md border-2 border-syro-gold/40 bg-white py-1 shadow-lg"
        >
          {filteredYears.length > 0 ? (
            filteredYears.map((year) => (
              <li key={year} role="option" aria-selected={selectedYear === year}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyYear(year)}
                  className={`block w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-red-50 ${
                    selectedYear === year ? 'bg-red-50 text-syro-red' : 'text-syro-blue'
                  }`}
                >
                  {year}
                  {selectedYear === year ? ' (click to clear)' : ''}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-gray-500">No matching years</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

function YearFilterBar({
  allYearOptions,
  currentFilters,
  buildFilterHref,
  searchQuery,
  onSearchChange,
  onClearFilters,
  hasActiveFiltersOrSearch,
}: {
  allYearOptions: number[];
  currentFilters: { categoryId: number | null; year: number | null };
  buildFilterHref: (categoryId: number | null, year: number | null) => string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFiltersOrSearch: boolean;
}) {
  const currentCalendarYear = new Date().getFullYear();
  const priorCalendarYear = currentCalendarYear - 1;

  const toggleYearHref = (year: number) =>
    buildFilterHref(currentFilters.categoryId, currentFilters.year === year ? null : year);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-syro-blue mb-2">Filter by year</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildFilterHref(currentFilters.categoryId, null)}
          className={yearFilterChipClass(!currentFilters.year)}
        >
          All years
        </Link>
        <Link
          href={toggleYearHref(currentCalendarYear)}
          className={yearFilterChipClass(currentFilters.year === currentCalendarYear)}
          title={currentFilters.year === currentCalendarYear ? 'Click again to clear year filter' : undefined}
        >
          {currentCalendarYear}
        </Link>
        <Link
          href={toggleYearHref(priorCalendarYear)}
          className={yearFilterChipClass(currentFilters.year === priorCalendarYear)}
          title={currentFilters.year === priorCalendarYear ? 'Click again to clear year filter' : undefined}
        >
          {priorCalendarYear}
        </Link>
        <YearCombobox
          years={allYearOptions}
          selectedYear={currentFilters.year}
          categoryId={currentFilters.categoryId}
          buildFilterHref={buildFilterHref}
        />

        {/* Search documents — pushed to the right-most end of the filter row */}
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <label className="relative block min-w-0 flex-1 sm:flex-initial">
            <span className="sr-only">Search downloads</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-syro-blue/50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search documents…"
              className="w-full sm:w-56 rounded-md border-2 border-syro-gold/40 bg-white py-1.5 pl-9 pr-3 text-xs font-semibold text-syro-blue placeholder:font-normal placeholder:text-gray-400 focus:border-syro-blue focus:outline-none focus:ring-2 focus:ring-syro-blue/30"
              aria-label="Search documents on this page"
            />
          </label>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFiltersOrSearch}
            className="shrink-0 rounded-md border-2 border-syro-gold/40 bg-white px-3 py-1.5 text-xs font-semibold text-syro-blue transition-colors hover:border-syro-red hover:bg-red-50 hover:text-syro-red disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-syro-gold/40 disabled:hover:bg-white disabled:hover:text-syro-blue"
            title="Clear search and reset to all years and categories"
            aria-label="Clear search and reset filters"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryFilterBar({
  categoryOptions,
  currentFilters,
  buildFilterHref,
}: {
  categoryOptions: CategoryFilterOption[];
  currentFilters: { categoryId: number | null; year: number | null };
  buildFilterHref: (categoryId: number | null, year: number | null) => string;
}) {
  const router = useRouter();
  if (categoryOptions.length === 0) {
    return null;
  }

  const { featured, dropdownOptions } = React.useMemo(
    () => partitionCategoryOptions(categoryOptions),
    [categoryOptions]
  );

  const featuredIds = React.useMemo(() => new Set(featured.map((c) => c.id)), [featured]);

  const dropdownValue =
    currentFilters.categoryId != null && !featuredIds.has(currentFilters.categoryId)
      ? String(currentFilters.categoryId)
      : '';
  const dropdownActive = dropdownValue !== '';

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-syro-blue mb-2">Filter by category</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildFilterHref(null, currentFilters.year)}
          className={categoryFilterChipClass(!currentFilters.categoryId)}
          title="All categories"
        >
          All categories
        </Link>
        {featured.map((cat) => {
          const isActive = currentFilters.categoryId === cat.id;
          return (
            <Link
              key={cat.id}
              href={buildFilterHref(isActive ? null : cat.id, currentFilters.year)}
              className={categoryFilterChipClass(isActive)}
              title={isActive ? `${cat.displayName} — click again to clear` : cat.displayName}
            >
              {cat.displayName}
            </Link>
          );
        })}
        {dropdownOptions.length > 0 ? (
          <label className="inline-flex shrink-0 items-center gap-2">
            <span className="sr-only">Select another document category</span>
            <select
              value={dropdownValue}
              onChange={(e) => {
                const next = e.target.value;
                const nextId = next ? Number(next) : null;
                router.push(
                  buildFilterHref(
                    nextId != null && nextId === currentFilters.categoryId ? null : nextId,
                    currentFilters.year
                  )
                );
              }}
              className={filterDropdownClass(dropdownActive, 'category')}
              aria-label="Filter by other categories"
            >
              <option value="">More categories…</option>
              {dropdownOptions.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}

export default function DownloadsPageClient({
  officialTreePage,
  currentFilters,
}: Props) {
  const router = useRouter();
  const pageSize = officialTreePage.size || 24;
  const totalPages = Math.max(officialTreePage.totalPages || 1, 1);
  const currentPageZeroBased = Math.min(Math.max(officialTreePage.page, 0), totalPages - 1);

  const [downloadingId, setDownloadingId] = React.useState<number | null>(null);
  const [downloadError, setDownloadError] = React.useState<DownloadErrorState | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredDownloads = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return officialTreePage.content;
    return officialTreePage.content.filter((file) => {
      const haystack = [
        file.fileName,
        file.description ?? '',
        file.categoryLabel ?? '',
        getFolderPath(file),
        file.officialDocumentYear ? String(file.officialDocumentYear) : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [officialTreePage.content, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;
  const hasActiveFilters = currentFilters.categoryId != null || currentFilters.year != null;
  const hasActiveFiltersOrSearch = hasActiveFilters || isSearching;

  const handleClearFilters = React.useCallback(() => {
    setSearchQuery('');
    router.replace('/mosc-redesign/downloads');
    router.refresh();
  }, [router]);

  const handleDownload = React.useCallback(async (file: TreeItem) => {
    if (!file.downloadUrl) {
      return;
    }

    setDownloadingId(file.id);
    setDownloadError(null);

    try {
      const jsonUrl = file.downloadUrl.includes('?')
        ? `${file.downloadUrl}&format=json`
        : `${file.downloadUrl}?format=json`;

      const res = await fetch(jsonUrl, { method: 'GET', cache: 'no-store' });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const details =
          typeof errBody?.error === 'string' ? errBody.error : 'Could not prepare the download link.';
        throw new Error(details);
      }

      const payload = (await res.json()) as { downloadUrl?: string };
      const freshUrl = payload.downloadUrl?.trim();
      if (!freshUrl) {
        throw new Error('No download URL was returned for this file.');
      }

      startOfficialDocumentDownload(freshUrl, file.fileName);
    } catch (error) {
      setDownloadError({
        fileName: file.fileName,
        message: error instanceof Error ? error.message : 'Download failed. Please try again.',
      });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const queryWithPage = (page: number) => {
    const params = new globalThis.URLSearchParams();
    params.set('page', String(page));
    if (currentFilters.categoryId) params.set('categoryId', String(currentFilters.categoryId));
    if (currentFilters.year) params.set('year', String(currentFilters.year));
    return `/mosc-redesign/downloads?${params.toString()}`;
  };

  const queryWithFilter = (categoryId: number | null, year: number | null) => {
    const params = new globalThis.URLSearchParams();
    params.set('page', '1');
    if (categoryId) params.set('categoryId', String(categoryId));
    if (year) params.set('year', String(year));
    return `/mosc-redesign/downloads?${params.toString()}`;
  };

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Downloads"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <DownloadErrorDialog
        state={downloadError}
        open={!!downloadError}
        onClose={() => setDownloadError(null)}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-6 pl-8 border-l-[7px] border-syro-red">
            Official Library Explorer
          </h3>
          <div className="bg-white rounded-xl border border-syro-gold/25 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 md:p-8 mb-12">
            <div className="mb-6 space-y-4">
              <div className="text-sm text-gray-600">
                {hasActiveFilters || isSearching ? (
                  <>
                    Filtered library
                    {currentFilters.categoryId ? (
                      <>
                        {' '}
                        in{' '}
                        <span className="font-semibold">
                          {officialTreePage.categoryOptions.find((c) => c.id === currentFilters.categoryId)
                            ?.displayName ?? 'selected category'}
                        </span>
                      </>
                    ) : null}
                    {currentFilters.year ? (
                      <>
                        {' '}
                        for year <span className="font-semibold">{currentFilters.year}</span>
                      </>
                    ) : null}
                    {isSearching ? (
                      <>
                        {' '}
                        — search on this page:{' '}
                        <span className="font-semibold">&ldquo;{searchQuery.trim()}&rdquo;</span>
                      </>
                    ) : null}
                    . Lower priority values are shown first.
                  </>
                ) : (
                  <>
                    Browse official documents by year and category. Lower priority values are shown first.
                  </>
                )}
              </div>

              <YearFilterBar
                allYearOptions={officialTreePage.allYearOptions}
                currentFilters={currentFilters}
                buildFilterHref={queryWithFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearFilters={handleClearFilters}
                hasActiveFiltersOrSearch={hasActiveFiltersOrSearch}
              />

              <CategoryFilterBar
                categoryOptions={officialTreePage.categoryOptions}
                currentFilters={currentFilters}
                buildFilterHref={queryWithFilter}
              />
            </div>

            {isSearching ? (
              <div className="mb-4 text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredDownloads.length}</span> of{' '}
                <span className="font-semibold">{officialTreePage.content.length}</span> files on this page matching{' '}
                <span className="font-semibold">&ldquo;{searchQuery.trim()}&rdquo;</span>.
              </div>
            ) : null}

            {filteredDownloads.length === 0 ? (
              <div className="rounded-lg border border-syro-gold/25 bg-syro-bg-gray/50 px-5 py-6 text-sm text-gray-600 space-y-3">
                {isSearching ? (
                  <p>
                    No files on this page match &ldquo;{searchQuery.trim()}&rdquo;. Try a different search term, or
                    click the{' '}
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="font-semibold text-syro-blue underline hover:text-syro-red"
                    >
                      Clear filters
                    </button>{' '}
                    button to return to all downloads.
                  </p>
                ) : hasActiveFilters ? (
                  <p>
                    No files match the selected{' '}
                    {currentFilters.categoryId && currentFilters.year
                      ? 'category and year'
                      : currentFilters.categoryId
                        ? 'category'
                        : 'year'}
                    . Try another filter, click an active category or year chip again to undo it, or click the{' '}
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="font-semibold text-syro-blue underline hover:text-syro-red"
                    >
                      Clear filters
                    </button>{' '}
                    button to return to all downloads.
                  </p>
                ) : (
                  <p>No files are available right now. Please check back later.</p>
                )}
              </div>
            ) : (
              <DownloadsGrid
                files={filteredDownloads}
                page={currentPageZeroBased}
                pageSize={pageSize}
                onDownload={handleDownload}
                downloadingId={downloadingId}
              />
            )}

            <DownloadsPagination
              currentPage={currentPageZeroBased}
              totalPages={totalPages}
              totalCount={officialTreePage.totalElements}
              pageSize={pageSize}
              itemsOnPage={isSearching ? filteredDownloads.length : officialTreePage.content.length}
              buildPageHref={queryWithPage}
              itemLabel="files"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
