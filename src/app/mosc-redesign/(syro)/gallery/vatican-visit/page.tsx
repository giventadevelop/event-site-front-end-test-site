import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Vatican Visit of His Holiness | Gallery | MOSC',
  description: 'Photo gallery of Vatican Visit of His Holiness.',
};

export default function VaticanVisitPage() {
  const photos = [
    { src: '/images/mosc/gallery/vatican-visit/00240_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00238_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00228_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00225_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00224_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00223_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00222_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00221_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00180_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00181_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00186_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00185_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00206_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00207_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00217_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00218_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00179_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00178_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00177_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00176_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00173_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00172_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00170_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00169_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00069_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00076_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00146_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00147_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00155_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00158_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00166_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00168_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00061_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00056_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00053_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00049_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00043_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00032_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00027_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00012_11092023-683x1024.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00005_11092023-683x1024.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
    { src: '/images/mosc/gallery/vatican-visit/00001_11092023-1024x683.jpg', alt: 'Vatican Visit of His Holiness Baselios Marthoma Paulose II, September 5, 2013' },
  ];

  return (
    <GalleryAlbum
      title="Vatican Visit of His Holiness Baselios Marthoma Paulose II"
      date="September 5, 2013"
      category="Ecumenical Visits"
      photos={photos}
    />
  );
}
