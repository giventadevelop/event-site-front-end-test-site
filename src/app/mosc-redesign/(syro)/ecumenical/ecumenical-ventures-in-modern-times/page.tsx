import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Ecumenical ventures in modern times',
  description:
    'His Holiness Baselios Marthoma Paulose II and ecumenical relations: Coptic and Ethiopian visits, meeting with Pope Francis, Vienna, Lambeth Palace. Ecumenical movement of the Malankara Orthodox Syrian Church.',
};

const EcumenicalVenturesInModernTimesPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Ecumenical ventures in modern times" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-6">
                    <p>
                      His Holiness Baselios Marthoma Paulose II is also very keen to encourage
                      ecumenical relations. Various ecclesiastical visits during a short span of
                      time have paid rich dividends. A delegation led by His Holiness attended the
                      Enthronement service of the Coptic and Ethiopian Prelates. His Holiness
                      received a rousing reception and honour in the Coptic Orthodox Church. The
                      reception accorded to His Holiness in Ethiopia in March 2013 was equally
                      colourful. His Holiness got the rare distinction of being the only Head of a
                      Church who attended the Enthronement service of His Holiness Abune Mathias
                      I. The representatives from various Churches celebrated their short services
                      immediately after the enthronement was over.
                    </p>

                    <p>
                      Abune Paulose, the late Patriarch of the Ethiopian Church had visited
                      Malankara Church and keen to maintain a good rapport with the Church till
                      his demise. He could galvanize the cooperation between these two Churches
                      started by His Grace Dr. Paulos Mar Gregorios and Rev. Fr. Dr. V. C. Samuel.
                      The newly enthroned Patriarch His Holiness Mathias emphasized the need to
                      strengthen the ties between these two Churches when the Catholicos and other
                      delegates visited him and handed over the gifts of the Church. Nearly 8
                      professors of theology from the Malankara have served the seminaries of the
                      Ethiopian Church. The Patriarch acknowledged the service of Rev. Fr. Josi
                      Jacob who presently teaches at the Seminary.
                    </p>

                    <p>
                      The most important event in this series is the meeting with Pope Francis on
                      5th September, 2013. The reception accorded to the Catholicos and the Indian
                      delegation right from the airport was really amazing. During the meeting, the
                      Pope stated that the historical meeting was on the basis of great faith
                      proclaimed by St. Thomas &quot;My Lord and My God&quot; and this very same
                      faith unites us. The Pope recollected the dialogues between these two
                      Churches and the milestones in mutual cooperation for the last 30 years after
                      the historic meeting between His Holiness Pope John Paul II and His Holiness
                      Baselios Marthoma Mathews I in 1983. The speech was concluded with an
                      exhortation to be united in prayer.
                    </p>

                    <p>
                      His Holiness the Catholicos visited Vienna en route Rome and received the
                      hospitality of Pro-Oriente. Pro-Oriente gave the initial spark for the
                      dialogue between Catholics and Orthodox Churches. The Catholicos stayed at
                      Vienna as the guest of Cardinal Christoph Schonborn, the Arch Bishop of
                      Roman Catholic Church in Vienna. His Holiness presided over an Ecumenical
                      meeting organized by St. Thomas Orthodox Parish in Vienna. The Catholicos
                      was given a rousing reception at Lambeth Palace, the official residence of
                      the Archbishop of Canterbury on 9th September, 2013 on his way back from
                      Rome. The banquet hosted in honour of the Catholicos at Lambeth Palace was
                      attended by bishops of the Catholic and Anglican Churches and bishops of the
                      Oriental and Byzantine Orthodox Churches in London. In his speech, His
                      Holiness talked about the fraternal relations the Malankara Orthodox Church
                      has with each Church.
                    </p>

                    <p>
                      I happened to hear a question from many quarters whether these visits would
                      yield a good result in the near future. To them I want to reiterate that
                      establishing good relations with others is a vital factor for success. It
                      is undoubted that these visits have helped to strengthen our relation with
                      others. Let us rejoice in the fact that His Holiness the Catholicos is
                      following the same path trodden by H. G. Alexios Mar Theodosius, H. G.
                      Philpose Mar Theophilose, H. G. Dr. Paulos Mar Gregorios and Rev. Fr. Dr. V.
                      C. Samuel, the bulwarks of the Orthodox Church in the ecumenical movement.
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
            <div className="space-y-6 lg:col-span-1">
              <EcumenicalSidebar />
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

export default EcumenicalVenturesInModernTimesPage;
