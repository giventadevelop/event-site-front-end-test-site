import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Geevarghese Mar Theophilos Metropolitan',
  description: 'His Grace Dr. Geevarghese Mar Theophilos, Metropolitan of Ahmedabad diocese. PhD Liturgical Theology, M.Th. Patristics; author of seven books; ordained Metropolitan 2022.',
};

const HgDrGeevargheseMarTheophilosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Geevarghese Mar Theophilos Metropolitan"
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
                  <Image src="/images/holy-synod/Dr-Geevarghese-Mar-Theophilos.png" alt="H.G. Dr. Geevarghese Mar Theophilos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Geevarghese Mar Theophilos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Born as the son of Mr. P. C. Joshua and Mrs. P. C. Marykutty in Kizhakkemannil House, Chenneerkkara, Thumpamon on 8 August 1971, His Grace belongs to the parish St Mary\'s Kadeeshtha Orthodox Church, Thumpamon North under Thumpamon diocese. His Grace completed his school education from SNDP HS Chenneerkkara (1985), following which he completed graduation programme in History (91-94) from Karyavattom campus, Kerala University. H. G. also did his Postgraduation in Syriac language from MG University, Kottayam. After passing GST as well as BD (1997-2001) at Old Seminary, Kottayam, he later completed M.Th. in Early Christian Teachers (Patristics) from FFRRC Kottayam, MA in Christian Theology from St. Mary’s University, Baltimore (USA), and PhD in Liturgical Theology from Dharmaram Vidya Kshetram, Bengaluru in 2016. He was ordained sub-deaconship on June 2, 2001, by H.G. Geevarghese Mar Ivanios Metropolitan at Orthodox Theological Seminary, Kottayam. He was ordained deaconship on 16th March 2022 at Mar Baselios Dayara, Njaliyakuzhi, and priesthood on 2 May 2002 at St. Mary\'s Kadeeshtha Orthodox Church Thumpamon North. He was chosen as the Metropolitan in the Malankara Syrian Christian Association held on 25 February 2022 at Kolencherry. He received the status of Ramban at the Parumala Seminary on 2 June 2022. He was ordained as Metropolitan by the name ‘Mar Theophilos’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 July 2022. H.G. has taken charge of Ahmedabad diocese since 3 November 2022. H. G. has authored seven books including Church as the Bride of Christ: Ecclesiastical & Societal Understanding of the Early Syriac Church Based on Select Homilies of Mar Jacob of Serugh, Book of Common Prayer (English translation of Pampakuda Namaskaram ), Promion and Sedre of Three Days\' and Forty Days\' Lent (English Translation), Two Commenteries of Jacobite Liturgy (Reproduced with Syriac text in West Syriac Script), Jeevante Vachanam ( Sermons for the Liturgical Year), Marubhoomiyile uravakal (Translation of Early Church Fathers), Vishudha Rehasyangal (Malayalam translations four Interpretations of Holy Liturgy).
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>St. Mary&apos;s Higher Secondary School Campus, Naroda, Ahmedabad, Gujarat</p>
                        <p>Mobile: +91 9496591151</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:geevarghesetheophilos@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          geevarghesetheophilos@gmail.com
                        </a>
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

export default HgDrGeevargheseMarTheophilosMetropolitanPage;
