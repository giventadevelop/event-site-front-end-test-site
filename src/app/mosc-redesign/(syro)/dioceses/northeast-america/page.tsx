import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Northeast America',
  description: 'Learn about the Diocese of Northeast America of the Malankara Orthodox Syrian Church.',
};

const northeastamericaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Northeast America" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/northeast_america_diocese.png"
                    alt="Diocese of Northeast America"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of  Northeast America
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      History
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The history of the Malankara Orthodox Syrian Church of the East in the U.S.A. begins approximately in the mid 20th century. During this period, a number of prominent priests and laity came to the U.S.A. for higher studies and training. We do not have much information about the people who came over during that time period, but we do know that His Grace Mathews Mar Coorilos Metropolitan (late H.H. Moran Mar Baselius Mar Thoma Mathews II) stayed at the General Theological Seminary in 1963 and returned to India in 1964. Mar Coorilos celebrated Holy Qurbana occasionally during his stay here.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Beginning 
In 1965, the United States' legislation passed a new bill which cleared the way for thousands of professionally qualified individuals to make their way to America. Many Malankara Orthodox Christians, who were in search of a better life for themselves and their families, came to the United States during this time.
After 1970, the Malankara Orthodox Church gradually began to take root in many of the major US cities. Many of the new congregations were faced with uncertainties regarding the fate of the Church in America. As time passed, the growing number of clergy and laity proved that the Malankara Orthodox Church would be a permanent body in the United States. The question of ecclesiastical authority and how this body should be structured was a chief point of concern among the clergy and other church officials.Â Â Despite the hardships taking place within the Church, "pioneer" priests worked hard to establish parishes in order to serve the needs of the growing number of Malankara immigrants to the United States.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The year 1976 was a very important year for the Church, especially here in America. The Holy Synod decided to establish more dioceses to better administer the flock in various parts of the world. At this time, the numerous churches in America were placed under the authority of the Metropolitan of the Bombay Diocese, Thomas Mar Makarios, who had spent time in America as a student.Â Â Under the leadership of Mar Makarios, the Holy Synod made a momentous decision and granted the parishes in America their own Diocese, creating the American Diocese. Mar Makarios was given authority of the American Diocese and the enthronement of the newly elected Metropolitan Mar Makarios was held at the Cathedral Church of St. John the Divine in Manhattan, under the authority of the Catholicos of the East and Malankara Metropolitan, Baselius Mar Thoma Mathews I, on July 14, 1979. Â The enthronement was well attended by many leaders of the Orthodox Churches, as well as representatives from various other denominations. Notable during this time was the grand celebration of Saint Thomas Day by parishioners and church leaders across the nation at Union Theological Seminary, NY.Â Â During the tenure of Mar Makarios as Metropolitan, the Diocese saw growth in a dramatic fashion and the number of parishes grew to almost fifty strong. Along with this, the dedicated service of the priests in America added to the unity, prosperity and growth of the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1991, the Diocese came under the direct control of a Malankara Metropolitan who was assisted by Mathews Mar Barnabas, our present Metropolitan. For one year, the Diocese continued in this manner, until control came under the full authority of Mathews Mar Barnabas.Â  The enthronement ceremony was held in March 1993 on a grand scale at St. Mary's West Sayville under the authority of the Catholicos of the East, Baselius Mar Thoma Mathews II, and was attended by representatives from across the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Under the leadership of Mar Barnabas, the Diocese has grown both spiritually and physically.Â Most notable of all Mar Barnabus' accomplishments is the development of spiritual organizations, such as MGOCSM and Sunday School. He gave both organizations a national structure and administration.Â  In 2002, Zacharias Mar Nicholovos, a young, talented leader and orator joined the Diocese as the assistant to Mar Barnabas. With his assistance, the Diocese has grown even further.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today, the Northeast American Diocese can boast of more than fifty parishes, with more than forty priests, 14 deacons and seminarians. The hard work and prayers of all our Hierarchs, Priests, and laity have led to the Diocese's strong foundation, and have provided for us a secure future and outlook for the next generation of Indian Orthodox Christians in the Northeast American Diocese.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Indian Orthodox Church Centre,
                        <br />
                        2158 Route 106, Mutton Town,
                        <br />
                        N.Y. 11791.
                      </p>
                      <p>
                        <span className="font-semibold">Ph:</span> 00911-215 3421500
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:northeastamericandiocese@gmail.com" className="text-syro-red hover:underline font-medium">northeastamericandiocese@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/wPqgNc6t9rxR4snz6"
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

export default northeastamericaPage;