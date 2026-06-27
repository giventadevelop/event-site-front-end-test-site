'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SyroPageBanner from '../../components/SyroPageBanner';

interface Photo {
  src: string;
  title?: string;
  alt?: string;
}

interface GalleryAlbumProps {
  title: string;
  date: string;
  category: string;
  photos: Photo[];
}

export default function GalleryAlbum({ title, date, category, photos }: GalleryAlbumProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <>
      <SyroPageBanner title={title} breadcrumbFrom="gallery" />
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/mosc-redesign/gallery" className="inline-flex items-center">
              <span className="syro-read-more-btn font-syro-primary inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Gallery
              </span>
            </Link>
            <span className="inline-block px-3 py-1 bg-syro-red/10 text-syro-red text-xs font-syro-primary font-medium rounded-full">
              {category}
            </span>
          </div>
          <div className="flex items-center justify-center space-x-4 font-syro-primary text-syro-dark-gray text-sm">
            <span>{date}</span>
            <span>•</span>
            <span>{photos.length} Photos</span>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="group relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 cursor-pointer bg-syro-bg-gray"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt || `Photo ${index + 1}`}
                  fill
                  className="object-contain object-center group-hover:scale-105 transition-all duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={95}
                  style={{ 
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                  <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 text-white hover:text-syro-red transition-all duration-300 p-2"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 z-50 text-white hover:text-syro-red transition-all duration-300 p-2"
            aria-label="Previous photo"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-50 text-white hover:text-syro-red transition-all duration-300 p-2"
            aria-label="Next photo"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={photos[currentIndex].src}
                alt={photos[currentIndex].alt || `Photo ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Photo Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-white font-syro-primary text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Photo Title */}
          {photos[currentIndex].title && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50 text-white font-syro-primary text-center max-w-2xl px-4">
              {photos[currentIndex].title}
            </div>
          )}
        </div>
      )}
    </>
  );
}

