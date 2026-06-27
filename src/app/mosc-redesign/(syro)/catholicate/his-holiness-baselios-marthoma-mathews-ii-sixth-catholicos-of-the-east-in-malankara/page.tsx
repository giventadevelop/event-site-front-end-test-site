import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc-redesign/(syro)/components/QuickLinks';
import SyroPageBanner from '@/app/mosc-redesign/(syro)/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc-redesign/(syro)/catholicate/catholicosLinks';

export const metadata = {
  title: 'His Holiness Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)',
  description: 'Biography of His Holiness Baselios Marthoma Mathews II, the sixth Catholicos of the East in Malankara.',
};

const BaseliosMarthomaMathewsIIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="His Holiness Baselios Marthoma Mathews II" breadcrumbFrom="catholicate" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The Sixth Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">1991–2005</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/sas.jpg"
                    alt="His Holiness Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                    Biography
                  </h2>
                  <p>
                    His Holiness Moran Mar Baselios Marthoma Mathews II, Catholicos of the East, and 89th successor to the Holy Apostolic Throne of St. Thomas was enthroned on 29 April 1991.
                  </p>
                  <p>
                    He was born on 30 January 1915 at Perinad in Kollam District of Kerala. His Holiness had his early education in a local school. After his High School education he had his training at Old Seminary Kottayam and also at Basil Dayara, Pathanamthitta. Later he joined Bishop&apos;s College, Calcutta for his B.D. degree. He had his higher education in Theology at General Theological Seminary, New York. He was ordained as Deacon in 1938 and as Priest in 1941. It was during his stay at St. George Dayara, Othara that Father Mathews made a mark as a devoted and able priest of the Indian Orthodox Church. He was noted for his spiritual leadership and loving nature and could endear himself to everyone who came in contact with him. He was known as &quot;Father Angel&quot; at that time. The Catholicos His Holiness Baselios Geevarghese II took special interest to see that the services of Father Mathews were utilized in a still better way for the Church and the community. On 15 May 1953 he was ordained as a Bishop of the Orthodox Church. He was only thirty-eight years of age at that time. The young Bishop grew in stature very soon. As Metropolitan of the Diocese of Kollam he was fully responsible for its growth and progress and the number of parishes almost doubled within a short period. Several monasteries and convents were started. A large number of educational institutions and hospitals were established. His services in the field of education and social service are well known. Several Colleges, Schools, Hospitals and other service institutions were successfully established and administered under his direct control and leadership. He travelled widely in various countries: the United States, Canada, Europe, Malaya, Singapore, Gulf countries etc. and attended various international meetings and conferences. It was in 1980 that he was unanimously elected by the Malankara Syrian Christian Association as successor to the throne of Catholicos of the East and Malankara Metropolitan. In recent years some of the new schemes started under his direction have been of much help and benefit for the community at large. A Civil Service Academy was started at Thiruvananthapuram, to give proper training for candidates appearing for IAS, IPS, IFS and other Central Service Examinations. With a view to provide shelter for the poor, a House Building Assistance project was started. The Community Marriage Scheme has been beneficial for the marriage of poor girls. The Human Resources Development and Services Wing is also helpful for the community in general. As President of the Ecumenical Committee in Kerala and in various other Inter-Church Committees he showed excellent leadership. He kept in touch with Heads of other Churches constantly and was keenly interested to promote Ecumenism. He had very friendly relations with leaders of other religions as well and fully demonstrated by his activities the role the Head of a Christian Church has to play in the secular, socialist, democratic Republic of India. He encouraged all activities directed towards the progress and development of the Nation and promotion of communal harmony and maintenance of peace in the country. A good orator, an eminent scholar, a renowned theologian, an able administrator and a man of the Word of God, he had all the qualities needed for a spiritual leader and a good shepherd. With his intelligence, wisdom, love and vision and with his vast experience in various fields he proved himself successful as a skilful ecclesiastical head of an ancient Church. With his devotion and dedication in life and sincerity of purpose, the community at large was benefited by his true Christian life as a servant of God in the service of mankind.
                  </p>
                  <p>
                    He entered into eternal rest on 26 January 2006 and was laid to rest in Mar Elia Chapel, Shastamcotta.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  Quick Facts
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <div>
                    <span className="font-semibold text-syro-blue">Born:</span>
                    <p className="text-sm mt-0.5">30 January 1915, Perinad, Kollam</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">15 May 1953</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">1991–2005</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">26 January 2006</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Mar Elia Chapel, Shastamcotta</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  The Catholicate
                </h3>
                <Link
                  href="/mosc-redesign/catholicate"
                  className="syro-primary-button inline-flex items-center gap-2 w-full justify-center py-1.5 leading-tight hidden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to The Catholicate</span>
                </Link>
                <div className="mt-3 space-y-1.5">
                  {SYRO_CATHOLICATE_SIDEBAR_LINKS.map((item) => {
                    const isActive = item.href === '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara';
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg font-syro-primary text-sm leading-tight outline-none focus:outline-none transition-colors ${
                          isActive ? 'bg-syro-red text-white' : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50'
                        }`}
                      >
                        <span className={`font-syro-display font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                        {item.period ? <p className={`font-syro-primary text-xs font-medium mt-0 mb-0 ${isActive ? '!text-white' : 'text-syro-blue'}`}>{item.period}</p> : null}
                        {item.description ? <p className={`font-syro-primary text-xs leading-tight mt-0 mb-0 ${isActive ? '!text-white' : 'text-[#798daf]'}`}>{item.description}</p> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
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

export default BaseliosMarthomaMathewsIIPage;
