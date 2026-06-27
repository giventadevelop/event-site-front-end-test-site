import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CatholicateEmblem from './CatholicateEmblem';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Catholicate',
  description: 'Learn about the Catholicate of the Malankara Orthodox Syrian Church, its history, and the spiritual leadership of our Catholicos.',
};

const CatholicatePage = () => {
  const catholicosHistory = [
    {
      name: 'H.H. Baselios Paulos I',
      period: '1912–1913',
      description: 'The First Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Paulos I, The First Catholicos of the East in Malankara (1912–1913)',
      excerpt: 'His Holiness was born on 19 January 1836 to Murimattom Kurian and Mariamma in Kolencherry. He received deaconship from Cheppad Mar Dionysius in 1843 and in 1852 he was ordained as Priest by Metropolitan Yuyakim Mar Kurilos. He served for a long period as Vicar of Kolencherry Church.',
      href: '/mosc-old/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/Untitled-11.jpg'
    },
    {
      name: 'H.H. Baselios Geevarghese I',
      period: '1925–1928',
      description: 'The Second Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Geevarghese I, The Second Catholicos of the East in Malankara (1925–1928)',
      excerpt: 'His Holiness was born in 1870 as the second son of Karuchira Paulose. He was ordained as \'Koruya\' on 13 June 1885, as deacon in 1892, on 16 August 1896 as priest and on 23 August as Ramban(Monk) by Metropolitan Kadavil Paulose Mar Athanasios.',
      href: '/mosc-old/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/Untitled-12.jpg'
    },
    {
      name: 'H.H. Baselios Geevarghese II',
      period: '1929–1964',
      description: 'The Third Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)',
      excerpt: 'His Holiness was born to Ulahannan and Naithi of Kallaserri family in Kurichi, Kottayam on 16 June 1874. On 24 April 1892, Kadavil Paulose Mar Athanasios ordained him as deacon and on 24 November and 27 November 1898 he was ordained as priest and Ramban (Monk) respectively by St.Gregorios.',
      href: '/mosc-old/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/geevar.jpg'
    },
    {
      name: 'H.H. Baselios Augen I',
      period: '1964–1975',
      description: 'The Fourth Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)',
      excerpt: 'His Holiness was born on 26 June 1884 at Perumbavoor , Vengola, to Abraham Kathanar of Chettakulathukara family. He was ordained as deacon by Kadavil Paulose Mar Athanasios and in 1908 at Jerusalem he was elevated to the monastic order of Ramban.',
      href: '/mosc-old/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/augen.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Mathews I',
      period: '1975–1991',
      description: 'The Fifth Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)',
      excerpt: 'His Holiness was born on 27th, March 1907 as the youngest son of Vattakunnel Kurien Kathanar and Olesha Pulickaparampil Mariamma in Kottayam. He took his B.A, B.D. degrees. Even as a layman he had achieved the unique distinction in studies and also in the Canonical Laws.',
      href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/mathews-i.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Mathews II',
      period: '1991–2005',
      description: 'The Sixth Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)',
      excerpt: 'His Holiness Moran Mar Baselios Marthoma Mathews II, Catholicos of the East, and 89th successor to the Holy Apostolic Throne of St. Thomas was enthroned on 29 April 1991. He was born on January 30, 1915 at Perinad in Kollam District of Kerala.',
      href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/sas.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Didymos I',
      period: '2005-2010',
      description: 'The Seventh Catholicos of the East in Malankara',
      fullTitle: 'His Holiness Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005-2010)',
      excerpt: 'His Holiness was consecrated and enthroned at Parumala Seminary as Catholicoi of the East in the Apostolic throne of St. Thomas on 31 October 2005. He is the seventh Catholicos since the Catholicate of the East was relocated to India and 90th in the lineage of Catholicoi of the East.',
      href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/didymus.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Paulose II',
      period: '2010–2021',
      description: 'The Eighth Catholicos of the East in Malankara',
      fullTitle: 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)',
      excerpt: 'His Holiness Baselios MarthomaPaulose II was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Monday, 1st November 2010. His Holiness is the 91st Primate on the Apostolic Throne of St. Thomas.',
      href: '/mosc-old/catholicate/h-h-baselios-marthoma-paulose-ii',
      image: '/images/catholicate/bava.jpg'
    }
  ];

  return (
    <div className="bg-background">
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-semibold text-4xl md:text-5xl text-foreground text-center mb-12">
            The Catholicate
          </h1>

          {/* Intro - logo on top, description on bottom (no card background) */}
          <article className="mb-10">
            <div className="flex flex-col gap-6 p-6 md:p-8">
              <div className="flex justify-center">
                <CatholicateEmblem />
              </div>
              <div className="min-w-0">
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  <span className="font-semibold text-foreground">Introduction</span> The word &apos;Catholicos&apos; means &quot;the general head&quot; or &quot;general bishop&quot;. It can be considered as equivalent to &quot;universal Bishop&quot;. This title and rank is much more ancient than the title Patriarch in the church.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed mb-5">
                  In the ministry of the early church there were only three ranks namely; Episcopos (Bishop), Priest and Deacon. By the end of the third century or by the beginning of the fourth century certain bishops of certain important cities or provincial capitals in the Roman empire gained pre-eminence than other bishops and they came to be known as Metropolitans. The Ecumenical councils of the fourth century recognized the authority of these Metropolitans.
                </p>
                <Link
                  href="/mosc-old/catholicate/catholicate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg border border-primary/30 reverent-transition group"
                >
                  <span>Read More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </article>

          {/* Catholicos cards grid - 3 per row like saints page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {catholicosHistory.map((catholicos) => (
              <Link
                key={catholicos.name}
                href={catholicos.href}
                className="bg-card rounded-lg sacred-shadow p-0 overflow-hidden hover:sacred-shadow-lg reverent-transition group flex flex-col"
              >
                <div className="relative w-full h-48 bg-muted overflow-hidden flex items-center justify-center">
                  <Image
                    src={catholicos.image}
                    alt={catholicos.name}
                    fill
                    className="object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {catholicos.fullTitle}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-4">
                    {catholicos.excerpt}
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

          {/* Quick Links - Horizontal Below Main Content (same as holy-synod) */}
          <div className="mt-8">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatholicatePage;





