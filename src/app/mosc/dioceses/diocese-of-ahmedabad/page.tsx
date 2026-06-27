import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Ahmedabad',
  description: 'Learn about the Diocese of Ahmedabad of the Malankara Orthodox Syrian Church.',
};

const dioceseofahmedabadPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Ahmedabad" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/ahmedabad_diocese.jpg"
                    alt="Diocese of Ahmedabad"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Ahmedabad
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Ahmedabad came into existence vide Kalpana No 93/2009 dated March 2,.2009 of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan. The new Diocese was carved out of the Dioceses of Bombay, Calcutta and Delhi and consists of 35 parishes and congregations, situated in the states of Gujarat, Rajasthan, Madhya Pradesh and Sultanate of Oman in the Arabian Gulf.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      His Holiness assumed the charge as the Metropolitan of the new Diocese and His Grace Geevarghese Mar Coorilos, Metropolitan of Bombay Diocese was appointed as the Assistant Metropolitan of the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The first General Body meeting of the new Diocese of Ahmedabad was held on June 19,.2009 under the Presidentship of HG Geevarghese Mar Coorilose at St Mary's Orthodox Syrian Church, Ahmedabad. The meeting was attended by priests and lay representatives representing various parishes in the Diocese. The meeting was also attended by existing members of the Malankara Orthodox Church Managing Committee and the Diocesan Council from the Parishes which have been included in the New Diocese and also by the Parish Office Bearers as special invitees. Rev Fr Joji George, Vicar, St Mary's Orthodox Syrian Church, Ahmedabad was elected as the Diocesan Secretary by the General Assembly.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Ahmedabad was formally inaugurated on October 3, 2009 by His Grace Dr Mathews Mar Severios Metropolitan, Secretary to the Holy Episcopal Synod and the Metropolitan of Kandanad Diocese in the presence of priests, faithful and invited guests.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Ahmedabad is presently functioning from the premises of St Mary's School, Naroda, provided by the St Mary's Orthodox Syrian Church, Ahmedabad.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Â St Mary's Higher Secondary School Campus,
Naroda, Ahmedabad, Gujarat
India 382 330
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Ph: Â 046922980253
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email: Â ahmedabaddiocese@gmail.com
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

export default dioceseofahmedabadPage;