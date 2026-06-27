import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Saints',
  description: 'Learn about the saints and holy figures of the Malankara Orthodox Syrian Church.',
};

const SAINTS_CARDS = [
  {
    title: 'St. Mary Mother of God',
    excerpt: 'The Concept of St. Mary in the Malankara Orthodox Church Among all the saints of the Church, St. Mary occupies a preeminent position. This prominence is the consequence of her...',
    href: '/mosc/saints/st-mary-mother-of-god',
    image: '/images/saints/st-mary-mother-of-god.jpg',
  },
  {
    title: 'The Apostles',
    excerpt: 'The word Apostle (apostolos) designates a person with a particular mission. In the very strict biblical meaning it denotes only the twelve Apostles. In the Gospel narratives the Twelve Apostles...',
    href: '/mosc/saints/the-apostles',
    image: '/images/saints/the-apostles.jpg',
  },
  {
    title: 'Early Church Fathers',
    excerpt: 'Church Fathers during 4th and 5th Centuries The fourth and fifth centuries may be regarded as the greatest centuries as far as the defense of faith is concerned. There...',
    href: '/mosc/saints/early-church-father',
    image: '/images/saints/early-church-father.jpg',
  },
  {
    title: 'St. Baselios Yeldho (Kothamangalam Bava)',
    excerpt: 'St Baselios Yeldho was born in a village called kooded (now known as Karakosh) near Mosul in Iraq where Marth Smooni and her 7 children suffered martyrdom. At a very...',
    href: '/mosc/saints/st-baselios-yeldho-kothamangalam-bava',
    image: '/images/saints/st-baselios-yeldho-kothamangalam-bava.jpg',
  },
  {
    title: 'St. Gregorios Of Parumala – Metropolitan Geevarghese Mar Gregorios.',
    excerpt: "Saint Gregorios of Parumala is popularly known as 'Parumala Thirumeni'. Metropolitan Geevarghese Mar Gregorios of the Malankara Orthodox Church who passed away on November 2nd 1902, became the first declared...",
    href: '/mosc/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios',
    image: '/images/saints/st-gregorios-of-parumala.jpg',
  },
  {
    title: 'St. Geevarghese Mar Dionysius Vattasseril',
    excerpt: 'Introduction St. Geevarghese Mar Dionysius Vattasseril, Malankara Metropolitan, was a bright light for the Malankara Orthodox Syrian Church that illumined during her dark and tumultuous times and possessed the vision...',
    href: '/mosc/saints/st-geevarghese-mar-dionysius-vattasseril',
    image: '/images/saints/st-geevarghese-mar-dionysius-vattasseril.jpg',
  },
  {
    title: 'Other Saints and Martyrs',
    excerpt: 'Cyril was the nephew of Theophilus of Alexandria, and became the Patriarch of Alexandria in 412 after the death of his uncle. As soon as he became a bishop, Cyril...',
    href: '/mosc/saints/other-saints-and-martyrs',
    image: '/images/saints/other-saints-and-martyrs.jpg',
  },
];

const SaintsPage = () => {
  const BANNER_DESCRIPTION =
    'Learn about the saints and holy figures venerated in the Malankara Orthodox Syrian Church.';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Saints"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      {/* Content - same layout and style as administration */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (matches administration .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Saints &amp; Holy Figures
          </h3>

          {/* Cards grid (matches administration .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {SAINTS_CARDS.map((card) => (
              <div
                key={card.href}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="mb-5 flex justify-center pt-8">
                  <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-contain rounded-lg"
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                </div>
                <div className="p-8 pt-0 flex flex-col flex-1">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {card.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-4">
                    {card.excerpt}
                  </p>
                  <Link
                    href={`${card.href}?from=saints`}
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

      {/* Understanding Saints - keep brief section */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
                Understanding Saints in Orthodoxy
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                <p>
                  In the Orthodox tradition, saints are not just historical figures but living
                  examples of holiness who continue to intercede for us before God. They serve
                  as models of Christian life and sources of spiritual inspiration.
                </p>
                <p>
                  The veneration of saints is an integral part of Orthodox spirituality,
                  helping us to connect with the great cloud of witnesses who have gone
                  before us in faith.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-syro-card p-6">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                How We Honor Saints
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Prayer">🙏</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Prayer & Intercession</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Seeking their prayers and intercession</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Feast Days">📅</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Feast Days</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Celebrating their memory on special days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Icons">🖼️</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Icons & Images</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Using their images for veneration and inspiration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaintsPage;
