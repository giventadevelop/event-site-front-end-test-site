import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Diascoros Metropolitan',
  description: 'His Grace Dr. Yuhanon Mar Diascoros, Metropolitan of Kottayam Diocese. Professor and Dean of Studies, Orthodox Theological Seminary; Chief Editor of Malankara Sabha Monthly.',
};

const HGDrYuhanonMarDioscorosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Yuhanon Mar Diascoros Metropolitan"
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
                  <Image src="/images/holy-synod/pani.jpg" alt="H.G. Dr. Yuhanon Mar Diascoros Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Yuhanon Mar Diascoros Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born in Kallarackal Kaleelil family on 28 May 1964 as the son of Mr. P. T. Mathunny Panicker & Mrs. Kunjamma Panicker. He is a member of St. Thomas Orthodox Valiyapally, Kundara. He obtained his B.Sc degree from Kerala University(1984), theological diploma (GST) from Orthodox Seminary, Kottayam, Bachelor of Divinity (B.D) from Serampore University (1988), Master of Theology (1991) and Doctor of Theology (1995) from the Pontifical Oriental Institute in Rome. He also holds a certificate in Pastoral Counselling from Glasgow University, Scotland (1997). He was ordained as Sub-deacon on 13 June 1987 and Deacon on 15 May 1989 and on 3 June 1989 he was ordained to the Holy priesthood by the late H.G. Geevarghese Mar Dioscorus, Metropolitan of Trivandrum Diocese. He was the director of Holy Trinity Centre for Disabled Children, Trivandrum(1990-91), Professor and Registrar of the Holy Trinity Theological College, Addis Ababa of the Ethiopian Orthodox Church (1994-1997), and the Programme Secretary, Sophia Centre, Kottayam (1997-2006). He served as the vicar of Sreekaryam Mar Baselios Gregorios, TVM (1989-90), Makkulam St. George, TVM (1997-2000), Narickal St. Mary’s, TVM (2000-03), Valakam Mar Gregorios, TVM (2003-06), Koorthamala St. Mary’s, Chengannoor (Asst. Vicar, 1998-02), Kurichimuttom St. Stephen’s, Chengannoor (Vicar, 2002-04) Pullad St. George, Chengannoor (2004-06) and now serving as the Chaplain of Old Seminary, Kottayam and the Vicar of Kundara Kadeestha, TVM, from 2006 onwards.He is currently the Professor and Dean of Studies of Orthodox Theological Seminary, Kottayam, Registrar of Divyabodhanam-the laity theological training programme of the Church, Joint Secretary of St. Thomas Orthodox Vaidika Sanghom, Chief Editor of Malankara Sabha Monthly, Publisher of Purohithan Quarterly, Editorial Board Member of Bethel Pathrika, Editorial Board Member of St. Ephrem Theological Journal, (Satna), Executive Committee Member of TLC, Thiruvalla, Member of the Joint International Dialogue between Roman Catholic Church and Malankara Orthodox Syrian Church. He has authored five books and numerous articles and a good preacher, teacher and a retreat father. The Malankara Syrian Christian Association met on 11 Sep 2008 at Pampakuda elected him as bishop along with six others. On 4 Dec 2008 His Holiness Baselios Marthoma Didymos I professed him as Ramban. On 19 February 2009 he was ordained as bishop by H.H. Baselios Marthoma Didymos I, at St. George Orthodox Church, Puthupally. His Grace is serving the Kottayam Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Mar Kuriakose Dayara, Pothenpuram P.O., Pampady, Kottayam Dist., Kerala, India – 686 502</p>
                        <p>Tel: 0481 2505431 | Mobile: 09791020730</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:mardiascoros@yahoo.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          mardiascoros@yahoo.com
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

export default HGDrYuhanonMarDioscorosMetropolitanPage;
