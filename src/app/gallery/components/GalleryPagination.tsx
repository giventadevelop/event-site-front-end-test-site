'use client';

import pageStyles from '../GalleryPage.module.css';

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  itemType?: 'albums' | 'events';
}

export function GalleryPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false,
  itemType = 'events',
}: GalleryPaginationProps) {
  const displayPage = currentPage + 1;
  const hasResults = totalCount > 0;
  const startItem = hasResults ? currentPage * pageSize + 1 : 0;
  const endItem = hasResults ? currentPage * pageSize + Math.min(pageSize, totalCount - currentPage * pageSize) : 0;

  const handlePrevPage = () => {
    if (currentPage > 0 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1 && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const isPrevDisabled = currentPage === 0 || loading;
  const isNextDisabled = currentPage >= totalPages - 1 || loading;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevPage}
          disabled={isPrevDisabled}
          className={`${pageStyles.paginationButton} px-5 py-2.5 font-semibold rounded-lg shadow-sm border-2 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:hover:scale-100`}
          title="Previous Page"
          aria-label="Previous Page"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className={`${pageStyles.paginationInfo} px-4 py-2 border-2 rounded-lg shadow-sm`}>
          <span className="text-sm font-bold">
            Page <span className={pageStyles.paginationInfoAccent}>{displayPage}</span> of{' '}
            <span className={pageStyles.paginationInfoAccent}>{totalPages}</span>
          </span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={isNextDisabled}
          className={`${pageStyles.paginationButton} px-5 py-2.5 font-semibold rounded-lg shadow-sm border-2 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:hover:scale-100`}
          title="Next Page"
          aria-label="Next Page"
          type="button"
        >
          <span>Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="text-center mt-3">
        {hasResults ? (
          <div className={`${pageStyles.paginationCount} inline-flex items-center px-4 py-2 border-2 rounded-lg shadow-sm`}>
            <span className="text-sm">
              Showing <span className={`font-bold ${pageStyles.paginationCountAccent}`}>{startItem}</span> to{' '}
              <span className={`font-bold ${pageStyles.paginationCountAccent}`}>{endItem}</span> of{' '}
              <span className={`font-bold ${pageStyles.paginationCountAccent}`}>{totalCount}</span>{' '}
              {itemType === 'albums' ? 'albums' : 'events'}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50/90 border-2 border-orange-300 rounded-lg shadow-sm">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-orange-700">No {itemType === 'albums' ? 'albums' : 'events'} found</span>
            <span className="text-sm text-orange-600">[No {itemType === 'albums' ? 'albums' : 'events'} match your criteria]</span>
          </div>
        )}
      </div>
    </div>
  );
}
