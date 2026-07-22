'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  buildBrowserTabKeywords,
  buildBrowserTabTitle,
  shouldApplyPathDerivedTitle,
} from '@/lib/browserTabTitle';

const KEYWORDS_META_ID = 'app-browser-tab-keywords';

/**
 * Keeps document.title (and keywords meta) page-specific for browser tab
 * search / hover. Renders nothing — no UI or layout impact.
 */
export default function BrowserTabTitle() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const desired = buildBrowserTabTitle(pathname);

    const apply = () => {
      if (!shouldApplyPathDerivedTitle(pathname, document.title)) {
        // Still refresh keywords for tab search even when title is already good
      } else if (document.title !== desired) {
        document.title = desired;
      }

      let meta = document.getElementById(KEYWORDS_META_ID) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.id = KEYWORDS_META_ID;
        meta.name = 'keywords';
        document.head.appendChild(meta);
      }
      meta.content = buildBrowserTabKeywords(pathname);
    };

    apply();

    // Next.js may write nested layout titles after hydration; re-assert.
    const timers = [50, 200, 500, 1000].map((ms) => window.setTimeout(apply, ms));

    // If framework overwrites <title> later, put ours back when it no longer matches the path.
    // The `document.title !== desired` guard is load-bearing: assigning document.title mutates
    // <title> and re-fires this observer, so an unconditional set loops forever and freezes the tab.
    const observer = new MutationObserver(() => {
      if (document.title !== desired && shouldApplyPathDerivedTitle(pathname, document.title)) {
        document.title = desired;
      }
    });
    const titleEl = document.querySelector('title');
    if (titleEl) {
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    }
    observer.observe(document.head, { childList: true, subtree: true });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
