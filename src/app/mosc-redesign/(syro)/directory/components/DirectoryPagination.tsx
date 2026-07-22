import Link from 'next/link';

export type DirectoryPaginationProps = {
  /** One-based page index (Strapi / directory list pages) */
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  /** Items rendered on the current page (accurate "Showing X to Y" on partial last pages) */
  itemsOnPage?: number;
  buildPageHref: (pageOneBased: number) => string;
  itemLabel?: string;
  emptyLabel?: string;
};

/**
 * Shared directory list pagination footer (Downloads-style):
 * Page X of Y + Showing A to B of C {itemLabel}.
 */
export default function DirectoryPagination({
  page,
  pageCount,
  total,
  pageSize,
  itemsOnPage,
  buildPageHref,
  itemLabel = 'entries',
  emptyLabel = 'No entries found',
}: DirectoryPaginationProps) {
  const safePage = Math.max(1, page);
  const safeTotalPages = Math.max(pageCount, 1);
  const hasResults = total > 0;
  const zeroBased = safePage - 1;
  const startItem = hasResults ? zeroBased * pageSize + 1 : 0;
  const endItem = hasResults
    ? zeroBased * pageSize +
      Math.min(
        typeof itemsOnPage === 'number' && itemsOnPage >= 0 ? itemsOnPage : pageSize,
        total - zeroBased * pageSize
      )
    : 0;

  const isPrevDisabled = safePage <= 1;
  const isNextDisabled = safePage >= safeTotalPages;

  const buttonBase =
    'px-5 py-2.5 font-semibold rounded-lg shadow-sm border-2 flex items-center gap-2 transition-all duration-300';
  const buttonEnabled =
    'bg-red-50 hover:bg-red-100 text-red-700 border-red-300 hover:border-red-400 hover:scale-105 hover:shadow-md';
  const buttonDisabled =
    'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-60';

  // Always show footer when we have results (even single page) so counts are visible
  if (!hasResults && safeTotalPages <= 1) {
    return (
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-orange-700">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {isPrevDisabled ? (
          <span className={`${buttonBase} ${buttonDisabled}`} aria-disabled="true" title="Previous Page">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </span>
        ) : (
          <Link
            href={buildPageHref(safePage - 1)}
            className={`${buttonBase} ${buttonEnabled}`}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </Link>
        )}

        <div className="px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-red-800">
            Page <span className="text-red-600">{safePage}</span> of{' '}
            <span className="text-red-600">{safeTotalPages}</span>
          </span>
        </div>

        {isNextDisabled ? (
          <span className={`${buttonBase} ${buttonDisabled}`} aria-disabled="true" title="Next Page">
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        ) : (
          <Link
            href={buildPageHref(safePage + 1)}
            className={`${buttonBase} ${buttonEnabled}`}
            title="Next Page"
            aria-label="Next Page"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <div className="text-center mt-3">
        {hasResults ? (
          <div className="inline-flex items-center px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm">
            <span className="text-sm text-gray-700">
              Showing <span className="font-bold text-red-600">{startItem}</span> to{' '}
              <span className="font-bold text-red-600">{endItem}</span> of{' '}
              <span className="font-bold text-red-600">{total}</span> {itemLabel}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-orange-700">{emptyLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
