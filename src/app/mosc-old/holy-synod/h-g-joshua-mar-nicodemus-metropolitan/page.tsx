import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H. G. Dr.Joshua Mar Nicodimos Metropolitan',
  description: 'Biography and information about H. G. Dr.Joshua Mar Nicodimos Metropolitan.',
};

const HGJoshuaMarNicodemusMetropolitanPage = () => {
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
                        src="/images/holy-synod/mar-nicodimos.jpg"
                        alt="H. G. Dr.Joshua Mar Nicodimos Metropolitan"
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
                      H. G. Dr.Joshua Mar Nicodimos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was Born on 8th October 1962 as the youngest son of Mr.Philipose Mathai and Mrs.Thankamma Mathai, Sankarathil Nediyavilayil, Kurampala, Pandalam. Home parish is St.Thomas Orthodox Valiyapally Kurampala, Pandalam, in the diocese of Chengannoor. After completing the formal education secured M.A in Sociology from Kerala University. Joined the Orthodox Theological Seminary, Kottayam in 1982 and secured GST and BD degrees. In 1996 S.T.M degree from General Theological Seminary, New York and completed MTh in Spiritual Theology from Indian Institute of Spirituality, Bangalore in 2007. In 1978 joined the Holy Trinity Ashram, Angadi, Ranni founded by H.G.Geevarghese Mar Dioscorus, as its first member. Became Korooyo in 1981 and Yaupadyakno in 1985. He was ordained Full Deacon on 27th April 1986 and Priest on Nov. 1st, 1986 by H.G. Geevarghese Mar Dioscorus Metropolitan. Served as vicar of three parishes in Trivandrum and five parishes in American dioceses from 1987 to 2003. Also served as Secretary to H.G Geevarghese Mar Dioscorus at Trivandrum and H.G Mathews Mar Barnabas Metropolitan at America. He served as Aramana Chaplain at Ulloor, Trivandrum and manager of American Diocese office at NewYork from 1988 to 2003. Upon the demise of Geevarghese Mar Dioscorus Metropolitan, became Superior of the Holy Trinity Ashram in 1999 and continued till 2010. He was elevated as Yoohanon Ramban on 12th December 2003 by H.H. Baselios Marthoma Mathews II The Catholicos. The Malankara Association held at Sasthamkotta on February 17, 2010 elected Yoohanon Ramban as Bishop candidate, and on May 12, 2010 H.H. Baselios Marthoma Didymos I, The Catholicos Consecrated him as Metropolitan with the name Joshua Mar Nicodimos at Mar Elia Cathedral, Kottayam. On August 15,2010 Joshua Mar Nicodimos was appointed as the Ist Metropolitan of the newly formed Nilackal Diocese. On May 18, 2011General Theological Seminary NewYork at its 188th Annual Commencement conferred upon him Doctor of Divinity, honoris causa. In February 2012 Holy Episcopal Synod appointed him as the President of the Akhila Malankara Balasamajam.His Grace is serving the Ranni- Nilackal Diocese as its Metro
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Nilackal Orthodox Diocesan Centre, St.Thomas Aramana, Pazhavangadi. P.O, Ranni, Pathanamthitta- 689-673
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Mob: 9446600671
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: marnicodimos @gmail.com
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

export default HGJoshuaMarNicodemusMetropolitanPage;
