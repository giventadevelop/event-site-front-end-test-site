'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchInputWithClear from '../components/SearchInputWithClear';

/** One selectable directory entity. `path` is the list or CMS hub route (all support ?q=). */
interface EntityOption {
  key: string;
  label: string;
  path: string;
}

const ENTITY_OPTIONS: EntityOption[] = [
  { key: 'bishops', label: 'Bishops', path: '/mosc-redesign/holy-synod-cms' },
  { key: 'dioceses', label: 'Dioceses', path: '/mosc-redesign/dioceses-cms' },
  { key: 'parishes', label: 'Parishes', path: '/mosc-redesign/parishes-cms' },
  { key: 'priests', label: 'Priests', path: '/mosc-redesign/priests-cms' },
  { key: 'institutions', label: 'Institutions', path: '/mosc-redesign/institutions-cms' },
  { key: 'church-dignitaries', label: 'Church Dignitaries', path: '/mosc-redesign/church-dignitaries-cms' },
  { key: 'working-committee', label: 'Working Committee', path: '/mosc-redesign/working-committee-cms' },
  { key: 'managing-committee', label: 'Managing Committee', path: '/mosc-redesign/managing-committee-cms' },
  { key: 'spiritual-organisations', label: 'Spiritual Organisations', path: '/mosc-redesign/spiritual-organizations-cms' },
  { key: 'pilgrim-centres', label: 'Pilgrim Centres', path: '/mosc-redesign/pilgrim-centres-cms' },
  { key: 'seminaries', label: 'Seminaries', path: '/mosc-redesign/theological-seminaries-cms' },
];

const DEBOUNCE_MS = 350;

export default function DirectorySearch() {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string>(ENTITY_OPTIONS[0].key);
  const [term, setTerm] = useState<string>('');
  const skipNavigateRef = useRef(true);

  const selected = useMemo(
    () => ENTITY_OPTIONS.find((o) => o.key === selectedKey) ?? ENTITY_OPTIONS[0],
    [selectedKey]
  );

  // Live navigate to the selected category list as the user types.
  useEffect(() => {
    if (skipNavigateRef.current) {
      skipNavigateRef.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      const q = term.trim();
      if (!q) return;
      router.push(`${selected.path}?q=${encodeURIComponent(q)}`);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [term, selected.path, router]);

  // Changing category with an existing term navigates immediately.
  const prevSelectedKeyRef = useRef(selectedKey);
  useEffect(() => {
    if (prevSelectedKeyRef.current === selectedKey) return;
    prevSelectedKeyRef.current = selectedKey;
    const q = term.trim();
    if (!q) return;
    router.push(`${selected.path}?q=${encodeURIComponent(q)}`);
  }, [selectedKey, selected.path, term, router]);

  return (
    <section className="py-10 bg-syro-bg-gray border-b border-syro-table-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg p-6 sm:p-8 border-l-[7px] border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
          <h2 className="font-syro-display text-2xl font-semibold text-syro-blue mb-1">
            Search the Directory
          </h2>
          <p className="font-syro-primary text-base text-syro-dark-gray mb-6">
            Choose what you are looking for, then search by name — results update as you type.
          </p>

          <fieldset>
            <legend className="font-body text-sm font-medium text-syro-dark-gray mb-2">
              1. Choose a category
            </legend>
            <div
              className="flex flex-wrap gap-2 mb-6"
              role="radiogroup"
              aria-label="Directory category"
            >
              {ENTITY_OPTIONS.map((opt) => {
                const isActive = opt.key === selectedKey;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelectedKey(opt.key)}
                    className={`font-body font-medium px-4 py-2 rounded-lg reverent-transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isActive
                        ? 'bg-syro-red text-white border-2 border-syro-red-darker shadow-[0_4px_12px_rgba(220,53,69,0.35)] focus:ring-syro-red'
                        : 'bg-syro-blue/[0.08] text-syro-blue border border-syro-blue/25 hover:bg-syro-red/15 hover:text-syro-red hover:border-syro-red/40 focus:ring-syro-blue/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="directory-global-search"
              className="font-body text-sm font-medium text-syro-dark-gray block mb-2"
            >
              2. Search {selected.label} by name
            </label>
            <div
              className="flex flex-wrap gap-2 items-center"
              role="search"
              aria-label={`Search ${selected.label.toLowerCase()} by name`}
            >
              <div className="relative flex-1 min-w-[220px]">
                <span className="pointer-events-none absolute inset-y-0 left-3 z-[1] flex items-center text-syro-dark-gray">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
                    />
                  </svg>
                </span>
                <SearchInputWithClear
                  id="directory-global-search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onClear={() => setTerm('')}
                  placeholder={`Search ${selected.label.toLowerCase()} by name...`}
                  wrapperClassName="w-full"
                  className="font-body w-full pl-10 py-2.5 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                />
              </div>
              <Link
                href={selected.path}
                className="font-body font-medium px-5 py-2.5 rounded-lg border border-syro-blue/25 bg-syro-blue/[0.08] text-syro-blue hover:bg-syro-red/15 hover:text-syro-red hover:border-syro-red/40 reverent-transition shrink-0 focus:outline-none focus:ring-2 focus:ring-syro-blue/40 focus:ring-offset-2"
              >
                Browse all {selected.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
