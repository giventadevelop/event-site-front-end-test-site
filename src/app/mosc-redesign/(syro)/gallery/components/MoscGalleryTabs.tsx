'use client';

interface MoscGalleryTabsProps {
  activeTab: 'albums' | 'events';
  onTabChange: (tab: 'albums' | 'events') => void;
  albumsCount: number;
  eventsCount: number;
  loading?: boolean;
}

export function MoscGalleryTabs({
  activeTab,
  onTabChange,
  albumsCount,
  eventsCount,
  loading = false,
}: MoscGalleryTabsProps) {
  const albumsDisabled = albumsCount === 0 && !loading;
  const eventsDisabled = eventsCount === 0 && !loading;

  const tabBase =
    'relative px-5 sm:px-8 py-3 font-syro-primary font-semibold text-sm sm:text-base transition-all duration-300 rounded-t-lg border border-b-0';
  const tabActive =
    'bg-white text-[#be1929] border-syro-table-border z-10 -mb-px shadow-sm';
  const tabInactive =
    'bg-syro-bg-gray/80 text-[#798daf] border-transparent hover:bg-white/90 hover:text-syro-blue';
  const tabDisabled = 'bg-syro-bg-gray/50 text-gray-400 cursor-not-allowed border-transparent';

  return (
    <div className="mb-0">
      <div className="flex flex-wrap items-end gap-1 border-b border-syro-table-border">
        <button
          type="button"
          onClick={() => {
            if (!albumsDisabled) onTabChange('albums');
          }}
          disabled={albumsDisabled}
          className={`${tabBase} ${
            activeTab === 'albums' ? tabActive : albumsDisabled ? tabDisabled : tabInactive
          }`}
          aria-label="Albums Gallery"
          aria-selected={activeTab === 'albums'}
          role="tab"
        >
          <span className="flex items-center gap-2">
            <span>Albums Gallery</span>
            {!loading && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'albums'
                    ? 'bg-[#fce4ec] text-[#be1929]'
                    : albumsDisabled
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white text-[#798daf] border border-syro-table-border'
                }`}
              >
                {albumsCount}
              </span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!eventsDisabled) onTabChange('events');
          }}
          disabled={eventsDisabled}
          className={`${tabBase} ${
            activeTab === 'events' ? tabActive : eventsDisabled ? tabDisabled : tabInactive
          }`}
          aria-label="Event Based Galleries"
          aria-selected={activeTab === 'events'}
          role="tab"
        >
          <span className="flex items-center gap-2">
            <span>Event Based Galleries</span>
            {!loading && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'events'
                    ? 'bg-[#fce4ec] text-[#be1929]'
                    : eventsDisabled
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white text-[#798daf] border border-syro-table-border'
                }`}
              >
                {eventsCount}
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
