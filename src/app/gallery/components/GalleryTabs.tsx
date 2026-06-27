'use client';

interface GalleryTabsProps {
  activeTab: 'albums' | 'events';
  onTabChange: (tab: 'albums' | 'events') => void;
  albumsCount: number;
  eventsCount: number;
  loading?: boolean;
}

export function GalleryTabs({
  activeTab,
  onTabChange,
  albumsCount,
  eventsCount,
  loading = false,
}: GalleryTabsProps) {
  // Disable tabs only if count is 0 and not loading (to allow initial load)
  const albumsDisabled = albumsCount === 0 && !loading;
  const eventsDisabled = eventsCount === 0 && !loading;

  return (
    <div className="mb-8">
      {/* Floating Tabs Container - No background, tabs appear floating */}
      <div className="relative flex items-end" style={{ gap: '4px' }}>
          {/* Albums Tab */}
          <button
            onClick={() => {
              if (!albumsDisabled) {
                onTabChange('albums');
              }
            }}
            disabled={albumsDisabled}
            className={`relative font-heading font-bold text-base transition-all duration-300 ${
              activeTab === 'albums'
                ? 'text-blue-700 z-10'
                : albumsDisabled
                ? 'text-orange-500 cursor-not-allowed z-0'
                : 'text-gray-700 hover:text-gray-900 z-0'
            }`}
            style={activeTab === 'albums' ? {
              // Active tab - appears on top, connects to content
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
              borderRadius: '12px 12px 0 0',
              padding: '12px 24px 16px 24px',
              marginBottom: '-2px', // Connects to content area
              boxShadow: `
                inset 0 2px 4px rgba(255, 255, 255, 0.9),
                inset 0 -1px 2px rgba(0, 0, 0, 0.05),
                0 -2px 4px rgba(59, 130, 246, 0.2),
                0 2px 4px rgba(59, 130, 246, 0.15),
                0 0 0 1px rgba(59, 130, 246, 0.15)
              `,
              border: '2px solid',
              borderColor: 'rgba(59, 130, 246, 0.25)',
              borderBottom: '2px solid rgba(255, 255, 255, 0.98)',
            } : albumsDisabled ? {
              // Disabled tab - appears behind with orange/amber tones
              background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, rgba(251, 191, 36, 0.3) 100%)',
              borderRadius: '10px 10px 0 0',
              padding: '10px 20px 12px 20px',
              marginBottom: '0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              borderBottom: 'none',
            } : {
              // Inactive tab - appears behind active tab
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(249, 250, 251, 0.6) 100%)',
              borderRadius: '10px 10px 0 0',
              padding: '10px 20px 12px 20px',
              marginBottom: '0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderBottom: 'none',
            }}
            type="button"
            aria-label="Albums Gallery"
            aria-disabled={albumsDisabled}
            onMouseEnter={(e) => {
              if (!albumsDisabled && activeTab !== 'albums') {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(249, 250, 251, 0.75) 100%)';
                e.currentTarget.style.boxShadow = `
                  inset 0 1px 2px rgba(255, 255, 255, 0.7),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.05),
                  0 2px 4px rgba(59, 130, 246, 0.15)
                `;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'albums') {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(249, 250, 251, 0.6) 100%)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="tracking-wide">Albums Gallery</span>
              {!loading && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    albumsDisabled
                      ? 'bg-orange-100 text-orange-600'
                      : activeTab === 'albums'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                  }`}
                  style={activeTab === 'albums' ? {
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
                  } : {}}
                >
                  {albumsCount}
                </span>
              )}
            </span>
          </button>

          {/* Events Tab */}
          <button
            onClick={() => {
              if (!eventsDisabled) {
                onTabChange('events');
              }
            }}
            disabled={eventsDisabled}
            className={`relative font-heading font-bold text-base transition-all duration-300 ${
              activeTab === 'events'
                ? 'text-blue-700 z-10'
                : eventsDisabled
                ? 'text-gray-400 cursor-not-allowed z-0'
                : 'text-gray-700 hover:text-gray-900 z-0'
            }`}
            style={activeTab === 'events' ? {
              // Active tab - appears on top, connects to content
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
              borderRadius: '12px 12px 0 0',
              padding: '12px 24px 16px 24px',
              marginBottom: '-2px', // Connects to content area
              boxShadow: `
                inset 0 2px 4px rgba(255, 255, 255, 0.9),
                inset 0 -1px 2px rgba(0, 0, 0, 0.05),
                0 -2px 4px rgba(59, 130, 246, 0.2),
                0 2px 4px rgba(59, 130, 246, 0.15),
                0 0 0 1px rgba(59, 130, 246, 0.15)
              `,
              border: '2px solid',
              borderColor: 'rgba(59, 130, 246, 0.25)',
              borderBottom: '2px solid rgba(255, 255, 255, 0.98)',
            } : eventsDisabled ? {
              // Disabled tab - appears behind
              background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.4) 0%, rgba(229, 231, 235, 0.4) 100%)',
              borderRadius: '10px 10px 0 0',
              padding: '10px 20px 12px 20px',
              marginBottom: '0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(209, 213, 219, 0.3)',
              borderBottom: 'none',
            } : {
              // Inactive tab - appears behind active tab
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(249, 250, 251, 0.6) 100%)',
              borderRadius: '10px 10px 0 0',
              padding: '10px 20px 12px 20px',
              marginBottom: '0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderBottom: 'none',
            }}
            type="button"
            aria-label="Event Based Galleries"
            aria-disabled={eventsDisabled}
            onMouseEnter={(e) => {
              if (!eventsDisabled && activeTab !== 'events') {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(249, 250, 251, 0.75) 100%)';
                e.currentTarget.style.boxShadow = `
                  inset 0 1px 2px rgba(255, 255, 255, 0.7),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.05),
                  0 2px 4px rgba(59, 130, 246, 0.15)
                `;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'events') {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(249, 250, 251, 0.6) 100%)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="tracking-wide">Event Based Galleries</span>
              {!loading && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    eventsDisabled
                      ? 'bg-gray-200 text-gray-400'
                      : activeTab === 'events'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                  }`}
                  style={activeTab === 'events' ? {
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
                  } : {}}
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

