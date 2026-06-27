import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Geevarghese Mar Yulios Metropolitan',
  description: 'His Grace Dr. Geevarghese Mar Yulios, Metropolitan of Kunnamkulam Diocese. President, National Council of Churches in India; President, Orthodox Christian Youth Movement; Ph.D. in Theology of Religions, Friedrich-Alexander University, Erlangen.',
};

const HGDrGeevargheseMarJuliusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Geevarghese Mar Yulios Metropolitan"
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
                  <Image src="/images/holy-synod/yulios.jpg" alt="H.G. Dr. Geevarghese Mar Yulios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Geevarghese Mar Yulios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace Dr. Geevarghese Mar Yulios, Bishop and Metropolitan in the Malankara Orthodox Syrian Church, was born on May 17, 1967, to Late Mr. P. V. Pavu and Mrs. K. V. Anna. He hails from the Pulikkottil Family, Kunnamkulam, and is a member of St. Mathias Parish, Thekke Angaadi, Kunnamkulam. His current residence is the Bishop’s House, Arthat, Kunnamkulam. His Grace was ordained as a sub-deacon on April 27, 1990, at St. Mary’s Church, Arthat, and as a deacon on March 7, 1992, at Arthat Aramana Chapel. He was ordained as a priest (Kassissa) on March 14, 1992, by Paulose Mar Milithios. He was later elevated to the monastic rank (Ramban) on March 21, 2010, by His Holiness Baselios Didymos I at Parumala Seminary Chapel. On May 12, 2010, he was consecrated as a Metropolitan by His Holiness Baselios Didymos I at the Kottayam Mar Elia Cathedral and received the title Pulikkottil Dr. Geevarghese Mar Yulios Metropolitan. His academic path began at St. Joseph’s School, Kunnamkulam, after which he completed a B.Sc. in Mathematics from St. Aloysius College, Elthuruth (affiliated with Calicut University). His theological education includes GST and BD from the Old Seminary, Kottayam, and a Master of Theology (M.Th.) from the Gurukul Lutheran Theological College, Madras (affiliated with Serampore University). He earned his Ph.D. in Theology of Religions from the Friedrich-Alexander University of Erlangen, Germany, and later pursued post-doctoral research at the University of Chicago, USA. He is proficient in German and holds diplomas in Sanskrit, Latin, Greek, and Hebrew. In his pastoral and academic service, His Grace began teaching in 1994 as a Lecturer/Professor of Religion and Philosophy at the Orthodox Theological Seminary, Kottayam, and from 1995 at the St. Thomas Orthodox Theological Seminary, Nagpur. He held several administrative positions including Bursar of the Nagpur Seminary, Registrar of the Divyabodhanam Programme (1995–1997), Programme Secretary of the Sophia Centre for Inter-religious Dialogue and Cultural Studies, Kottayam, Assistant Warden at the Seminary, and Associate Secretary of the Kerala Council of Churches. His Grace has served as vicar in various dioceses including Kunnamkulam, Madras, Kottayam, UK-Europe-Africa, South-West America, and North-East America. From 2010 to 2022, he served as the Metropolitan of the Diocese of Ahmedabad, and since November 2022, he has been the Metropolitan of the Diocese of Kunnamkulam. In his wider ecclesial and academic leadership roles, His Grace serves as President of the National Council of Churches in India, Chairman of the Henry Martyn Institute, Hyderabad, Senior Professor at Serampore College, Research Guide at Martin Luther Christian University, Shillong, and President of the Orthodox Christian Youth Movement (OCYM). His contributions to theological research and interfaith engagement are widely recognized. He is a member of the Association of Professors and Research Scholars in Germany for the Study of Religion and Philosophy since 2002, a Resource Person for Oriental Studies, and has continued to serve in ecumenical roles. Dr. Geevarghese Mar Yulios has authored over 10 publications in the fields of theology, language, and inter-religious dialogue. Notable among them are Mathangalude Sandesham (1995) and Message of the Religions (1995, Revised Edition 2019).
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Bishop&apos;s House, Arthat, Kunnamkulam – 680 521</p>
                        <p>Mobile: 9447383931</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:hgyulios@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          hgyulios@gmail.com
                        </a>
                        {', '}
                        <a
                          href="mailto:mockkmdiocese@yahoo.in"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          mockkmdiocese@yahoo.in
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

export default HGDrGeevargheseMarJuliusMetropolitanPage;
