'use client';

import { useState } from 'react';
import { MoscGalleryAlbumCard } from '@/components/gallery/MoscGalleryAlbumCard';
import { AlbumMediaSlideshow } from '@/app/gallery/components/AlbumMediaSlideshow';
import { resolveMoscGalleryAlbumHref } from '@/lib/gallery/resolveMoscGalleryHref';
import type { GalleryAlbumWithMedia } from '@/types';

interface MoscGalleryAlbumCardWrapperProps {
  albumWithMedia: GalleryAlbumWithMedia;
  gradientIndex?: number;
}

function displayDescription(description?: string): string | undefined {
  if (!description?.trim()) return undefined;
  if (description.trim().startsWith('static_slug=')) return undefined;
  return description;
}

export function MoscGalleryAlbumCardWrapper({
  albumWithMedia,
  gradientIndex = 0,
}: MoscGalleryAlbumCardWrapperProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { album, media, totalMediaCount } = albumWithMedia;

  const coverImage = album.coverImageUrl || media.find((m) => m.fileUrl)?.fileUrl;
  const href = resolveMoscGalleryAlbumHref(album);
  const useSlideshow = !href && media.length > 0;

  return (
    <>
      <MoscGalleryAlbumCard
        title={album.title}
        coverImageUrl={coverImage}
        totalMediaCount={totalMediaCount}
        categoryDisplayName={album.galleryCategory?.displayName ?? null}
        albumYear={album.albumYear ?? null}
        eventDateStart={album.eventDateStart ?? null}
        eventDateEnd={album.eventDateEnd ?? null}
        eventLocation={album.eventLocation ?? null}
        description={displayDescription(album.description)}
        href={href}
        onViewAlbum={useSlideshow ? () => setShowSlideshow(true) : undefined}
        viewDisabled={!href && media.length === 0}
        variant="mosc-redesign"
        gradientIndex={gradientIndex}
      />

      {showSlideshow && (
        <AlbumMediaSlideshow album={album} media={media} onClose={() => setShowSlideshow(false)} />
      )}
    </>
  );
}
