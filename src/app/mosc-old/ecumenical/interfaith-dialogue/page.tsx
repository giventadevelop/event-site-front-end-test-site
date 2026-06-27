import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'Interfaith Dialogue',
  description: 'Learn about the interfaith dialogue relations of the Malankara Orthodox Syrian Church.',
};

const interfaithdialoguePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Interfaith Dialogue">🕊️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Interfaith Dialogue
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Engagement with other religious traditions
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
                    src="/images/ecumenical/interfaith-dialogue.jpg"
                    alt="Interfaith Dialogue"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Ecumenical ventures in modern times
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      His Holiness Baselios Marthoma Paulose II is also very keen to encourage ecumenical relations. Various ecclesiastical visits during a short span of time have paid rich dividends. A delegation led by His Holiness attended the Enthronement service of the Coptic and Ethiopian Prelates. His Holiness received a rousing reception and honour in the Coptic Orthodox Church.
The reception accorded to His Holiness in Ethiopia in March 2013 was equally colourful. His Holiness got the rare distinction of being the only Head of a Church who attended the Enthronement service of His Holiness Abune Mathias I. The representatives from various Churches celebrated their short services immediately after the enthronement was over.
Abune Paulose, the late Patriarch of the Ethiopian Church had visited Malankara Church and keen to maintain a good rapport with the Church till his demise. He could galvanize the cooperation between these two Churches started by His Grace Dr. Paulos Mar Gregorios and Rev. Fr. Dr. V. C. Samuel. The newly enthroned Patriarch His Holiness Mathias emphasized the need to strengthen the ties between these two Churches when the Catholicos and other delegates visited him and handed over the gifts of the Church, Nearly 8 professors of theology from the Malankara have served the seminaries of the Ethiopian Church. The Patriarch acknowledged the service of Rev. Fr. Josi Jacob who presently teaches at the Seminary.
The most important event in this series is the meeting with Pope Francis on 5th September, 2013. The reception accorded to the Catholicos and the Indian delegation right from the airport was really amazing. During the meeting, the Pope stated that the historical meeting was on the basis of great faith proclaimed by St. Thomas 'My Lord and My God' and this very same faith unites us. The Pope recollected the dialogues between these two Churches and the milestones in mutual cooperation for the last 30 years after the historic meeting between His Holiness Pope John Paul II and His Holiness Baselios Marthoma Mathews I in 1983. The speech was concluded with an exhortation to be united in prayer.
His Holiness the Catholicos visited Vienna en route Rome and received the hospitality of Pro-Oriente. Pro-Oriente gave the initial spark for the dialogue • between Catholics and Orthodox Churches. The Catholicos stayed at Vienna as the guest of Cardinal Christoph Schonborn, the Arch Bishop of Roman Catholic Church in Vienna. His Holiness presided over an Ecumenical meeting organized by St. Thomas Orthodox Parish in Vienna.
The Catholicos was given a rousing reception at Lambeth Palace, the official residence of the Archbishop of Canterbury on 9th September, 2013 on his way back from Rome. The banquet hosted in honour of the Catholicos at Lambeth Palace was attended by bishops of the Catholic and Anglican Churches and bishops of the Oriental and Byzantine Orthodox Churches in London. In his speech, His Holiness talked about the fraternal relations the Malankara Orthodox Church has with each Church.
I happened to hear a question from many quarters whether these visits would yield a good result in the near future. To them I want to reiterate that establishing good relations with others is a vital factor for success. It is undoubted that these visits have helped to strengthen our relation with others. Let us rejoice in the fact that His Holiness the Catholicos is following the same path trodden by H. G. Alexios Mar Theodosius, H. G. Philpose Mar Theophilose, H. G. Dr. Paulos Mar Gregorios and Rev. Fr. Dr. V. C. Samuel, the bulwarks of the Orthodox Church in the ecumenical movement.
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
                    href="/mosc-old/ecumenical/interfaith-dialogue" 
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default interfaithdialoguePage;