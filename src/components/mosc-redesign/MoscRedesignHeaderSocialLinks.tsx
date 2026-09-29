'use client';

import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { InstagramIcon } from '@/components/icons/InstagramIcon';

/** Compact header variant of footer social icons (rose on parchment). */
const HEADER_SOCIAL_LINK_CLASS =
  'inline-flex items-center justify-center rounded-full p-1 leading-none text-rose-600 transition-colors hover:bg-rose-500/10 hover:text-warmGold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50';
const HEADER_SOCIAL_SVG_CLASS = 'block h-5 w-5 shrink-0 overflow-visible';

/**
 * Same Facebook / Instagram / YouTube / TikTok links as MoscRedesignFooter.
 * Rendered in the header logo row to the left of Admin / auth controls.
 */
export default function MoscRedesignHeaderSocialLinks() {
  const { settings } = useTenantSettings();
  const hasAnySocial =
    settings?.facebookUrl?.trim() ||
    settings?.instagramUrl?.trim() ||
    settings?.youtubeUrl?.trim() ||
    settings?.tiktokUrl?.trim();

  if (!hasAnySocial) return null;

  return (
    <div
      className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-visible"
      aria-label="Social media"
    >
      {settings?.facebookUrl?.trim() && (
        <a
          href="https://www.facebook.com/catholicatenews.in"
          target="_blank"
          rel="noopener noreferrer"
          className={HEADER_SOCIAL_LINK_CLASS}
          aria-label="Facebook"
        >
          <svg className={HEADER_SOCIAL_SVG_CLASS} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      )}
      {settings?.instagramUrl?.trim() && (
        <a
          href="https://www.instagram.com/malankara_sabha?fbclid=IwY2xjawQvK5tleHRuA2FlbQIxMABicmlkETBMTVQ5UFdQa0dmQlFyYzNSc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHlkCQWoyNFMKgQSqpGL4xBnm4kYXRK9mSTH54avT-vHV9yn2cuQG3fd-Z0Sy_aem_w-t6H5HlT-irapc29vb1ng"
          target="_blank"
          rel="noopener noreferrer"
          className={HEADER_SOCIAL_LINK_CLASS}
          aria-label="Instagram"
        >
          <InstagramIcon className={HEADER_SOCIAL_SVG_CLASS} />
        </a>
      )}
      {settings?.youtubeUrl?.trim() && (
        <a
          href="https://www.youtube.com/@newscatholicate"
          target="_blank"
          rel="noopener noreferrer"
          className={HEADER_SOCIAL_LINK_CLASS}
          aria-label="YouTube"
        >
          <svg className="block h-6 w-6 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden>
            <rect x="1.5" y="5" width="21" height="14" rx="4.5" fill="currentColor" />
            <path fill="#F5EDD8" d="M10 9.2v5.6l5.6-2.8L10 9.2z" />
          </svg>
        </a>
      )}
      {settings?.tiktokUrl?.trim() && (
        <a
          href={settings.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={HEADER_SOCIAL_LINK_CLASS}
          aria-label="TikTok"
        >
          <svg className={HEADER_SOCIAL_SVG_CLASS} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12.525.02c1.31-.02 2.61-.01 3.918-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.01-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48.01 2.96.02 4.44-.9-.24-1.92-.2-2.75.29-.82.48-1.39 1.3-1.59 2.22-.1.42-.14.86-.12 1.29.12 1.09.77 2.09 1.7 2.6.94.52 2.12.55 3.08.08 1.02-.5 1.68-1.56 1.78-2.67.07-.53.04-1.07.05-1.61-.01-4.09.02-8.18-.02-12.27z" />
          </svg>
        </a>
      )}
    </div>
  );
}
