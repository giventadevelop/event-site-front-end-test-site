import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Reception to His Holiness Baselios Marthoma Mathews III | Gallery | MOSC',
  description: 'Photo gallery of Reception to His Holiness Baselios Marthoma Mathews III.',
};

export default function ReceptionMathewsIiiPage() {
  const photos = [
    { src: '/images/mosc/gallery/reception-mathews-iii/al1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/al2.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/AL1-1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/AL2-1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/AL3.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/AL4.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R2.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R3.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R4.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R7.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R5.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R6.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R8.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R9-1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R10.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R11.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R12.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R15-1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R13-1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R14-1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R15-2.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R16.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R17.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R18.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R19.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/R20.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B1.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B2.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B3.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B4.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B5.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B6.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B7.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B8.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/reception-mathews-iii/B9.jpg', alt: 'Reception to His Holiness Baselios Marthoma Mathews III' },
  ];

  return (
    <GalleryAlbum
      title="Reception to His Holiness Baselios Marthoma Mathews III"
      date="2021"
      category="Receptions"
      photos={photos}
    />
  );
}

