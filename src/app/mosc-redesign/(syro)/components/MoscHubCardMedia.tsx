import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Hub card media — rounded corners on all four sides + full image (no crop).
 *
 * Portrait (default): intrinsic height — container hugs the image (no fixed aspect),
 * overflow:hidden + rounded-xl clips all four corners.
 *
 * Landscape: fixed 280×168 + object-cover for directory banners.
 */
const HUB_FRAME_BASE =
  'mosc-hub-card-media relative w-full rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5';

/** Portrait photos — height follows image (no bottom letterbox gap). */
export const HUB_FRAME_PORTRAIT = `${HUB_FRAME_BASE} max-w-[220px] mosc-hub-card-media--portrait mosc-hub-card-media--intrinsic`;

/** Placeholder / empty state — fixed ratio when no image. */
export const HUB_FRAME_PORTRAIT_PLACEHOLDER = `${HUB_FRAME_BASE} max-w-[220px] aspect-[2/3] mosc-hub-card-media--portrait`;

export const HUB_FRAME_LANDSCAPE = `${HUB_FRAME_BASE} max-w-[280px] aspect-[280/168] mosc-hub-card-media--landscape`;

export type MoscHubCardFrame = 'portrait' | 'landscape';

/** Default width/height for Next/Image layout hint (actual display is w-full h-auto). */
const PORTRAIT_IMAGE_LAYOUT = { width: 440, height: 660 };

type MoscHubCardMediaProps = {
  src: string;
  alt: string;
  frame?: MoscHubCardFrame;
  objectPosition?: 'center' | 'top';
  sizes?: string;
  unoptimized?: boolean;
  padded?: boolean;
  outerClassName?: string;
  frameClassName?: string;
};

function frameClasses(frame: MoscHubCardFrame) {
  return frame === 'landscape' ? HUB_FRAME_LANDSCAPE : HUB_FRAME_PORTRAIT;
}

export function MoscHubCardMedia({
  src,
  alt,
  frame = 'portrait',
  objectPosition = 'center',
  sizes,
  unoptimized,
  padded = true,
  outerClassName,
  frameClassName,
}: MoscHubCardMediaProps) {
  const isLandscape = frame === 'landscape';
  const resolvedSizes =
    sizes ?? (isLandscape ? '(max-width: 768px) 100vw, 280px' : '(max-width: 768px) 50vw, 220px');

  const positionClass =
    objectPosition === 'top'
      ? 'mosc-hub-card-image--position-top object-top'
      : 'mosc-hub-card-image--position-center object-center';

  return (
    <div className={cn('mb-5 flex justify-center', padded && 'pt-8', outerClassName)}>
      <div className={cn(frameClasses(frame), frameClassName)}>
        {isLandscape ? (
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized={unoptimized}
            className={cn(
              'mosc-hub-card-image !rounded-xl mosc-hub-card-image--cover object-cover',
              positionClass
            )}
            sizes={resolvedSizes}
            style={{ backgroundColor: 'transparent' }}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={PORTRAIT_IMAGE_LAYOUT.width}
            height={PORTRAIT_IMAGE_LAYOUT.height}
            unoptimized={unoptimized}
            className="mosc-hub-card-image mosc-hub-card-image--intrinsic w-full h-auto !rounded-xl"
            sizes={resolvedSizes}
            style={{ backgroundColor: 'transparent', width: '100%', height: 'auto' }}
          />
        )}
      </div>
    </div>
  );
}

type MoscHubCardMediaPlaceholderProps = {
  frame?: MoscHubCardFrame;
  padded?: boolean;
  outerClassName?: string;
  frameClassName?: string;
  icon?: ReactNode;
};

export function MoscHubCardMediaPlaceholder({
  frame = 'portrait',
  padded = true,
  outerClassName,
  frameClassName,
  icon = <span className="text-4xl text-syro-red/40" role="img" aria-hidden>⛪</span>,
}: MoscHubCardMediaPlaceholderProps) {
  const frameClass =
    frame === 'landscape' ? HUB_FRAME_LANDSCAPE : HUB_FRAME_PORTRAIT_PLACEHOLDER;

  return (
    <div className={cn('mb-5 flex justify-center', padded && 'pt-8', outerClassName)}>
      <div className={cn(frameClass, 'flex items-center justify-center', frameClassName)}>
        {icon}
      </div>
    </div>
  );
}
