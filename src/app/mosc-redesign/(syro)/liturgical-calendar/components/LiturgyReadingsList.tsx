'use client';

import type { LiturgyReading } from '@/lib/strapi/liturgyDays';

export function LiturgyReadingsList({
  readings,
  compact = false,
}: {
  readings: LiturgyReading[];
  compact?: boolean;
}) {
  const filtered = readings.filter(
    (r) => r.liturgy_heading || r.content_place
  );

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-[#798daf] italic font-syro-primary">
        No readings listed for this day.
      </p>
    );
  }

  return (
    <ul className={compact ? 'space-y-2' : 'space-y-4'}>
      {filtered.map((reading, idx) => (
        <li
          key={idx}
          className={`border-l-4 border-syro-red ${compact ? 'pl-3 py-1' : 'pl-4 py-2 bg-gray-50 rounded-r-lg'}`}
        >
          {reading.liturgy_heading && (
            <p className={`font-semibold text-syro-blue font-syro-display ${compact ? 'text-xs' : 'text-sm'}`}>
              {reading.liturgy_heading}
            </p>
          )}
          {reading.content_place && (
            <p className={`text-[#798daf] font-syro-primary mt-0.5 ${compact ? 'text-[10px]' : 'text-sm'}`}>
              {reading.content_place}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
