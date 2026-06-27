import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import { ADMINISTRATION_PAGE_CARDS } from '@/components/mosc-redesign/administrationCards';

export const metadata = {
  title: 'Administration',
  description:
    'Administration of the Malankara Orthodox Church — Constitution, Canon Law, Holy Episcopal Synod, Malankara Association, Managing Committee, and parish-level structures.',
};

const adminCards = ADMINISTRATION_PAGE_CARDS;

const AdministrationPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Administration" />

      {/* Content - matches HTML structure and style */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro card (HTML .admin-intro-card) - slight theme tint */}
          <div className="bg-syro-red/5 p-10 rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] mb-16 border-l-4 border-syro-red">
            <p className="font-syro-primary text-xl text-syro-dark-gray leading-relaxed">
              The Malankara Orthodox Syrian Church is administered according to its Constitution, Canon Law, and the structures of the Holy Episcopal Synod, Malankara Association, Managing Committee, Working Committee, and bodies at diocesan and parish levels.
            </p>
          </div>

          {/* Section title - left red bar (HTML .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Constitution & Structure
          </h3>

          {/* Cards grid - no images (HTML .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {adminCards.map((card, index) => (
              <div
                key={card.title}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
              >
                {index === 0 ? (
                  <div className="mb-5 flex justify-center">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="MOSC Logo"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                ) : card.image ? (
                  <MoscHubCardMedia
                    src={card.image}
                    alt={card.imageAlt ?? card.title}
                    objectPosition="top"
                  />
                ) : null}
                <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                  {card.title}
                </h3>
                <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                  {card.excerpt}
                </p>
                <Link
                  href={card.href}
                  className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                >
                  <span>Read More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default AdministrationPage;
