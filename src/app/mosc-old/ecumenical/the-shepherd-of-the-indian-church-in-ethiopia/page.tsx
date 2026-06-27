import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Shepherd of the Indian Church in Ethiopia',
  description:
    'Enthronement of Abune Mathias as 6th Patriarch Catholicos of Ethiopia, 3rd March 2013. Ecumenical relations of the Malankara Orthodox Syrian Church with the Ethiopian Orthodox Tewahedo Church.',
};

const TheShepherdOfTheIndianChurchInEthiopiaPage = () => {
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
                aria-label="Ethiopia"
              >
                ⛪
              </span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Shepherd of the Indian Church in Ethiopia
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Enthronement of Abune Mathias as 6th Patriarch Catholicos of Ethiopia — 3rd March 2013
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
                    src="/images/mosc/ecumenical/et.jpg"
                    alt="Ecumenical gathering in Ethiopia"
                    width={600}
                    height={360}
                    className="rounded-lg w-full h-auto object-contain max-w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Abune Mathias, the 63rd Ichege of the See of St. Tekle Haymanot and the 6th
                    Patriarch Catholicos of Ethiopia was enthroned on 3rd March 2013 amidst prayers
                    of millions of people. The Patriarchal enthronement service began when the
                    Patriarch designate and other Metropolitans entered the Holy Trinity Cathedral
                    in a procession. The preparatory service of the Eucharist began after the
                    Patriarch designate, in ordinary attire was made to sit on a throne placed just
                    below the Sanctuary in ordinary attire. On his left, His Holiness Baselios
                    Marthoma Paulose II and on right, Abune Nathaniel, the interim Patriarch and
                    senior Metropolitan were seated.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Patriarchal enthronement service started immediately after the reading of
                    the Evangelion (Gospel) in the Eucharistic service which followed the preparatory
                    service. The candidate was put on the vestments and the crown reciting prayers.
                    The enthronement service ended when the new incumbent was given the Staff and
                    Cross. Following the short prayers of the Oriental Orthodox Churches, the new
                    Patriarch completed the remaining part of the Holy Eucharist (from the reading of
                    the Gospel).
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Following the demise of His Holiness Abune Paulose, the Ethiopian Patriarch on
                    10th August 2012, the Church with a strength of 50 million people had elected
                    Abune Mathias, Arch Bishop of Jerusalem as the Patriarch of Ethiopian Orthodox
                    Church (28th February 2013).
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    After the enthronement service, there was a meeting to felicitate the new
                    Patriarch. In his keynote speech at the function, the Catholicos reiterated the
                    ancient relation between the nations of India and Ethiopia and the Church of
                    Ethiopia and Malankara. He also underlined the need for meaningful cooperation in
                    the fields of theological education and pastoral work. The Catholicos also
                    decorated the new Patriarch with three chains with cross.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Catholicos visited His Holiness Abune Mathias on the previous and succeeding
                    days of enthronement and made long discussion with him. His Holiness invited the
                    Patriarch to visit India.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The dinner hosted by the Catholicos on 2nd March was attended by 30
                    representatives from various Churches. Abba Bishoy, the Head of the Ecumenical
                    Department of the Coptic Church while proposing the vote of thanks extolled the
                    contribution made by Malankara Orthodox Church in the ecumenical field. He also
                    added that all are eagerly looking forward to the theological dialogue between the
                    Catholics and the Oriental Orthodox Churches to be hosted by the Malankara
                    Orthodox Church in 2014.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Ethiopian Government gave great importance to the Catholicos&apos; visit. The
                    only foreign delegate who was mentioned by name by official television channel
                    which telecast the enthronement ceremony extensively was the Catholicos.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The delegation included H. G. Dr. Gabriel Mar Gregorios, H. G. Yuhanon Mar
                    Diascoros, Rev. Fr. Dr. Johns Abraham Konatt, Rev. Fr. Dr. Josi Jacob, Rev. Fr.
                    Abraham Thomas, Rev. Dn. Jiss Johnson and Mr. Jacob Mathew Kulanjikombil.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Ethiopian Orthodox Tewahedo Church is the largest Church among the Oriental
                    Orthodox Churches with whom the Malankara Orthodox Church has communion. His
                    Holiness Abune Mathias is the supreme head of the Church which has 50 million
                    members spread over 56 dioceses with 60 bishops and 400,000 priests.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed pt-4 border-t border-border/30 mt-8">
                    <span className="font-semibold text-foreground">Dr. Gabriel Mar Gregorios Metropolitan</span>, President,
                    Ecumenical Relations Department
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default TheShepherdOfTheIndianChurchInEthiopiaPage;
