import Link from 'next/link';

interface MoscGalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  tab?: 'albums' | 'events';
  itemLabel?: 'albums' | 'events';
  onPageChange?: (page: number) => void;
}

function buildPageHref(page: number, tab: 'albums' | 'events') {
  const params = new URLSearchParams();
  if (tab !== 'albums') params.set('tab', tab);
  if (page > 0) params.set('page', String(page + 1));
  const qs = params.toString();
  return `/mosc-redesign/gallery${qs ? `?${qs}` : ''}`;
}

export function MoscGalleryPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  tab = 'albums',
  itemLabel = 'albums',
  onPageChange,
}: MoscGalleryPaginationProps) {
  const displayPage = currentPage + 1;
  const hasResults = totalCount > 0;
  const startItem = hasResults ? currentPage * pageSize + 1 : 0;
  const endItem = hasResults
    ? currentPage * pageSize + Math.min(pageSize, totalCount - currentPage * pageSize)
    : 0;

  const prevHref = currentPage > 0 ? buildPageHref(currentPage - 1, tab) : null;
  const nextHref = currentPage < totalPages - 1 ? buildPageHref(currentPage + 1, tab) : null;

  const buttonBase =
    'px-5 py-2.5 font-semibold rounded-lg shadow-sm border-2 flex items-center gap-2 transition-all duration-300';
  const buttonEnabled =
    'bg-red-50 hover:bg-red-100 text-red-700 border-red-300 hover:border-red-400 hover:scale-105 hover:shadow-md';
  const buttonDisabled =
    'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-60';

  const handlePrev = () => {
    if (currentPage > 0) onPageChange?.(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange?.(currentPage + 1);
  };

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {prevHref ? (
          onPageChange ? (
            <button
              type="button"
              onClick={handlePrev}
              className={`${buttonBase} ${buttonEnabled}`}
              title="Previous Page"
              aria-label="Previous Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
          ) : (
            <Link
              href={prevHref}
              className={`${buttonBase} ${buttonEnabled}`}
              title="Previous Page"
              aria-label="Previous Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </Link>
          )
        ) : (
          <span
            className={`${buttonBase} ${buttonDisabled}`}
            aria-disabled="true"
            title="Previous Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </span>
        )}

        <div className="px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-red-800">
            Page <span className="text-red-600">{displayPage}</span> of{' '}
            <span className="text-red-600">{Math.max(totalPages, 1)}</span>
          </span>
        </div>

        {nextHref ? (
          onPageChange ? (
            <button
              type="button"
              onClick={handleNext}
              className={`${buttonBase} ${buttonEnabled}`}
              title="Next Page"
              aria-label="Next Page"
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <Link
              href={nextHref}
              className={`${buttonBase} ${buttonEnabled}`}
              title="Next Page"
              aria-label="Next Page"
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )
        ) : (
          <span className={`${buttonBase} ${buttonDisabled}`} aria-disabled="true" title="Next Page">
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>

      {hasResults && (
        <div className="text-center mt-3">
          <div className="inline-flex items-center px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm">
            <span className="text-sm text-gray-700">
              Showing <span className="font-bold text-red-600">{startItem}</span> to{' '}
              <span className="font-bold text-red-600">{endItem}</span> of{' '}
              <span className="font-bold text-red-600">{totalCount}</span> {itemLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
