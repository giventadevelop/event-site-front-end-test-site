import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kandanad East',
  description: 'Learn about the Diocese of Kandanad East of the Malankara Orthodox Syrian Church.',
};

const dioceseofkandanadeastPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kandanad East" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-kandanad-east.jpg"
                    alt="Diocese of Kandanad East"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kandanad East
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Kandanad Diocese is one of the oldest dioceses of the Orthodox Syrian Church. It was constituted with Kandanad St. Mary&apos;s Church at its centre along with two scores and odd parishes around it in the erstwhile Travancore State. The historical Synod of 1599 was held at Udayamperoor, a place close to Kandanad. The ancient Churches of Piravom, Kadamattam, Vadakara, Kolenchery, Mamalaserry, Nechoor, Mulakulam, as well as Kandanad came under this Diocese. It extends from Vaikom in the west to Idukki in the east spreading over the parts of Ernakulam, Kottayam and Idukki districts. The boundaries of the dioceses of Kochi and Angamaly intercept those of Kandanad at certain points.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In 1876-77 (M.E. 1052) the Malankara Syrian Christian Church was divided into seven dioceses namely Kollam, Thumbaman, Niranam, Kottayam, Kochi, Kandanad and Angamaly. The Patriarch ordained Karavattuveettil Simon Cor-Episcopa on 5th September 1876 and Murimattathil Paulose Kathanaar on 25th March 1877 as Rambans at Mar Thomman Church Mulanthuruthy and St. Mary&apos;s Church, Kuruppampady respectively. Both registered their agreements (Salmoosa) on 26th March 1877 at the Kunnathunad Registrar office at Perumbavoor. Both were members of the Malankara Association Managing Committee. On 17th May 1877 Karavattuveettil Simon Mar Dionysius and Murimattathil Paulose Mar Ivanios were ordained metropolitans at Chiralayam St. Lazarus Church, Kunnamkulam for the Dioceses of Kochi and Kandanad respectively. The four new metropolitans were co-celebrants at the spiritual function and the last part of the Holy Mass was celebrated by the then ordained Paulose Mar Ivanios. Two days later, on the 19th May, at Chalissery West Church, both the new bishops were enthroned and accorded Stacicon to the Diocese they were assigned for. The &apos;Staticon&apos; was worded and prepared by H.G. Paulose Mar Ivanios.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Churches included in the Kandanad Diocese were Kandanad Martha Mariam, South Paravoor, Chembu, Kurinji, Puttumanoor, Kanniyattunirappu, Nechoor Mamalaserry, Piravom, Onakkoor, Kolenchery, Kottoor, Pampakuda, Ramamangalam, Mulakulam, Mannathoor, Vadakara, Kuzhikkattukunnu, Puthuvely, Palakuzha and Kadamattam. The &apos;Stasthicon&apos; of Paulose Mar Ivanios Metropolitan was read out and his &apos;Sunthronisa&apos; was performed on June 16th, the day of &apos;Penthicost&apos; at Mar Michael Church, Mamalaserry. Parishioners of eight Churches—Mamalaserry, Kandanad, Kannyattunirappu, Puttumanoor, Kolenchery, Vadakara, Palakuzha and Ramamangalam—participated in the ceremony. Of the six Metropolitans ordained by H.H. Patriarch Pathrose III, Paulose Mar Ivanios is the only metropolitan whose &apos;Sunthroniso&apos; is on record.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    On September 15th, 1912 he was elevated and ordained the first &apos;Catholicose&apos; of Malankara with the title H.H. Baselios Paulose I. Of the above mentioned metropolitans he was the last to be called to the Heavenly Abode. On May 2nd, 1913 he entered eternity and was entombed at Pampakuda Cheriya Pally. He was the diocesan metropolitan of Kandanad till his demise.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the excommunication of the Malankara Metropolitan Vattasseril Geevarghese Mar Dionysius by the Patriarch on flimsy grounds without sufficient reasons, the Malankara Syrian Church split into two factions, one supporting the Patriarch (Bava Kakshi) and the other siding with the Malankara Metropolitan (Methran Kakshi). In the Kandanad Diocese the former outnumbered the latter. In this faction Kochuparambil Paulose Mar Coorilose (1911-17) and Kuttikkattil Paulose Mar Athanasius (1920-27) held the responsibility of the Kandanad Diocese. Oughen Mar Timotheos who was ordained metropolitan was in charge of the diocese from 1927. Simultaneously during this period Yuyakkim Mar Ivanios (1913-1925), the Malankara Metropolitan Vattasseril Geevarghese Mar Dionysius and Catholicos Baselios Geevarghese II (1934-42) were in charge of Kandanad Diocese on behalf of the Catholicos faction.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As per the decision of the Kandanad Diocesan General Body Oughen Mar Timotheos Metropolitan accepted Baselios Geevarghese II in October 1942 and embraced Catholicos faction. He continued to be the metropolitan of Kandanad Diocese, with diocesan headquarters at Muvattupuzha until he was elevated and enthroned as the Catholicos of the East with the name H.H. Baselios Oughen I. It was during the tranquil period after the unification of the Church in 1958. Paulose Mar Athanasius of the Patriarch faction held the additional charge as the metropolitan of Kandanad Diocese as well from 1942 to 1952. Paulose Mar Philoxenos who was ordained metropolitan for the Kandanad Diocese on 19th October 1952 by the Patriarch took over its charge. He continued in the post till 1958 when the two factions merged bringing unity in the Church. Thereafter he ruled over the diocese along with Oughen Mar Timotheos until the latter was elevated as the Catholicos on 22nd 1964. Then Paulose Mar Philoxenos became the sole head of the diocese.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    But unfortunately breach of peace raised its ugly head again in the Church by 1970 and he chose to be on the Patriarch side and continued to be their Metropolitan. But on the Catholicos side, the Malankara Metropolitan took over the charge of the diocese. Then, on 16th Feb 1975 Joseph Mar Pachomios was ordained and posted as the Metropolitan of Kandanad. But in 1991 when he passed away, the diocese fell back under Malankara Metropolitan. The diocese got a metropolitan of its own when Dr. Mathews Mar Severios was posted as its head in 1993.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    On 7th September 1975, when the second split in the Church was complete, Paulose Mar Philoxenos who had been continuing as the metropolitan of Kandanad Diocese was elevated as Catholicos by the Patriarch with the official name H.B. Baselios Paulose II. But he still continued as the diocesan metropolitan. Philipose Mar Ivanios and Dr. Thomas Mar Athanasius were his assistants from 1979 to 1988 and from 1990 to 1996 respectively. H.B. Baselios Paulose II entered eternity on 1st September 1996.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the Supreme Court verdict on the Malankara Sabha case, fully imbibing its thrust and spirit, the Diocese of Kandanad under the Diocesan Metropolitan Dr. Thomas Mar Athanasius declared allegiance to the Malankara Orthodox Syrian Church Constitution of 1934 and started working with the Church leadership for unity and peace in the Church. According to the recommendation of the managing committee elected by the Malankara Association held on 20th March 2002 at Parumala as per the direction of the Apex Court, the Kandanad Diocese was divided into two—Kandanad East and Kandanad West Diocese. Dr. Thomas Mar Athanasius and Dr. Mathews Mar Severios were assigned Episcopal ministry of Kandanad East and Kandanad West respectively.
                  </p>

                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Bishop&apos;s House, Cathedral Road,
                        <br />
                        Muvattupuzha - 686 661
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 0485 - 2832401, 2833401
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:mvparamana@gmail.com" className="text-syro-red hover:underline font-medium">mvparamana@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://share.google/9yo3ZUyn5mSV6GqP4"
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

export default dioceseofkandanadeastPage;