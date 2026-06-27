import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Delhi',
  description: 'Learn about the Diocese of Delhi of the Malankara Orthodox Syrian Church.',
};

const dioceseofdelhiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Delhi" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-delhi.jpg"
                    alt="Diocese of Delhi"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of  Delhi
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Once the nucleus of the Orthodox Church in north India was formed in the capital of the country, the growth of parishes in adjacent centres was rapid and the establishment of the Diocese of Delhi followed in a few years. Outside Delhi, there are several parishes spread across the various States at Alwar, Gurgaon, Kherti Nagar, Bharatpur, Gwalior, Jhansi, Dholpur, Agra, Dehradun, Ambala, Hardwar, Bhatinda, Hanumangarh, Chandigarh, Ludhiana, Jallandhar, Jaipur, Kanpur, Udaipur, Bhilwara, Banswara, Chittorgarh, Dungarpur, Pratapgarh, Singrauli, Obra., Renukoot, Varanasi, Ajmer, Kota, Rawat Bhatta, Lucknow, Rae Bareli, Allahabad, Jodhpur, Bikaner, and Jaisalmer. New congregations have also been started at BITS Pilani, and Pali. Allahabad has also witnessed an amicable settlement with the CNI Church, and a vicar has been nominated for the church there.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today, there are thirteen parishes in and around Delhi alone â€“ Hauz Khas, Janakpuri, Tughlaqabad, Sarita Vihar, Mayur Vihar-I, Mayur Vihar-III, Rohini, Dwaraka, Dilshad Garden, Ghaziabad, Noida, Gurgaon and Faridabad. Overall, there are sixty one parishes including some congregations looked after by one Ramban and thirty six priests, spread over Uttar Pradesh, Rajasthan, Madhya Pradesh, Haryana, Delhi and United Arab Emirates.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1975, the Delhi Diocese was constituted by the Holy Synod, along with the four other new dioceses of Madras, Bombay, Calcutta and America. The next year, Paulose Mar Gregorios took charge as the Metropolitan of Delhi. By 1985, the Diocesan headquarters moved to its own building, the Delhi Orthodox Centre in Tughlaqabad in South Delhi. An architecturally distinctive three-storey building, the centre was dedicated by Catholicos Baselios Mar Thoma Mathews I and inaugurated by the Vice-President of India, R Venkataraman, in November 1984. With the St. Thomas Chapel in the middle, the centre is the residence of the Metropolitan and houses, besides the secretariat of the Diocesan Council, a library, a publication unit, the People's Education Society, Sophia Society, Sarva Dharma Nilaya, Dhyan Mandir and Niti Santi Kendra, engaged in a variety of complementary activities. In 1991, the Diocese was strengthened by the arrival of Job Mar Philoxenos as the Assistant Metropolitan.1996 Paulose Mar Gregorios Metropolitan enters the heavenly Abode.2002 Job Mar Philoxenos is consecrated as the Metropoliton of Delhi Diocese on 26 December 2002.2011 Job Mar Philoxenos Metropolitan enters the heavenly Abode on 20 November 2011.2012 Youhanon Mar Demetrios is consecrated as new Metropolitan of the Delhi Diocese on 7 October 2012.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Delhi Orthodox Church Centre,
                        <br />
                        2, Industrial Area,
                        <br />
                        Thughlakabad, New Delhi 110062.
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:delhiorthodoxdiocese@gmail.com" className="text-syro-red hover:underline font-medium">delhiorthodoxdiocese@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/ALM823MeZEns8yXN8"
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

export default dioceseofdelhiPage;