import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getDirectoryHomeData } from './getDirectoryHomeData';
import type { DirectorySectionCard } from './types';
import QuickLinks from '../components/QuickLinks';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import SyroPageBanner from '../components/SyroPageBanner';
import DirectorySearch from './DirectorySearch';

export const metadata: Metadata = {
  title: 'Directory | Malankara Orthodox Syrian Church',
  description: 'Malankara Orthodox Directory — Holy Synod, Dioceses, Parishes, Priests, Institutions, Church Dignitaries, Working Committee, Managing Committee, Spiritual Organisations, Pilgrim Centres, Seminaries.',
  keywords: ['MOSC Directory', 'Malankara Orthodox Directory', 'Parishes', 'Priests', 'Dioceses', 'Church Directory'],
};

/** Static fallback sections when Strapi returns no section cards */
type DirectorySection = {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
};

const FALLBACK_SECTIONS: DirectorySection[] = [
  { title: 'The Holy Synod of Bishops', description: 'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and privileges in the matter of upholding the faith of the church, its discipline and order of Apostolic Succession. As regards temporal matters the church is guided by the Malankara Syrian Christian Association.', href: '/mosc-redesign/directory/bishops' },
  { title: 'Dioceses', description: 'The Diocese is the basic church body which comprises all the parishes of a determined geographical area. It is governed by the Diocesan Bishop with the assistance of Diocesan Council.', href: '/mosc-redesign/directory/dioceses' },
  { title: 'Parishes', description: 'The parish is a local community of the Church having at its head a duly appointed priest and consisting of Orthodox Christians who live in accordance with the teachings of the Orthodox Church, comply with the discipline and rules of the Church, and regularly support their parish. Being subordinate to the Diocesan Authority, it is a component part of the Diocese.', href: '/mosc-redesign/directory/parishes' },
  { title: 'Priests', description: 'At the head of the parish is its Vicar. According to the teachings of the Church, he is the spiritual father and teacher of his flock and the celebrant of the liturgical worship established by the Church. He teaches and edifies the People of God entrusted to his spiritual care.', href: '/mosc-redesign/directory/priests' },
  { title: 'Institutions', description: 'The institutions of the Malankara Orthodox Church consists of different organizations such as hospitals, schools, monasteries, orphanages, convents, medical colleges etc. Some of these Institutions are directly administered by the church and some others have its own leadership team.', href: '/mosc-redesign/directory/institutions' },
  { title: 'Church Dignitaries', description: 'The Church dignitaries consists of the Priest trustee, Lay trustee and the Association Secretary. The Priest trustee and Lay trustee are elected in the Malankara Association. The Association Secretary is elected in the Managing Committee. The tenure of the office is five years.', href: '/mosc-redesign/directory/church-dignitaries' },
  { title: 'Working Committee', description: 'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions. The same body is also known as the Advisory Council.', href: '/mosc-redesign/directory/working-committee' },
  { title: 'The Managing Committee', description: 'The members of the Managing Committee are elected by the association, two priests and four lay people representing each Diocese are elected for a period of five years. Other than the elected members, a proportionate number of members are nominated to the Managing Committee by the Malankara Metropolitan.', href: '/mosc-redesign/directory/managing-committee' },
  { title: 'Spiritual Organisations', description: 'Spiritual organisations include all types of organizations of the Church that offer spiritual guidance to the faithful. They also include religious or spiritual study groups and other organizations that teach or offer spiritual direction and advice to the members of the Church.', href: '/mosc-redesign/directory/spiritual-organisations' },
  { title: 'Pilgrim Centres', description: `The major Pilgrim centres of Malankara Orthodox Church include historical churches such as Niranam St. Mary's Valiya Pally, Thiruvathamcode Arapally, which are instituted by the Apostle St. Thomas.`, href: '/mosc-redesign/directory/pilgrim-centres' },
  { title: 'Seminaries', description: 'There are mainly two seminaries under Malankara Orthodox Church.', href: '/mosc-redesign/directory/seminaries' },
];

/** Static images for directory section cards, in same order as FALLBACK_SECTIONS (and displayCards). */
const DIRECTORY_CARD_IMAGES: string[] = [
  '/images/directory/bishop.jpg',
  '/images/directory/diocese.jpg',
  '/images/directory/parish.jpg',
  '/images/directory/priest.jpg',
  '/images/directory/institution.jpg',
  '/images/directory/institution.jpg',
  '/images/directory/institution.jpg',
  '/images/directory/managing_commitee.jpg',
  '/images/directory/institution.jpg',
  '/images/directory/pilgrim_centers.jpg',
  '/images/directory/seminaries.jpg',
];

/** One card to render: either from API or from fallback (no image) */
type DisplayCard = {
  title: string;
  description: string | null;
  linkUrl: string | null;
  isExternal: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
};

function toDisplayCard(card: DirectorySectionCard): DisplayCard {
  return {
    title: card.title,
    description: card.description,
    linkUrl: card.linkUrl,
    isExternal: (card.linkUrl?.startsWith('http') ?? false),
    imageUrl: card.imageUrl,
    imageAlt: card.imageAlt,
  };
}

function fallbackToDisplayCard(section: DirectorySection): DisplayCard {
  return {
    title: section.title,
    description: section.description,
    linkUrl: section.href ?? null,
    isExternal: section.external ?? (section.href?.startsWith('http') ?? false),
    imageUrl: null,
    imageAlt: null,
  };
}

/** Heroicons outline 24x24 - icon key to SVG path(s). */
const DIRECTORY_ICONS: Record<string, { path: string; viewBox?: string }> = {
  bishops: {
    path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  dioceses: {
    path: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  parishes: {
    path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  priests: {
    path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  institutions: {
    path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  dignitaries: {
    path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  committee: {
    path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2H7a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  spiritual: {
    path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  pilgrim: {
    path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  },
  seminaries: {
    path: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  },
  default: {
    path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
};

function getIconKey(title: string): keyof typeof DIRECTORY_ICONS {
  const t = title.toLowerCase();
  if (t.includes('holy synod') || t.includes('bishops')) return 'bishops';
  if (t.includes('diocese')) return 'dioceses';
  if (t.includes('parish')) return 'parishes';
  if (t.includes('priest')) return 'priests';
  if (t.includes('institution')) return 'institutions';
  if (t.includes('dignitar')) return 'dignitaries';
  if (t.includes('working committee')) return 'committee';
  if (t.includes('managing committee')) return 'committee';
  if (t.includes('spiritual')) return 'spiritual';
  if (t.includes('pilgrim')) return 'pilgrim';
  if (t.includes('seminar')) return 'seminaries';
  return 'default';
}

function DirectoryCardIcon({ title }: { title: string }) {
  const key = getIconKey(title);
  const { path } = DIRECTORY_ICONS[key] ?? DIRECTORY_ICONS.default;
  return (
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-syro-red/10 flex items-center justify-center mb-4 self-center" aria-hidden>
      <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </div>
  );
}

export default async function DirectoryPage() {
  const data = await getDirectoryHomeData();
  const displayCards: DisplayCard[] =
    data.sectionCards.length > 0
      ? data.sectionCards.map(toDisplayCard)
      : FALLBACK_SECTIONS.map(fallbackToDisplayCard);

  const leadText =
    data.introText?.trim() ??
    'The comprehensive directory of the Malankara Orthodox Syrian Church — bishops, dioceses, parishes, priests, institutions, and church administration.';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Directory"
        breadcrumbFrom="home"
        description={leadText}
      />

      {/* Quick entity selector + global name search (routes to the chosen entity's list page) */}
      <DirectorySearch />

      {/* Content - same layout and design as /mosc/administration */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (same as administration) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Directory Sections
          </h3>

          {/* Cards grid - same styling as administration cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayCards.map((card, index) => {
              const imageUrl = card.imageUrl ?? DIRECTORY_CARD_IMAGES[index] ?? null;
              return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full overflow-hidden"
              >
                {imageUrl ? (
                  <MoscHubCardMedia
                    src={imageUrl}
                    alt={card.imageAlt ?? card.title}
                    frame="landscape"
                  />
                ) : (
                  <DirectoryCardIcon title={card.title} />
                )}
                <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                    {card.description}
                  </p>
                )}
                {card.linkUrl ? (
                  card.isExternal ? (
                    <a
                      href={card.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                    >
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={card.linkUrl}
                      className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                    >
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  )
                ) : null}
              </div>
            );
            })}
          </div>

          <QuickLinks />
        </div>
      </section>

      {/* Update directory info / Login */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-syro-dark-gray mb-4">
            Need to update your Directory information?
          </p>
          <a
            href="mailto:webmanager@mosc.in"
            className="font-body text-syro-blue font-medium hover:underline"
          >
            Email webmanager@mosc.in
          </a>
          <p className="font-body text-sm text-syro-dark-gray mt-6">
            Login only for admin
          </p>
        </div>
      </section>

      {/* Official links - mosc.in & catholicatenews.in */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href="https://mosc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 border-l-[7px] border-syro-red"
            >
              <span className="font-heading font-semibold text-lg text-syro-blue block">
                mosc.in
              </span>
              <span className="font-body text-sm text-syro-dark-gray block mt-1">
                The Malankara Orthodox Syrian Church
              </span>
            </a>
            <a
              href="https://catholicatenews.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 border-l-[7px] border-syro-red"
            >
              <span className="font-heading font-semibold text-lg text-syro-blue block">
                catholicatenews.in
              </span>
              <span className="font-body text-sm text-syro-dark-gray block mt-1">
                The official news portal of the Indian Orthodox Church
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Address Info - from directory.mosc.in */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-2xl text-black mb-6 text-center">
            Address Info
          </h2>
          <div className="bg-white rounded-lg p-8 border-l-[7px] border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
            <p className="font-body font-medium mb-2 text-black">
              Malankara Orthodox Church
            </p>
            <p className="font-body text-syro-dark-gray">
              Catholicate Palace,<br />
              Devalokam,<br />
              Kottayam - 686 004
            </p>
            <p className="font-body text-syro-dark-gray mt-4">
              <span className="font-medium text-syro-blue">Phone:</span> 0481 2578500, 0481 2578499
            </p>
          </div>
        </div>
      </section>

      {/* Related internal links */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-black mb-8 text-center">
            Related Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/mosc-redesign/dioceses"
              className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 text-center group border-l-[7px] border-syro-red"
            >
              <h3 className="font-heading font-medium text-lg text-syro-blue mb-2 group-hover:text-syro-red transition-colors">
                Dioceses
              </h3>
              <p className="font-body text-sm text-syro-dark-gray">
                View all dioceses and their information
              </p>
            </Link>
            <Link
              href="/mosc-redesign/institutions"
              className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 text-center group border-l-[7px] border-syro-red"
            >
              <h3 className="font-heading font-medium text-lg text-syro-blue mb-2 group-hover:text-syro-red transition-colors">
                Institutions
              </h3>
              <p className="font-body text-sm text-syro-dark-gray">
                Schools, hospitals, monasteries, and more
              </p>
            </Link>
            <Link
              href="/mosc-redesign/spiritual-organizations-cms"
              className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 text-center group border-l-[7px] border-syro-red"
            >
              <h3 className="font-heading font-medium text-lg text-syro-blue mb-2 group-hover:text-syro-red transition-colors">
                Spiritual Organisations
              </h3>
              <p className="font-body text-sm text-syro-dark-gray">
                Organisations offering spiritual guidance
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
