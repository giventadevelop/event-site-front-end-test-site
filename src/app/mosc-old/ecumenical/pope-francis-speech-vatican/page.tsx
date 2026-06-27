import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican',
  description:
    'Speech of His Holiness Pope Francis at the meeting with the Catholicos at Vatican. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const PopeFrancisSpeechVaticanPage = () => {
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
                aria-label="Vatican"
              >
                ✟
              </span>
            </div>
            <h1 className="font-heading font-semibold text-3xl md:text-4xl text-foreground mb-4">
              Relevant portions of the speech by His Holiness Pope Francis at the meeting with His
              Holiness Baselios Marthoma Paulose II at Vatican
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Address of Pope Francis at the Vatican meeting — September 2013
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
                    src="/images/mosc/ecumenical/rm1.jpg"
                    alt="Meeting with Pope Francis at Vatican"
                    width={600}
                    height={360}
                    className="rounded-lg w-full h-auto object-contain max-w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="font-body text-muted-foreground leading-relaxed space-y-6">
                    <p>
                      Your Holiness, It is a joy for me to meet Your Holiness and the distinguished
                      delegation of the Malankara Orthodox Syrian Church. Through you, I greet a
                      Church that was founded upon the witness, even to martyrdom, that Saint Thomas
                      gave to Our Lord Jesus Christ. The apostolic fraternity which united the
                      first disciples in their service of the Gospel, today also unites our
                      Churches, notwithstanding the many divisions that have arisen in the
                      sometimes sad course of history, divisions which, thanks be to God, we are
                      endeavouring to overcome in obedience to Lord&apos;s will and desire (cf. Jn
                      17:21). The Apostle Thomas exclaimed, &quot;My Lord and my God!&quot; (Jn 20:28)
                      with one of the most beautiful confessions of faith in Christ handed down by
                      the Gospels, a faith which proclaims the divinity of Christ, his lordship in
                      our lives, and his victory over sin and death through his resurrection. This
                      event is so real that Saint Thomas is invited to touch for himself the actual
                      marks of the crucified and risen Jesus (cf. Jn 20:27). It is precisely in
                      this faith that we meet each other: it is this faith that unites us, even if
                      we cannot yet share the Eucharistic table; and it is this faith which urges
                      us to continue and intensify the commitment to ecumenism, encounter and
                      dialogue towards full communion.
                    </p>

                    <p>
                      With deep affection I welcome Your Holiness and the members of your delegation
                      and I ask you to convey my cordial greetings to the Bishops, clergy and
                      faithful of the Malankara Orthodox Syrian Church. I also greet the
                      communities you are visiting in Europe. I wanted to recall some of the steps
                      in these 30 years of the growing closeness between us, because I believe that
                      on the ecumenical path it is important to look with trust to the steps that
                      have been completed, overcoming prejudices and closed attitudes which are
                      part of a kind of &quot;culture of clashes&quot; and source of division, and
                      giving way to a &quot;culture of encounter&quot;, which educates us for mutual
                      understanding and for working towards unity. Alone however, this is
                      impossible; our weaknesses and poverty slow the progress. For this reason,
                      it is important to intensify our prayer, because only the Holy Spirit with
                      his grace, his light and his warmth can melt our coldness and guide our
                      steps towards an ever greater brotherhood.
                    </p>

                    <p>
                      Prayer and commitment in order to let relationships of friendship and
                      cooperation grow at various levels, in the clergy, among the faithful, and
                      among the various churches born from the witness given by St Thomas. May the
                      Holy Spirit continue to enlighten us and guide us towards reconciliation and
                      harmony, overcoming all causes of division and rivalry which have marked our
                      past. Your Holiness, let us walk this path together, looking with trust
                      towards that day in which, with the help of God, we will be united at the
                      altar of Christ&apos;s sacrifice, in the fullness of Eucharistic communion.
                      Let us pray for one another, invoking the protection of Saint Peter and
                      Saint Thomas upon all the flock that has been entrusted to our pastoral
                      care. May they who worked together for the Gospel, intercede for us and
                      accompany the journey of our Churches.
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default PopeFrancisSpeechVaticanPage;
