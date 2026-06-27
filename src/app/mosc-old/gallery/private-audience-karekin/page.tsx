import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians | Gallery | MOSC',
  description: 'Photo gallery of Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians.',
};

export default function PrivateAudienceKarekinPage() {
  const photos = [
    { src: '/images/mosc/gallery/private-audience-karekin/IMG_3455.jpg', alt: 'Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians' },
    { src: '/images/mosc/gallery/private-audience-karekin/IMG_3477.jpg', alt: 'Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians' },
    { src: '/images/mosc/gallery/private-audience-karekin/IMG_3504.jpg', alt: 'Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians' },
    { src: '/images/mosc/gallery/private-audience-karekin/IMG_3537.jpg', alt: 'Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians' },
  ];

  return (
    <GalleryAlbum
      title="Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians"
      date="2015"
      category="Private Audiences"
      photos={photos}
    />
  );
}
