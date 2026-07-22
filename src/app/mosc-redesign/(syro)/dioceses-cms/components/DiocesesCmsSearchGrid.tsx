import Link from 'next/link';
import Image from 'next/image';
import type { Diocese } from '../../directory/dioceses/types';

const DETAIL_BASE = '/mosc-redesign/directory/dioceses';

function cardExcerpt(description: string | null): string {
  if (!description?.trim()) return '';
  const first = description.split(/\n\n/)[0]?.trim() ?? description.trim();
  return first.length > 280 ? `${first.slice(0, 277)}...` : first;
}

/** Presentational diocese card grid (search/pagination owned by parent page). */
export default function DiocesesCmsSearchGrid({ dioceses }: { dioceses: Diocese[] }) {
  if (dioceses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      {dioceses.map((card) => {
        const excerpt = cardExcerpt(card.description);
        const href = `${DETAIL_BASE}/${card.documentId}`;
        return (
          <div
            key={card.documentId}
            className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
          >
            <div className="relative w-full h-48 shrink-0">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.imageAlt ?? card.name}
                  fill
                  className="object-contain object-center"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  unoptimized={card.imageUrl.startsWith('http')}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-burgundy/80">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-burgundy/10 ring-1 ring-burgundy/30">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 10v6m-3-3h6"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                {card.name}
              </h3>
              {excerpt ? (
                <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-4">
                  {excerpt}
                </p>
              ) : (
                <div className="flex-1 mb-5" />
              )}
              <Link
                href={href}
                className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
              >
                <span>Read More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
