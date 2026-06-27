import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Malankara Sabha Magazine (Masika) | Publications | MOSC',
  description: 'The official monthly magazine of the Malankara Orthodox Syrian Church, published since 1946 from the Catholicate Palace of Devalokam. Subscribe and contact the editorial board.',
};

export default function MalankaraSabhaMagazinePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">
              MOSC
            </Link>
            <span>/</span>
            <Link href="/mosc-old/publications" className="hover:text-primary reverent-transition">
              Publications
            </Link>
            <span>/</span>
            <span className="text-foreground">Malankara Sabha Magazine (Masika)</span>
          </nav>
        </div>
      </section>

      {/* Hero Section with Image */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
              <Image
                src="/images/publications/mal.jpg"
                alt="Malankara Sabha Magazine (Masika)"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '0.5rem',
                }}
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Malankara Sabha Magazine (Masika)
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                On August 8th 1946, due to the dedicated conviction and enthusiasm of H.H. Baselius Geevarghese II Catholicos of Blessed memory, the Magazine was published from the Catholicate Palace of Devalokam.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Very Rev. M.C. Kuriakose Ramban of Blessed memory was the first chief editor. From January 1968 to February 1969 &quot;Malankara Sabha&quot; was published as a biweekly. At present, this is a monthly published Magazine and it is the official organ of the Indian Orthodox Church.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Board */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
            Editorial Board
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
            The editorial board appointed by the Holy Episcopal Synod of the Church oversees the administration and growth of the Magazine. At present, the editorial board includes H.G Dr Yuhanon Mar Diascoros Metropolitan (President), Fr Zachariah Thomas Puthupally (Chief Editor), Fr. Thomas Raju Karuvatta (Managing -Editor), Fr.Alex Thomas Nazhoorimattathil ( Sub- Editor)
          </p>
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
              Editorial Board Members
            </h3>
            <ul className="space-y-2 font-body text-lg text-muted-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Fr dr Bijesh Philip</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Fr. Thomas Varghese chavadiyil</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Adv Biju Oommen</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Dr Thomas Kuruvila</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Alexin George IPoS</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Merlin T Mathew</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Subscribe & Contact */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
            Subscribe and Contact
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
            The magazine is published on the 10th of every month. In order to subscribe for the magazine and for other information, contact:
          </p>
          <div className="bg-card rounded-lg sacred-shadow p-8 border-l-4 border-primary">
            <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
              The Managing Editor
            </h3>
            <div className="space-y-2 font-body text-lg text-foreground">
              <p><strong>Malankara Sabha Monthly</strong></p>
              <p>Devalokam P.O</p>
              <p>Kottayam – 686 038</p>
              <p><strong>Tel.:</strong> 0481-2573234</p>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="mb-2"><strong>Email:</strong></p>
                <p>
                  <a
                    href="mailto:malankarasabha1946@gmail.com"
                    className="text-primary hover:underline reverent-transition"
                  >
                    malankarasabha1946@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:sabhamasika@yahoo.com"
                    className="text-primary hover:underline reverent-transition"
                  >
                    sabhamasika@yahoo.com
                  </a>
                </p>
              </div>
              <div className="mt-4">
                <p className="mb-2"><strong>Website:</strong></p>
                <a
                  href="http://www.malankarasabhaonline.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline reverent-transition"
                >
                  www.malankarasabhaonline.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Publications */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link
              href="/mosc-old/publications"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Publications
            </Link>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}
