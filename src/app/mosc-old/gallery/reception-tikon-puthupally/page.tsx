import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Reception to H.B.Tikon at Puthupally Church | Gallery | MOSC',
  description: 'Photo gallery of Reception to H.B.Tikon at Puthupally Church.',
};

export default function ReceptionTikonPuthupallyPage() {
  const photos = [
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9165.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9166.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9167.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9168.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9169.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9172.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9174.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9176.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9177.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9178.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
    { src: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9182.jpg', alt: 'Reception to H.B.Tikon at Puthupally Church' },
  ];

  return (
    <GalleryAlbum
      title="Reception to H.B.Tikon at Puthupally Church"
      date="2015"
      category="Receptions"
      photos={photos}
    />
  );
}
