import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Private Audience with H.B.Tikon at Devalokam Aramana | Gallery | MOSC',
  description: 'Photo gallery of Private Audience with H.B.Tikon at Devalokam Aramana.',
};

export default function PrivateAudienceTikonDevalokamPage() {
  const photos = [
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9238.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9244.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9243.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9248.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9254.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9257.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9262.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9267.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
    { src: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9263.jpg', alt: 'Private Audience with H.B.Tikon at Devalokam Aramana' },
  ];

  return (
    <GalleryAlbum
      title="Private Audience with H.B.Tikon at Devalokam Aramana"
      date="November 25, 2015"
      category="Private Audiences"
      photos={photos}
    />
  );
}
