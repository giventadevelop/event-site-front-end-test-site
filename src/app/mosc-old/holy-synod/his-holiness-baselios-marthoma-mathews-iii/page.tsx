import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara',
  description: 'Biography and information about H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara.',
};

const HisHolinessBaseliosMarthomaMathewsIiiPage = () => {
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
                        src="/images/holy-synod/hh-scaled.jpg"
                        alt="H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara"
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Holiness was born on 12 February 1949 to Mr Cherian Anthrayos of Mattathil family, being a member of St Peters Church, Vazhoor. After his school education, he joined Kerala University and passed his BSc Chemistry. After his BSc, he joined Orthodox Seminary, Kottayam, and had his GST degree. His Holiness took his BD degree from the Serampore University and did his higher studies in Theology at Theological Academy, Leningrad, Russia. Thereupon he joined Oriental Institute, Rome, and took his MTh and PhD from there. His Holiness was ordained a deacon in 1976 and a priest in 1978 by HH Baselios Mathews I. His Holiness was escalated to the post of an Episcopa on 30 April 1991 at a function at Parumala, and metropolitan in 1993. He is a well-known teacher and a faculty member of the Orthodox Seminary, Kottayam. A philanthropist, he works relentlessly for the uplift of the poor, especially women. He has started many ventures to help give employment opportunities to women from the economically backward classes. His Holiness was also served the Holy Episcopal Synod as its secretary.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          H.H. Baselios Marthoma Mathews III,
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Catholicate Aramana
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Devalokam P.O, Kottayam
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Kerala, India
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Tel: 04812578499, 04812578500
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: catholicos@mosc.in
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Facebook: https://www.facebook.com/CatholicosBaseliosMarthomaMathewsIII
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Instagram:  baseliosmarthomamathewslll
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

export default HisHolinessBaseliosMarthomaMathewsIiiPage;
