import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Geevarghese Mar Yulios Metropolitan',
  description: 'Biography and information about H.G. Dr. Geevarghese Mar Yulios Metropolitan.',
};

const HGDrGeevargheseMarJuliusMetropolitanPage = () => {
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
                        src="/images/holy-synod/yulios.jpg"
                        alt="H.G. Dr. Geevarghese Mar Yulios Metropolitan"
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
                      H.G. Dr. Geevarghese Mar Yulios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace Dr. Geevarghese Mar Yulios, Bishop and Metropolitan in the Malankara Orthodox Syrian Church, was born on May 17, 1967, to Late Mr. P. V. Pavu and Mrs. K. V. Anna. He hails from the Pulikkottil Family, Kunnamkulam, and is a member of St. Mathias Parish, Thekke Angaadi, Kunnamkulam. His current residence is the Bishop’s House, Arthat, Kunnamkulam. His Grace was ordained as a sub-deacon on April 27, 1990, at St. Mary’s Church, Arthat, and as a deacon on March 7, 1992, at Arthat Aramana Chapel. He was ordained as a priest (Kassissa) on March 14, 1992, by Paulose Mar Milithios. He was later elevated to the monastic rank (Ramban) on March 21, 2010, by His Holiness Baselios Didymos I at Parumala Seminary Chapel. On May 12, 2010, he was consecrated as a Metropolitan by His Holiness Baselios Didymos I at the Kottayam Mar Elia Cathedral and received the title Pulikkottil Dr. Geevarghese Mar Yulios Metropolitan. His academic path began at St. Joseph’s School, Kunnamkulam, after which he completed a B.Sc. in Mathematics from St. Aloysius College, Elthuruth (affiliated with Calicut University). His theological education includes GST and BD from the Old Seminary, Kottayam, and a Master of Theology (M.Th.) from the Gurukul Lutheran Theological College, Madras (affiliated with Serampore University). He earned his Ph.D. in Theology of Religions from the Friedrich-Alexander University of Erlangen, Germany, and later pursued post-doctoral research at the University of Chicago, USA. He is proficient in German and holds diplomas in Sanskrit, Latin, Greek, and Hebrew. In his pastoral and academic service, His Grace began teaching in 1994 as a Lecturer/Professor of Religion and Philosophy at the Orthodox Theological Seminary, Kottayam, and from 1995 at the St. Thomas Orthodox Theological Seminary, Nagpur. He held several administrative positions including Bursar of the Nagpur Seminary, Registrar of the Divyabodhanam Programme (1995–1997), Programme Secretary of the Sophia Centre for Inter-religious Dialogue and Cultural Studies, Kottayam, Assistant Warden at the Seminary, and Associate Secretary of the Kerala Council of Churches. His Grace has served as vicar in various dioceses including Kunnamkulam, Madras, Kottayam, UK-Europe-Africa, South-West America, and North-East America. From 2010 to 2022, he served as the Metropolitan of the Diocese of Ahmedabad, and since November 2022, he has been the Metropolitan of the Diocese of Kunnamkulam. In his wider ecclesial and academic leadership roles, His Grace serves as President of the National Council of Churches in India, Chairman of the Henry Martyn Institute, Hyderabad, Senior Professor at Serampore College, Research Guide at Martin Luther Christian University, Shillong, and President of the Orthodox Christian Youth Movement (OCYM). His contributions to theological research and interfaith engagement are widely recognized. He is a member of the Association of Professors and Research Scholars in Germany for the Study of Religion and Philosophy since 2002, a Resource Person for Oriental Studies, and has continued to serve in ecumenical roles. Dr. Geevarghese Mar Yulios has authored over 10 publications in the fields of theology, language, and inter-religious dialogue. Notable among them are Mathangalude Sandesham (1995) and Message of the Religions (1995, Revised Edition 2019).
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        H.G. Dr. Geevarghese Mar Yulios served as the Metropolitan of Ahmedabad Diocese from 2010 to 2022. From 2022 November onwards, His Grace is serving as the Metropolitan of the Kunnamkulam Diocese.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Bishop\'s House, Arthat, Kunnamkulam - 680 521
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Ph: 9447383931
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: hgyulios@gmail.com, mockkmdiocese@yahoo.in
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

export default HGDrGeevargheseMarJuliusMetropolitanPage;
