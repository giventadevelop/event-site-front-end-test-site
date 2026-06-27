import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H. G. Dr. Mathews Mar Thimothios Metropolitan',
  description: 'Biography and information about H. G. Dr. Mathews Mar Thimothios Metropolitan.',
};

const HGDrMathewsMarThimothiosMetropolitanPage = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden sacred-shadow-lg">
                      <Image
                        src="/images/holy-synod/thimothios.jpg"
                        alt="H. G. Dr. Mathews Mar Thimothios Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H. G. Dr. Mathews Mar Thimothios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace has served as assistant vicar and vicar in eight parishes in Kollam and Mavelikkara Dioceses. His Grace has prepared O. V. B. S text books, teacher\'s guide and a study based on the 24th Psalm.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Mob: 9447718511
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 3rd May 1963 as the eldest son of Mr. P.J. Baby and Mrs. Thankamma Baby of Painuvilla Puthenveettil family. His Grace is a member of St. Mary\'s Cathedral Puthiakavu, Mavelikkara.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace took his degree as a student of Bishop Moore College Mavelikkara, G. S. T. from Orthodox Theological Seminary and B. D and M.Th. from Serampore University. His Grace has also attained the Licentiate in sacred scripture from the Pontifical Institute in Rome and Diploma in Biblical Archeology from the Pontifical Bible Institute in Jerusalem.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace is a scholar in Italian, French, German, Aramic and Hebrew apart from English and Malayalam. His Grace has served as Joint Secretary of St. Thomas Orthodox Vaidika Sanghom, Publisher of "Purohithan" Magazine, Executive Committee Member of the Priest Fellowship in Rome, Secretary of Vattasseril Mar Divanyasios Charitable Fund, Dean of Postgraduate Studies and Registrar of Orthodox Theological Seminary.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Bethel Mar Gregorios Aramana, Chengannur, P.O- 689121
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: thimothiosmathews@gmail.com
                        </p>
                      </div>
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
            <div className="lg:col-span-1">
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
