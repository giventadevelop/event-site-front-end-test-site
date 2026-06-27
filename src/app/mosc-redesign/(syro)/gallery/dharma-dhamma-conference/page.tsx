import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: '3rd International Dharma-Dhamma Conference | Gallery | MOSC',
  description: 'Photo gallery of 3rd International Dharma-Dhamma Conference.',
};

export default function DharmaDhammaConferencePage() {
  const photos = [
    { src: '/images/mosc/gallery/dharma-dhamma-conference/12038151_10206956334419958_7469993072484946131_n.jpg', alt: 'Meeting with Madhya Pradesh Chief Minister Shivraj Singh Chouhan at 3rd International Dharma-Dhamma Conference' },
    { src: '/images/mosc/gallery/dharma-dhamma-conference/dharama.jpg', alt: '3rd International Dharma-Dhamma Conference, Indore, October 24-26, 2015' },
    { src: '/images/mosc/gallery/dharma-dhamma-conference/IMG_7504.jpg', alt: '3rd International Dharma-Dhamma Conference, Indore, October 24-26, 2015' },
    { src: '/images/mosc/gallery/dharma-dhamma-conference/dharma-dhama.jpg', alt: '3rd International Dharma-Dhamma Conference, Indore, October 24-26, 2015' },
    { src: '/images/mosc/gallery/dharma-dhamma-conference/IMG_7490.jpg', alt: '3rd International Dharma-Dhamma Conference, Indore, October 24-26, 2015' },
  ];

  return (
    <GalleryAlbum
      title="3rd International Dharma-Dhamma Conference"
      date="October 24-26, 2015, Indore"
      category="Conferences"
      photos={photos}
    />
  );
}
