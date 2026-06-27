import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'H.H Visit to Canberra | Gallery | MOSC',
  description: 'Photo gallery of H.H Visit to Canberra.',
};

export default function CanberraVisitPage() {
  const photos = [
    { src: '/images/mosc/gallery/canberra-visit/IMG_3553.jpg', alt: 'With Peter Hendy at Australian Parliament' },
    { src: '/images/mosc/gallery/canberra-visit/IMG_3552.jpg', alt: 'With Peter Hendy at Australian Parliament' },
    { src: '/images/mosc/gallery/canberra-visit/IMG_35891.jpg', alt: 'With Indian High Commissioner Australia, H.E Navdeep Suri' },
    { src: '/images/mosc/gallery/canberra-visit/IMG_35581.jpg', alt: 'Indian Embassy Canberra' },
    { src: '/images/mosc/gallery/canberra-visit/IMG_3591.jpg', alt: 'Indian Embassy Canberra' },
  ];

  return (
    <GalleryAlbum
      title="H.H Visit to Canberra"
      date="November 17, 2015"
      category="Church Visits"
      photos={photos}
    />
  );
}
