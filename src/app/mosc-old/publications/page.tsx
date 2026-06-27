import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publications | Malankara Orthodox Syrian Church',
  description: 'Official publications of the Malankara Orthodox Syrian Church, including the Malankara Sabha Magazine (Masika) and other church literature.',
};

export default function PublicationsPage() {
  const publications = [
    {
      id: 'malankara-sabha-magazine-masika',
      title: 'Malankara Sabha Magazine (Masika)',
      description: 'On August 8th 1946, due to the dedicated conviction and enthusiasm of H.H. Baselius Geevarghese II Catholicos of Blessed memory, the Magazine was published from the Catholicate Palace of Devalokam...',
      image: '/images/publications/mal.jpg',
      link: '/mosc-old/publications/malankara-sabha-magazine-masika',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Publications
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Official publications of the Malankara Orthodox Syrian Church, sharing the faith, tradition, and teachings of our ancient church.
            </p>
          </div>
        </div>
      </section>

      {/* Publications Grid Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publications.map((publication) => (
              <Link
                key={publication.id}
                href={publication.link}
                className="group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition overflow-hidden"
              >
                <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-muted/20">
                  <Image
                    src={publication.image}
                    alt={publication.title}
                    fill
                    className="object-contain group-hover:scale-105 reverent-transition"
                    style={{ objectPosition: 'center center' }}
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {publication.title}
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {publication.description}
                  </p>
                  <span className="inline-flex items-center font-body text-primary font-medium group-hover:gap-2 reverent-transition">
                    Read More
                    <svg 
                      className="w-5 h-5 ml-1 group-hover:ml-2 reverent-transition" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
              Our Publishing Mission
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
              The publications of the Malankara Orthodox Syrian Church serve to educate, inspire, and strengthen the faith of our community. Through our magazines, books, and other literature, we preserve our rich heritage while addressing contemporary spiritual needs.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Each publication reflects our commitment to sharing the timeless teachings of the Orthodox faith in a manner that is both accessible and meaningful to all generations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


