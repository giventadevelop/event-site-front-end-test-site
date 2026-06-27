import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Meletius Metropolitan',
  description: 'Biography and information about H.G. Dr. Yuhanon Mar Meletius Metropolitan.',
};

const HGDrYuhanonMorMeletiusMetropolitanPage = () => {
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
                        src="/images/holy-synod/milithios.jpg"
                        alt="H.G. Dr. Yuhanon Mar Meletius Metropolitan"
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
                      H.G. Dr. Yuhanon Mar Meletius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born at Elakkaranadu, a typical village in the Ernakulam District of Kerala, to a social worker Mr Markose and Mrs Saramma, Murimakkil. He had his primary education from the Government School at Maneed. After his schooling, His Grace studied at St Peter’s College, Kolencherry, and passed out with his bachelors in Malayalam.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Coming to the theological studies, he did his BD and MTh degrees from the United Theological College, Bangalore. Thereupon, he took ThM and PhD qualify (old testament theology) from Lutheran School of Theology, Chicago. His Grace has submitted his PhD paper to Dharmaram Vidyashektram, Bangalore. Meanwhile, he studied syriac at St Aphrem’s Seminary, Damascus.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Mar Meletius got into the services of Our Lord being ordained a deacon in 1973 by His Grace Paulose Mar Phelexinos, the then metropolitan of Kandanad Diocese. He was ordained a priest in 1986 by His Beatitude Catholicos Baselios Paulose II. HH Patriarc Ignatius Zakka I, ordained him as Ramban on 22 December 1990 and as Bishop on 23 December 1990 in Damascus. Since then, he is serving the Trissur Diocese as its Metropolitan.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        As a priest, he was teaching at MSOT Seminary, Udaigiri. He was also serving as the vicar of St Mary’s Church, Valampur, for about four years. His Grace is also served as the president of Orthodox Christian Youth Movement.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          A scholar, His Grace is a visiting professor to the Orthodox seminaries at Nagpur and Kottayam. An accomplished writer, Mar Meletius has few books—Verukal Thedi, Manavikathayude Kazhchapadukal, Swatantravum Swayam Paryapthathayum—to his credit.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          This widely travelled Bishop has also published numerous articles in different publications.Visit the new website of H.G.Mar Meletius Metropolitan: www.yuhanonmeletius.org
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address:Gedseemon Seminary , Mannuthy, Thrissur, Kerala, India.- 680651 Phone: 0487 2371039, 2371748, 9447037174 Email: yuhanonmilitos@hotmail.com / mormilitos@gmail.com
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

export default HGDrYuhanonMorMeletiusMetropolitanPage;
