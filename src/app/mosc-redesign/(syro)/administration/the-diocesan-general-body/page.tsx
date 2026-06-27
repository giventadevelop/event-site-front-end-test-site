import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Diocesan General Body',
  description:
    'Every diocese has a Diocesan Assembly. The Diocesan bishop presides; budget, accounts and diocesan matters are decided in the General body. Term of members is five years.',
};

export default function DiocesanGeneralBodyPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Diocesan General Body" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/diocesan-general-body.jpg"
                    alt="The Diocesan General Body"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    Every diocese will have a Diocesan Assembly. The Diocesan bishop presides over the meetings.
                    All matters related to the Diocese is discussed and decided in the General body assembly
                    including the budget and accounts. If necessary the Malankara Metropolitan can also convene
                    the diocesan General body. The representation of the lay people is based on the number of
                    parishioners. The term of members will be five years.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-diocesan-general-body" />
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
