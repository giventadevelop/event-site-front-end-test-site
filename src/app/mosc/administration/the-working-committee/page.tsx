import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Working Committee',
  description: 'The operational committee that implements church policies and decisions.',
};

const WORKING_COMMITTEE_MEMBERS = [
  'H. H. Baselios Marthoma Mathews III Catholicos',
  'H. G. Dr. Yuhanon Mar Chrisostomos Metropolitan',
  'Fr. Dr. Thomas Varghese Amayil (Priest Trustee)',
  'Shri. Ronny Varghese Abraham (Lay Trustee)',
  'Adv. Biju Oommen (Association Secretary)',
  'Fr. Dr. K. L Mathew Vaidyan Cor Episcopa',
  'Fr. Jacob Kurian Chemmanam',
  'Dr. C. K. Mathew IAS (Retd)',
  'Dr. T. Tiju IRS',
  'Shri. Jacob Mathew',
  'Shri. M. C. Sunny',
];

export default function WorkingCommitteePage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Working Committee" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/working-committee.jpg"
                    alt="The Working Committee"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda
                    for the Managing Committee and helps the Malankara Metropolitan in his administrative functions.
                    The same body is also known as the Advisory Council.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Association Managing Committee shall have a Working Committee consisting of not more than ten members
                    and that body shall execute matters as decided by the Managing Committee. In case of urgent necessity the
                    Working Committee may act on behalf the Managing Committee in anticipation of its approval. All matters
                    so done shall be reported to the Managing Committee and its approval obtained. The President of the
                    Working Committee shall be the Malankara Metropolitan. A Prelate elected by the Malankara Episcopal Synod,
                    the Community Trustees and the Association Secretary shall be members of the Working Committee. The
                    remaining members shall be appointed by the Malankara Metropolitan in consultation with them. Members
                    of the Working Committee who are not already members of the Managing Committee, so long as they continue
                    to be members of the Working Committee shall be members of the Managing Committee.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Working Committee referred to in Section 87 shall also be the Consultative Committee of the Malankara
                    Metropolitan. The Association Secretary shall also be the Secretary of the Malankara Metropolitan&apos;s
                    Consultative Committee. The Malankara Metropolitan may have an Assistant. If such an Assistant is not
                    elected by the Association, he may be nominated by the Malankara Metropolitan. The Assistant shall be
                    ex-officio member of the Managing Committee and the Working Committee.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6">
                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                      Working Committee Members
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {WORKING_COMMITTEE_MEMBERS.map((name, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-syro-dark-gray/10">
                          <p className="font-syro-primary text-syro-dark-gray">
                            <strong>{name}</strong>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-working-committee" />
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
