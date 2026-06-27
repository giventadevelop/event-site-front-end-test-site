import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'The Great Shepherd of Malankara Prayerfully in Pokrovsky Monastery Chapel | Gallery | MOSC',
  description: 'Photo gallery of The Great Shepherd of Malankara Prayerfully in Pokrovsky Monastery Chapel.',
};

export default function PokrovskyMonasteryPage() {
  const photos = [
    { src: '/images/mosc/gallery/pokrovsky-monastery/IMG-20190916-WA0019.jpg', alt: 'The Great Shepherd of Malankara, Prayerfully in Pokrovsky Monastery Chapel' },
    { src: '/images/mosc/gallery/pokrovsky-monastery/IMG-20190916-WA0018.jpg', alt: 'The Great Shepherd of Malankara, Prayerfully in Pokrovsky Monastery Chapel' },
  ];

  return (
    <GalleryAlbum
      title="The Great Shepherd of Malankara Prayerfully in Pokrovsky Monastery Chapel"
      date="2019"
      category="Liturgical Events"
      photos={photos}
    />
  );
}
