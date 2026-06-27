import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Official Reception at the Main Chapel of St. Cyril and Methodius Institute | Gallery | MOSC',
  description: 'Photo gallery of Official Reception at the Main Chapel of St. Cyril and Methodius Institute.',
};

export default function StCyrilMethodiusPage() {
  const photos = [
    { src: '/images/mosc/gallery/st-cyril-methodius/IMG-20190916-WA0022.jpg', alt: 'Official reception at the main Chapel of St. Cyril and Methodius Institute of Post-Graduate Studies' },
    { src: '/images/mosc/gallery/st-cyril-methodius/IMG-20190916-WA0023.jpg', alt: 'Official reception at the main Chapel of St. Cyril and Methodius Institute of Post-Graduate Studies' },
    { src: '/images/mosc/gallery/st-cyril-methodius/IMG-20190916-WA0024.jpg', alt: 'Official reception at the main Chapel of St. Cyril and Methodius Institute of Post-Graduate Studies' },
  ];

  return (
    <GalleryAlbum
      title="Official Reception at the Main Chapel of St. Cyril and Methodius Institute"
      date="2019"
      category="Receptions"
      photos={photos}
    />
  );
}
