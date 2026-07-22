import Link from 'next/link';
import { MoscHubCardMedia } from '../../components/MoscHubCardMedia';
import type { HolySynodMember } from '../types';

const PLACEHOLDER_IMAGE = '/images/holy-synod/Synod-2.jpg';
const BASE_PATH = '/mosc-redesign/holy-synod-cms';

/** Presentational Holy Synod card grid (search/pagination owned by parent page). */
export default function HolySynodCmsGrid({ members }: { members: HolySynodMember[] }) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      {members.map((member) => {
        const href = `${BASE_PATH}/${member.slug}`;
        const imageSrc = member.imageUrl ?? PLACEHOLDER_IMAGE;
        return (
          <div
            key={member.documentId || member.slug}
            className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
          >
            <MoscHubCardMedia
              src={imageSrc}
              alt={member.imageAlt ?? member.name}
              objectPosition="top"
              frameClassName="bg-white"
              unoptimized={Boolean(member.imageUrl?.startsWith('http'))}
            />
            <div className="p-8 pt-0 flex flex-col flex-1">
              <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                {member.name}
              </h3>
              {member.excerpt ? (
                <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                  {member.excerpt}
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
