import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Bangalore',
  description: 'Learn about the Diocese of Bangalore of the Malankara Orthodox Syrian Church.',
};

const dioceseofbangalorePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Bangalore" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-bangalore.jpg"
                    alt="Diocese of Bangalore"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Bangalore
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Dioceses in the history of the Malankara Orthodox Syrian Church, were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H.Patriarch Mar Peter III divided the Malankara Church into seven Dioceses. In 1938, Diocese for outside Kerala (Bahya Kerala Bhadrasanam) was formed and in 1976 the outside Kerala Diocese was divided into three, namely Bombay, Madras and Delhi dioceses. The present Calcutta Diocese was included in Madras Diocese and late lamented Dr. Stephanos Mar Theodosius was the first Diocesan Metropolitan. In 1979, Calcutta was further detached and formed as a separate diocese and the present Bangalore Diocese remained part of the Madras Diocese till 2009. Late lamented Zachariah Mar Dionysius was the diocesan Metropolitan until his solemn demise in 1997. In the same year H.G. Dr. Yakob Mar Irenios took over the charge of leading the Madras Diocese till the formation of the new Bangalore Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Bangalore Diocese came into existence on 1st April 2009. All the Orthodox churches in Karnataka, Andhra Pradesh, two churches and a congregation from the Gulf region were constituent churches in the new diocese(32 churches and a congregation). The Diocese was under the direct administration of the Catholicose and Malankara Metropolitan. His Holiness was assisted by H.G. Abraham Mar Epiphanios, the Metropolitan of Sultan Battery Diocese as the assistant Metropolitan of Bangalore Diocese. H.G. Abraham Mar Epiphanios was in charge of the Bangalore Diocese till the newly appointed Metropolitan H.G. Dr. Abraham Mar Seraphim assumed charge of the Diocese on 15th August 2010. Dr. Abraham Mar Seraphim, the youngest of the newly elected 7 Bishops of the Malankara Orthodox Church, assumed the office with full independent charge of the Diocese. Later in 2010 itself the church authority reorganized the churches of Bangalore, Malabar and Sultan Battery Dioceses and formed the new Brahmavar Diocese.Ten parishes of Bangalore Diocese from Brahmavar - Mangalore region were included in the new diocese. Bangalore Diocese now has 21 parishes and a congregation spread across the states of Karnataka & Andhra Pradesh and 3 cities in the UAE, namely; Fujairah, Dibba and Rasâ€“al-Khaima (RAK) in the UAE and has about 4000 families as its members. 23 priests, including 6 Cor-Episcopoi are serving in the Diocese. 2 Deacons and 3 brothers are pursuing their studies in the two Seminaries of our Church, representing Bangalore Diocese. The Diocese has two Mission Projects one at Eluru of Andhra Pradesh and the other at Bilikere in Mysore. These are homes for mentally challenged and physically handicapped children who need complete help and support for their daily activities.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Bangalore Diocese though in its early stages has ambitious overall development plans, to establish and reinforce The Orthodox Church's glorious identity in and around Bangalore taking advantage of the geographical location in this Silicon Valley of India. It needs to create a lot of infrastructure of its own, besides funding for its development.The Diocesan General Body has formed a Diocesan Development Committee under the chairmanship of the Diocesan Metropolitan. The Committee under his able leadership has carved robust plans for the overall development of the Diocese. The Diocesan Metropolitan has earnestly requested each member of our Diocese to contribute one month's family income with the objective to create a corpus. H.H. Baselios Marthoma Paulose II, the Catholicose the East and Malankara Metropolitan inaugurated the fund raising drive on 27th March 2011.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Bishop's House, No. 1, Malankara DV, Behind Sharma Farm House, Doddagubi, Bangalore-560077
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Ph: 09611353977
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email: Â moc.bangalorediocese@gmail.com
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Website :http://www.bangaloreorthodoxdiocese.org/
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Dioceses in the history of the Malankara Orthodox Syrian Church, were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H.Patriarch Mar Peter III divided the Malankara Church into seven Dioceses. In 1938, Diocese for outside Kerala (Bahya Kerala Bhadrasanam) was formed and in 1976 the outside Kerala Diocese was divided into three, namely Bombay, Madras and Delhi dioceses. The present Calcutta Diocese was included in Madras Diocese and late lamented Dr. Stephanos Mar Theodosius was the first Diocesan Metropolitan. In 1979, Calcutta was further detached and formed as a separate diocese and the present Bangalore Diocese remained part of the Madras Diocese till 2009. Late lamented Zachariah Mar Dionysius was the diocesan Metropolitan until his solemn demise in 1997. In the same year H.G. Dr. Yakob Mar Irenios took over the charge of leading the Madras Diocese till the formation of the new Bangalore Diocese. The Bangalore Diocese came into existence on 1st April 2009. All the Orthodox churches in Karnataka, Andhra Pradesh, two churches and a congregation from the Gulf region were constituent churches in the new diocese(32 churches and a congregation). The Diocese was under the direct administration of the Catholicose and Malankara Metropolitan. His Holiness was assisted by H.G. Abraham Mar Epiphanios, the Metropolitan of Sultan Battery Diocese as the assistant Metropolitan of Bangalore Diocese. H.G. Abraham Mar Epiphanios was in charge of the Bangalore Diocese till the newly appointed Metropolitan H.G. Dr. Abraham Mar Seraphim assumed charge of the Diocese on 15th August 2010. Dr. Abraham Mar Seraphim, the youngest of the newly elected 7 Bishops of the Malankara Orthodox Church, assumed the office with full independent charge of the Diocese. Later in 2010 itself the church authority reorganized the churches of Bangalore, Malabar and Sultan Battery Dioceses and formed the new Brahmavar Diocese.Ten parishes of Bangalore Diocese from Brahmavar - Mangalore region were included in the new diocese. Bangalore Diocese now has 21 parishes and a congregation spread across the states of Karnataka &amp; Andhra Pradesh and 3 cities in the UAE, namely; Fujairah, Dibba and Rasâ€“al-Khaima (RAK) in the UAE and has about 4000 families as its members. 23 priests, including 6 Cor-Episcopoi are serving in the Diocese. 2 Deacons and 3 brothers are pursuing their studies in the two Seminaries of our Church, representing Bangalore Diocese. The Diocese has two Mission Projects one at Eluru of Andhra Pradesh and the other at Bilikere in Mysore. These are homes for mentally challenged and physically handicapped children who need complete help and support for their daily activities. Bangalore Diocese though in its early stages has ambitious overall development plans, to establish and reinforce The Orthodox Church's glorious identity in and around Bangalore taking advantage of the geographical location in this Silicon Valley of India. It needs to create a lot of infrastructure of its own, besides funding for its development.The Diocesan General Body has formed a Diocesan Development Committee under the chairmanship of the Diocesan Metropolitan. The Committee under his able leadership has carved robust plans for the overall development of the Diocese. The Diocesan Metropolitan has earnestly requested each member of our Diocese to contribute one month's family income with the objective to create a corpus. H.H. Baselios Marthoma Paulose II, the Catholicose the East and Malankara Metropolitan inaugurated the fund raising drive on 27th March 2011. Address: Bishop's House, No. 1, Malankara DV, Behind Sharma Farm House, Doddagubi, Bangalore-560077 Ph: 09611353977 Email: moc.bangalorediocese@gmail.com Website :http:// www.bangaloreorthodoxdiocese.org/
                    </p>
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

export default dioceseofbangalorePage;