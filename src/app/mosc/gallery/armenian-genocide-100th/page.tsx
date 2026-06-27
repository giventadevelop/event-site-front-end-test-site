import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: '100th Anniversary of the Armenian Genocide | Gallery | MOSC',
  description: 'Photo gallery of 100th Anniversary of the Armenian Genocide.',
};

export default function ArmenianGenocide100thPage() {
  const photos = [
    { src: '/images/mosc/gallery/armenian-genocide-100th/IMG_3758.jpg', alt: '100th Anniversary of the Armenian Genocide, Beirut - July 18, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-100th/IMG_4278.jpg', alt: '100th Anniversary of the Armenian Genocide, Beirut - July 18, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-100th/IMG_3767.jpg', alt: '100th Anniversary of the Armenian Genocide, Beirut - July 18, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-100th/IMG_3745.jpg', alt: '100th Anniversary of the Armenian Genocide, Beirut - July 18, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-100th/IMG_3720.jpg', alt: '100th Anniversary of the Armenian Genocide, Beirut - July 18, 2015' },
  ];

  return (
    <GalleryAlbum
      title="100th Anniversary of the Armenian Genocide, Beirut"
      date="July 18, 2015"
      category="Special Events"
      photos={photos}
    />
  );
}
