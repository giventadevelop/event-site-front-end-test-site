import React from 'react';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Successor of St. Thomas in Europe',
  description:
    'A grand reception accorded to His Holiness Baselios Marthoma Paulose II by the U. K. Europe Africa Diocese and Lambeth Palace, London — September 2013. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const SuccessorOfStThomasInEuropePage = () => {
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
                aria-label="Lambeth"
              >
                ✟
              </span>
            </div>
            <h1 className="font-heading font-semibold text-3xl md:text-4xl text-foreground mb-4">
              The Successor of St. Thomas in Europe
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Reception at Lambeth Palace, London — 9th September 2013
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
                <div className="prose prose-lg max-w-none">
                  <div className="font-body text-muted-foreground leading-relaxed space-y-6">
                    <p>
                      A grand reception was accorded to His Holiness Baselios Marthoma Paulose II
                      by the U. K. Europe Africa Diocese and the Lambeth Palace of the Anglican
                      Church jointly on 9th September 2013 at Lambeth Palace, London, the
                      headquarters of the Anglican Church.
                    </p>

                    <p>
                      The special highlight during this ecclesiastical visit was an exhibition in
                      honour of the Catholicos of the letters written by the supreme heads of
                      Malankara Orthodox Church to the Arch Bishops of Canterbury from time to
                      time from 1939 on the backdrop of the mutual relationship between these two
                      Churches. The credit of this exhibition goes to Mr. Gines Mantel Brott, the
                      Lambeth Librarian.
                    </p>

                    <p>
                      The Catholicos discussed with Bishop Jeffrey Rowell, the co-chairman of
                      Anglican-Oriental Orthodox Dialogue and Christopher Chessun, the Bishop of
                      Southwark Diocese, London about need, possibilities and arrangements of
                      resuming the Dialogue between Oriental Orthodox and Anglican Church which
                      halted temporarily in 2003. Discussions were also made to explore the
                      possibilities and opportunities for higher studies and research in history
                      and theology. It was decided to discover platforms for studies and dialogue
                      between these two Churches by the respective ecumenical departments.
                    </p>

                    <p>
                      Following this, Bishop Angelos (the Bishop of the Coptic Orthodox Church in
                      London), Abba Seraphim (the supreme head of the British Orthodox Church under
                      the Coptic Orthodox Church), Bishop Vahan (President of the Council of
                      Oriental Orthodox Churches in England and the Bishop of the Armenian
                      Orthodox Church), Bishop Antonios (Ethiopian Orthodox Church), the Bishop
                      of the Eritrean Orthodox Church met the Catholicos as a group at Lambeth
                      Palace. Nearly sixty distinguished leaders representing various Christian
                      ecumenical bodies in England and Wales attended the historic meeting.
                    </p>

                    <p className="font-caption text-sm text-muted-foreground pt-4 border-t border-border">
                      Dr. Mathews Mar Thimotheos Metropolitan, Diocese of U. K., Europe and Africa
                    </p>
                  </div>
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default SuccessorOfStThomasInEuropePage;
