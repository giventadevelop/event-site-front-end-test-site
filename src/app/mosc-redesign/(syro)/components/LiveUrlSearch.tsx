'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchInputWithClear from './SearchInputWithClear';

const DEFAULT_INPUT_CLASS =
  'font-body w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2';

export type LiveUrlSearchProps = {
  /** Query param for the search term (default `q`). */
  paramName?: string;
  /**
   * When set, only these params (plus the search param) are kept in the URL.
   * Use for pages that must not carry unrelated filters (e.g. bishops `type`, parishes `diocese`).
   * When omitted, all current params are preserved except those in `resetParams`.
   */
  preserveParams?: string[];
  /** Params removed whenever the search term changes (default `['page']`). */
  resetParams?: string[];
  id?: string;
  label?: string;
  labelVisible?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  clearLabel?: string;
  debounceMs?: number;
  /** Optional id for aria-describedby. */
  describedBy?: string;
};

/**
 * Debounced live search that updates the URL (`?q=`) as the user types —
 * no Enter / Search button required. Resets pagination on each change.
 */
export default function LiveUrlSearch(props: LiveUrlSearchProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-wrap gap-2 items-center w-full">
          <div className={props.wrapperClassName ?? 'flex-1 min-w-[200px]'}>
            <div className="h-10 w-full animate-pulse rounded-lg bg-syro-table-border/40" />
          </div>
        </div>
      }
    >
      <LiveUrlSearchInner {...props} />
    </Suspense>
  );
}

function LiveUrlSearchInner({
  paramName = 'q',
  preserveParams,
  resetParams = ['page'],
  id = 'live-url-search',
  label = 'Search by name',
  labelVisible = false,
  placeholder = 'Search by name...',
  ariaLabel,
  inputClassName = DEFAULT_INPUT_CLASS,
  wrapperClassName = 'flex-1 min-w-[200px]',
  clearLabel = 'Clear search',
  debounceMs = 300,
  describedBy,
}: LiveUrlSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramName) ?? '';
  const [term, setTerm] = useState(urlValue);
  const skipNextPushRef = useRef(true);
  const lastPushedRef = useRef(urlValue.trim());

  // Sync from URL on browser back/forward or external navigation (not while typing ahead of debounce).
  useEffect(() => {
    const trimmedUrl = urlValue.trim();
    if (trimmedUrl === lastPushedRef.current) return;
    setTerm(urlValue);
    lastPushedRef.current = trimmedUrl;
    skipNextPushRef.current = true;
  }, [urlValue]);

  useEffect(() => {
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    const handle = window.setTimeout(() => {
      const trimmed = term.trim();
      if (trimmed === lastPushedRef.current) return;

      const next = new URLSearchParams();
      if (preserveParams) {
        for (const key of preserveParams) {
          const value = searchParams.get(key);
          if (value) next.set(key, value);
        }
      } else {
        searchParams.forEach((value, key) => {
          if (key === paramName || resetParams.includes(key)) return;
          next.set(key, value);
        });
      }

      for (const key of resetParams) {
        next.delete(key);
      }

      if (trimmed) next.set(paramName, trimmed);
      else next.delete(paramName);

      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      lastPushedRef.current = trimmed;
      router.replace(href, { scroll: false });
    }, debounceMs);

    return () => window.clearTimeout(handle);
  }, [
    term,
    debounceMs,
    paramName,
    pathname,
    preserveParams,
    resetParams,
    router,
    searchParams,
  ]);

  const hasSearch = term.trim().length > 0;

  const clearHref = (() => {
    const next = new URLSearchParams();
    if (preserveParams) {
      for (const key of preserveParams) {
        const value = searchParams.get(key);
        if (value) next.set(key, value);
      }
    }
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  })();

  const handleClear = () => {
    setTerm('');
    lastPushedRef.current = '';
    skipNextPushRef.current = true;
    router.replace(clearHref, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center w-full" role="search" aria-label={ariaLabel ?? label}>
      <div className={wrapperClassName}>
        <label htmlFor={id} className={labelVisible ? 'font-body text-sm text-syro-dark-gray block mb-1' : 'sr-only'}>
          {label}
        </label>
        <SearchInputWithClear
          id={id}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onClear={handleClear}
          placeholder={placeholder}
          className={inputClassName}
          wrapperClassName="w-full"
          aria-describedby={describedBy}
        />
      </div>
      {hasSearch ? (
        <Link
          href={clearHref}
          onClick={(e) => {
            e.preventDefault();
            handleClear();
          }}
          className="font-body text-sm text-syro-dark-gray hover:text-syro-red hover:underline"
        >
          {clearLabel}
        </Link>
      ) : null}
    </div>
  );
}
