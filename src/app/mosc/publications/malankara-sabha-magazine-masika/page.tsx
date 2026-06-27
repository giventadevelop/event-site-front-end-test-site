import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import PublicationsSidebar from '../components/PublicationsSidebar';

export const metadata: Metadata = {
  title: 'Malankara Sabha Magazine (Masika) | Publications | MOSC',
  description: 'The official monthly magazine of the Malankara Orthodox Syrian Church, published since 1946 from the Catholicate Palace of Devalokam. Subscribe and contact the editorial board.',
};

export default function MalankaraSabhaMagazinePage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Malankara Sabha Magazine (Masika)" breadcrumbFrom="publications" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/publications/mal.jpg"
                    alt="Malankara Sabha Magazine (Masika)"
                    width={175}
                    height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    On August 8th 1946, due to the dedicated conviction and enthusiasm of H.H. Baselius Geevarghese II Catholicos of Blessed memory, the Magazine was published from the Catholicate Palace of Devalokam.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Very Rev. M.C. Kuriakose Ramban of Blessed memory was the first chief editor. From January 1968 to February 1969 &quot;Malankara Sabha&quot; was published as a biweekly. At present, this is a monthly published Magazine and it is the official organ of the Indian Orthodox Church.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-10">
                    Editorial Board
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The editorial board appointed by the Holy Episcopal Synod of the Church oversees the administration and growth of the Magazine. At present, the editorial board includes H.G Dr Yuhanon Mar Diascoros Metropolitan (President), Fr Zachariah Thomas Puthupally (Chief Editor), Fr. Thomas Raju Karuvatta (Managing -Editor), Fr.Alex Thomas Nazhoorimattathil ( Sub- Editor)
                  </p>
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    Editorial Board Members
                  </h3>
                  <ul className="space-y-2 font-syro-primary text-syro-dark-gray mb-8">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>Fr dr Bijesh Philip</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>Fr. Thomas Varghese chavadiyil</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>Adv Biju Oommen</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>Dr Thomas Kuruvila</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>Alexin George IPoS</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>Merlin T Mathew</span>
                    </li>
                  </ul>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-10">
                    Subscribe and Contact
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The magazine is published on the 10th of every month. In order to subscribe for the magazine and for other information, contact:
                  </p>
                  <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red mb-8">
                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                      The Managing Editor
                    </h3>
                    <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                      <p><strong>Malankara Sabha Monthly</strong></p>
                      <p>Devalokam P.O</p>
                      <p>Kottayam – 686 038</p>
                      <p><strong>Tel.:</strong> 0481-2573234</p>
                      <div className="mt-6 pt-4 border-t border-syro-table-border">
                        <p className="mb-2"><strong>Email:</strong></p>
                        <p>
                          <a
                            href="mailto:malankarasabha1946@gmail.com"
                            className="text-syro-red hover:underline transition-all duration-300"
                          >
                            malankarasabha1946@gmail.com
                          </a>
                        </p>
                        <p>
                          <a
                            href="mailto:sabhamasika@yahoo.com"
                            className="text-syro-red hover:underline transition-all duration-300"
                          >
                            sabhamasika@yahoo.com
                          </a>
                        </p>
                      </div>
                      <div className="mt-4">
                        <p className="mb-2"><strong>Website:</strong></p>
                        <a
                          href="http://www.malankarasabhaonline.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-syro-red hover:underline transition-all duration-300"
                        >
                          www.malankarasabhaonline.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <PublicationsSidebar currentSlug="malankara-sabha-magazine-masika" />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}
