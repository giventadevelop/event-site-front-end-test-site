import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H. G. Dr. Mathews Mar Thimothios Metropolitan',
  description: 'His Grace Dr. Mathews Mar Thimothios, Metropolitan of Chengannur Diocese. Scholar in Scripture and Biblical archaeology; Dean of Postgraduate Studies and Registrar of Orthodox Theological Seminary.',
};

const HGDrMathewsMarThimothiosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H. G. Dr. Mathews Mar Thimothios Metropolitan"
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
                  <Image src="/images/holy-synod/thimothios.jpg" alt="H. G. Dr. Mathews Mar Thimothios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H. G. Dr. Mathews Mar Thimothios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 3rd May 1963 as the eldest son of Mr P.J. Baby and Mrs Thankamma Baby of Painuvilla Puthenveettil family. His Grace is a member of St Mary’s Cathedral Puthiakavu, Mavelikkara.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace took his degree as a student of Bishop Moore College, Mavelikkara, G.S.T. from Orthodox Theological Seminary and B.D. and M.Th. from Serampore University. His Grace has also attained the Licentiate in Sacred Scripture from the Pontifical Institute in Rome and a Diploma in Biblical Archaeology from the Pontifical Bible Institute in Jerusalem.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace is a scholar in Italian, French, German, Aramaic and Hebrew apart from English and Malayalam. His Grace has served as Joint Secretary of St Thomas Orthodox Vaidika Sanghom, Publisher of “Purohithan” Magazine, Executive Committee Member of the Priest Fellowship in Rome, Secretary of Vattasseril Mar Divanyasios Charitable Fund, Dean of Postgraduate Studies and Registrar of Orthodox Theological Seminary.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace has served as assistant vicar and vicar in eight parishes in Kollam and Mavelikkara Dioceses. His Grace has prepared O.V.B.S. textbooks, teacher’s guide and a study based on the 24th Psalm.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace is serving the Chengannur Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Bethel Mar Gregorios Aramana, Chengannur P.O. – 689 121</p>
                        <p>Mob: 9447718511</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:thimothiosmathews@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          thimothiosmathews@gmail.com
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

export default HGDrMathewsMarThimothiosMetropolitanPage;
