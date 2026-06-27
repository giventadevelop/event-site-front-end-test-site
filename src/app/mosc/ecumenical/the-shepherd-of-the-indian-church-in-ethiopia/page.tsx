import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'The Shepherd of the Indian Church in Ethiopia',
  description:
    'Enthronement of Abune Mathias as 6th Patriarch Catholicos of Ethiopia, 3rd March 2013. Ecumenical relations of the Malankara Orthodox Syrian Church with the Ethiopian Orthodox Tewahedo Church.',
};

const TheShepherdOfTheIndianChurchInEthiopiaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Shepherd of the Indian Church in Ethiopia" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/mosc/ecumenical/et.jpg"
                    alt="Ecumenical gathering in Ethiopia"
                    width={175} height={175}
                    className="rounded-lg w-auto h-auto object-contain max-w-full block mx-auto"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
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

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Patriarchal enthronement service started immediately after the reading of
                    the Evangelion (Gospel) in the Eucharistic service which followed the preparatory
                    service. The candidate was put on the vestments and the crown reciting prayers.
                    The enthronement service ended when the new incumbent was given the Staff and
                    Cross. Following the short prayers of the Oriental Orthodox Churches, the new
                    Patriarch completed the remaining part of the Holy Eucharist (from the reading of
                    the Gospel).
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the demise of His Holiness Abune Paulose, the Ethiopian Patriarch on
                    10th August 2012, the Church with a strength of 50 million people had elected
                    Abune Mathias, Arch Bishop of Jerusalem as the Patriarch of Ethiopian Orthodox
                    Church (28th February 2013).
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    After the enthronement service, there was a meeting to felicitate the new
                    Patriarch. In his keynote speech at the function, the Catholicos reiterated the
                    ancient relation between the nations of India and Ethiopia and the Church of
                    Ethiopia and Malankara. He also underlined the need for meaningful cooperation in
                    the fields of theological education and pastoral work. The Catholicos also
                    decorated the new Patriarch with three chains with cross.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Catholicos visited His Holiness Abune Mathias on the previous and succeeding
                    days of enthronement and made long discussion with him. His Holiness invited the
                    Patriarch to visit India.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The dinner hosted by the Catholicos on 2nd March was attended by 30
                    representatives from various Churches. Abba Bishoy, the Head of the Ecumenical
                    Department of the Coptic Church while proposing the vote of thanks extolled the
                    contribution made by Malankara Orthodox Church in the ecumenical field. He also
                    added that all are eagerly looking forward to the theological dialogue between the
                    Catholics and the Oriental Orthodox Churches to be hosted by the Malankara
                    Orthodox Church in 2014.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Ethiopian Government gave great importance to the Catholicos&apos; visit. The
                    only foreign delegate who was mentioned by name by official television channel
                    which telecast the enthronement ceremony extensively was the Catholicos.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The delegation included H. G. Dr. Gabriel Mar Gregorios, H. G. Yuhanon Mar
                    Diascoros, Rev. Fr. Dr. Johns Abraham Konatt, Rev. Fr. Dr. Josi Jacob, Rev. Fr.
                    Abraham Thomas, Rev. Dn. Jiss Johnson and Mr. Jacob Mathew Kulanjikombil.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Ethiopian Orthodox Tewahedo Church is the largest Church among the Oriental
                    Orthodox Churches with whom the Malankara Orthodox Church has communion. His
                    Holiness Abune Mathias is the supreme head of the Church which has 50 million
                    members spread over 56 dioceses with 60 bishops and 400,000 priests.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed pt-4 border-t border-syro-table-border/30 mt-8">
                    <span className="font-semibold text-syro-blue">Dr. Gabriel Mar Gregorios Metropolitan</span>, President,
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

export default TheShepherdOfTheIndianChurchInEthiopiaPage;
