import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Thumpamon',
  description: 'Learn about the Diocese of Thumpamon of the Malankara Orthodox Syrian Church.',
};

const dioceseofthumpamonPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Thumpamon" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/thumpamon_diocese.jpg"
                    alt="Diocese of Thumpamon"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Thumpamon
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Flipping through the historical pages of Orthodox Christian community in Kerala, Thumpamon was one of the bastions for Christians during the very first century. Thumpamon Diocese was created after the Mulanthuruthy Synod 1876 along with other six dioceses. The historical diocese has been an idealist not just to the Orthodox Christian believers but even to the Kerala society under the bulwarks of Malankara Orthodox Church who have contributed to a great extend for the formation the Indian Orthodox Church and Diocese as a whole. The first torch bearer of the diocese was Metropolitan Geevarghese Mar Yulios of Pampakuda (1876- 1883) followed by St. Gregorios of Parumala (1883-1902), Pulikkottil Joseph Mar Dionysius (1902-1909), Vattasseril Mar Dionysius (1909 â€“ 1913) ,Euyakim Mar Ivanios (1913- 1925), Geevarghese Mar Gregorios (1925-1930) , Geevarghese Mar Philoxenos (1930-1951), Augen Mar Timotheos (19451-1953), Daniel Mar Philoxenos (1953-1990), Philipose Mar Eusebius (1990-2009), H.G. Kuriakose Mar Clemis (2009- 2023),Â  Â At present H.G. Dr. Abraham Mar Seraphim 12thÂ  Metropolitan of the Thumpamon diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Bishop's house (Aramana) of the diocese was built by Puthencav kochu Thirumeni (Geevarghese Mar Philoxenos) who was also the founder of the then Catholicate High School ,at present known as Catholicate College which became the blessing and guiding path of education for the people of Pathanamtitta. The contribution of Thumpamon diocese was not just centric to church and spirituality but also to the social fabric of Pathanamthitta, where late lamented Daniel Mar Philoxenise was part of the regional committee of the Pathanamthitta district who initiated many schemes and policy for the welfare of the people.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      During the litigation on Kottayam Seminary, a new Seminary was been formulated and started under the guidance of Puthencavu Kochu Thirumeni (Geevarghese Mar Philoxenos) and Daniel Mar Philoxenos. Thinganthara Valiya Achen and L.G Achen were the faculties of the seminary. H.H Baselios Marthoma Mathew II of his blessed memory was one among students of the Seminary.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese has been the initiator for many spiritual organizations of the Indian Orthodox Church. Bala Balika Samajam was started under the initiative of Sabha Kavi C.P Chandy. Orthodox Youth Movement and Students Movement were initiated and guided by Puthencavu Kochu Thirumeni (Geevarghese Mar Philoxenos), Daniel Mar Philoxenos and Philipose Mar Eusebius during their blessed administration of the diocese. The salary and transfer system of the priests was first implemented by the Thumpamon Diocese in the Indian Orthodox Church.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The contributions of the diocese for the social upliftment of the people are wide and extensive, providing shelter for the Homeless, educational scholarship for the financially weak students, training and guiding students who are specially able, free treatment and medicine for helpless and needy are the projects owned and implemented by the Basil Monastery , St Antony Monastry, St Mary's Convent as a lending hand to bring the less facilitated people to the mainstream society.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Basil Aramana,
                        <br />
                        Pathanamthitta - 689 645
                      </p>
                      <p>
                        <span className="font-semibold">Mob:</span> 9497254400
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:thumpamondiocese@gmail.com" className="text-syro-red hover:underline font-medium">thumpamondiocese@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/EDmq7ECerDfbRngh9"
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

export default dioceseofthumpamonPage;
