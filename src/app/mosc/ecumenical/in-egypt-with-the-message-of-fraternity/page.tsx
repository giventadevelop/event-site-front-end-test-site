import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'In Egypt with the Message of Fraternity',
  description:
    'His Holiness Baselios Marthoma Paulose II attended the enthronement of Pope Tawadros II at St. Mark\'s Cathedral, Cairo. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const InEgyptWithTheMessageOfFraternityPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="In Egypt with the Message of Fraternity" breadcrumbFrom="ecumenical" />

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
                    src="/images/mosc/ecumenical/eg.jpg"
                    alt="Ecumenical gathering in Egypt"
                    width={175} height={175}
                    className="rounded-lg w-auto h-auto object-contain max-w-full block mx-auto"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    His Holiness Baselios Marthoma Paulose II attended the enthronement service of
                    Pope Tawadros II, the Supreme head of the Coptic Orthodox Church at St.
                    Mark&apos;s Cathedral, Cairo on 18th March, 2012 as a special invitee. His
                    Holiness Theodore II, Alexandrian Patriarch of the Greek Orthodox Church, His
                    Holiness Ignatius Zakka Iwas I, the Patriarch of the Antiochian Syrian Orthodox
                    Church, His Holiness Baselios Marthoma Paulose II were the heads of the Churches
                    who attended the Service. His Grace Abba Pakkomios, the Senior Metropolitan of
                    the Coptic Orthodox Church was the chief celebrant at the service.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
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

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    His Holiness the Catholicos and the newly installed Pope had a meeting for one
                    hour in the evening on 18th March. The Catholicos handed over his prayerful
                    greetings to the new Pope to give brave leadership to the Coptic Church which
                    faces severe persecutions in the changed political situations in Egypt.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The delegates from the Eritrean Orthodox Church also had an exclusive meeting
                    with the Catholicos on 19th morning. They shared the agonies and concerns of the
                    Church on the backdrop of various hurdles and problems on account of the recent
                    political circumstances and asked for the prayer and co-operation of our Church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In a meeting of the heads of all the Churches, the Catholicos spoke about the
                    need for working together in the changed political and social scenario of the
                    world in general and the Middle East in particular.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
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

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Ethiopian Orthodox Church delegations lead by the senior Metropolitan His
                    Eminence Abune Nathaniel met the Catholicos. The ecclesiastical heads from both
                    the Churches expressed their wish to find out more arenas of fraternal relations
                    as the two apostolic Churches which existed beyond the frontiers of the Roman
                    Empire.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed pt-4 border-t border-syro-table-border/30 mt-8">
                    <span className="font-semibold text-syro-blue">Fr. Abraham Thomas</span>, Secretary,
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

export default InEgyptWithTheMessageOfFraternityPage;
