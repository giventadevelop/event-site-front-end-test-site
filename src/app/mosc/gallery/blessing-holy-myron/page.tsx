import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Blessing of Holy Myron | Gallery | MOSC',
  description: 'Photo gallery of Blessing of Holy Myron.',
};

export default function BlessingHolyMyronPage() {
  const photos = [
    { src: '/images/mosc/gallery/blessing-holy-myron/IMG_3889.jpg', alt: 'Blessing of Holy Myron, Beirut, July 19, 2015' },
    { src: '/images/mosc/gallery/blessing-holy-myron/IMG_3906.jpg', alt: 'Blessing of Holy Myron, Beirut, July 19, 2015' },
    { src: '/images/mosc/gallery/blessing-holy-myron/IMG_3909.jpg', alt: 'Blessing of Holy Myron, Beirut, July 19, 2015' },
    { src: '/images/mosc/gallery/blessing-holy-myron/IMG_3898.jpg', alt: 'Blessing of Holy Myron, Beirut, July 19, 2015' },
    { src: '/images/mosc/gallery/blessing-holy-myron/IMG_3881.jpg', alt: 'Blessing of Holy Myron, Beirut, July 19, 2015' },
  ];

  return (
    <GalleryAlbum
      title="Blessing of Holy Myron"
      date="July 19, 2015, Beirut"
      category="Liturgical Events"
      photos={photos}
    />
  );
}
