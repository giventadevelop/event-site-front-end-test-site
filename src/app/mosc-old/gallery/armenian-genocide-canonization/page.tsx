import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Service of Canonization of the Victims of Armenian Genocide | Gallery | MOSC',
  description: 'Photo gallery of Service of Canonization of the Victims of Armenian Genocide.',
};

export default function ArmenianGenocideCanonizationPage() {
  const photos = [
    { src: '/images/mosc/gallery/armenian-genocide-canonization/IMG_3222.jpg', alt: 'Service of Canonization of the Victims of Armenian Genocide, April 23, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-canonization/IMG_3219.jpg', alt: 'Service of Canonization of the Victims of Armenian Genocide, April 23, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-canonization/IMG_3225.jpg', alt: 'Service of Canonization of the Victims of Armenian Genocide, April 23, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-canonization/IMG_3213.jpg', alt: 'Service of Canonization of the Victims of Armenian Genocide, April 23, 2015' },
    { src: '/images/mosc/gallery/armenian-genocide-canonization/IMG_3229.jpg', alt: 'Service of Canonization of the Victims of Armenian Genocide, April 23, 2015' },
  ];

  return (
    <GalleryAlbum
      title="Service of Canonization of the Victims of Armenian Genocide"
      date="April 23, 2015"
      category="Special Events"
      photos={photos}
    />
  );
}
