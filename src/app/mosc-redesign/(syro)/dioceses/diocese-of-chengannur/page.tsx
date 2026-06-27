import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Chengannur',
  description: 'Learn about the Diocese of Chengannur of the Malankara Orthodox Syrian Church.',
};

const dioceseofchengannurPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Chengannur" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/chengannur_diocese.png"
                    alt="Diocese of Chengannur"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Chengannur
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Chengannur came into existence of 10th March 1985 vide Kalpana No. 52/85 dtd. 8.3.85 of H.H. Moran Mar Baselios Marthoma Mathews I Catholicose of theÂ Â Â  East and MalankaraÂ Â Â  Metropolitan. This Diocese was established with 50 Churches from Thumpamon, Niranam and Kollam Dioceses. This newly constituted Diocese lies in an area comprising of Pazhakulam in the South, Kallunkal in the North, Kuttemperoor St. Mary's - Budhannoor in the West and Mezhuveli and Maramon in the East.H.G. Thomas Mar Athanasios, the celebrated educationalist and a pioneer priest in organising congregations in western India (Maharastra, Gujarat and Rajastan), became the first Metropolitan of the Diocese on 1st August 1985. His Grace is at present the president of Divyasandesam (Visual Media Department of our Church), Malankara Orthodox Church Publications and Akhila Malankara Gayaka Sangam of our church.Â  Eventhough he is very busy with various activities, he goes through effectively and punctually every minute details of the activities of the Diocese.The Diocesan Head Quarters is Bethel of which the founder is the late Puthencavu Geevarghese Mar Philoxenos of blessed memory. A multistoried Administative Block and a beautiful Church has come up in Bethel.Now there are 51 Churches, 10 Chapels and 55 Priests. There are 8851 families in the diocese.The Diocese gives maximum importance to spiritual organisations. Moreover the "Daivavili Sangam", a nursery for budding priests and nuns, is a unique activity of the Diocese.The Suvisesha Sangam - a fellowship of all the office bearers of the various spiritual organisations in the Diocese is the missionary wing of the Diocese.The Parish Council is yet another innovative idea of the Diocese. The Vicar, the Kaikaran, the Secretary and the office bearers (Vice-President, Secretary & Trustee) of various spiritual organisations in a Parish consitute the Parish Council. They meet every three months and review the functioning of the spiritual organisations in the Parishes.Assraya Social and Charitable Society,Â  "Mar Philoxenos Research & Guidence Centre, Vidya Jyothi, Philox School ofÂ  Liturgical Music, Baselios Counselling Centre" are four innovative ideas introduced recently.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The official organ of the Diocese is "Bethel Pathrika" a monthly, with an online editionwww.bethelpatrika.org
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Bethel Aramana, Chengannur - 689 121
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 0479 2451331
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:bethelaramana@gmail.com" className="text-syro-red hover:underline font-medium">bethelaramana@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/qrPsU77qYCLoZuJe7"
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

export default dioceseofchengannurPage;