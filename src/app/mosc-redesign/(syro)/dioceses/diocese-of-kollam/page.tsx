import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kollam',
  description: 'Learn about the Diocese of Kollam of the Malankara Orthodox Syrian Church.',
};

const dioceseofkollamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kollam" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/kollam diocese.jpg"
                    alt="Diocese of Kollam"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content - from https://mosc.in/dioceses/diocese-of-kollam/ */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kollam
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    St Thomas, the Apostle of Jesus Christ, is the Father of Christianity in India, landed at Maliankara in Kerala founded seven churches at Maliankara, Palayur, Kottakavu, Niranam, Nilakkel, Chayal and Kollam.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In AD 1876, Patriarch Moran Mar Ignatius Pathros III came here and a historical synod was convened at Mulanthuruthy. Later six new dioceses were formed in Malankara.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Diocese of Kollam was one among the six new dioceses formed with a vast area from Thiruvithamcode to Mavelikara.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Dionysius V, the then Malankara Metropolitan was the first Bishop of Kollam diocese and he headed the diocese from 1876 to (---?). Geevarghese Mar Gregorious of Parumala was the second Bishop of Kollam Diocese till 1902. Again from 1902 to 1909, Dionysius V became the Bishop of Kollam.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Vattasseril Geevarghese Mar Dionysius, the then Malankara Metropolitan became the third Bishop of Kollam diocese up to 1912. From 1912 onwards Geevarghese Mar Gregorious later known as Baselious Geevarghese II, the then Catholicos of Malankara adorned the position of Bishop of Kollam diocese till 1938. He adorned the position of the Catholicos of Malankara sabha and also the Bishop of Kollam from 1934 to 1938.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 1938 onwards, the diocese was under the leadership of Alexious Mar Thevedosius. From 1953 to 1966 Mathews Mar Coorilos served as the Assistant Bishop of Kollam along with Alexious Mar Thevedosius.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Mathews Mar Coorilos became the Bishop of Kollam in 1966 and served the diocese till he became the Catholicos of the East. In 1991 when Mathews Mar Coorilos became the Supreme Head of Malankara Sabha, Mathews Mar Epiphanios, who was the Assistant Bishop of Kollam became the Bishop of Kollam and served the diocese till 2009.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In 1979, the diocese of Kollam was bifurcated to Trivandrum and Kollam Diocese (------?) churches went to Trivandrum diocese. Again in 1985 four churches detached from Kollam diocese and included in Chengannur diocese. In 2002, from Kollam diocese twenty seven churches detached and formed the new Mavelikara diocese. In 2010 a rearrangement of churches of Kollam and Trivandrum dioceses resulted in the formation of Adoor – Kadampanadu and Kottarakara – Punalur dioceses.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The first headquarters of Kollam Diocese was Kottapuram Seminary during the reign of Geevarghese Mar Gregorious of Parumala and Kundara Seminary was the headquarters of Kollam Diocese during the reign of Geevarghese Mar Gregorious who later known as Baselious Geevarghese II.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Mathews Mar Coorilous later known as Baselious Marthoma Mathews II, the Catholicos of the East, established the present headquarters at Cross Junction, Kollam.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 2009 April 1st onwards H.G. Zachariah Mar Anthonios became the Metropolitan of Kollam Diocese. At present sixty five churches under the Diocese of Kollam. H.G Zachariah Mar Anthonios renovated and dedicated the Kollam Aramana during 2013-15. The Kollam diocese has two diocesan centers – Mar Epiphnios Centre, Kottarakara and Sooranad. The diocese also has St. Thomas Boys Home, Sasthamkotta and Mar Baselious Santhi Bhavan, Thalavoor as Charitable institutions.
                  </p>

                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5">
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                        <p className="mb-1">
                          <span className="font-semibold">Office:</span>
                          <br />
                          Bishop&apos;s House, Cross Jn.,
                          <br />
                          Kollam - 691 001
                        </p>
                        <p>
                          <span className="font-semibold">E-mail:</span>{' '}
                          <a href="mailto:kollamdiocese@gmail.com" className="text-syro-red hover:underline font-medium">kollamdiocese@gmail.com</a>
                        </p>
                        <p>
                          <a
                            href="https://maps.app.goo.gl/ghXMMtu1diDkqCpm9"
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

export default dioceseofkollamPage;