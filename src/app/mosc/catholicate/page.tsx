import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'The Catholicate',
  description: 'The Catholicate of the Malankara Orthodox Syrian Church — history, spiritual leadership, and the succession of Catholicoi of the East in Malankara.',
};

interface CatholicosCard {
  title: string;
  excerpt: string;
  image: string;
  href: string;
  alt: string;
  internal?: boolean;
}

const catholicosCards: CatholicosCard[] = [
  {
    title: 'His Holiness Baselios Paulos I, The First Catholicos of the East in Malankara (1912–1913)',
    excerpt: 'His Holiness was born on 19 January 1836 to Murimattom Kurian and Mariamma in Kolencherry. He received deaconship from Cheppad Mar Dionysius in 1843 and in 1852 he was ordained...',
    image: '/images/catholicate/Catholicos-1.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Paulos I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Geevarghese I, The Second Catholicos of the East in Malankara (1925–1928)',
    excerpt: 'His Holiness was born in 1870 as the second son of Karuchira Paulose. He was ordained as \'Koruya\' on 13 June 1885, as deacon in 1892, on 16 August 1896...',
    image: '/images/catholicate/Catholicos-2.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Geevarghese I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)',
    excerpt: 'His Holiness was born to Ulahannan and Naithi of Kallaserri family in Kurichi, Kottayam on 16 June 1874. On 24 April 1892, Kadavil Paulose Mar Athanasios ordained him as deacon...',
    image: '/images/catholicate/Catholicos-3.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Geevarghese II',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)',
    excerpt: 'His Holiness was born on 26 June 1884 at Perumbavoor, Vengola, to Abraham Kathanar of Chettakulathukara family. He was ordained as deacon by Kadavil Paulose Mar Athanasios and in...',
    image: '/images/catholicate/Catholicos-4.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Augen I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)',
    excerpt: 'His Holiness was born on 27th March 1907 as the youngest son of Vattakunnel Kurien Kathanar and Olesha Pulickaparampil Mariamma in Kottayam. He took his B.A, B.D. degrees. Even as...',
    image: '/images/catholicate/Catholicos-5.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Marthoma Mathews I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)',
    excerpt: 'His Holiness Moran Mar Baselios Marthoma Mathews II, Catholicos of the East, and 89th successor to the Holy Apostolic Throne of St. Thomas was enthroned on 29 April 1991. He...',
    image: '/images/catholicate/Catholicos-6.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Marthoma Mathews II',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005–2010)',
    excerpt: 'His Holiness was consecrated and enthroned at Parumala Seminary as Catholicoi of the East in the Apostolic throne of St. Thomas on 31 October 2005. He is the seventh Catholicos since the...',
    image: '/images/catholicate/Catholicos-7.jpg',
    href: '/mosc/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Marthoma Didymos I',
    internal: true,
  },
  {
    title: 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)',
    excerpt: 'His Holiness Baselios Marthoma Paulose II was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Monday, 1st...',
    image: '/images/catholicate/Catholicos-8.jpg',
    href: '/mosc/catholicate/h-h-baselios-marthoma-paulose-ii',
    alt: 'H.H. Baselios Marthoma Paulose II',
    internal: true,
  },
];

const CatholicatePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Catholicate" />

      {/* Content - same layout and design as /mosc/administration */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro card - same structure as administration: single white card (image + text kept) */}
          <div className="bg-white p-10 rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="The Catholicate"
                    fill
                    className="object-contain"
                    sizes="200px"
                  />
                </div>
              </div>
              <div className="lg:col-span-8">
                <h2 className="font-syro-display text-[2.2rem] font-bold text-black mb-5">
                  The Catholicate of the Malankara Orthodox Syrian Church
                </h2>
                <p className="font-syro-primary text-xl text-syro-dark-gray leading-relaxed mb-5">
                  <strong>Introduction</strong> — The word &apos;Catholicos&apos; means &quot;the general head&quot; or &quot;general bishop&quot;. It can be considered as equivalent to &quot;universal Bishop&quot;. This title and rank is much more ancient than the title Patriarch in the church. In the ministry of the early church there were only three ranks: Episcopos (Bishop), Priest and Deacon. By the end of the third century certain bishops of important cities gained pre-eminence and came to be known as Metropolitans. The same rank in the Churches outside the Roman Empire was called Catholicos. There were three ancient Catholicates: the Catholicate of the East (Persia), the Catholicate of Armenia and the Catholicate of Georgia.
                </p>
                <Link
                  href="/mosc/catholicate-intro"
                  className="syro-primary-button inline-flex items-center gap-2"
                >
                  <span>Read More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Section title - left red bar (same as administration) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Catholicos of the East in Malankara
          </h3>

          {/* Cards grid - same styling as administration cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {catholicosCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full overflow-hidden"
              >
                <div className="mb-5 flex justify-center pt-8">
                  <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-contain rounded-lg"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 280px"
                    />
                  </div>
                </div>
                <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                  {card.title}
                </h3>
                <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                  {card.excerpt}
                </p>
                {card.internal ? (
                  <Link
                    href={card.href}
                    className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                ) : (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default CatholicatePage;
