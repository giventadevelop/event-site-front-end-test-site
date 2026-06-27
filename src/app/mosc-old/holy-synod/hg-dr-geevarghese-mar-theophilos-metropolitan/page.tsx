import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Geevarghese Mar Theophilos Metropolitan',
  description: 'Biography and information about H.G. Dr. Geevarghese Mar Theophilos Metropolitan.',
};

const HgDrGeevargheseMarTheophilosMetropolitanPage = () => {
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
                        src="/images/holy-synod/Dr-Geevarghese-Mar-Theophilos.png"
                        alt="H.G. Dr. Geevarghese Mar Theophilos Metropolitan"
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
                      H.G. Dr. Geevarghese Mar Theophilos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Born as the son of Mr. P. C. Joshua and Mrs. P. C. Marykutty in Kizhakkemannil House, Chenneerkkara, Thumpamon on 8 th August 1971, His Grace belongs to the parish St Mary\'s Kadeeshtha Orthodox Church, Thumpamon North under Thumpamon diocese. His Grace completed his school education from SNDP HS Chenneerkkara (1985), following which he completed graduation programme in History (91-94) from Karyavattom campus, Kerala University. H. G. also did his Postgraduation in Syriac language from MG University, Kottayam. After passing GST as well as BD (1997-2001) at Old Seminary, Kottayam , he later completed M.Th. in Eary Christian Teachers (Patristics) from FFRRC Kottayam, MA in Christian Theology from St. Mary’s University, Baltimore (USA), and PhD in Liturgical Theology from Dharmaram Vidya Kshetram, Bengaluru in 2016. He was ordained sub-deaconship on June 2, 2001, by H.G. Geevarghese Mar Ivanios Metropolitan at Orthodox Theological Seminary, Kottayam. He was ordained deaconship on 16th March 2022 at Mar Baselios Dayara, Njaliyakuzhi, and priesthood in 2th May 2002 at St. Mary\'s Kadeeshtha Orthodox Church Thumpamon North. He was chosen as the Metropolitan in the Malankara Syrian Christian Association held on 25 th February 2022 at Kolencherry. He received the status of Ramban at the Parumala Seminary on 2 nd June 2022. He was ordained as Metropolitan by the name ‘Mar Theophilos’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 th July 2022. H.G. has taken charge of Ahmedabad diocese since 3 rd November 2022. H. G. has authored seven books including Church as the Bride of Christ: Ecclesiastical & Societal Understanding of the Early Syriac Church Based on Select Homilies of Mar Jacob of Serugh, Book of Common Prayer (English translation of Pampakuda Namaskaram ), Promion and Sedre of Three Days\' and Forty Days\' Lent (English Translation), Two Commenteries of Jacobite Liturgy (Rr-produced with Syriac text in West Syriac Script), Jeevante Vachanam ( Sermons for the Liturgical Year), Marubhoomiyile uravakal (Translation of Early Church Fathers), Vishudha Rehasyangal (Malayalam translations four Interpretations of Holy Litury).
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: St.Marys Higher Secondary School Campus, Naroda, Ahmedabad, Gujarat.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: +91 9496591151
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: geevarghesetheophilos@gmail.com
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

export default HgDrGeevargheseMarTheophilosMetropolitanPage;
