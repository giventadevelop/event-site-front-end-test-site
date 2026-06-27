import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'World Council of Churches',
  description: 'Learn about the world council of churches relations of the Malankara Orthodox Syrian Church.',
};

const worldcouncilofchurchesPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="World Council of Churches" breadcrumbFrom="ecumenical" />

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
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="Malankara Orthodox Syrian Church logo"
                    width={375}
                    height={225}
                    className="rounded-lg w-auto h-auto object-contain max-w-[375px] block mx-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Department of Ecumenical Relations
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Department of Ecumenical Relations caters onto the fraternal relations of the Church. The Church, being a founding member of the World Council of Churches, extends its warmth and cordial hand in building up excellent relations with sister churches and ecumenical bodies. The Church prioritizes the relations with the anticipated common witness of the love of God in the world.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Along with the extensive works which have been carried out in the inception of the World Council of Churches, several of the previous Metropolitans, Clergy men and lay leaders of the Church initiated works in establishing good relations with the Churches in the Oriental Orthodox and Byzantine families, Catholic Church, Churches in Anglican Communion and with the World Alliance of Reformed Churches. There are active participatory roles played in the Asian, National and in State levels through the Christian Conference for Asia, National Council of Churches in India and the Kerala Council of Churches. The Community in Diaspora has made a point that in every National Ecumenical Bodies through membership, effectives roles are carried out.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In terms of effectual and practical works the Department concentrates in four major areas, which are- a) Inter-Church relations b) State, National and International levels of ecumenical bodies c) Academic endeavors and mutual exchanges and d) Orthodox Mission. The Department is in the process of getting revamped in terms of its practical organization and outreaches.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Contact email:{' '}
                    <a href="mailto:ecumenical@malankaraorthodoxchurch.in" className="text-syro-red hover:underline font-medium">
                      ecumenical@malankaraorthodoxchurch.in
                    </a>
                  </p>
                  <div className="mb-8">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-1">
                      President: H.G. Dr. Youhanon Mar Demetrios Metropolitan
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed pl-4 mt-2 border-l-2 border-syro-red/30">
                      Email: <a href="mailto:mar.demetrios@gmail.com" className="text-syro-red hover:underline font-medium">mar.demetrios@gmail.com</a>
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-1">
                      Secretary: Fr. Aswin Fernandis
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed pl-4 mt-2 border-l-2 border-syro-red/30">
                      Email: <a href="mailto:ecumenical@mosc.in" className="text-syro-red hover:underline font-medium">ecumenical@mosc.in</a>
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

export default worldcouncilofchurchesPage;