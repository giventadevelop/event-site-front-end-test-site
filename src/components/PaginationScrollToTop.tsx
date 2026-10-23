'use client';

import { useEffect } from 'react';

function scrollPageToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function paginationControl(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const control = target.closest('button, a');
  if (!(control instanceof HTMLElement)) return null;
  if (control.matches(':disabled') || control.getAttribute('aria-disabled') === 'true') return null;
  const label = `${control.getAttribute('aria-label') || ''} ${control.getAttribute('title') || ''}`.toLowerCase();
  const labeled = label.includes('previous page') || label.includes('next page');
  return labeled ? control : null;
}

/**
 * Previous/Next keep the clicked control in view, so the next page opens at the bottom.
 * Blur the control and scroll to the top after the new page has painted.
 */
export default function PaginationScrollToTop() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const control = paginationControl(event.target);
      if (!control) return;
      control.blur();
      scrollPageToTop();
      requestAnimationFrame(() => {
        scrollPageToTop();
        requestAnimationFrame(scrollPageToTop);
      });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
