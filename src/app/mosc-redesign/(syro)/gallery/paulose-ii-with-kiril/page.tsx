import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch | Gallery | MOSC',
  description: 'Photo gallery of H.H Baselios Marthoma Paulose II with Kiril Patriarch.',
};

export default function PauloseIiWithKirilPage() {
  const photos = [
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0034.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0036.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0042.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0047.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0053.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0056.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0057.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0059.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0061.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0063.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0067.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0071.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0072.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0085.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0088.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0091_1.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0093.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0098.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
    { src: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0096_1.jpg', alt: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch' },
  ];

  return (
    <GalleryAlbum
      title="H.H Baselios Marthoma Paulose II with Kiril Patriarch"
      date="2012"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
