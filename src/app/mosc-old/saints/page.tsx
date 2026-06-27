import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Saints',
  description: 'Learn about the saints and holy figures of the Malankara Orthodox Syrian Church.',
};

const SAINTS_CARDS = [
  {
    title: 'St. Mary Mother of God',
    excerpt: 'The Concept of St. Mary in the Malankara Orthodox Church Among all the saints of the Church, St. Mary occupies a preeminent position. This prominence is the consequence of her...',
    href: '/mosc-old/saints/st-mary-mother-of-god',
    image: '/images/saints/st-mary-mother-of-god.jpg',
  },
  {
    title: 'The Apostles',
    excerpt: 'The word Apostle (apostolos) designates a person with a particular mission. In the very strict biblical meaning it denotes only the twelve Apostles. In the Gospel narratives the Twelve Apostles...',
    href: '/mosc-old/saints/the-apostles',
    image: '/images/saints/the-apostles.jpg',
  },
  {
    title: 'Early Church Fathers',
    excerpt: 'Church Fathers during 4th and 5th Centuries The fourth and fifth centuries may be regarded as the greatest centuries as far as the defense of faith is concerned. There...',
    href: '/mosc-old/saints/early-church-father',
    image: '/images/saints/early-church-father.jpg',
  },
  {
    title: 'St. Baselios Yeldho (Kothamangalam Bava)',
    excerpt: 'St Baselios Yeldho was born in a village called kooded (now known as Karakosh) near Mosul in Iraq where Marth Smooni and her 7 children suffered martyrdom. At a very...',
    href: '/mosc-old/saints/st-baselios-yeldho-kothamangalam-bava',
    image: '/images/saints/st-baselios-yeldho-kothamangalam-bava.jpg',
  },
  {
    title: 'St. Gregorios Of Parumala – Metropolitan Geevarghese Mar Gregorios.',
    excerpt: "Saint Gregorios of Parumala is popularly known as 'Parumala Thirumeni'. Metropolitan Geevarghese Mar Gregorios of the Malankara Orthodox Church who passed away on November 2nd 1902, became the first declared...",
    href: '/mosc-old/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios',
    image: '/images/saints/st-gregorios-of-parumala.jpg',
  },
  {
    title: 'St. Geevarghese Mar Dionysius Vattasseril',
    excerpt: 'Introduction St. Geevarghese Mar Dionysius Vattasseril, Malankara Metropolitan, was a bright light for the Malankara Orthodox Syrian Church that illumined during her dark and tumultuous times and possessed the vision...',
    href: '/mosc-old/saints/st-geevarghese-mar-dionysius-vattasseril',
    image: '/images/saints/st-geevarghese-mar-dionysius-vattasseril.jpg',
  },
  {
    title: 'Other Saints and Martyrs',
    excerpt: 'Cyril was the nephew of Theophilus of Alexandria, and became the Patriarch of Alexandria in 412 after the death of his uncle. As soon as he became a bishop, Cyril...',
    href: '/mosc-old/saints/other-saints-and-martyrs',
    image: '/images/saints/other-saints-and-martyrs.jpg',
  },
];

const SaintsPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Saints">👼</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Saints of the Orthodox Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the lives, teachings, and spiritual legacies of the saints who have shaped
              our Orthodox tradition and continue to inspire our faith journey.
            </p>
          </div>
        </div>
      </section>

      {/* Saints Cards Grid - 7 cards with thumbnails (legacy content) */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Saints
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Learn about the saints and holy figures venerated in the Malankara Orthodox Syrian Church.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SAINTS_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-background rounded-lg sacred-shadow p-0 overflow-hidden hover:sacred-shadow-lg reverent-transition group flex flex-col"
              >
                {/* Image area - padded container, object-contain per image_containment_prevention rule */}
                <div className="relative w-full h-48 bg-muted overflow-hidden flex items-center justify-center p-4">
                  <div className="relative w-full h-full min-h-0">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                      style={{
                        objectPosition: 'center center',
                        backgroundColor: 'transparent',
                      }}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {card.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-4">
                    {card.excerpt}
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

      {/* Understanding Saints - keep brief section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                Understanding Saints in Orthodoxy
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
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
            <div className="bg-card rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                How We Honor Saints
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Prayer">🙏</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Prayer & Intercession</h4>
                    <p className="font-body text-muted-foreground text-sm">Seeking their prayers and intercession</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Feast Days">📅</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Feast Days</h4>
                    <p className="font-body text-muted-foreground text-sm">Celebrating their memory on special days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Icons">🖼️</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Icons & Images</h4>
                    <p className="font-body text-muted-foreground text-sm">Using their images for veneration and inspiration</p>
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
