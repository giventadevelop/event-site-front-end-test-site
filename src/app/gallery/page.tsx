import { Suspense } from 'react';
import GalleryPageBackground from './GalleryPageBackground';
import { GalleryContent } from './GalleryContent';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import pageStyles from './GalleryPage.module.css';

export default function GalleryPage() {
  return (
    <>
      <GalleryPageBackground />
      <div
        className={`${pageStyles.galleryPage} home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden`}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '120px', paddingBottom: '2rem' }}
        >
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <HomeSectionTitle className="mb-4">Gallery</HomeSectionTitle>
            <p className={`${pageStyles.pageDescription} text-lg max-w-3xl mx-auto`}>
              Explore memories from our albums and events through our photo and video gallery
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="homepage-glass-card services-glass-card-face rounded-2xl overflow-hidden animate-pulse"
                    style={{ padding: 0 }}
                  >
                    <div className="h-48 bg-white/10" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-white/20 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <GalleryContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
