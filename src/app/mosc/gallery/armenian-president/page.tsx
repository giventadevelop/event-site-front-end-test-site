import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'His Holiness with Armenian President | Gallery | MOSC',
  description: 'Photo gallery of His Holiness with Armenian President.',
};

export default function ArmenianPresidentPage() {
  const photos = [
    { src: '/images/mosc/gallery/armenian-president/IMG_17041.jpg', alt: 'His Holiness with Armenian President, April 23, 2015' },
  ];

  return (
    <GalleryAlbum
      title="His Holiness with Armenian President"
      date="April 23, 2015"
      category="Special Events"
      photos={photos}
    />
  );
}
