import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Enthronement Ceremony of the New Coptic Pope | Gallery | MOSC',
  description: 'Photo gallery of Enthronement Ceremony of the New Coptic Pope.',
};

export default function EnthronementCopticPopePage() {
  const photos = [
    { src: '/images/mosc/gallery/enthronement-coptic-pope/3.jpg', alt: 'Enthronement Ceremony of the New Coptic Pope' },
    { src: '/images/mosc/gallery/enthronement-coptic-pope/9.jpg', alt: 'Enthronement Ceremony of the New Coptic Pope' },
    { src: '/images/mosc/gallery/enthronement-coptic-pope/14.jpg', alt: 'Enthronement Ceremony of the New Coptic Pope' },
  ];

  return (
    <GalleryAlbum
      title="Enthronement Ceremony of the New Coptic Pope"
      date="2012"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
