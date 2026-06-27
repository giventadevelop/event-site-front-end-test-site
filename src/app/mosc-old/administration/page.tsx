import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'Administration',
  description:
    'Learn about the administrative structure and governance of the Malankara Orthodox Syrian Church — Constitution, Canon Law, Holy Episcopal Synod, Malankara Association, and more.',
};
// test
const administrationSections = [
  {
    title: 'The Constitution of the Malankara Orthodox Church',
    description:
      'The church had no written constitution until 1934, but was governed by consensus, traditions and precedence. It was the vision of Mor Dionysius, Vattasseril to have a clearly defined uniform constitution for the church.',
    href: '/mosc-old/administration/administration',
    image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
  },
  {
    title: 'The Canon Law of the Malankara Orthodox Church',
    description:
      'The Canon Law accepted and followed by the Orthodox church of Malankara was collected and codified by Mar Gregorios Bar Hebraeus, Catholicos of Edessa (AD. 1226-1286) in the thirteenth century. It continues to guide the ecclesiastical discipline and governance of the church.',
    href: '/mosc-old/administration/he-canon-law-of-the-malankara-orthodox-church',
    image: '/images/administration/canon-law.jpg',
  },
  {
    title: 'The Holy Episcopal Synod',
    description:
      'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and responsibilities in matters of faith, order, and spiritual governance.',
    href: '/mosc-old/administration/the-holy-episcopal-synod',
    image: '/images/administration/holy-episcopal-synod.jpg',
  },
  {
    title: 'Malankara Association',
    description:
      'It was in the Mulamthuruthy synod summoned by the patriarch Peter III in 1876 that resolved to have an elected body called the Malankara Syria Christian Association to manage and administer the affairs of the church. This body remains the supreme legislative assembly.',
    href: '/mosc-old/administration/malankara-association',
    image: '/images/administration/malankara-association.jpg',
  },
  {
    title: 'The Managing Committee',
    description:
      'In the Mulamthuruthy synod which formulated the Malankara Association, provision was laid down for the Managing Committee — a smaller body to look into the financial and other administrative matters of the church.',
    href: '/mosc-old/administration/the-managing-committee',
    image: '/images/administration/managing-committee.jpg',
  },
  {
    title: 'The Working Committee',
    description:
      'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions.',
    href: '/mosc-old/administration/the-working-committee',
    image: '/images/administration/working-committee.jpg',
  },
  {
    title: 'The Diocesan General Body',
    description:
      'Every diocese will have a Diocesan Assembly. The Diocesan bishop presides over the meetings. All matters related to the Diocese are discussed and decided in the General body assembly, including the election of diocesan office bearers.',
    href: '/mosc-old/administration/the-diocesan-general-body',
    image: '/images/administration/diocesan-general-body.jpg',
  },
  {
    title: 'The Parish Managing Committee',
    description:
      'The members of the Parish Managing Committee, excluding the priests, will be elected by the Parish Assembly and their term of office will be one year. Every Parish Managing Committee functions under the guidance of the parish priest and the diocesan bishop.',
    href: '/mosc-old/administration/the-parish-managing-committee',
    image: '/images/administration/parish-managing-committee.jpg',
  },
  {
    title: 'The Parish General Body',
    description:
      'Every parish is within the framework of the church constitution. It is neither outside the umbrella of the constitution nor an independent entity. Each Parish has a general body comprising all members of the parish.',
    href: '/mosc-old/administration/the-parish-general-body',
    image: '/images/administration/parish-general-body.jpg',
  },
];

const AdministrationPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted min-h-[280px] flex items-center py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 sacred-shadow-lg border border-border/50">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Administration
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The administrative structure of the Malankara Orthodox Syrian Church — from the
              Constitution and Canon Law to the Holy Episcopal Synod, Malankara Association, and
              parish-level bodies.
            </p>
          </div>
        </div>
      </section>

      {/* Administration Sections - 3 cards per row (holy synod style) */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Governance &amp; Administrative Structure
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Our church is governed by a clear hierarchy of bodies, from the Holy Episcopal Synod
              to the parish general body, each with defined roles and responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {administrationSections.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="bg-card rounded-lg sacred-shadow p-0 overflow-hidden hover:sacred-shadow-lg reverent-transition group flex flex-col"
              >
                {/* Image area - same as catholicate: full width h-48, centered and fully visible */}
                <div className="relative w-full h-48 bg-muted overflow-hidden flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={index === 0 ? 'object-contain object-center group-hover:scale-105 transition-transform duration-300' : 'object-center group-hover:scale-105 transition-transform duration-300'}
                    style={{
                      objectPosition: 'center center',
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
                {/* Content area - same padding and spacing as catholicate */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-4">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary">
                      Read More
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links - same style as holy synod member pages */}
      <QuickLinks />
    </div>
  );
};

export default AdministrationPage;
