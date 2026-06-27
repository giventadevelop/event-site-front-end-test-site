import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: 'His Holiness the Catholicos paying his respects at the relics of St. Matrona of Moscow | Gallery | MOSC',
  description: 'Photo gallery of His Holiness the Catholicos paying his respects at the relics of St. Matrona of Moscow. She is a very well adored and interceded saint who was blind by birth! (Relics by the Convent of Pokrovsky)',
};

export default function StMatronaRelicsPage() {
  const photos = [
    { 
      src: '/images/mosc/gallery/st-matrona-relics/IMG-20190916-WA0017.jpg', 
      alt: 'His Holiness the Catholicos paying his respects at the relics of St. Matrona of Moscow' 
    },
  ];

  return (
    <GalleryAlbum
      title="His Holiness the Catholicos paying his respects at the relics of St. Matrona of Moscow"
      date="2019"
      category="Liturgical Events"
      photos={photos}
      description="His Holiness the Catholicos visited the Convent of Pokrovsky in Moscow, where he paid his respects at the relics of St. Matrona of Moscow. St. Matrona is a revered saint known for her intercessions, despite being blind from birth. The relics are housed in the Convent of Pokrovsky, a significant spiritual site in Moscow."
    />
  );
}
