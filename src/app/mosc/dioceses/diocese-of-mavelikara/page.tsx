import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Mavelikara',
  description: 'Learn about the Diocese of Mavelikara of the Malankara Orthodox Syrian Church.',
};

const dioceseofmavelikaraPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Mavelikara" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/mavelikara_diocese.jpg"
                    alt="Diocese of Mavelikara"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese Of Mavelikara
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Establishment
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese ofÂ Mavelikara came in to existenceÂ on 10th August, 2002 with the decision of the holy Episcopal Synod of Malankara Orthodox Church. Late Lamented H.H.BaseliosMarthoma Mathews II Catholicos formally announced the formation of the Mavelikara diocese of the Malankara Orthodox Churchthrough Kalpana no. 134/2002. His Holiness appointed H.G.Paulose Mar Pachomiosmetropolitan as the first diocesean Metropolitan. The craftsmanship and administrative skills of Mar Pachomios Metropolitan helped the diocese to keep its root fixed for its future growth and development. The priest's and laymen's personal attachment to Pachomios Metropolitan was one of the primary reasons that kept the diocese united in its initial days. Forty-oneparishes and twelve chapels of the dioceses of Kollam, Niranam and Chengannoor, were annexed to the newly formed Mavelikara Diocese. Though the diocese is a newly formed one, it has the rich heritage kept by its ancient churches and communities. The spiritual guidance of H.G. Dr.Geevarghese Mar Osthathios, H.G.Mathews Mar Epiphanios and H.G. Thomas Mar Athanasius to the parishes from their respective dioceses was priceless in formulating the spiritual foundation of the diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Diocesan Center
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The M.S. Seminary,Thazhakkara, Mavelikara was the temporary diocesan office and bishop's residence.Â  In view of having a permanent diocesan office and Aramana,1.22acres of land was purchasedin Thazhakkara villagein 2005. It has all the conveniences of a town with the serenity of a village and isstrategically located in proximity to Saint Mary's Orthodox Cathedral, Puthiyakavu, Mavelikara and the M.S. Seminary Thazhakkara.Under the guidance and leadership of the late lamented H.G.Paulose Mar PachomiosMetropolitan, abeautiful Aramana was constructed in 2008. The newly built Diocesan center, named TheobhavanAramana was consecrated by late H.H.Baselios Marthoma Didymus I Catholicos on 17thOctober, 2008.Along with serving as the residence of the metropolitan and the diocesan office, TheobhavanAramana is designed with a vision to serve multiple needs of the diocese. The diocesan centre consists of a chapel for regular worship, office for spiritual organizations, guest rooms, diocesan council room, conference rooms and quarters for staff and other inmates.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 2018, the diocese purchased a prime land of 57 cents and a building adjacent to the Aramana, for future expansions. The office of the Orthodox Syrian Church Navajothy MOMs charitable society currently functions there.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Administration
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      While administering his pastoral care for the initial growth and development of the diocese H.G. Paulose Mar Pachomios entered into eternal rest on 1stAugust, 2012 and is entombed at Bethany Asram, Ranni - Perunad. H.H.Baselios Paulose II Catholicos took over the charge of the diocesan Metropolitan and administers the diocese. On 10th December 2012, BavaThirumeniappointed Nilackal diocesan Metropolitan H.G.Dr.Joshua Mar Nicodimos as Assistant Metropolitan of the diocese to help His Holiness. From September 20, 2017 H.G.Alexios Mar Eusebius Metropolitan has been appointed as the assistant metropolitan of the diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The metropolitans from time to time are assisted by the diocesan secretaries and diocesan council of the period. Rev.Fr. V.M. Mathai Vilanilam served as the first secretary of the Mavelikara diocese. Rev.Fr.Jacob John Kallada became the second diocesan secretary and served office for the period 2009-2014. He was succeeded by Rev.Fr. Ebey Philip for the period 2014-2019. In 2019 Rev.Fr.Johns Eapenwas elected as the new diocesan secretary and has assumed office from December 21, 2019.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocesan Council consists of Rev. Fr. P. D. Skaria Ponvanibham, Rev. Fr. K. P. Varghese, Sri. Binu Samuel, Sri. Johnson P. Kannanakuzhy, Sri. T. K. Mathai and Sri. S. Thankachan Kollamala gives applaudable support to Metropolitan and Diocesan Secreatary in the administration of the diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Aramana Family
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Rev.Fr.Joykutty Varghese serves as the present Aramana manager. Rev. Fr. Allen S. Mathew serves as the assistant Manager and supervises the agricultural works along with the day to day affairs. The Aramanahas a full-fledgedoffice with Rev.Fr. Dennis Samuel as theManager and principal secretary to the metropolitanand Sri.John Cherianas the accountant. The seminary aspirants reside at the aramana and undergo training with biblical and liturgical orientation under the guidance of the metropolitan. Deacons who completed their theological studies live in the Aramana and serve as secretary to the metropolitan.Â  Metropolitan's driver, a farmer and cook also reside at the Aramana making the family an extended one.Â  Life at the Aramana campus is rich and diverse with a cow and a brood of hens which provide for the needs of Aramana kitchen. The organic farming with a variety of vegetables and fruit trees helps to be self-sufficient to a great extent.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Diocesan Mission
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The mission of the Mavelikkara diocese is to maintain and practice the orthodox faith and thereby enhance the spiritual growth of all members of the diocesan community and to continue as the ambassadors of Christian love to serve humankind and to sustain the creation.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The mission of the diocese is taken up and carried forward by its folk in an appreciable manner. In this they are led by the priests of the diocese. The diocese has five Cor-Episcopas: Very. Rev.P.T. Daniel, Very. Rev.G. Ninan, Very. Rev. P.J. Mathew, Very. Rev. K.L. Mathew Vaidyan and Very. Rev. M.K. Varghese. Fifty four priests serve in the regular active ministry. The senior retired priests always enrich the diocese with their spiritual advice and experienced guidance. The diocese now has ten students who are undergoing priestly training in the Orthodox Theological Seminary.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The parishes of the diocese are of diverse socio-economic backgrounds, yet keep the same Christian spirit. Forty-one churches of the diocese extend from Kottampally to Kuttemperoor, and from Chunakkara to Mathirampally all of which are admirable examples of Christian witness.The diocese has sixteen chapels under its parishes. Among them five chapels have Holy Qurbana on every Sundays and the rest on alternative Sundays and on special occasions.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Along with the parishes M.S.Seminary Chapel founded by H.B.Pulikottil Joseph Mar Dionysius V, and St. Paul's M.T.C Chapel blessed by the tomb of H.G. Dr. Geevarghese Mar Osthathios Metropolitanserves to fulfill the liturgical and spiritual requirements of believers. CheppadSt.GeorgeValiyapalli, with the tomb of Philippose Mar Dionysius IV malankara metropolitan, KarthikapallySt.Thomas Cathedral with its ancient design and collection of ancient manuscripts, PuthiyakavuSt.Mary's Cathedral and KayamkulamKadeesa Cathedral with their traditions of centuries are among the ancient parishes of Malankara Orthodox Church.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The diocese manifests its Christian responsibility and services to the societythrough various means:
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Premarital counselling conducted on alternative Saturdays under experienced resource persons has proved to be fruitful to the young generation. The spiritual organizations for Youth, Women, Children and Students are active in enriching the spiritual life of the parishes and believers. The Sunday School, Balasamajam, M.G.O.C.S.M, Orthodox Christian Youth Movement, Martha Mariam Vanitha Samajam, Navajyothi MOMs, Suvushesha Sangam, PrarthanaYogam, Divyabodhanam, Sushrushaka Sangam, Bodhanam internal mission of the diocese are functioning in an exemplary manner under the active and dedicated leadership ofrespective vice presidents and other office bearers.The MDM School of Liturgical Music under the guidance of Fr. Joice V. Joy imparts training for liturgical and devotional music to our aspiring choir singers.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Along with the spiritual organizations, the departments of Human Resource and the Ecology, the Prison Ministry and evangelism, the diocese extends its services to the community and thereby accomplishes its social commitment.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      All parishes under the diocese are urged to promote and implement Eco- friendly practices in order to protect our natural environment.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Theo Bhavan, Thazhakara P.O,
                        <br />
                        Mavelikara - 690 102
                      </p>
                      <p>
                        <span className="font-semibold">Ph:</span> (O) 0479 2309900
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:marpachomios@gmail.com" className="text-syro-red hover:underline font-medium">marpachomios@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://share.google/KFuhxKZGb9NPAskrr"
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

export default dioceseofmavelikaraPage;