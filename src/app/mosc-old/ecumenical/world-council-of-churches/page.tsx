import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'World Council of Churches',
  description: 'Learn about the world council of churches relations of the Malankara Orthodox Syrian Church.',
};

const worldcouncilofchurchesPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section - hidden per design */}
      <section className="hidden py-16 bg-gradient-to-br from-background to-muted" aria-hidden>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="World Council of Churches">🌍</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              World Council of Churches
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Active participation in global Christian unity initiatives
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
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="Malankara Orthodox Syrian Church logo"
                    width={375}
                    height={225}
                    className="rounded-lg w-full h-auto object-contain max-w-[375px]"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Department of Ecumenical Relations
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Department of Ecumenical Relations caters onto the fraternal relations of the Church. The Church, being a founding member of the World Council of Churches, extends its warmth and cordial hand in building up excellent relations with sister churches and ecumenical bodies. The Church prioritizes the relations with the anticipated common witness of the love of God in the world.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Along with the extensive works which have been carried out in the inception of the World Council of Churches, several of the previous Metropolitans, Clergy men and lay leaders of the Church initiated works in establishing good relations with the Churches in the Oriental Orthodox and Byzantine families, Catholic Church, Churches in Anglican Communion and with the World Alliance of Reformed Churches. There are active participatory roles played in the Asian, National and in State levels through the Christian Conference for Asia, National Council of Churches in India and the Kerala Council of Churches. The Community in Diaspora has made a point that in every National Ecumenical Bodies through membership, effectives roles are carried out.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      In terms of effectual and practical works the Department concentrates in four major areas, which are- a) Inter-Church relations b) State, National and International levels of ecumenical bodies c) Academic endeavors and mutual exchanges and d) Orthodox Mission. The Department is in the process of getting revamped in terms of its practical organization and outreaches.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Contact email: ecumenical@malankaraorthodoxchurch.in
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      President: H.G. Dr. Youhanon Mar Demetrios Metropolitan
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Email: mar.demetrios@gmail.com
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Secretary: Fr. Aswin Fernandis
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Email: ecumenical@mosc.in
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
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
                    href="/mosc-old/ecumenical/in-egypt-with-the-message-of-fraternity" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    In Egypt with the Message of Fraternity
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Shepherd of the Indian Church in Ethiopia
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/the-confluence-of-love-in-vatican" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Confluence of Love in Vatican
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/the-fraternity-at-vienna" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Fraternity at Vienna
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/catholicos-speech-vatican" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Catholicos Speech at Vatican
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/pope-francis-speech-vatican" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Pope Francis Speech at Vatican
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/the-successor-of-st-thomas-in-europe" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Successor of St. Thomas in Europe
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/co-operation-with-the-protestant-churches" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Co-operation with the Protestant Churches
                  </Link>
                  <Link 
                    href="/mosc-old/ecumenical/ecumenical-ventures-in-modern-times" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Ecumenical ventures in modern times
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

export default worldcouncilofchurchesPage;