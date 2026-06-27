import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Parish Managing Committee',
  description: 'The local administrative body responsible for individual parish management.',
};

export default function ParishManagingCommitteePage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Parish Managing Committee" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/parish-managing-committee.jpg"
                    alt="The Parish Managing Committee"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    The members of the Parish Managing Committee excluding the priests will be elected by the Parish Assembly and their term of office will be one year. Every Parish Managing Committee will have a minimum of 5 and a maximum of 15 members excluding the Priests. The Parish Assembly will decide the required number of members within these limits. In the event of any vacancy arising in the Parish Managing Committee, the remaining members of the committee may fill up such vacancy by co-option from the members of the Parish Assembly. If in any circumstances special to any Parish, it is found necessary to extend the term of the Parish Managing Committee, the Parish Assembly may with the special permission of the Diocesan Metropolitan extend the term of office of that Parish Managing Committee to a period for three years.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-parish-managing-committee" />
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
