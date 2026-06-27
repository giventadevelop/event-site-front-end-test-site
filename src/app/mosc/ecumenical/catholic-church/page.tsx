import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Catholic Church',
  description: 'Learn about the catholic church relations of the Malankara Orthodox Syrian Church.',
};

const catholicchurchPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Catholic Church" breadcrumbFrom="ecumenical" />

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
                    src="/images/ecumenical/catholic-church.jpg"
                    alt="Catholic Church"
                    width={175}
                    height={175}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Relationship with the Catholic Churches
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Pro Oriente, the Catholic organization was the inspiration behind the initiation of unofficial dialogues with the Catholic Church. The dialogues began in 1971 helped to correct many misunderstanding in both sides. Many meetings between the Catholicoi of Malankara Orthodox Church and Popes of Catholic Church took place. The visits of His Holiness Baselios Augen I to Pope Paul VI in Bombay (1964), His Holiness Baselios Marthoma Mathews I to Pope John Paul II in Rome (1983) and later the visit of Pope John Paul II to His Holiness Baselios Marthoma Mathews I at Kottayam (1986) are highlights of this relationship. These mutual visits facilitated dialogues between the Malankara Orthodox Church and the Catholic Church in Kerala from 1989. These talks are still continuing every year. These dialogues with the Catholics helped a lot to explore and discover the common St. Thomas heritage of both the Churches and find out platforms where both can cooperate.
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

export default catholicchurchPage;