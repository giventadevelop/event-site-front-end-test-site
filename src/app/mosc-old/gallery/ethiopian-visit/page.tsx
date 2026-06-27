import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Ethiopian Visit of His Holiness | Gallery | MOSC',
  description: 'Photo gallery of Ethiopian Visit of His Holiness.',
};

export default function EthiopianVisitPage() {
  const photos = [
    { src: '/images/mosc/gallery/ethiopian-visit/Picture-052.jpg', alt: 'Ethiopian Visit of His Holiness' },
    { src: '/images/mosc/gallery/ethiopian-visit/ethiopia.jpg', alt: 'Ethiopian Visit of His Holiness' },
    { src: '/images/mosc/gallery/ethiopian-visit/ethiopia2.jpg', alt: 'Ethiopian Visit of His Holiness' },
    { src: '/images/mosc/gallery/ethiopian-visit/Picture-301.jpg', alt: 'Ethiopian Visit of His Holiness' },
    { src: '/images/mosc/gallery/ethiopian-visit/Picture-577.jpg', alt: 'Ethiopian Visit of His Holiness' },
  ];

  return (
    <GalleryAlbum
      title="Ethiopian Visit of His Holiness"
      date="February 28, 2013"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
