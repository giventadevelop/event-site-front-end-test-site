import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import { getHolySynodMembersData } from './getHolySynodMembersData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Holy Synod',
  description:
    'Members of the Holy Synod of the Malankara Orthodox Syrian Church — bishops and the Catholicos as the highest governing body.',
};

const BANNER_DESCRIPTION =
  'The Holy Synod consists of all the bishops of the Malankara Orthodox Syrian Church, serving as the highest governing body under the leadership of the Catholicos.';

const PLACEHOLDER_IMAGE = '/images/holy-synod/Synod-2.jpg';

export default async function HolySynodCmsPage() {
  const { members } = await getHolySynodMembersData();

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Holy Synod"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Members of the Holy Synod
          </h3>

          {members.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              No Holy Synod members are available at this time. Please check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {members.map((member) => {
                const href = `/mosc-redesign/holy-synod-cms/${member.slug}`;
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
                      {member.excerpt && (
                        <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                          {member.excerpt}
                        </p>
                      )}
                      <Link
                        href={href}
                        className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                      >
                        <span>Read More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
