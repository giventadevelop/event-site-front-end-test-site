import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Administration',
  description:
    'Administration of the Malankara Orthodox Church — Constitution, Canon Law, Holy Episcopal Synod, Malankara Association, Managing Committee, and parish-level structures.',
};

const adminCards = [
  {
    title: 'The Constitution of the Malankara Orthodox Church',
    excerpt:
      'The church had no written constitution until 1934, but was governed by consensus, traditions and precedence. It was the vision of Mor Dionysius, Vattasseril to have a clearly defined uniform...',
    href: '/mosc/administration/administration',
  },
  {
    title: 'The Canon Law of the Malankara Orthodox Church',
    excerpt:
      'The Canon Law accepted and followed by the Orthodox church of Malankara was collected and codified by Mar Gregorios Bar Hebraeus, Catholicos of Edessa (AD. 1226-1286) in the thirteenth century....',
    href: '/mosc/administration/he-canon-law-of-the-malankara-orthodox-church',
  },
  {
    title: 'The Holy Episcopal Synod',
    excerpt:
      'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and...',
    href: '/mosc/administration/the-holy-episcopal-synod',
  },
  {
    title: 'Malankara Association',
    excerpt:
      'It was in the Mulamthuruthy synod summoned by the patriarch peter III in 1876 that resolved to have an elected body called the Malankara Syria Christian Association to manage and...',
    href: '/mosc/administration/malankara-association',
  },
  {
    title: 'The Managing Committee',
    excerpt:
      'In the Mulamthuruthy synod which formulated the Malankara association had laid down the provision for the managing committee, a smaller body to look into the financial and other administrative matters....',
    href: '/mosc/administration/the-managing-committee',
  },
  {
    title: 'The Working Committee',
    excerpt:
      'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions....',
    href: '/mosc/administration/the-working-committee',
  },
  {
    title: 'The Diocesan General Body',
    excerpt:
      'Every diocese will have a Diocesan Assembly. The Diocesan bishop presides over the meetings. All matters related to the Diocese is discussed and decided in the General body assembly including...',
    href: '/mosc/administration/the-diocesan-general-body',
  },
  {
    title: 'The Parish Managing Committee',
    excerpt:
      'The members of the Parish Managing Committee excluding the priests will be elected by the Parish Assembly and their term of office will be one year. Every Parish Managing Committee...',
    href: '/mosc/administration/the-parish-managing-committee',
  },
  {
    title: 'The Parish General Body',
    excerpt:
      'Every parish is within the frame work of the church constitution. It is neither outside the umbrella of the constitution nor an independent entity. Each Parish has a general body....',
    href: '/mosc/administration/the-parish-general-body',
  },
];

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
                {index === 0 && (
                  <div className="mb-5 flex justify-center">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="MOSC Logo"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                )}
                {index === 1 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/canon-law.jpg"
                        alt="The Canon Law of the Malankara Orthodox Church"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 2 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/holy-episcopal-synod.jpg"
                        alt="The Holy Episcopal Synod"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 3 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/malankara-association.jpg"
                        alt="Malankara Association"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 4 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/managing-committee.jpg"
                        alt="The Managing Committee"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 5 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/working-committee.jpg"
                        alt="The Working Committee"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 6 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/diocesan-general-body.jpg"
                        alt="The Diocesan General Body"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 7 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/parish-managing-committee.jpg"
                        alt="The Parish Managing Committee"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {index === 8 && (
                  <div className="mb-5 flex justify-center pt-8">
                    <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src="/images/administration/parish-general-body.jpg"
                        alt="The Parish General Body"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
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
