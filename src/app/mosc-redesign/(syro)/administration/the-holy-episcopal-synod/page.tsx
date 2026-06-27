import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Holy Episcopal Synod',
  description: 'The highest governing body consisting of all bishops of the church.',
};

export default function HolyEpiscopalSynodPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Holy Episcopal Synod" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/holy-episcopal-synod.jpg"
                    alt="The Holy Episcopal Synod"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority
                    of the synod is final and binding. It has exclusive rights and privileges in the matter of upholding the
                    faith of the church, its discipline and order of Apostolic Succession. As regards temporal matters the
                    church is guided by the Malankara Syrian Christian Association.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The bishops lead the diocese assigned to them by the synod. Presently there are 31 bishops including
                    H. H, The Catholicos.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-6">
                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                      Constitution Sections 102-109
                    </h3>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      Section 102 to 109 of The constitution of Malankara Orthodox church deals about the Episcopal Synod.
                      It is as follows:
                    </p>

                    <div className="space-y-4">
                      {[
                        { num: '102', text: 'There shall be an Episcopal Synod in Malankara.' },
                        { num: '103', text: 'All Prelates in Malankara Orthodox Syrian Church who have been duly approved as per the constitution shall be members of this Synod.' },
                        { num: '104', text: 'The Catholicos shall be the President of the Synod.' },
                        { num: '105', text: 'The Catholicos shall convene the Synod and preside over the Synod.' },
                        { num: '106', text: 'When there is no Catholicos or if there is any accusation against the Catholicos and the Catholicos does not convene the Synod for considering such accusation, the Senior Metropolitan shall convene the Synod and preside over the Synod.' },
                        { num: '107', text: 'The Episcopal Synod shall have the authority to decide matters concerning faith, order and discipline. When the Synod shall meet for this purpose the Synod may select such persons as the Synod may deem needed for consultation.' },
                        { num: '108', text: 'No one shall have the right to alter the faith of the Church. But in case there may arise any dispute as to what is faith, the Episcopal synod above said may decide the matter and the final decision about this shall vest with the Ecumenical Synod.' },
                        { num: '109', text: 'The Episcopal Synod may in consultation with the Association Managing committee appoint sub-committees for the purpose of Theological Education, Mission Work, Sunday school and similar matters.' },
                      ].map(({ num, text }) => (
                        <div key={num} className="flex items-start space-x-3">
                          <span className="font-syro-display font-semibold text-syro-red">{num}.</span>
                          <p className="font-syro-primary text-syro-dark-gray">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-syro-red/10 rounded-lg p-6">
                    <Link
                      href="/mosc-redesign/holy-synod"
                      className="syro-primary-button inline-flex items-center gap-2"
                    >
                      View all Episcopal Synod Members
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-holy-episcopal-synod" />
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
