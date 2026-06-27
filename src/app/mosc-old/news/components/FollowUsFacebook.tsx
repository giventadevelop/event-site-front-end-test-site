import React from 'react';

/**
 * Facebook Page Plugin embed for "Follow Us" sidebar.
 * Extracted from legacy documentation/news_portal/strapi/index.html.
 * No Strapi - static embed URL forwards to Catholicate News Facebook page.
 * Shows page timeline, cover, facepile, and Follow button.
 */
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/catholicatenews.in';
const IFRAME_WIDTH = 360;
const IFRAME_HEIGHT = 720;
const IFRAME_SRC = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
  FACEBOOK_PAGE_URL,
)}&tabs=timeline&width=${IFRAME_WIDTH}&height=${IFRAME_HEIGHT}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M22 12a10 10 0 10-11.5 9.87v-6.99H7.9V12h2.6V9.79c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.88h-2.4v6.99A10 10 0 0022 12z"
      />
    </svg>
  );
}

export function FollowUsFacebook() {
  return (
    <div className="rounded-xl bg-card border border-border sacred-shadow-sm overflow-hidden">
      <h3 className="font-heading font-semibold text-lg text-foreground border-b border-border px-4 py-3 bg-muted/30 flex items-center gap-2">
        <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
        <span>Follow Us</span>
      </h3>
      <div className="px-2 pt-2 pb-0 overflow-hidden [&>iframe]:block">
        <iframe
          src={IFRAME_SRC}
          width="100%"
          height={IFRAME_HEIGHT}
          style={{
            border: 'none',
            overflow: 'hidden',
            width: '100%',
            height: `${IFRAME_HEIGHT}px`,
          }}
          scrolling="no"
          frameBorder={0}
          allowFullScreen
          allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
          title="Catholicate News on Facebook"
          loading="lazy"
          className="w-full max-w-full"
        />
      </div>
    </div>
  );
}
