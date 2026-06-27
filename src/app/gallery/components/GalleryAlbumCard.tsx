'use client';

import { useState } from 'react';
import { MoscGalleryAlbumCard } from '@/components/gallery/MoscGalleryAlbumCard';
import { AlbumMediaSlideshow } from './AlbumMediaSlideshow';
import type { GalleryAlbumWithMedia } from '../../ApiServerActions';

interface GalleryAlbumCardProps {
  albumWithMedia: GalleryAlbumWithMedia;
}

function displayDescription(description?: string): string | undefined {
  if (!description?.trim()) return undefined;
  if (description.trim().startsWith('static_slug=')) return undefined;
  return description;
}

export function GalleryAlbumCard({ albumWithMedia }: GalleryAlbumCardProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { album, media, totalMediaCount } = albumWithMedia;

  const coverImage = album.coverImageUrl
    ? album.coverImageUrl
    : media.find((m) => m.fileUrl)?.fileUrl;

  const categoryDisplayName = album.galleryCategory?.displayName ?? null;
  const description = displayDescription(album.description);

  return (
    <>
      <MoscGalleryAlbumCard
        title={album.title}
        coverImageUrl={coverImage}
        totalMediaCount={totalMediaCount}
        categoryDisplayName={categoryDisplayName}
        albumYear={album.albumYear ?? null}
        eventDateStart={album.eventDateStart ?? null}
        eventDateEnd={album.eventDateEnd ?? null}
        eventLocation={album.eventLocation ?? null}
        description={description}
        variant="main-gallery"
        onViewAlbum={() => setShowSlideshow(true)}
        viewDisabled={media.length === 0}
      />

      {showSlideshow && (
        <AlbumMediaSlideshow
          album={album}
          media={media}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </>
  );
}
