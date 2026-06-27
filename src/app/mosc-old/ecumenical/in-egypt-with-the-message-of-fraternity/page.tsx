import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'In Egypt with the Message of Fraternity',
  description:
    'His Holiness Baselios Marthoma Paulose II attended the enthronement of Pope Tawadros II at St. Mark\'s Cathedral, Cairo. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const InEgyptWithTheMessageOfFraternityPage = () => {
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
                aria-label="Egypt fraternity"
              >
                🤝
              </span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              In Egypt with the Message of Fraternity
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Enthronement of Pope Tawadros II at St. Mark&apos;s Cathedral, Cairo — March 2012
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
                    src="/images/mosc/ecumenical/eg.jpg"
                    alt="Ecumenical gathering in Egypt"
                    width={600}
                    height={360}
                    className="rounded-lg w-full h-auto object-contain max-w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    His Holiness Baselios Marthoma Paulose II attended the enthronement service of
                    Pope Tawadros II, the Supreme head of the Coptic Orthodox Church at St.
                    Mark&apos;s Cathedral, Cairo on 18th March, 2012 as a special invitee. His
                    Holiness Theodore II, Alexandrian Patriarch of the Greek Orthodox Church, His
                    Holiness Ignatius Zakka Iwas I, the Patriarch of the Antiochian Syrian Orthodox
                    Church, His Holiness Baselios Marthoma Paulose II were the heads of the Churches
                    who attended the Service. His Grace Abba Pakkomios, the Senior Metropolitan of
                    the Coptic Orthodox Church was the chief celebrant at the service.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Ecclesiastical dignitaries like His Holiness Ignatius Zakka Iwas I, His
                    Holiness Baselios Marthoma Paulose II, His Holiness Theodore II and Cardinal
                    Koch from the Catholic Church congratulated the new Pope at the meeting which
                    followed the enthronement service. The delegates of Syrian and Armenian Churches
                    recited hymns after their words of felicitation. There was no participation of
                    the sister Churches in the enthronement service except the chanting of some
                    prayers by the Bishops of the Ethiopian Orthodox Church during the blessing of
                    the vestments as per the protocol. The new Pope celebrated Holy Eucharist after
                    the enthronement. All Metropolitans from the Oriental Churches received Holy
                    Communion.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    His Holiness the Catholicos and the newly installed Pope had a meeting for one
                    hour in the evening on 18th March. The Catholicos handed over his prayerful
                    greetings to the new Pope to give brave leadership to the Coptic Church which
                    faces severe persecutions in the changed political situations in Egypt.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The delegates from the Eritrean Orthodox Church also had an exclusive meeting
                    with the Catholicos on 19th morning. They shared the agonies and concerns of the
                    Church on the backdrop of various hurdles and problems on account of the recent
                    political circumstances and asked for the prayer and co-operation of our Church.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In a meeting of the heads of all the Churches, the Catholicos spoke about the
                    need for working together in the changed political and social scenario of the
                    world in general and the Middle East in particular.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The ecclesiastical dignitaries like His Eminence Theophilos George Sleeba
                    Metropolitan (Holy Episcopal Synod Secretary, Syrian Orthodox Church), His
                    Eminence Nareg Metropolitan (President, Ecumenical Relations Department, Armenian
                    Orthodox Church), His Eminence Sarkisian Metropolitan (Bishop of Armenian
                    Orthodox Church in Baghdad), His Eminence Abune Nathaniel (Interim Patriarch,
                    Ethiopian Orthodox Church), His Eminence Abba Seraphim (Bishop, Coptic Orthodox
                    Church), Mrs. Tara Curlewis (General Secretary, Churches together in Australia),
                    Dr. Johann Marte (President, Pro-Oriente) attended the banquet hosted by the
                    Catholicos and the ecumenical meeting that followed organized by the Malankara
                    Orthodox Church.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Ethiopian Orthodox Church delegations lead by the senior Metropolitan His
                    Eminence Abune Nathaniel met the Catholicos. The ecclesiastical heads from both
                    the Churches expressed their wish to find out more arenas of fraternal relations
                    as the two apostolic Churches which existed beyond the frontiers of the Roman
                    Empire.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed pt-4 border-t border-border/30 mt-8">
                    <span className="font-semibold text-foreground">Fr. Abraham Thomas</span>, Secretary,
                    Ecumenical Relations Department, Indian Orthodox Church
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default InEgyptWithTheMessageOfFraternityPage;
