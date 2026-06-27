import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'Catholic Church',
  description: 'Learn about the catholic church relations of the Malankara Orthodox Syrian Church.',
};

const catholicchurchPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Catholic Church">✟</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Catholic Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Dialogue and cooperation with the Roman Catholic Church
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/ecumenical/catholic-church.jpg"
                    alt="Catholic Church"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Relationship with the Catholic Churches
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Pro Oriente, the Catholic organization was the inspiration behind the initiation of unofficial dialogues with the Catholic Church. The dialogues began in 1971 helped to correct many misunderstanding in both sides. Many meetings between the Catholicoi of Malankara Orthodox Church and Popes of Catholic Church took place. The visits of His Holiness Baselios Augen I to Pope Paul VI in Bombay (1964), His Holiness Baselios Marthoma Mathews I to Pope John Paul II in Rome (1983) and later the visit of Pope John Paul II to His Holiness Baselios Marthoma Mathews I at Kottayam (1986) are highlights of this relationship. These mutual visits facilitated dialogues between the Malankara Orthodox Church and the Catholic Church in Kerala from 1989. These talks are still continuing every year. These dialogues with the Catholics helped a lot to explore and discover the common St. Thomas heritage of both the Churches and find out platforms where both can cooperate.
                    </p>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Ecumenical Relations
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-old/ecumenical" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Ecumenical Overview
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/world-council-of-churches" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    World Council of Churches
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/orthodox-churches" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Orthodox Churches
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/catholic-church" 
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                  >
                    Catholic Church
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/protestant-churches" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Protestant Churches
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/oriental-orthodox" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Oriental Orthodox
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/interfaith-dialogue" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Interfaith Dialogue
                  </Link>
                </nav>
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default catholicchurchPage;