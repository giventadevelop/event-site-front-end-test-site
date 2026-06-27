import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan',
  description: 'His Grace Dr. Youhanon Mar Demetrios, Metropolitan of Delhi Diocese. Professor, Orthodox Theological Seminary; General Secretary, Orthodox Vaidika Sangham; Co-Secretary, Orthodox–Catholic Church Dialogue.',
};

const HGDrYuhanonMarDemetriusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Youhanon Mar Demetrios Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <Image src="/images/holy-synod/del.jpg" alt="H.G. Dr. Youhanon Mar Demetrios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Youhanon Mar Demetrios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 18 December 1952 as the son of Palamoottil Mathews and Mercy. His home parish is St. Thomas Orthodox Cathedral, Kollam Diocese. After completing formal education, His Grace received his M.R.E. from Gordon-Conwell Theological Seminary in South Hamilton, Massachusetts, and his Ph.D. from Fordham University. He is well versed in Malayalam, Greek, and Syriac. His Grace has held several key positions in the Church: Professor at the Orthodox Theological Seminary, Kottayam; Secretary, Ecumenical Relations Committee; General Secretary, Orthodox Vaidika Sangham; Co-Secretary, Orthodox–Catholic Church Dialogue; Delegate, W.C.C. Commission on Education and Ecumenical Formation; Representative of the Church at many international conferences; Registrar, F.F.R.R.C.; Dean of Doctoral Studies. He was elected as Metropolitan candidate on 17 February at the Malankara Association held at Sasthamkotta, and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. His Grace is serving the Delhi Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Delhi Orthodox Centre, 2 Institutional Area, Tughlakabad, New Delhi 110 062</p>
                        <p>Mobile: 9810791894</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:mar.demetrios@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          mar.demetrios@gmail.com
                        </a>
                      </p>
                      </div>
                    </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <SynodMembersSidebar />
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

export default HGDrYuhanonMarDemetriusMetropolitanPage;
