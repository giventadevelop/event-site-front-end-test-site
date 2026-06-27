'use client';

import Image from 'next/image';

type EventStripBannerImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  /** Featured homepage strip uses aspect-ratio containment; live strip uses compact row height */
  variant?: 'strip' | 'featured';
};

/**
 * Event strip banner — strip: contain in row; featured: object-cover, full-bleed in clipped parent (see image_containment rule).
 */
export function EventStripBannerImage({
  src,
  alt,
  priority,
  variant = 'strip',
}: EventStripBannerImageProps) {
  const mediaClass =
    variant === 'featured'
      ? 'event-card-banner-media event-card-banner-media--featured-strip h-full w-full'
      : 'event-card-banner-media event-card-banner-media--strip h-full w-full';

  return (
    <div className={mediaClass}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={variant === 'featured' ? '(min-width: 768px) 70vw, 100vw' : '(min-width: 768px) 70vw, 100vw'}
        priority={priority}
        className={`event-card-banner-image transition-transform duration-300 ease-out ${
          variant === 'featured' ? 'group-hover:scale-105' : 'group-hover:scale-[1.02]'
        }`}
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
}
