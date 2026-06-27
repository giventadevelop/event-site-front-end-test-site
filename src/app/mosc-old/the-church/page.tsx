import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Church',
  description:
    'The Malankara Orthodox Syrian Church — Catholicate of the East. Explore our faith, creed, theology, spirituality, Syrian heritage, history, the Holy Myron, and liturgy.',
};

const churchSections = [
  {
    title: 'The Malankara Orthodox Syrian Church',
    description:
      'Catholicate of the East. The Malankara Orthodox Syrian Church was founded by St. Thomas, one of the twelve apostles of Jesus Christ, who came to India in A.D. 52. At the heart of our faith is the apostolic tradition and the Catholicate of the East.',
    href: '/mosc-old/the-church/the-malankara-orthodox-syrian-church',
    image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
  },
  {
    title: 'The Throne of St. Thomas',
    description:
      "The concept of the 'Throne of St. Thomas' is based on the words of our Lord Himself. In St. Matthew 19:28 it is written that 'Jesus said to them: Amen, I say to you that you who have followed me, in the regeneration when the Son of man shall sit on the seat of his majesty, you also shall sit on twelve thrones judging the twelve tribes of Israel.'",
    href: '/mosc-old/the-church/the-throne-of-st-thomas',
    image: '/images/church/throne_of_st_thomas.jpg',
  },
  {
    title: 'What do we believe?',
    description:
      'What do the Orthodox Believe? It is more to ask: "in whom do we put our trust?" "Believe" is a very vague word. Often it means simply holding an opinion. For the Orthodox, faith is a personal relationship with the living God—Father, Son, and Holy Spirit.',
    href: '/mosc-old/the-church/what-do-we-believe',
    image: '/images/church/what-do-we-believe.jpg',
  },
  {
    title: 'The Creed',
    description:
      'The Ecumenical Council of Nicea and Nicene Creed. The Oriental Orthodox Churches recognize only three ecumenical councils, and the Council of Nicea is the first among them. The Nicene Council, held in A.D. 325, gave us the Creed that confesses the faith of the one, holy, catholic, and apostolic Church.',
    href: '/mosc-old/the-church/the-creed',
    image: '/images/church/creed.jpg',
  },
  {
    title: 'Theology',
    description:
      'The main Doctrines of the Church. The Malankara Orthodox Church has pillars of Mystery through which it teaches and demonstrates its basic religious belief. They are called pillars due to their foundational role in Orthodox theology and spiritual life.',
    href: '/mosc-old/the-church/theology',
    image: '/images/church/theology.jpg',
  },
  {
    title: 'Spirituality',
    description:
      'Introduction. Spirituality may be defined as the life in and with the Holy Spirit. It is an ascetic and pious struggle against sin through repentance, prayer, fasting, and participation in the sacraments—the means by which we grow in the likeness of God.',
    href: '/mosc-old/the-church/spirituality',
    image: '/images/church/spirituality.jpg',
  },
  {
    title: 'Syrian Heritage',
    description:
      'Syrian Heritage of the St. Thomas Christians. Syriac is the liturgical language of the St. Thomas Christians from a very early date, even though their identity and culture remained always Indian. This heritage connects us to the ancient Christian East.',
    href: '/mosc-old/the-church/syrian-heritage',
    image: '/images/church/syrian_heritage.jpg',
  },
  {
    title: 'Oriental and Eastern Orthodox churches',
    description:
      'How Different is The Eastern Orthodox Church? Several people have asked this question in several different forms: Who are these Orthodox—Protestants or Roman Catholics? What do they believe differently? We belong to the Oriental Orthodox family of churches.',
    href: '/mosc-old/the-church/oriental-and-eastern-orthodox-churches',
    image: '/images/church/oriental.jpg',
  },
  {
    title: 'History',
    description:
      'THE ORTHODOX CHURCH OF INDIA. The Malankara Orthodox Church—hereafter referred to as the Orthodox Church of India or the Indian Orthodox Church—is the second largest faction of the St. Thomas Christians, tracing its origins to the apostolic mission of St. Thomas in A.D. 52.',
    href: '/mosc-old/the-church/church-history',
    image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
  },
  {
    title: 'The Holy Myron',
    description:
      'By the divine power, we have spoken at length on the mysteries of the cross. We next write about the divine and life-giving mystery of the Holy Myron—the consecrated oil used in the sacrament of Chrismation, sealing the faithful with the gift of the Holy Spirit.',
    href: '/mosc-old/the-church/the-holy-myron',
    image: '/images/church/sacraments.jpg',
  },
  {
    title: 'Liturgy',
    description:
      '"We have seen the true Light, we have received the heavenly Spirit; we have found the true Faith, worshiping the undivided Trinity: for He has saved us." The Liturgy of St. John Chrysostom and other ancient liturgies form the heart of our worship.',
    href: '/mosc-old/the-church/liturgy-worship',
    image: '/images/church/liturgy-worship.jpg',
  },
];

const TheChurchPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section - MOSC styling */}
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
              The Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Malankara Orthodox Syrian Church — Catholicate of the East. Founded by St. Thomas
              the Apostle in A.D. 52, we preserve the Orthodox faith, creed, theology, spirituality,
              and liturgical tradition of the one, holy, catholic, and apostolic Church.
            </p>
          </div>
        </div>
      </section>

      {/* Main content - 11 sections in card grid (same pattern as administration) */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              The Malankara Orthodox Syrian Church
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore our faith, heritage, and tradition—from the Throne of St. Thomas to the Creed,
              theology, spirituality, Syrian heritage, history, the Holy Myron, and liturgy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {churchSections.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="bg-background rounded-lg sacred-shadow p-4 hover:sacred-shadow-lg reverent-transition group flex flex-col h-full"
              >
                {/* Image container - centered, contained, no overflow (image_containment_prevention) */}
                <div className="relative w-full h-48 min-h-[192px] mb-3 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center p-3">
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain object-center group-hover:scale-105 reverent-transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col flex-1 text-left">
                  <h3 className="font-heading font-semibold text-base text-foreground mb-1.5 group-hover:text-primary reverent-transition">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary mt-auto">
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links - same style as holy synod / administration */}
      <QuickLinks />
    </div>
  );
};

export default TheChurchPage;
