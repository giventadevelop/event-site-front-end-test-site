import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Mother Feofania and the Little Flowers of the Convent | Gallery | MOSC',
  description: 'Photo gallery of Mother Feofania and the Little Flowers of the Convent.',
};

export default function MotherFeofaniaPage() {
  const photos = [
    { src: '/images/mosc/gallery/mother-feofania/IMG-20190916-WA0020.jpg', alt: 'Mother Feofania and the Little Flowers of the Convent where St. Matrona is interred, welcomed His Holiness with the songs of their heart' },
  ];

  return (
    <GalleryAlbum
      title="Mother Feofania and the Little Flowers of the Convent"
      date="2019"
      category="Special Events"
      photos={photos}
    />
  );
}
