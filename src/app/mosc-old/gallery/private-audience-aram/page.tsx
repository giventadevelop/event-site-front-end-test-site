import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Private Audience with H.H Aram - 100th Anniversary of the Armenian Genocide | Gallery | MOSC',
  description: 'Photo gallery of Private Audience with H.H Aram - 100th Anniversary of the Armenian Genocide.',
};

export default function PrivateAudienceAramPage() {
  const photos = [
    { src: '/images/mosc/gallery/private-audience-aram/IMG_3656.jpg', alt: 'Private Audience with H.H Aram' },
    { src: '/images/mosc/gallery/private-audience-aram/IMG_3660.jpg', alt: 'Private Audience with H.H Aram' },
    { src: '/images/mosc/gallery/private-audience-aram/IMG_3684.jpg', alt: 'Private Audience with H.H Aram' },
    { src: '/images/mosc/gallery/private-audience-aram/IMG_3650.jpg', alt: 'Private Audience with H.H Aram' },
    { src: '/images/mosc/gallery/private-audience-aram/IMG_3655.jpg', alt: 'Private Audience with H.H Aram' },
  ];

  return (
    <GalleryAlbum
      title="Private Audience with H.H Aram - 100th Anniversary of the Armenian Genocide"
      date="July 17, 2015"
      category="Private Audiences"
      photos={photos}
    />
  );
}
