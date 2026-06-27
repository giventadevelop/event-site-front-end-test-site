import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church | Gallery | MOSC',
  description: 'Photo gallery of Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church.',
};

export default function CeremonialReceptionRussianOrthodoxPage() {
  const photos = [
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0015.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0014.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0013.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0012.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0011.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0010.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0009.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0008.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
    { src: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0007.jpg', alt: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church' },
  ];

  return (
    <GalleryAlbum
      title="Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church"
      date="2019"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
