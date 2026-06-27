import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Bangalore',
  description: 'Learn about the Diocese of Bangalore of the Malankara Orthodox Syrian Church.',
};

const dioceseofbangalorePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Diocese">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Diocese of Bangalore
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              India Diocese of the Malankara Orthodox Syrian Church
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/dioceses/diocese-of-bangalore.jpg"
                    alt="Diocese of Bangalore"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of Bangalore
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Dioceses in the history of the Malankara Orthodox Syrian Church, were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H.Patriarch Mar Peter III divided the Malankara Church into seven Dioceses. In 1938, Diocese for outside Kerala (Bahya Kerala Bhadrasanam) was formed and in 1976 the outside Kerala Diocese was divided into three, namely Bombay, Madras and Delhi dioceses. The present Calcutta Diocese was included in Madras Diocese and late lamented Dr. Stephanos Mar Theodosius was the first Diocesan Metropolitan. In 1979, Calcutta was further detached and formed as a separate diocese and the present Bangalore Diocese remained part of the Madras Diocese till 2009. Late lamented Zachariah Mar Dionysius was the diocesan Metropolitan until his solemn demise in 1997. In the same year H.G. Dr. Yakob Mar Irenios took over the charge of leading the Madras Diocese till the formation of the new Bangalore Diocese.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Bangalore Diocese came into existence on 1st April 2009. All the Orthodox churches in Karnataka, Andhra Pradesh, two churches and a congregation from the Gulf region were constituent churches in the new diocese(32 churches and a congregation). The Diocese was under the direct administration of the Catholicose and Malankara Metropolitan. His Holiness was assisted by H.G. Abraham Mar Epiphanios, the Metropolitan of Sultan Battery Diocese as the assistant Metropolitan of Bangalore Diocese. H.G. Abraham Mar Epiphanios was in charge of the Bangalore Diocese till the newly appointed Metropolitan H.G. Dr. Abraham Mar Seraphim assumed charge of the Diocese on 15th August 2010. Dr. Abraham Mar Seraphim, the youngest of the newly elected 7 Bishops of the Malankara Orthodox Church, assumed the office with full independent charge of the Diocese. Later in 2010 itself the church authority reorganized the churches of Bangalore, Malabar and Sultan Battery Dioceses and formed the new Brahmavar Diocese.Ten parishes of Bangalore Diocese from Brahmavar - Mangalore region were included in the new diocese. Bangalore Diocese now has 21 parishes and a congregation spread across the states of Karnataka & Andhra Pradesh and 3 cities in the UAE, namely; Fujairah, Dibba and Ras–al-Khaima (RAK) in the UAE and has about 4000 families as its members. 23 priests, including 6 Cor-Episcopoi are serving in the Diocese. 2 Deacons and 3 brothers are pursuing their studies in the two Seminaries of our Church, representing Bangalore Diocese. The Diocese has two Mission Projects one at Eluru of Andhra Pradesh and the other at Bilikere in Mysore. These are homes for mentally challenged and physically handicapped children who need complete help and support for their daily activities.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Bangalore Diocese though in its early stages has ambitious overall development plans, to establish and reinforce The Orthodox Church's glorious identity in and around Bangalore taking advantage of the geographical location in this Silicon Valley of India. It needs to create a lot of infrastructure of its own, besides funding for its development.The Diocesan General Body has formed a Diocesan Development Committee under the chairmanship of the Diocesan Metropolitan. The Committee under his able leadership has carved robust plans for the overall development of the Diocese. The Diocesan Metropolitan has earnestly requested each member of our Diocese to contribute one month's family income with the objective to create a corpus. H.H. Baselios Marthoma Paulose II, the Catholicose the East and Malankara Metropolitan inaugurated the fund raising drive on 27th March 2011.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Address: Bishop's House, No. 1, Malankara DV, Behind Sharma Farm House, Doddagubi, Bangalore-560077
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Ph: 09611353977
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Email:  moc.bangalorediocese@gmail.com
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Website :http://www.bangaloreorthodoxdiocese.org/
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Dioceses in the history of the Malankara Orthodox Syrian Church, were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H.Patriarch Mar Peter III divided the Malankara Church into seven Dioceses. In 1938, Diocese for outside Kerala (Bahya Kerala Bhadrasanam) was formed and in 1976 the outside Kerala Diocese was divided into three, namely Bombay, Madras and Delhi dioceses. The present Calcutta Diocese was included in Madras Diocese and late lamented Dr. Stephanos Mar Theodosius was the first Diocesan Metropolitan. In 1979, Calcutta was further detached and formed as a separate diocese and the present Bangalore Diocese remained part of the Madras Diocese till 2009. Late lamented Zachariah Mar Dionysius was the diocesan Metropolitan until his solemn demise in 1997. In the same year H.G. Dr. Yakob Mar Irenios took over the charge of leading the Madras Diocese till the formation of the new Bangalore Diocese. The Bangalore Diocese came into existence on 1st April 2009. All the Orthodox churches in Karnataka, Andhra Pradesh, two churches and a congregation from the Gulf region were constituent churches in the new diocese(32 churches and a congregation). The Diocese was under the direct administration of the Catholicose and Malankara Metropolitan. His Holiness was assisted by H.G. Abraham Mar Epiphanios, the Metropolitan of Sultan Battery Diocese as the assistant Metropolitan of Bangalore Diocese. H.G. Abraham Mar Epiphanios was in charge of the Bangalore Diocese till the newly appointed Metropolitan H.G. Dr. Abraham Mar Seraphim assumed charge of the Diocese on 15th August 2010. Dr. Abraham Mar Seraphim, the youngest of the newly elected 7 Bishops of the Malankara Orthodox Church, assumed the office with full independent charge of the Diocese. Later in 2010 itself the church authority reorganized the churches of Bangalore, Malabar and Sultan Battery Dioceses and formed the new Brahmavar Diocese.Ten parishes of Bangalore Diocese from Brahmavar - Mangalore region were included in the new diocese. Bangalore Diocese now has 21 parishes and a congregation spread across the states of Karnataka &amp; Andhra Pradesh and 3 cities in the UAE, namely; Fujairah, Dibba and Ras–al-Khaima (RAK) in the UAE and has about 4000 families as its members. 23 priests, including 6 Cor-Episcopoi are serving in the Diocese. 2 Deacons and 3 brothers are pursuing their studies in the two Seminaries of our Church, representing Bangalore Diocese. The Diocese has two Mission Projects one at Eluru of Andhra Pradesh and the other at Bilikere in Mysore. These are homes for mentally challenged and physically handicapped children who need complete help and support for their daily activities. Bangalore Diocese though in its early stages has ambitious overall development plans, to establish and reinforce The Orthodox Church's glorious identity in and around Bangalore taking advantage of the geographical location in this Silicon Valley of India. It needs to create a lot of infrastructure of its own, besides funding for its development.The Diocesan General Body has formed a Diocesan Development Committee under the chairmanship of the Diocesan Metropolitan. The Committee under his able leadership has carved robust plans for the overall development of the Diocese. The Diocesan Metropolitan has earnestly requested each member of our Diocese to contribute one month's family income with the objective to create a corpus. H.H. Baselios Marthoma Paulose II, the Catholicose the East and Malankara Metropolitan inaugurated the fund raising drive on 27th March 2011. Address: Bishop's House, No. 1, Malankara DV, Behind Sharma Farm House, Doddagubi, Bangalore-560077 Ph: 09611353977 Email: moc.bangalorediocese@gmail.com Website :http:// www.bangaloreorthodoxdiocese.org/
                    </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Dioceses
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-old/dioceses" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Dioceses Overview
                  </Link>
                  <div className="border-t border-border my-2"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    India Dioceses
                  </div>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-chennai-diocese" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Madras
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-bangalore" 
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Bangalore
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-mumbai" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Bombay
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-calcutta" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Calcutta
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-delhi" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Delhi
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-ahmedabad" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Ahmedabad
                    </Link>
                </nav>
              </div>

              {/* Quick Links - desktop only in sidebar */}
              <div className="hidden lg:block">
                <DiocesesQuickLinksNav />
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <DiocesesQuickLinksNav />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofbangalorePage;