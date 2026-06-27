import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'The Fraternity at Vienna | Gallery | MOSC',
  description: 'Photo gallery of The Fraternity at Vienna.',
};

export default function ViennaFraternityPage() {
  const photos = [
    { src: '/images/mosc/gallery/vienna-fraternity/IMG_0895.jpg', alt: 'Meeting Cardinal Christoph Schönborn, the Archbishop of Vienna, September 3, 2013' },
    { src: '/images/mosc/gallery/vienna-fraternity/IMG_0898.jpg', alt: 'Meeting Cardinal Christoph Schönborn, the Archbishop of Vienna, September 3, 2013' },
    { src: '/images/mosc/gallery/vienna-fraternity/IMG_0902.jpg', alt: 'Meeting Cardinal Christoph Schönborn, the Archbishop of Vienna, September 3, 2013' },
    { src: '/images/mosc/gallery/vienna-fraternity/IMG_0900.jpg', alt: 'Meeting Cardinal Christoph Schönborn, the Archbishop of Vienna, September 3, 2013' },
    { src: '/images/mosc/gallery/vienna-fraternity/IMG_0887.jpg', alt: 'Meeting Cardinal Christoph Schönborn, the Archbishop of Vienna, September 3, 2013' },
  ];

  return (
    <GalleryAlbum
      title="The Fraternity at Vienna"
      date="September 3, 2013"
      category="Special Events"
      photos={photos}
    />
  );
}
