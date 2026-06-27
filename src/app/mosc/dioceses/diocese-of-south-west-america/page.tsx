import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of South West America',
  description: 'Learn about the Diocese of South West America of the Malankara Orthodox Syrian Church.',
};

const dioceseofsouthwestamericaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of South West America" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/southwest_america_diocese.jpg"
                    alt="Diocese of South West America"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of South West America
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese was formed by order number 145/2009 signed by the then Catholicos of the Apostolic Throne of St. Thomas and Malankara Metropolitan, His Holiness Baselios Mar Thoma Didymos I on April 1, 2009. The head quarteres of the Diocese is in Houston, Texas.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese is constituted of the parishes located in the southern and western states of the United States of America and the western provinces of Canada. The head of the Diocese is the Diocesan Metropolitan also known as the Diocesan Bishop, canonically elected, installed, and recognized by order of the Catholicos.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese is governed according to Holy Tradition, practices, and the Constitution of the Malankara Orthodox Syrian Church adopted in 1934 and subsequent amendments, (hereafter the Constitution). The Diocese is not an independent church in matters of ecclesiastical discipline or faith, but a part of the Malankara Orthodox Syrian Church and always will remain as such, unless otherwise decided by the Malankara Orthodox Syrian Church.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The purpose of the Diocese is to function as the Central Administrative Body of the individual parishes within its functional jurisdiction and to provide leadership to bring administrative and functional consistency, spiritual harmony, ecclesiastical spread and discipline among the faithful members of the Malankara Orthodox Syrian Church of the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese may engage in various religious, educational, charitable, social, and mission activities allowed to any religious charitable organizations in the United States of America and Canada under applicable law.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      By virtue of his office, the Diocesan Metropolitan is the chief administrative officer of the Diocese. All decisions and actions of any diocesan committee, official body or organization shall be executed with the approval of the Diocesan Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Subject to the Constitution, the decisions of the Diocesan Assembly should be executed by the Diocesan Council with the approval of the Diocesan Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In accordance with Section 3(c) Article 65 of the Constitution, matters concerning faith, order and discipline shall, subject to the decisions of the Holy Episcopal Synod, be under the control of the Diocesan Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Mailing Address:
3101 Hopkins Rd Beasley, TX 77417, USA
E-mail:Â dswadiocesanoffice@gmail.com
Phone: 281.403.0670 Fax: 281.459.0814
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Website:Â www.ds-wa.org
                    </p>
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

export default dioceseofsouthwestamericaPage;