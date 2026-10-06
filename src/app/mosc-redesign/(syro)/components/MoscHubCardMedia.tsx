import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Hub card media — rounded corners on all four sides + full image (no crop).
 *
 * Portrait (default): intrinsic height — container hugs the image (no fixed aspect),
 * overflow:hidden + rounded-xl clips all four corners.
 *
 * Portrait uniform: fixed 2:3 tile + object-cover for equal-height grids (Holy Synod).
 *
 * Landscape: fixed 280×168 + object-cover for directory banners.
 *
 * Uniform contain: one shared frame; each image keeps its ratio (no stretch, no crop).
 */
const HUB_FRAME_BASE =
  'mosc-hub-card-media relative w-full rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5';

/** Portrait photos — taller/wider on mobile; desktop keeps 220px. */
export const HUB_FRAME_PORTRAIT = `${HUB_FRAME_BASE} max-w-[290px] md:max-w-[220px] mosc-hub-card-media--portrait mosc-hub-card-media--intrinsic`;

/** Equal-height portrait tiles for multi-column grids (same size regardless of source ratio). */
export const HUB_FRAME_PORTRAIT_UNIFORM = `${HUB_FRAME_BASE} max-w-[290px] md:max-w-[220px] aspect-[2/3] mosc-hub-card-media--portrait`;

/** Placeholder / empty state — fixed ratio when no image. */
export const HUB_FRAME_PORTRAIT_PLACEHOLDER = `${HUB_FRAME_BASE} max-w-[290px] md:max-w-[220px] aspect-[2/3] mosc-hub-card-media--portrait`;

export const HUB_FRAME_LANDSCAPE = `${HUB_FRAME_BASE} max-w-[calc(100%-2rem)] md:max-w-[280px] aspect-[280/168] mosc-hub-card-media--landscape`;

/**
 * Same box on every card. Width stays at or below the 300px church photos
 * so those files are not upscaled. object-contain keeps the original ratio.
 */
export const HUB_FRAME_UNIFORM_CONTAIN = `${HUB_FRAME_BASE} w-full max-w-[300px] aspect-[300/188] mosc-hub-card-media--uniform-contain`;

export type MoscHubCardFrame = 'portrait' | 'portraitUniform' | 'landscape' | 'uniformContain';

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
  if (frame === 'landscape') return HUB_FRAME_LANDSCAPE;
  if (frame === 'portraitUniform') return HUB_FRAME_PORTRAIT_UNIFORM;
  if (frame === 'uniformContain') return HUB_FRAME_UNIFORM_CONTAIN;
  return HUB_FRAME_PORTRAIT;
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
  const usesFill = frame === 'landscape' || frame === 'portraitUniform' || frame === 'uniformContain';
  const resolvedSizes =
    sizes ??
    (frame === 'uniformContain'
      ? '300px'
      : frame === 'landscape'
        ? '(max-width: 768px) calc(100vw - 4rem), 280px'
        : '(max-width: 768px) 290px, 220px');

  const positionClass =
    objectPosition === 'top'
      ? 'mosc-hub-card-image--position-top object-top'
      : 'mosc-hub-card-image--position-center object-center';

  return (
    <div className={cn('mb-5 flex justify-center', padded && 'pt-8', outerClassName)}>
      <div className={cn(frameClasses(frame), frameClassName)}>
        {usesFill ? (
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized={unoptimized}
            className={cn(
              'mosc-hub-card-image !rounded-xl',
              frame === 'uniformContain'
                ? 'mosc-hub-card-image--contain object-contain'
                : 'mosc-hub-card-image--cover object-cover',
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
    frame === 'landscape'
      ? HUB_FRAME_LANDSCAPE
      : frame === 'uniformContain'
        ? HUB_FRAME_UNIFORM_CONTAIN
        : frame === 'portraitUniform'
          ? HUB_FRAME_PORTRAIT_UNIFORM
          : HUB_FRAME_PORTRAIT_PLACEHOLDER;

  return (
    <div className={cn('mb-5 flex justify-center', padded && 'pt-8', outerClassName)}>
      <div className={cn(frameClass, 'flex items-center justify-center', frameClassName)}>
        {icon}
      </div>
    </div>
  );
}
