import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Fraternity at Vienna',
  description:
    'His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special invitee of Pro-Oriente. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const TheFraternityAtViennaPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span
                className="text-primary-foreground text-4xl font-bold"
                role="img"
                aria-label="Vienna"
              >
                🤝
              </span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Fraternity at Vienna
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Catholicos&apos;s visit as special invitee of Pro-Oriente — 3rd September 2013
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/mosc/ecumenical/vienna.jpg"
                    alt="Ecumenical meeting in Vienna"
                    width={600}
                    height={360}
                    className="rounded-lg w-full h-auto object-contain max-w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special
                    invitee of Pro-Oriente. Pro-Oriente is the fellowship of all the Churches which
                    use Syriac as the sacramental language. From the very inception of the
                    organization, Malankara Orthodox Church has played a decisive role to this day
                    in Pro Oriente.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Cardinal Christoph Schonborn, the Arch Bishop of Vienna received His Holiness
                    the Catholicos. An ecumenical meeting was organized at his official residence in
                    honour of the Catholicos. Franz Scharl, the Auxiliary Bishop of Vienna and the
                    office bearers of Pro-Oriente attended the meeting. The meeting discussed many
                    important measures to strengthen the relationship among Syrian Churches and to
                    foster co-operations among them.
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default TheFraternityAtViennaPage;
