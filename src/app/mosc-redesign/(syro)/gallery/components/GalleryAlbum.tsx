import GalleryAlbumView from './GalleryAlbumView';
import { fetchYoutubeItemsForStaticSlug } from '@/app/gallery/ApiServerActions';

interface Photo {
  src: string;
  title?: string;
  alt?: string;
}

interface GalleryAlbumProps {
  title: string;
  date: string;
  category: string;
  photos: Photo[];
}

function staticSlugFromPhotos(photos: Photo[]): string | null {
  const src = photos[0]?.src || '';
  const match = src.match(/\/images\/mosc\/gallery\/([^/]+)\//);
  return match?.[1] || null;
}

export default async function GalleryAlbum({ title, date, category, photos }: GalleryAlbumProps) {
  const slug = staticSlugFromPhotos(photos);
  const videos = slug ? await fetchYoutubeItemsForStaticSlug(slug) : [];

  return (
    <GalleryAlbumView
      title={title}
      date={date}
      category={category}
      photos={photos}
      videos={videos}
    />
  );
}
