import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Official Website Inauguration, Devalokam Aramana | Gallery | MOSC',
  description: 'Photo gallery of Official Website Inauguration, Devalokam Aramana.',
};

export default function WebsiteInaugurationPage() {
  const photos = [
    { src: '/images/mosc/gallery/website-inauguration/IMG_9229.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
    { src: '/images/mosc/gallery/website-inauguration/IMG_9225.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
    { src: '/images/mosc/gallery/website-inauguration/IMG_9230.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
    { src: '/images/mosc/gallery/website-inauguration/IMG_9231.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
    { src: '/images/mosc/gallery/website-inauguration/IMG_9232.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
    { src: '/images/mosc/gallery/website-inauguration/IMG_9233.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
    { src: '/images/mosc/gallery/website-inauguration/IMG_9237.jpg', alt: 'Official Website Inauguration, Devalokam Aramana, November 25, 2015' },
  ];

  return (
    <GalleryAlbum
      title="Official Website Inauguration, Devalokam Aramana"
      date="November 25, 2015"
      category="Special Events"
      photos={photos}
    />
  );
}
