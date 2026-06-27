import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Thiruvananthapuram',
  description: 'Learn about the Diocese of Thiruvananthapuram of the Malankara Orthodox Syrian Church.',
};

const dioceseofthiruvananthapuramdiocesePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Thiruvananthapuram" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-thiruvananthapuram-diocese.png"
                    alt="Diocese of Thiruvananthapuram"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Thiruvananthapuram
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    On 1978, February 20th, Malankara Syrian Christian managing committee recommended a division in Kollam diocese. According to Committee&apos;s recommendation, on 1979, January 1st, Kollam diocese was divided into two, namely Kollam diocese and Thiruvananthapuram (Trivandrum) diocese. After the position, Trivandrum diocese was given 94 churches and now the churches and chapels include 106 numbers. From 1986 onwards, the orthodox Center at Ulloor has served as the bishop house. In 2010 a new diocese in the name of Kottarakkara Punalur Diocese was created after dividing the Thiruvananthapuram Diocese. There are 46 parishes in the diocese after the division.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-4">
                    Charitable and educational activities
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Charitable and Educational Society of the Thiruvananthapuram Orthodox Diocese is a registered society established in 1991 for starting and managing institutions of higher education in Thiruvananthapuram. The Society is sponsored by Thiruvananthapuram Diocese of Malankara Orthodox Church. H.G. Geevarghese Mar Dioscoros was the founder President of the Society. H. H. Baselios Mar Thoma Paulose II, the Catholicose of the East, is the patron of the Society. The metropolitan of the Thiruvananthapuram Orthodox Diocese, H. G. Dr. Gabriel Mar Gregorios, is the present president of the Society. The society runs Mar Dioscorus College of Pharmacy (MDCP), Sreekariyam.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-4">
                    H.G. Geevarghese Mar Dioscorus – 1st Metropolitan of Thiruvananthapuram Diocese
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      As youngest son to Kunjupappi and Achamma of Thevarvelil family in Kozhencherry was born Geevarghese Mar Dioscorus on 12 October 1926. He did his intermediate education from Madurai American college in 1948 and soon after joined Madras Christian College. After graduating in 1950, he did his Masters in Sociology from Bombay School of Economics. He was serving as the Secretary of the Co-operative Bank in Kozhenchery. While undergoing Officers Training Course in Reserve Bank of India he had the divine call to join the Ministry of God. He resigned from Reserve Bank and joined Orthodox Theological Seminary at Kottayam for studies in Divinity.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      He was ordained as a deacon in April 1963, and as priest in 1964 by His Holiness Geevarghese Catholicose II. In 1966 he went to Jerusalem for further studies. In 1970 he founded The Holy Trinity Ashram at Ranni and started to reside there. Very soon in 1973 he became the Diocesan Secretary of Thumpamon Diocese. On 16 May 1977 the Malankara Association that met at Mavelikkara elected him for the Episcopal order. He was consecrated as Episcopa Geevarghese Mar Dioscorus by His Holiness Baselios Mar Thoma Mathews I, Catholicos of the East on 15 May 1978 at Pazhani Church. On 28 February 1981 he was consecrated as a Metropolitan in the Pazhaya Seminary Chapel. He became the First Metropolitan of the newly formed Thiruvananthapuram Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      His Grace always conformed to the laws and wishes of God, devout and pious with all endeavours on a divine prospective. Being the first Metropolitan of Thiruvananthapuram Diocese, His Grace was fully responsible for the growth of the Orthodox Church in Thiruvananthapuram and establishing various institutes in Thiruvananthapuram for the poor and the destitutes like schools, convents and welfare centres. Ranny Holy Trinity Ashram, Ulloor Orthodox Church Centre, Edamulaikal V.M.D.M Centre, Sreekariyam Handicapped Children&apos;s welfare Centre, Thiruvananthapuram Holy Trinity School and Convent are all the fruits of his endeavours.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      He died on 23rd July 1999 and was interred in Holy Trinity Ashram, Ranny.
                    </p>

                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Orthodox Church Centre,
                        <br />
                        Ulloor, Medical College P.O.,
                        <br />
                        Thiruvananthapuram - 695 011
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 0475-2273493, Mob: 9447479843
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:moctvm@gmail.com" className="text-syro-red hover:underline font-medium">moctvm@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/jvwpJfnDtDFYoxuq6"
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

export default dioceseofthiruvananthapuramdiocesePage;