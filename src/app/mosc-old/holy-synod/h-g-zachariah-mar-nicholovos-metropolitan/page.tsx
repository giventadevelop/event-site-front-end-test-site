import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Zachariah Mar Nicholovos Metropolitan',
  description: 'Biography and information about H.G. Zachariah Mar Nicholovos Metropolitan.',
};

const HGZachariahMarNicholovosMetropolitanPage = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden sacred-shadow-lg">
                      <Image
                        src="/images/holy-synod/nico.png"
                        alt="H.G. Zachariah Mar Nicholovos Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H.G. Zachariah Mar Nicholovos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace, Metropolitan Zachariah Mar Nicholovos was born on August 13, 1959 to the famous Poothicote family in Mepral. His boyhood name was Cheriyachen, and was the fourth of five children. Much of his spiritual upbringing centered around his home parish, Saint John\'s Orthodox Church in Mepral, Kerala, India. It is at this church, His Grace Thoma Mar Dionysius, Metropolitan of Niranam Diocese, called young Cheriyachen to the service of the Holy Altar at the young age of 9. This initiated a strong interest in aspects of Orthodox spirituality, and the overall life of the Church. Not only was he blessed to spend time with Metropolitan Thoma Mar Dionysius of Blessed Memory, but also with spiritual giants like His Grace, Metropolitan Thomas Mar Thimithios (later His Holiness Catholicos Didymus I of Blessed Memory), and famous convention speaker, and retreat father, Reverend Father M. V. George (later Metropolitan Dr. Geevarghese Mar Osthathios of Blessed Memory). Seeing the spark for his keen interest in the life of the Church, his uncle, Reverend Father George Kurian (later Metropolitan Kuriakose Mar Coorilose) began mentoring him. Upon finishing his high school education, he enrolled in Malabar Christian College for his undergraduate education. Later, he moved with his family where he completed his Bachelors in Arts, (English) from Saint Joseph College, in Calicut After successfully completing his undergraduate studies, he joined United Theological College in Bangalore, India where he completed his Bachelor of Divinity, and his Master of Theology degree. His uncle and mentor, Metropolitan Kuriakose Mar Coorilose ordained him to the Holy Diaconate on January 4th, 1986 and to the Priesthood on May 16, 1990 at his home parish St. John\'s Church, Mepral. As a priest, he served parishes in the Diocese of Kandanad, as the Ecumenical Secretary of the Malankara Syrian Orthodox Church, and taught as a professor at the Malankara Syrian Seminary at Mulanthuruthy, until he was called to be consecrated to the holy episcopacy. On August 5, 1993, the eve of the Feast of the Transfiguration of our Lord, His Beatitude Mar Baselios Paulose II tonsured him as a monk at Saint Thomas Orthodox Cathedral, in Moovattupuzha, Kerala, India. On the Feast of the Falling Asleep of Saint Mary, the Mother of God, His Holiness Moran Mar Ignatius Zakka Iwas I, Patriarch of the Syriac Orthodox Church, consecrated him as Metropolitan on August 15, 1993. In 2002, His Holiness Moran Mar Baselios Marthoma Mathews II appointed Metropolitan Mar Nicholovos as the Assistant Metropolitan of the American Diocese, which was led by His Grace Mathews Mar Barnabas, Metropolitan of Blessed Memory. Later, in April 2009, after the American Diocese was divided, His Grace Mar Nicholovos continued assisting Metropolitan Mar Barnabas until his retirement in January 2011. On February 26, 2011, His Holiness Moran Mar Baselios Marthoma Paulose II, Catholicos of the East & Malankara Metropolitan appointed Metropolitan Zachariah Mar Nicholovos as the ruling Metropolitan of the Northeast American Diocese and was later enthroned on May 21, 2011. In addition to Metropolitan Nicholovos\' responsibilities to his Diocese, His Grace functions in various capacities which impact the Malankara Church, the Northeast American Diocese, and the greater ecumenical world: • Vice President of the Department of Ecumenical Relations of the Malankara Orthodox Syrian Church • Working Committee & Executive Committee Member to the World Council of Churches (WCC) - Member of the Permanent Commission on Consensus & Collaboration of the WCC • Governing Board member of the National Council of Churches in the United States (NCCUSA) • Member of the Board of Trustees of Saint Vladimir\'s Orthodox Theological Seminary • Former Member of the Board of Directors for Church World Services (CWS)
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Diocesan Chancery, 2158 Route 106, Muttontown, NY 11791
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Phone Office: 001(718) 470 9844
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Web site: www.neamericandiocese.org
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: Metropolitan@neamericandiocese.org Facebook: https://www.facebook.com/Nicholovos Instagram: https://www.instagram.com/nicholovosthirumeni/
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Web: www.neamericandiocese.org (http://www.neamericandiocese.org)
                        </p>
                      </div>
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
            <div className="lg:col-span-1">
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
