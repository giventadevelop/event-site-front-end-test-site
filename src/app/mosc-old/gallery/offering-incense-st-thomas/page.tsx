import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Offering Incense at the Relics of St.Thomas (Devalokam Aramana) | Gallery | MOSC',
  description: 'Photo gallery of Offering Incense at the Relics of St.Thomas (Devalokam Aramana).',
};

export default function OfferingIncenseStThomasPage() {
  const photos = [
    { src: '/images/mosc/gallery/offering-incense-st-thomas/IMG_9805.jpg', alt: 'Offering Incense at the Relics of St.Thomas (Devalokam Aramana)' },
    { src: '/images/mosc/gallery/offering-incense-st-thomas/IMG_9820-1.jpg', alt: 'Offering Incense at the Relics of St.Thomas (Devalokam Aramana)' },
  ];

  return (
    <GalleryAlbum
      title="Offering Incense at the Relics of St.Thomas (Devalokam Aramana)"
      date="2016"
      category="Liturgical Events"
      photos={photos}
    />
  );
}
