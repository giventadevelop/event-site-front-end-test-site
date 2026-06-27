import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Rome | Gallery | MOSC',
  description: 'Photo gallery of Rome.',
};

export default function RomeVisitPage() {
  const photos = [
    { src: '/images/mosc/gallery/rome-visit/IMG_1262.jpg', alt: 'Rome' },
    { src: '/images/mosc/gallery/rome-visit/IMG_1258.jpg', alt: 'Rome' },
    { src: '/images/mosc/gallery/rome-visit/IMG_1232.jpg', alt: 'Rome' },
    { src: '/images/mosc/gallery/rome-visit/IMG_1266.jpg', alt: 'Rome' },
    { src: '/images/mosc/gallery/rome-visit/IMG_1234.jpg', alt: 'Rome' },
  ];

  return (
    <GalleryAlbum
      title="Rome"
      date="2015"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
