import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church | Gallery | MOSC',
  description: 'Photo gallery of Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church.',
};

export default function VisitAbuneMathiasPage() {
  const photos = [
    { src: '/images/mosc/gallery/visit-abune-mathias/MG_2516.jpg', alt: 'Photo Session at Devalokam Aramana' },
    { src: '/images/mosc/gallery/visit-abune-mathias/MG_2513.jpg', alt: 'Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church' },
    { src: '/images/mosc/gallery/visit-abune-mathias/MG_2509.jpg', alt: 'Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church' },
  ];

  return (
    <GalleryAlbum
      title="Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church"
      date="2016"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
