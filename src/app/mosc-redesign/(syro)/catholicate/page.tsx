import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import {
  MOSC_REDESIGN_CARD,
  MOSC_REDESIGN_CARD_HOVER,
  MOSC_REDESIGN_CONTAINER,
  MOSC_REDESIGN_PAGE_SECTION,
  MOSC_REDESIGN_PRIMARY_BUTTON,
} from '@/lib/mosc-redesign-design-tokens';

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
    excerpt:
      'His Holiness was born on 19 January 1836 to Murimattom Kurian and Mariamma in Kolencherry. He received deaconship from Cheppad Mar Dionysius in 1843 and in 1852 he was ordained...',
    image: '/images/catholicate/Catholicos-1.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Paulos I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Geevarghese I, The Second Catholicos of the East in Malankara (1925–1928)',
    excerpt:
      "His Holiness was born in 1870 as the second son of Karuchira Paulose. He was ordained as 'Koruya' on 13 June 1885, as deacon in 1892, on 16 August 1896...",
    image: '/images/catholicate/Catholicos-2.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Geevarghese I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)',
    excerpt:
      'His Holiness was born to Ulahannan and Naithi of Kallaserri family in Kurichi, Kottayam on 16 June 1874. On 24 April 1892, Kadavil Paulose Mar Athanasios ordained him as deacon...',
    image: '/images/catholicate/Catholicos-3.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Geevarghese II',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)',
    excerpt:
      'His Holiness was born on 26 June 1884 at Perumbavoor, Vengola, to Abraham Kathanar of Chettakulathukara family. He was ordained as deacon by Kadavil Paulose Mar Athanasios and in...',
    image: '/images/catholicate/Catholicos-4.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Augen I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)',
    excerpt:
      'His Holiness was born on 27th March 1907 as the youngest son of Vattakunnel Kurien Kathanar and Olesha Pulickaparampil Mariamma in Kottayam. He took his B.A, B.D. degrees. Even as...',
    image: '/images/catholicate/Catholicos-5.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Marthoma Mathews I',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)',
    excerpt:
      'His Holiness Moran Mar Baselios Marthoma Mathews II, Catholicos of the East, and 89th successor to the Holy Apostolic Throne of St. Thomas was enthroned on 29 April 1991. He...',
    image: '/images/catholicate/Catholicos-6.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Marthoma Mathews II',
    internal: true,
  },
  {
    title: 'His Holiness Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005–2010)',
    excerpt:
      'His Holiness was consecrated and enthroned at Parumala Seminary as Catholicoi of the East in the Apostolic throne of St. Thomas on 31 October 2005. He is the seventh Catholicos since the...',
    image: '/images/catholicate/Catholicos-7.jpg',
    href: '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara',
    alt: 'His Holiness Baselios Marthoma Didymos I',
    internal: true,
  },
  {
    title: 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)',
    excerpt:
      'His Holiness Baselios Marthoma Paulose II was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Monday, 1st...',
    image: '/images/catholicate/Catholicos-8.jpg',
    href: '/mosc-redesign/catholicate/h-h-baselios-marthoma-paulose-ii',
    alt: 'H.H. Baselios Marthoma Paulose II',
    internal: true,
  },
];

const ReadMoreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CatholicatePage = () => {
  return (
    <div className="bg-parchment font-dm-sans text-warmGray-dark">
      <SyroPageBanner title="The Catholicate" breadcrumbFrom="home" />

      <section className={MOSC_REDESIGN_PAGE_SECTION}>
        <div className={MOSC_REDESIGN_CONTAINER}>
          {/* Intro — design system card (JSON: card shadow, 12px radius, border #C0284A33) */}
          <div className={`${MOSC_REDESIGN_CARD} ${MOSC_REDESIGN_CARD_HOVER} p-6 md:p-10 mb-12 md:mb-16`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-burgundy/25 bg-parchment-deep shadow-sm">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="The Catholicate"
                    fill
                    className="object-contain p-2"
                    sizes="200px"
                  />
                </div>
              </div>
              <div className="lg:col-span-8">
                <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
                  Introduction
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-warmBrown-dark mb-4 leading-tight">
                  The Catholicate of the{' '}
                  <span className="text-burgundy">Malankara Orthodox Syrian Church</span>
                </h2>
                <p className="text-base leading-relaxed text-warmGray-dark mb-6">
                  <strong className="text-warmBrown-dark">Introduction</strong> — The word &apos;Catholicos&apos; means
                  &quot;the general head&quot; or &quot;general bishop&quot;. It can be considered as equivalent to
                  &quot;universal Bishop&quot;. This title and rank is much more ancient than the title Patriarch in the
                  church. In the ministry of the early church there were only three ranks: Episcopos (Bishop), Priest and
                  Deacon. By the end of the third century certain bishops of important cities gained pre-eminence and came
                  to be known as Metropolitans. The same rank in the Churches outside the Roman Empire was called
                  Catholicos. There were three ancient Catholicates: the Catholicate of the East (Persia), the Catholicate
                  of Armenia and the Catholicate of Georgia.
                </p>
                <Link href="/mosc-redesign/catholicate-intro" className={MOSC_REDESIGN_PRIMARY_BUTTON}>
                  <span>Read more</span>
                  <ReadMoreIcon />
                </Link>
              </div>
            </div>
          </div>

          {/* Section heading — /mosc-redesign “Heritage” strip + left accent */}
          <div className="mb-10 md:mb-12">
            <span className="text-burgundy text-xs font-bold tracking-widest uppercase">Succession</span>
            <h3 className="mt-2 text-2xl md:text-3xl font-bold text-warmBrown-dark border-l-4 border-burgundy pl-4">
              Catholicos of the East in Malankara
            </h3>
          </div>

          <div className="catholicate-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            {catholicosCards.map((card) => (
              <article
                key={card.title}
                className="group flex flex-col h-full rounded-xl border border-burgundy/20 bg-parchment-light p-6 shadow-[0_2px_8px_rgba(61,13,13,0.08)] transition-all duration-300 hover:border-burgundy/50 hover:shadow-[0_8px_24px_rgba(192,40,74,0.16)] hover:-translate-y-1"
              >
                <MoscHubCardMedia
                  src={card.image}
                  alt={card.alt}
                  objectPosition="top"
                  unoptimized
                  padded={false}
                  outerClassName="-mx-1"
                  frameClassName="bg-parchment-light ring-0"
                />
                <h3 className="text-lg font-semibold mb-3 leading-snug transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-warmGray-dark flex-1 mb-5 leading-relaxed">{card.excerpt}</p>
                {card.internal ? (
                  <Link href={card.href} className={`${MOSC_REDESIGN_PRIMARY_BUTTON} mt-auto w-fit`}>
                    <span>Read more</span>
                    <ReadMoreIcon />
                  </Link>
                ) : (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${MOSC_REDESIGN_PRIMARY_BUTTON} mt-auto w-fit`}
                  >
                    <span>Read more</span>
                    <ReadMoreIcon />
                  </a>
                )}
              </article>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default CatholicatePage;
