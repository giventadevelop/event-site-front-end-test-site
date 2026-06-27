import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Diascoros Metropolitan',
  description: 'Biography and information about H.G. Dr. Yuhanon Mar Diascoros Metropolitan.',
};

const HGDrYuhanonMarDioscorosMetropolitanPage = () => {
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
                        src="/images/holy-synod/pani.jpg"
                        alt="H.G. Dr. Yuhanon Mar Diascoros Metropolitan"
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
                      H.G. Dr. Yuhanon Mar Diascoros Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born in Kallarackal Kaleelil family on 28 May 1964 as the son of Mr. P. T. Mathunny Panicker & Mrs. Kunjamma Panicker. He is a member of St. Thomas Orthodox Valiyapally, Kundara. He obtained his B.Sc degree from Kerala University(1984), theological diploma (GST) from Orthodox Seminary, Kottayam, Bachelor of Divinity (B.D) from Serampore University (1988), Master of Theology (1991) and Doctor of Theology (1995) from the Pontifical Oriental Institute in Rome. He also holds a certificate in Pastoral Counselling from Glasgow University, Scotland (1997). He was ordained as Sub-deacon on 13 June 1987 and Deacon on 15 May 1989 and on 3 June 1989 he was ordained to the Holy priesthood by the late H.G. Geevarghese Mar Dioscorus, Metropolitan of Trivandrum Diocese. He was the director of Holy Trinity Centre for Disabled Children, Trivandrum(1990-91), Professor and Registrar of the Holy Trinity Theological College, Addis Ababa of the Ethiopean Orthodox Church (1994-1997), and the Programme Secretary, Sophia Centre, Kottayam (1997-2006). He served as the vicar of Sreekaryam Mar Baselios Gregorios, TVM (1989-90), Makkulam St. George, TVM (1997-2000), Narickal St. Mary’s, TVM (2000-03), Valakam Mar Gregorios, TVM (2003-06), Koorthamala St. Mary’s, Chengannoor (Asst. Vicar, 1998-02), Kurichimuttom St. Stephen’s, Chengannoor (Vicar, 2002-04) Pullad St. George, Chengannoor (2004-06) and now serving a the Chaplain of Old Seminary, Kottayam and the Vicar of Kundara Kadeestha, TVM, from 2006 onwards.He is currently the Professor and Dean of Studies of Orthodox Theological Seminary, Kottayam, Registrar of Divyabodhanam-the laity theological training programme of the Church, Joint Secretary of St. Thomas Orthodox Vaidika Sanghom, Chief Editor of Malankara Sabha Monthly, Publisher of Purohithan Quarterly, Editorial Board Member of Bethel Pathrika, Editorial Board Member of St. Ephrem Theological Journal, (Satna), Executive Committee Member of TLC, Thiruvalla, Member of the Joint International Dialogue between Roman Catholic Church and Malankara Orthodox Syrian Church. He has authored five books and numerous articles and a good preacher, teacher and a retreat father. The Malankara Syrian Christian Association met on 11 Sep 2008 at Pampakuda elected him as the bsihop along with six others. On 4 Dec 2008 His Holiness Baselius Marthoma Didymus I professed him as Ramban. On 19 feb 2009 he was ordained as bishop by H.H.Baselius Marthoma Didymus I, at St. George Orthodox Church, Puthupally. His Grace is serving the Kottayam Diocese as its Metropolitan
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He was ordained as Sub-deacon on 13 June 1987 and Deacon on 15 May 1989 and on 3 June 1989 he was ordained to the Holy priesthood by the late H.G. Geevarghese Mar Dioscorus, Metropolitan of Trivandrum Diocese. He was the director of Holy Trinity Centre for Disabled Children, Trivandrum(1990-91), Professor and Registrar of the Holy Trinity Theological College, Addis Ababa of the Ethiopean Orthodox Church (1994-1997), and the Programme Secretary, Sophia Centre, Kottayam (1997-2006).
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He served as the vicar of Sreekaryam Mar Baselios Gregorios, TVM (1989-90), Makkulam St. George, TVM (1997-2000), Narickal St. Mary’s, TVM (2000-03), Valakam Mar Gregorios, TVM (2003-06), Koorthamala St. Mary’s, Chengannoor (Asst. Vicar, 1998-02), Kurichimuttom St. Stephen’s, Chengannoor (Vicar, 2002-04) Pullad St. George, Chengannoor (2004-06) and now serving a the Chaplain of Old Seminary, Kottayam and the Vicar of Kundara Kadeestha, TVM, from 2006 onwards.He is currently the Professor and Dean of Studies of Orthodox Theological Seminary, Kottayam, Registrar of Divyabodhanam-the laity theological training programme of the Church, Joint Secretary of St. Thomas Orthodox Vaidika Sanghom, Chief Editor of Malankara Sabha Monthly, Publisher of Purohithan Quarterly, Editorial Board Member of Bethel Pathrika, Editorial Board Member of St. Ephrem Theological Journal, (Satna), Executive Committee Member of TLC, Thiruvalla, Member of the Joint International Dialogue between Roman Catholic Church and Malankara Orthodox Syrian Church. He has authored five books and numerous articles and a good preacher, teacher and a retreat father.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        The Malankara Syrian Christian Association met on 11 Sep 2008 at Pampakuda elected him as the bsihop along with six others. On 4 Dec 2008 His Holiness Baselius Marthoma Didymus I professed him as Ramban. On 19 feb 2009 he was ordained as bishop by H.H.Baselius Marthoma Didymus I, at St. George Orthodox Church, Puthupally.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace is serving the Kottayam Diocese as its Metropolitan
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Mar Kuriakose Dayara, Pothenpuram P O, Pampady, Kottayam Dist, Kerala, India - 686502 : 0481 2505431
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address Mar Kuriakose Dayara, Pothenpuram P O, Pampady, Kottayam Dist, Kerala, India - 686502: 0481 2505431
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob ile:09791020730 E-mail: mardiascoros@yahoo.com
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

export default HGDrYuhanonMarDioscorosMetropolitanPage;
