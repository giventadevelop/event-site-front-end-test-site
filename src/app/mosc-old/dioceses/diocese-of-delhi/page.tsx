import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Delhi',
  description: 'Learn about the Diocese of Delhi of the Malankara Orthodox Syrian Church.',
};

const dioceseofdelhiPage = () => {
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
              Diocese of Delhi
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
                    src="/images/dioceses/diocese-of-delhi.jpg"
                    alt="Diocese of Delhi"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of  Delhi
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Once the nucleus of the Orthodox Church in north India was formed in the capital of the country, the growth of parishes in adjacent centres was rapid and the establishment of the Diocese of Delhi followed in a few years. Outside Delhi, there are several parishes spread across the various States at Alwar, Gurgaon, Kherti Nagar, Bharatpur, Gwalior, Jhansi, Dholpur, Agra, Dehradun, Ambala, Hardwar, Bhatinda, Hanumangarh, Chandigarh, Ludhiana, Jallandhar, Jaipur, Kanpur, Udaipur, Bhilwara, Banswara, Chittorgarh, Dungarpur, Pratapgarh, Singrauli, Obra., Renukoot, Varanasi, Ajmer, Kota, Rawat Bhatta, Lucknow, Rae Bareli, Allahabad, Jodhpur, Bikaner, and Jaisalmer. New congregations have also been started at BITS Pilani, and Pali. Allahabad has also witnessed an amicable settlement with the CNI Church, and a vicar has been nominated for the church there.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Today, there are thirteen parishes in and around Delhi alone – Hauz Khas, Janakpuri, Tughlaqabad, Sarita Vihar, Mayur Vihar-I, Mayur Vihar-III, Rohini, Dwaraka, Dilshad Garden, Ghaziabad, Noida, Gurgaon and Faridabad. Overall, there are sixty one parishes including some congregations looked after by one Ramban and thirty six priests, spread over Uttar Pradesh, Rajasthan, Madhya Pradesh, Haryana, Delhi and United Arab Emirates.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      In 1975, the Delhi Diocese was constituted by the Holy Synod, along with the four other new dioceses of Madras, Bombay, Calcutta and America. The next year, Paulose Mar Gregorios took charge as the Metropolitan of Delhi. By 1985, the Diocesan headquarters moved to its own building, the Delhi Orthodox Centre in Tughlaqabad in South Delhi. An architecturally distinctive three-storey building, the centre was dedicated by Catholicos Baselios Mar Thoma Mathews I and inaugurated by the Vice-President of India, R Venkataraman, in November 1984. With the St. Thomas Chapel in the middle, the centre is the residence of the Metropolitan and houses, besides the secretariat of the Diocesan Council, a library, a publication unit, the People's Education Society, Sophia Society, Sarva Dharma Nilaya, Dhyan Mandir and Niti Santi Kendra, engaged in a variety of complementary activities. In 1991, the Diocese was strengthened by the arrival of Job Mar Philoxenos as the Assistant Metropolitan.1996 Paulose Mar Gregorios Metropolitan enters the heavenly Abode.2002 Job Mar Philoxenos is consecrated as the Metropoliton of Delhi Diocese on 26 December 2002.2011 Job Mar Philoxenos Metropolitan enters the heavenly Abode on 20 November 2011.2012 Youhanon Mar Demetrios is consecrated as new Metropolitan of the Delhi Diocese on 7 October 2012.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Address:  Delhi Orthodox Centre 2, Institutional Area Tughlakabad, New Delhi 110062
Phone : 011-29956417 / 29962799
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      E mail: delhiorthodoxdiocese@gmail.com
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
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
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
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default dioceseofdelhiPage;