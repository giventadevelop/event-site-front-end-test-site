import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of UK Europe and Africa',
  description: 'Learn about the Diocese of UK Europe and Africa of the Malankara Orthodox Syrian Church.',
};

const dioceseofukeuropeandafricaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of UK Europe and Africa" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/diocese-of-uk-europe-and-africa.jpg"
                    alt="Diocese of UK Europe and Africa"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of UK Europe and Africa
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Diocese of the Indian Orthodox Church, UK Europe and Africa is acting as the umbrella organisation for various Indian Orthodox parishes in the UK, Rest of Europe and African Continent.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Diocese of UK Europe and Africa
To cater the spiritual needs of the community, the Holy Episcopal Synod and Managing Committee of the church had recommended forming a Diocese for the geographical region of UK, Rest of Europe and African Continent. In May 2009, Cathlolicos and Malankara Metropoltan- Supreme head of the Church declared the new diocese â€“ Diocese of UK Europe and Africa and appointed Dr.Mathews Mar Thimothios as the Diocesan Metropolitan.
Though vast majority of the members of the diocese is residing in the UK, by considering the geographical span of the diocese, for better functioning the Diocese has been divided into three regions, UK, Rest of Europe and Africa.
The UK region of the diocese has got its Diocesan centre and office at St.Gregorios Indian Orthodox Church, Cranfield Road, Brockley, London SE4 1UF. Now there are 957 families' comprise of approximately 3775 individuals lives in the UK, registered as members of the Diocese. Now we have twenty one (21) registered parishes/ congregations in various places of the UK where regular worships are being taken place. Most of the parishes and congregations are registered with UK charity Commission. For details been shown Table 1 below
Diocesan Metropolitan (Bishop) is the head of the organisation. A high level Diocesan Council elected by the Diocesan general body is the policy making body. Diocesan General Body members are representatives of each parish elected by the Parish General Body.
There are number of social organisations working under the Diocese as shown on the organisation chart below.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office (U.K.):</span>
                        <br />
                        St. Gregorios Indian Orthodox Church,
                        <br />
                        Cranfield Road, Brockley,
                        <br />
                        London, SE4 1UF.
                      </p>
                      <p>
                        <span className="font-semibold">Ph:</span> (44) 020-86919456
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:office@indianorthodoxuk.org" className="text-syro-red hover:underline font-medium">office@indianorthodoxuk.org</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/GNTRTuXaHQ2xU6bU6"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="syro-primary-button inline-flex items-center gap-2 w-fit"
                        >
                          <span>View on Map</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <DiocesesSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofukeuropeandafricaPage;