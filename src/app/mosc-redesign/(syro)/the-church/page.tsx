import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';

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
    href: '/mosc-redesign/the-church/the-malankara-orthodox-syrian-church',
    image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
  },
  {
    title: 'The Throne of St. Thomas',
    description:
      "The concept of the 'Throne of St. Thomas' is based on the words of our Lord Himself. In St. Matthew 19:28 it is written that 'Jesus said to them: Amen, I say to you that you who have followed me, in the regeneration when the Son of man shall sit on the seat of his majesty, you also shall sit on twelve thrones judging the twelve tribes of Israel.'",
    href: '/mosc-redesign/the-church/the-throne-of-st-thomas',
    image: '/images/church/throne_of_st_thomas.jpg',
  },
  {
    title: 'What do we believe?',
    description:
      'What do the Orthodox Believe? It is more to ask: "in whom do we put our trust?" "Believe" is a very vague word. Often it means simply holding an opinion. For the Orthodox, faith is a personal relationship with the living God—Father, Son, and Holy Spirit.',
    href: '/mosc-redesign/the-church/what-do-we-believe',
    image: '/images/church/what-do-we-believe.jpg',
  },
  {
    title: 'The Creed',
    description:
      'The Ecumenical Council of Nicea and Nicene Creed. The Oriental Orthodox Churches recognize only three ecumenical councils, and the Council of Nicea is the first among them. The Nicene Council, held in A.D. 325, gave us the Creed that confesses the faith of the one, holy, catholic, and apostolic Church.',
    href: '/mosc-redesign/the-church/the-creed',
    image: '/images/church/creed.jpg',
  },
  {
    title: 'Theology',
    description:
      'The main Doctrines of the Church. The Malankara Orthodox Church has pillars of Mystery through which it teaches and demonstrates its basic religious belief. They are called pillars due to their foundational role in Orthodox theology and spiritual life.',
    href: '/mosc-redesign/the-church/theology',
    image: '/images/church/theology.jpg',
  },
  {
    title: 'Spirituality',
    description:
      'Introduction. Spirituality may be defined as the life in and with the Holy Spirit. It is an ascetic and pious struggle against sin through repentance, prayer, fasting, and participation in the sacraments—the means by which we grow in the likeness of God.',
    href: '/mosc-redesign/the-church/spirituality',
    image: '/images/church/spirituality.jpg',
  },
  {
    title: 'Syrian Heritage',
    description:
      'Syrian Heritage of the St. Thomas Christians. Syriac is the liturgical language of the St. Thomas Christians from a very early date, even though their identity and culture remained always Indian. This heritage connects us to the ancient Christian East.',
    href: '/mosc-redesign/the-church/syrian-heritage',
    image: '/images/church/syrian_heritage.jpg',
  },
  {
    title: 'Oriental and Eastern Orthodox churches',
    description:
      'How Different is The Eastern Orthodox Church? Several people have asked this question in several different forms: Who are these Orthodox—Protestants or Roman Catholics? What do they believe differently? We belong to the Oriental Orthodox family of churches.',
    href: '/mosc-redesign/the-church/oriental-and-eastern-orthodox-churches',
    image: '/images/church/oriental.jpg',
  },
  {
    title: 'History',
    description:
      'THE ORTHODOX CHURCH OF INDIA. The Malankara Orthodox Church—hereafter referred to as the Orthodox Church of India or the Indian Orthodox Church—is the second largest faction of the St. Thomas Christians, tracing its origins to the apostolic mission of St. Thomas in A.D. 52.',
    href: '/mosc-redesign/the-church/church-history',
    image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
  },
  {
    title: 'The Holy Myron',
    description:
      'By the divine power, we have spoken at length on the mysteries of the cross. We next write about the divine and life-giving mystery of the Holy Myron—the consecrated oil used in the sacrament of Chrismation, sealing the faithful with the gift of the Holy Spirit.',
    href: '/mosc-redesign/the-church/the-holy-myron',
    image: '/images/church/sacraments.jpg',
  },
  {
    title: 'Liturgy',
    description:
      '"We have seen the true Light, we have received the heavenly Spirit; we have found the true Faith, worshiping the undivided Trinity: for He has saved us." The Liturgy of St. John Chrysostom and other ancient liturgies form the heart of our worship.',
    href: '/mosc-redesign/the-church/liturgy-worship',
    image: '/images/church/liturgy-worship.jpg',
  },
];

const cardShadow = 'rgba(50,50,93,0.25) 0px 6px 12px -2px, rgba(0,0,0,0.3) 0px 3px 7px -3px';

const BANNER_DESCRIPTION =
  'Explore our faith, heritage, and tradition—from the Throne of St. Thomas to the Creed, theology, spirituality, Syrian heritage, history, the Holy Myron, and liturgy.';

const TheChurchPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="The Church"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-syro-dark-gray mb-10 pl-8 border-l-4 border-syro-red">
            The Malankara Orthodox Syrian Church
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {churchSections.map((item) => {
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col h-full"
                  style={{ boxShadow: cardShadow }}
                >
                  <MoscHubCardMedia src={item.image} alt={item.title} padded={false} frameClassName="bg-white" />
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                    {item.description}
                  </p>
                  <Link
                    href={item.href + '?from=the-church'}
                    className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default TheChurchPage;
