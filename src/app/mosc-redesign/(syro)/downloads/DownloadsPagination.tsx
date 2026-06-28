import Link from 'next/link';

type DownloadsPaginationProps = {
  /** Zero-based page index from the server */
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  /** Items rendered on the current page (for accurate "Showing X to Y" on partial last pages) */
  itemsOnPage?: number;
  buildPageHref: (pageOneBased: number) => string;
  itemLabel?: string;
};

export default function DownloadsPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  itemsOnPage,
  buildPageHref,
  itemLabel = 'files',
}: DownloadsPaginationProps) {
  const displayPage = currentPage + 1;
  const safeTotalPages = Math.max(totalPages, 1);
  const hasResults = totalCount > 0;
  const startItem = hasResults ? currentPage * pageSize + 1 : 0;
  const endItem = hasResults
    ? currentPage * pageSize +
      Math.min(
        typeof itemsOnPage === 'number' && itemsOnPage >= 0 ? itemsOnPage : pageSize,
        totalCount - currentPage * pageSize
      )
    : 0;

  const isPrevDisabled = currentPage <= 0;
  const isNextDisabled = currentPage >= safeTotalPages - 1;

  const buttonBase =
    'px-5 py-2.5 font-semibold rounded-lg shadow-sm border-2 flex items-center gap-2 transition-all duration-300';
  const buttonEnabled =
    'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-400 hover:border-blue-500 hover:scale-105 hover:shadow-md';
  const buttonDisabled =
    'bg-blue-100 text-blue-500 border-blue-300 cursor-not-allowed disabled:hover:scale-100';

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
            href={buildPageHref(displayPage - 1)}
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

        <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-blue-700">
            Page <span className="text-blue-600">{displayPage}</span> of{' '}
            <span className="text-blue-600">{safeTotalPages}</span>
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
            href={buildPageHref(displayPage + 1)}
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
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm text-gray-700">
              Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
              <span className="font-bold text-blue-600">{endItem}</span> of{' '}
              <span className="font-bold text-blue-600">{totalCount}</span> {itemLabel}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-orange-700">No files found</span>
            <span className="text-sm text-orange-600">Try adjusting your filters or search</span>
          </div>
        )}
      </div>
    </div>
  );
}
