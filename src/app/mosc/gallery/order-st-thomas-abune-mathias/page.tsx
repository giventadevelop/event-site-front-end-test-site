import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church | Gallery | MOSC',
  description: 'Photo gallery of Order of St.Thomas to His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church.',
};

export default function OrderStThomasAbuneMathiasPage() {
  const photos = [
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2713.jpg', alt: 'Group Photo at Pazhaya Seminary' },
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2706.jpg', alt: 'Opening of Principal Residence' },
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2698.jpg', alt: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch' },
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2669.jpg', alt: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch' },
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2678.jpg', alt: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch' },
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2774.jpg', alt: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch' },
    { src: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2776.jpg', alt: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch' },
  ];

  return (
    <GalleryAlbum
      title="Order of St.Thomas to His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church"
      date="2016"
      category="Major Events"
      photos={photos}
    />
  );
}
