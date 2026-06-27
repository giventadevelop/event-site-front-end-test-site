import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III | Gallery | MOSC',
  description: 'Photo gallery of Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III.',
};

export default function EnthronementMathewsIiiPage() {
  const photos = [
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C1.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C2.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C3.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C4.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C5.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C6.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C7.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C8.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C9.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C10.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C11.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C12.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C13.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C14.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C15.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C17.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C18.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C19.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C20.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C21.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C22.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C23.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C24.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C25.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C26.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C27.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C28.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C29.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C30.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C31.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C32.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C33.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C34.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C35.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C36.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C37.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C38.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C39.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C40.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C41.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C42.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C43.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C44.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C45.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C46.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C47.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C48.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/enthronement-mathews-iii/C50.jpg', alt: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III' },
  ];

  return (
    <GalleryAlbum
      title="Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III"
      date="2021"
      category="Major Events"
      photos={photos}
    />
  );
}
