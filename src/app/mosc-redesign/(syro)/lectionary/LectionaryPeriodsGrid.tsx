'use client';

import React, { useMemo, useState } from 'react';
import { MoscCmsHubCard } from '../components/MoscCmsHubCard';

export type LectionaryPeriod = {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
};

export default function LectionaryPeriodsGrid({ periods }: { periods: LectionaryPeriod[] }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return periods;
    return periods.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [periods, query]);

  return (
    <>
      <div className="mb-8" role="search" aria-label="Filter lectionary periods">
        <label htmlFor="lectionary-name-filter" className="sr-only">
          Filter by name
        </label>
        <input
          id="lectionary-name-filter"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name..."
          className="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="font-syro-primary text-syro-dark-gray mb-12">
          No lectionary periods match your filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((period) => (
            <MoscCmsHubCard
              key={period.id}
              href={period.link}
              title={period.title}
              excerpt={period.description}
              imageUrl={period.image}
              imageAlt={period.title}
            />
          ))}
        </div>
      )}
    </>
  );
}
