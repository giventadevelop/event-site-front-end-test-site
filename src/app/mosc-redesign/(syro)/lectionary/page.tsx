import React from 'react';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LectionaryPeriodsGrid from './LectionaryPeriodsGrid';

export const metadata: Metadata = {
  title: 'Lectionary | Malankara Orthodox Syrian Church',
  description:
    'The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions.',
  keywords: [
    'Lectionary',
    'Scripture Readings',
    'Liturgical Calendar',
    'Orthodox Liturgy',
    'Bible Readings',
  ],
};

const lectionaryPeriods = [
  {
    id: 'koodosh-eetho-to-kothne',
    title: 'Koodosh Eetho to Kothne',
    description:
      'Koodhosh Eetho (Sanctification) Sunday - The Sunday that comes on or after October 30th is called Koodhosh Eetho (Sanctification of Church) Sunday. It is the beginning of the church calendar. Evening...',
    image: '/images/lectionary/lent2.jpg',
    link: '/mosc-redesign/lectionary/koodosh-eetho-to-kothne',
  },
  {
    id: 'great-lent',
    title: 'Great Lent',
    description:
      'First Monday of Great Lent Morning Genesis 1: 1 - 12, Great Wisdom 7: 7 -24, Isaiah 29: 15-24, St. James 1: 2-12, Romans 1:18-25, St. Matthew 4: 1-11, Shub-khono I John 4: 11-20, I...',
    image: '/images/lectionary/lent.jpg',
    link: '/mosc-redesign/lectionary/great-lent',
  },
  {
    id: 'kyomtho-easter-to-koodosh-edtho',
    title: 'Kyomtho (Easter) to Koodosh Edtho',
    description:
      'Easter Sunday Evening St. Mark 16: 1- 8, Midnight St. Luke 24: 1-12, Morning St. John 20: 1-18, Celebration of the Holy Cross Isaiah 60: 17-22, I Peter 5: 5-14, Romans 16: 1-16, St. John 14:...',
    image: '/images/lectionary/lent1.jpg',
    link: '/mosc-redesign/lectionary/kyomtho-easter-to-koodosh-edtho',
  },
  {
    id: 'special-occasions',
    title: 'Special Occasions',
    description:
      'Memory of St. Mary for Special Feasts - Evening St. Luke 8: 16 - 21, Morning St. Mark 3: 31 -35, Before Holy Qurbana Judges 13: 2-1, Zechariah 2: 10 - 13, 4: 1-...',
    image: '/images/lectionary/sp.jpg',
    link: '/mosc-redesign/lectionary/special-occasions',
  },
];

export default function LectionaryPage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Lectionary"
        breadcrumbFrom="home"
        description="The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Lectionary Periods
          </h3>

          <LectionaryPeriodsGrid periods={lectionaryPeriods} />

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
