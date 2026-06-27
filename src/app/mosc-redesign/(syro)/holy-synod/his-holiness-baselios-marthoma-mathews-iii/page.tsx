import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara',
  description:
    'His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan on 15 October 2021. The 92nd Primate on the Apostolic Throne of St. Thomas.',
};

const HisHolinessBaseliosMarthomaMathewsIiiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content - layout matches reference https://mosc.in/holysynod/his-holiness-baselios-marthoma-mathews-iii/ */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - larger size with 3D card effect */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[420px] aspect-[280/168] rounded-xl overflow-hidden flex items-center justify-center bg-white/5 shadow-xl shadow-gray-400/20 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-500/25 ring-1 ring-black/5">
                    <Image
                      src="/images/holy-synod/hh-scaled.jpg"
                      alt="H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara"
                      fill
                      className="object-contain rounded-xl"
                      priority
                      sizes="(max-width: 768px) 100vw, 420px"
                    />
                  </div>
                </div>

                {/* Content - from mosc.in/holysynod/his-holiness-baselios-marthoma-mathews-iii/ */}
                <div>
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara
                  </h2>

                  <div className="prose prose-lg max-w-none">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East &amp;
                      Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on
                      Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      His Holiness was born on 12 February 1949 to Mr Cherian Anthrayos of Mattathil family, being a
                      member of St Peters Church, Vazhoor. After his school education, he joined Kerala University and
                      passed his BSc Chemistry. After his BSc, he joined Orthodox Seminary, Kottayam, and had his GST
                      degree. His Holiness took his BD degree from the Serampore University and did his higher studies in
                      Theology at Theological Academy, Leningrad, Russia. Thereupon he joined Oriental Institute, Rome,
                      and took his MTh and PhD from there. His Holiness was ordained a deacon in 1976 and a priest in 1978
                      by HH Baselios Mathews I. His Holiness was escalated to the post of an Episcopa on 30 April 1991 at
                      a function at Parumala, and metropolitan in 1993. He is a well-known teacher and a faculty member of
                      the Orthodox Seminary, Kottayam. A philanthropist, he works relentlessly for the uplift of the
                      poor, especially women. He has started many ventures to help give employment opportunities to women
                      from the economically backward classes. His Holiness also served the Holy Episcopal Synod as its
                      secretary.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      His Holiness has authored a few devotional and contemplative books in Malayalam.
                    </p>

                    {/* Contact - Catholicate Aramana */}
                    <div className="mt-8 pt-6 border-t border-syro-table-border">
                      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4 sr-only">
                        Contact
                      </h3>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        H.H. Baselios Marthoma Mathews III,
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Catholicate Aramana
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Devalokam P.O, Kottayam
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Kerala, India
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Tel: 04812578499, 04812578500
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Email:{' '}
                        <a
                          href="mailto:catholicos@mosc.in"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          catholicos@mosc.in
                        </a>
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Facebook:{' '}
                        <a
                          href="https://www.facebook.com/CatholicosBaseliosMarthomaMathewsIII"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          Catholicos Baselios Marthoma Mathews III
                        </a>
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Instagram:{' '}
                        <a
                          href="https://www.instagram.com/baseliosmarthomamathewslll"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          baseliosmarthomamathewslll
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links - desktop */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <SynodMembersSidebar />
            </div>
          </div>
          {/* Quick Links - mobile */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HisHolinessBaseliosMarthomaMathewsIiiPage;
