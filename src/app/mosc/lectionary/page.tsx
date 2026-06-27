import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata: Metadata = {
  title: 'Lectionary | Malankara Orthodox Syrian Church',
  description: 'The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions.',
  keywords: ['Lectionary', 'Scripture Readings', 'Liturgical Calendar', 'Orthodox Liturgy', 'Bible Readings'],
};

export default function LectionaryPage() {
  const lectionaryPeriods = [
    {
      id: 'koodosh-eetho-to-kothne',
      title: 'Koodosh Eetho to Kothne',
      description: 'Koodhosh Eetho (Sanctification) Sunday - The Sunday that comes on or after October 30th is called Koodhosh Eetho (Sanctification of Church) Sunday. It is the beginning of the church calendar. Evening...',
      image: '/images/lectionary/lent2.jpg',
      link: '/mosc/lectionary/koodosh-eetho-to-kothne',
    },
    {
      id: 'great-lent',
      title: 'Great Lent',
      description: 'First Monday of Great Lent Morning Genesis 1: 1 - 12, Great Wisdom 7: 7 -24, Isaiah 29: 15-24, St. James 1: 2-12, Romans 1:18-25, St. Matthew 4: 1-11, Shub-khono I John 4: 11-20, I...',
      image: '/images/lectionary/lent.jpg',
      link: '/mosc/lectionary/great-lent',
    },
    {
      id: 'kyomtho-easter-to-koodosh-edtho',
      title: 'Kyomtho (Easter) to Koodosh Edtho',
      description: 'Easter Sunday Evening St. Mark 16: 1- 8, Midnight St. Luke 24: 1-12, Morning St. John 20: 1-18, Celebration of the Holy Cross Isaiah 60: 17-22, I Peter 5: 5-14, Romans 16: 1-16, St. John 14:...',
      image: '/images/lectionary/lent1.jpg',
      link: '/mosc/lectionary/kyomtho-easter-to-koodosh-edtho',
    },
    {
      id: 'special-occasions',
      title: 'Special Occasions',
      description: 'Memory of St. Mary for Special Feasts - Evening St. Luke 8: 16 - 21, Morning St. Mark 3: 31 -35, Before Holy Qurbana Judges 13: 2-1, Zechariah 2: 10 - 13, 4: 1-...',
      image: '/images/lectionary/sp.jpg',
      link: '/mosc/lectionary/special-occasions',
    },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Lectionary"
        breadcrumbFrom="home"
        description="The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (matches administration .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Lectionary Periods
          </h3>

          {/* Cards grid (matches administration .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {lectionaryPeriods.map((period) => (
              <div
                key={period.id}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="mb-5 flex justify-center pt-8">
                  <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src={period.image}
                      alt={period.title}
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 280px"
                    />
                  </div>
                </div>
                <div className="p-8 pt-0 flex flex-col flex-1">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {period.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                    {period.description}
                  </p>
                  <Link
                    href={period.link}
                    className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}


