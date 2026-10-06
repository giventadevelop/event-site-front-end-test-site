'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Download,
  Info
} from 'lucide-react';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';

interface EventMediaSlideshowProps {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
  onClose: () => void;
  initialIndex?: number;
}

export function EventMediaSlideshow({ event, media, onClose, initialIndex = 0 }: EventMediaSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(3000); // 3 seconds per slide

  console.log('EventMediaSlideshow rendered with:', {
    eventTitle: event.title,
    mediaCount: media.length,
    currentIndex,
    currentMedia: media[currentIndex]
  });

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.eventMediaType.startsWith('video/');

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < media.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, media.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isVideo && media.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, playbackSpeed);

      return () => clearInterval(interval);
    }
  }, [isPlaying, isVideo, media.length, playbackSpeed]);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const togglePlayPause = useCallback(() => {
    if (!isVideo) {
      setIsPlaying((prev) => !prev);
    }
  }, [isVideo]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
    } catch {
      return 'Date unknown';
    }
  };

  if (!mounted || !currentMedia) {
    if (!currentMedia) console.log('No current media found, returning null');
    return null;
  }

  console.log('Rendering slideshow modal for media:', currentMedia);

  const slideshow = (
    <div
      className="fixed inset-0 z-[1200] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div className="flex shrink-0 items-center justify-end px-4 py-3">
        <button
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg hover:bg-gray-100"
          aria-label="Close gallery"
          type="button"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14">
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Previous photo"
              type="button"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Next photo"
              type="button"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        <div className="relative h-full w-full max-w-6xl">
          {isVideo ? (
            <video
              src={currentMedia.fileUrl}
              controls
              className="mx-auto h-full max-h-full w-full object-contain"
              poster={currentMedia.preSignedUrl}
            />
          ) : (
            <Image
              src={currentMedia.fileUrl || '/placeholder-image.jpg'}
              alt={currentMedia.altText || currentMedia.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center px-4 pb-4 pt-3">

        {/* Media info */}
        <div className="max-w-4xl w-full bg-black bg-opacity-50 rounded-lg p-4 text-white">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold">{currentMedia.title}</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {currentMedia.description && (
            <p className="text-gray-300 mb-3">{currentMedia.description}</p>
          )}

          {/* Detailed info (collapsible) */}
          {showDetails && (
            <div className="border-t border-gray-600 pt-3 mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Event:</span>
                  <span className="ml-2">{event.title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="ml-2">{currentMedia.eventMediaType}</span>
                </div>
                <div>
                  <span className="text-gray-400">Uploaded:</span>
                  <span className="ml-2">{formatDate(currentMedia.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2">{formatFileSize(currentMedia.fileSize)}</span>
                </div>
              </div>

              {currentMedia.altText && (
                <div>
                  <span className="text-gray-400">Alt Text:</span>
                  <span className="ml-2">{currentMedia.altText}</span>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              {!isVideo && media.length > 1 && (
                <button
                  onClick={togglePlayPause}
                  className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              )}

              {currentMedia.fileUrl && (
                <a
                  href={currentMedia.fileUrl}
                  download
                  className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {currentIndex + 1} of {media.length}
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div className="max-w-4xl w-full mt-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {media.map((mediaItem, index) => (
                <button
                  key={mediaItem.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? 'border-white'
                      : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  {mediaItem.fileUrl ? (
                    <Image
                      src={mediaItem.fileUrl}
                      alt={mediaItem.altText || mediaItem.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xs">
                      {mediaItem.eventMediaType.startsWith('video/') ? '🎥' : '📷'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(slideshow, document.body);
}
