import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'Malankara Association',
  description: 'The supreme legislative body of the church representing all parishes.',
};

export default function MalankaraAssociationPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Malankara Association" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/downloads/malankara_association.png"
                    alt="Malankara Association"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It was in the Mulamthuruthy synod summoned by the patriarch peter III in 1876 that resolved to have an
                    elected body called the Malankara Syria Christian Association to manage and control all the religions
                    and social concerns of the whole church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The constitution has clearly defined the composition and representation of the association. In article 71:
                    a priest two laymen elected by each parish general body and the members of the existing managing committee
                    shall be members of the association. This was later amended in time with Supreme Court directive. Now the
                    representation of the lay people is based on the number of parishioner.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara metropolitan is the president and the bishops having administrative charge of Diocese shall
                    be vice-presidents of the association.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    The association is the body that elects the members of the managing committee, bishops and the Catholicos
                    Malankara metropolitan.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="malankara-association" />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}
