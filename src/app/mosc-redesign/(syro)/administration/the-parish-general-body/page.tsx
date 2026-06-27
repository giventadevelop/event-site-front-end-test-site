import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Parish General Body',
  description:
    'Every parish is within the framework of the church constitution. The Parish General Body comprises eligible members who discuss and decide parish matters and elect the managing committee, secretary, and lay trustee.',
};

export default function ParishGeneralBodyPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Parish General Body" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/parish-general-body.jpg"
                    alt="The Parish General Body"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Every parish is within the framework of the church constitution. It is neither outside the umbrella of the constitution nor an independent entity.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    Each Parish has a general body. The membership is confined to all male and female members above the age of 21 and who have made their annual confession and communion, and who are not defaulters in the parish dues for more than six months. All matters related to the parish are discussed and decided by this body. This general body elects the &apos;church managing committee&apos;, &apos;the secretary&apos;, and the &apos;lay trustee&apos;. The parish managing committee, the trustee and the secretary are elected every year.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-parish-general-body" />
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
