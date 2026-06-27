import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Zachariah Mar Nicholovos Metropolitan',
  description: 'His Grace Zachariah Mar Nicholovos, Metropolitan of the Northeast American Diocese. Vice President, Department of Ecumenical Relations, MOSC.',
};

const HGZachariahMarNicholovosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Zachariah Mar Nicholovos Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <Image src="/images/holy-synod/nico.png" alt="H.G. Zachariah Mar Nicholovos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Zachariah Mar Nicholovos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace, Metropolitan Zachariah Mar Nicholovos was born on August 13, 1959 to the famous Poothicote family in Mepral. His boyhood name was Cheriyachen, and he was the fourth of five children. Much of his spiritual upbringing centered around his home parish, Saint John&apos;s Orthodox Church in Mepral, Kerala, India. At this church, His Grace Thoma Mar Dionysius, Metropolitan of Niranam Diocese, called young Cheriyachen to the service of the Holy Altar at the age of 9. This initiated a strong interest in Orthodox spirituality and the life of the Church. He was blessed to spend time with Metropolitan Thoma Mar Dionysius of Blessed Memory, and with spiritual giants such as Metropolitan Thomas Mar Thimithios (later His Holiness Catholicos Didymus I of Blessed Memory) and the convention speaker and retreat father, Reverend Father M. V. George (later Metropolitan Dr. Geevarghese Mar Osthathios of Blessed Memory). His uncle, Reverend Father George Kurian (later Metropolitan Kuriakose Mar Coorilose), began mentoring him.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Upon finishing high school, he enrolled in Malabar Christian College and later completed his Bachelor of Arts (English) from Saint Joseph College, Calicut. He then joined United Theological College in Bangalore, where he completed his Bachelor of Divinity and Master of Theology. His uncle and mentor, Metropolitan Kuriakose Mar Coorilose, ordained him to the Holy Diaconate on January 4, 1986 and to the Priesthood on May 16, 1990 at his home parish St. John&apos;s Church, Mepral. As a priest, he served parishes in the Diocese of Kandanad, as Ecumenical Secretary of the Malankara Syrian Orthodox Church, and as professor at the Malankara Syrian Seminary at Mulanthuruthy.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        On August 5, 1993, the eve of the Feast of the Transfiguration, His Beatitude Mar Baselios Paulose II tonsured him as a monk at Saint Thomas Orthodox Cathedral, Moovattupuzha, Kerala. On the Feast of the Falling Asleep of Saint Mary, the Mother of God, August 15, 1993, His Holiness Moran Mar Ignatius Zakka Iwas I, Patriarch of the Syriac Orthodox Church, consecrated him as Metropolitan. In 2002, His Holiness Moran Mar Baselios Marthoma Mathews II appointed him Assistant Metropolitan of the American Diocese, then led by His Grace Mathews Mar Barnabas of Blessed Memory. After the American Diocese was divided in April 2009, His Grace Mar Nicholovos continued assisting Metropolitan Mar Barnabas until his retirement in January 2011. On February 26, 2011, His Holiness Moran Mar Baselios Marthoma Paulose II appointed Metropolitan Zachariah Mar Nicholovos as the ruling Metropolitan of the Northeast American Diocese; he was enthroned on May 21, 2011.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        In addition to his diocesan responsibilities, His Grace serves in various ecumenical capacities: Vice President of the Department of Ecumenical Relations of the Malankara Orthodox Syrian Church; Working Committee and Executive Committee Member of the World Council of Churches (WCC) and member of the WCC Permanent Commission on Consensus and Collaboration; Governing Board member of the National Council of Churches in the United States (NCCUSA); Member of the Board of Trustees of Saint Vladimir&apos;s Orthodox Theological Seminary; and former Member of the Board of Directors of Church World Services (CWS).
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Diocesan Chancery, 2158 Route 106, Muttontown, NY 11791</p>
                        <p>Phone: 001 (718) 470 9844</p>
                        <p>
                          Website:{' '}
                          <Link href="https://www.neamericandiocese.org" target="_blank" rel="noopener noreferrer" className="text-syro-blue hover:underline">
                            www.neamericandiocese.org
                          </Link>
                        </p>
                        <p>
                          Email:{' '}
                          <a
                            href="mailto:Metropolitan@neamericandiocese.org"
                            className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                          >
                            Metropolitan@neamericandiocese.org
                          </a>
                        </p>
                        <p>
                          Facebook:{' '}
                          <Link href="https://www.facebook.com/Nicholovos" target="_blank" rel="noopener noreferrer" className="text-syro-blue hover:underline">
                            Nicholovos
                          </Link>
                          {' | '}
                          Instagram:{' '}
                          <Link href="https://www.instagram.com/nicholovosthirumeni/" target="_blank" rel="noopener noreferrer" className="text-syro-blue hover:underline">
                            nicholovosthirumeni
                          </Link>
                        </p>
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
            <div className="space-y-6 lg:col-span-1">
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

export default HGZachariahMarNicholovosMetropolitanPage;
