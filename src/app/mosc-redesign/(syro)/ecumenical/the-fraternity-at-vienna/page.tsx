import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'The Fraternity at Vienna',
  description:
    'His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special invitee of Pro-Oriente. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const TheFraternityAtViennaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Fraternity at Vienna" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/mosc/ecumenical/vienna.jpg"
                    alt="Ecumenical meeting in Vienna"
                    width={175} height={175}
                    className="rounded-lg w-auto h-auto object-contain max-w-full block mx-auto"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special
                    invitee of Pro-Oriente. Pro-Oriente is the fellowship of all the Churches which
                    use Syriac as the sacramental language. From the very inception of the
                    organization, Malankara Orthodox Church has played a decisive role to this day
                    in Pro Oriente.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Cardinal Christoph Schonborn, the Arch Bishop of Vienna received His Holiness
                    the Catholicos. An ecumenical meeting was organized at his official residence in
                    honour of the Catholicos. Franz Scharl, the Auxiliary Bishop of Vienna and the
                    office bearers of Pro-Oriente attended the meeting. The meeting discussed many
                    important measures to strengthen the relationship among Syrian Churches and to
                    foster co-operations among them.
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

export default TheFraternityAtViennaPage;
