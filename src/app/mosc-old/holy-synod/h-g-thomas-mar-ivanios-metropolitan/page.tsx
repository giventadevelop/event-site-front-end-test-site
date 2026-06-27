import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Thomas Mar Ivanios Metropolitan',
  description: 'Biography and information about H.G. Dr. Thomas Mar Ivanios Metropolitan.',
};

const HGThomasMarIvaniosMetropolitanPage = () => {
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
                        src="/images/holy-synod/Thomas-Mar-Ivanios.png"
                        alt="H.G. Dr. Thomas Mar Ivanios Metropolitan"
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
                      H.G. Dr. Thomas Mar Ivanios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Born to of Late Mr. Thomas Chacko and Mrs. Annamma , in Pulluparampil house, Aleppey on 13 th December 1969, His Grace Thomas Mar Ivanios Metropolitan belongs to the parish of St. Thomas Orthodox Church, Chennankari under Kottayam diocese. His Grace completed his school education from St. Joseph High School, Chennankari (1985), following which H.G. completed degree in Malayalam (1986-88) from SD College, Aleppey. He joined Kottayam Old Seminary in 1992 and completed GST (1992-96). Later, he did M.Th (1997- 99) from FFRRC and a degree in Doctor of Ministry (D. Min). He was ordained sub-deaconship, by H.G. Geevarghese Mar Ivanios Metropolitan at Orthodox Theological Seminary, Kottayam on 8 th December 1996 . He was ordained deaconship (1999) at Mar Baselios Dayara, Njaliyakuzhi, and priesthood at St. Thomas Orthodox church, Chennankari on 18 th September 1999. He was chosen as Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 th February 2022 . He received the status of Ramban at the Parumala Seminary on 2 nd June 2022 . He was ordained as a Metropolitan by the name ‘Mar Ivanios’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 th July 2022 . H.G. has taken charge of the diocese of South-West America since 3 rd November 2022.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Urshlem (Indian Orthodox Church Center)3101 Hopkins Road, Beasley, TX 77417, USA
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: thomasmarivanios@mosc.in, diocesanoffice@ds-wa.org Ph: +7132813871 +919511842199 001-281-403-0670
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Web: www.ds-wa.org
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Web: www.ds-wa.org (/mosc/directory)
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

export default HGThomasMarIvaniosMetropolitanPage;
