import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kandanad West',
  description: 'Learn about the Diocese of Kandanad West of the Malankara Orthodox Syrian Church.',
};

const dioceseofkandanadwestPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kandanad West" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-kandanad-west.jpg"
                    alt="Diocese of Kandanad West"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kandanad West
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In 1876 Malankara Orthodox Church was divided into 7 Dioceses by Mulanthuruthy Synod. Among those seven, one diocese was Kandanad Diocese; at that time the parishes of Â Kandanad Diocese spread across Kottayam, Idukki and Ernakulam districts. The first Metropolitan of this diocese was H.G. Paulose Mar Ivanios (Murimattathil Bava), later First Catholicos of Malankara Orthodox Church, who belonged to Kolenchery St. Peter&apos;s and St. Paul&apos;s Orthodox Church. Followed by him, this diocese was governed by the following Metropolitans: H.G. Yuyakim Mar Ivanios, H.G. Augen Mar Timotheos, H.G. Paulose Mar Philoxenos, H.G. Joseph Mar Pachomios.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 1991 this diocese has been under the auspicious leadership of H.G. Dr. Mathews Mar Severios. In 2002 this Diocese was divided into two—Kandanad East and Kandanad West. Including parish churches and Catholicate centres, there are 41 worship centres in this diocese. There are 34 priests including Cor-Episcopas who offer their dedicated services in this Diocese. The diocesan headquarters is now situated at Prasadam Centre, Kolenchery. All spiritual organisations are very active in this diocese.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Besides the spiritual activities, several charitable activities are also functioning under this diocese under the leadership of H.G. Dr. Mathews Mar Severios. The charitable institutions are organized and administered by Mar Pachomios Charitable Society and Prathibha Charitable Trust. Following are the institutions:
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Pratheeksha Bhavan</strong> – Home for mentally and physically challenged, has been caring for the needy people since 1996. <strong>Prashanthi Bhavan (Home of Comfort)</strong> – is designed to provide comfort to terminally ill patients who have no place to go. <strong>Prathyasa Bhavan (Home of Hope)</strong> – institution takes care of mentally challenged and physically disabled boys. <strong>Pradanam Centre</strong> – Centre for free medical aid to poor patients. <strong>Pramodam Project</strong> – Distributing food every day to the poor patients in the government hospitals and near the premises of Kandanad Diocese. <strong>Prasannam Centre</strong> – this project is intended to take care of the destitute mental patients for life. <strong>Prakasam Institute of Special Education</strong> – This institute is intended to give training to the teachers for the training of mentally retarded children. <strong>Prepalanam</strong> – A project for providing pension to unorganized urban workers. Now 110 persons avail this facility. <strong>Prebhadom Computer Centre</strong> – giving free computer education to poor students irrespective of caste and creed. <strong>Presadom</strong> – Home for AIDS and Cancer patients. For this project 2.5 acres of land was bought near Peruva Catholicate Centre. <strong>Prathibha Bhavan</strong> – The project aims at giving training to the unemployed youths for self-employment through various small-scale industries. Its main institution is at Kunnakal, near Muvattupuzha, where Prathibha Curry Powder Unit and Electronics Unit are functioning. Prathibha Candles, Prathibha Umbrellas and Prathibha Ready Made Garments are in the pipeline at Pratheeksha Bhavan.
                  </p>

                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Prasadam Centre,
                        <br />
                        Kolencherry, Ernakulam 682 311
                      </p>
                      <p>
                        <span className="font-semibold">Ph:</span> 0484 2760286, <span className="font-semibold">Fax:</span> 2765180
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:kandanadwestdiocese@gmail.com" className="text-syro-red hover:underline font-medium">kandanadwestdiocese@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://share.google/C6b2bl94j7RtqGbAT"
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

export default dioceseofkandanadwestPage;