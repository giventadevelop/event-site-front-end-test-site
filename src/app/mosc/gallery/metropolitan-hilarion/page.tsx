import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Metropolitan Hilarion Receiving His Holiness to St. Cyril and Methodius Institute | Gallery | MOSC',
  description: 'Photo gallery of Metropolitan Hilarion, the Chairman of the Department of External Affairs of the Moscow Patriarchate receiving His Holiness to St. Cyril and Methodius Institute of Post-Graduate Studies.',
};

export default function MetropolitanHilarionPage() {
  const photos = [
    { 
      src: '/images/mosc/gallery/metropolitan-hilarion/IMG-20190916-WA0021.jpg', 
      alt: 'Metropolitan Hilarion, the Chairman of the Department of External Affairs of the Moscow Patriarchate receiving His Holiness to St. Cyril and Methodius Institute of Post-Graduate Studies' 
    },
    { 
      src: '/images/mosc/gallery/metropolitan-hilarion/IMG-20190916-WA0025.jpg', 
      alt: 'Metropolitan Hilarion, the Chairman of the Department of External Affairs of the Moscow Patriarchate receiving His Holiness to St. Cyril and Methodius Institute of Post-Graduate Studies' 
    },
  ];

  return (
    <GalleryAlbum
      title="Metropolitan Hilarion, the Chairman of the Department of External Affairs of the Moscow Patriarchate receiving His Holiness to St. Cyril and Methodius Institute of Post-Graduate Studies"
      date="2019"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}












