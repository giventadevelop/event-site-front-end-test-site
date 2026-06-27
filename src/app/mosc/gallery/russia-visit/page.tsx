import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Russia Visit of H.H Baselios Marthoma Mathews III | Gallery | MOSC',
  description: 'Photo gallery of Russia Visit of H.H Baselios Marthoma Mathews III.',
};

export default function RussiaVisitPage() {
  const photos = [
    { src: '/images/mosc/gallery/russia-visit/60.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/yt.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/cross.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/224.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/59.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/58.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/57.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/56.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/55.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/54.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/53.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/52.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/51.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/50.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/49.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/48.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/47.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/46.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/45.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/44.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/43.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/42.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/41.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/40.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/39.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/38.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/37.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/36.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/35.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/34.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/33.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/32.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/31.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/30.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/29.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/28.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/26.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/25.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/23.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/22.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/21.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/20.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/19.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/18.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/17.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/16.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/15.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/14.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/13.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/12.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/11.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/9.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/8.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/7.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/6.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/5.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/4.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/3.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/2.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
    { src: '/images/mosc/gallery/russia-visit/1.jpg', alt: 'Russia Visit of H.H Baselios Marthoma Mathews III' },
  ];

  return (
    <GalleryAlbum
      title="Russia Visit of H.H Baselios Marthoma Mathews III"
      date="2019"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
