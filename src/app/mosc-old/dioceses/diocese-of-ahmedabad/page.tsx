import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Ahmedabad',
  description: 'Learn about the Diocese of Ahmedabad of the Malankara Orthodox Syrian Church.',
};

const dioceseofahmedabadPage = () => {
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
              Diocese of Ahmedabad
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
                    src="/images/dioceses/ahmedabad_diocese.jpg"
                    alt="Diocese of Ahmedabad"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of Ahmedabad
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese of Ahmedabad came into existence vide Kalpana No 93/2009 dated March 2,.2009 of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan. The new Diocese was carved out of the Dioceses of Bombay, Calcutta and Delhi and consists of 35 parishes and congregations, situated in the states of Gujarat, Rajasthan, Madhya Pradesh and Sultanate of Oman in the Arabian Gulf.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      His Holiness assumed the charge as the Metropolitan of the new Diocese and His Grace Geevarghese Mar Coorilos, Metropolitan of Bombay Diocese was appointed as the Assistant Metropolitan of the Diocese.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The first General Body meeting of the new Diocese of Ahmedabad was held on June 19,.2009 under the Presidentship of HG Geevarghese Mar Coorilose at St Mary's Orthodox Syrian Church, Ahmedabad. The meeting was attended by priests and lay representatives representing various parishes in the Diocese. The meeting was also attended by existing members of the Malankara Orthodox Church Managing Committee and the Diocesan Council from the Parishes which have been included in the New Diocese and also by the Parish Office Bearers as special invitees. Rev Fr Joji George, Vicar, St Mary's Orthodox Syrian Church, Ahmedabad was elected as the Diocesan Secretary by the General Assembly.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese of Ahmedabad was formally inaugurated on October 3, 2009 by His Grace Dr Mathews Mar Severios Metropolitan, Secretary to the Holy Episcopal Synod and the Metropolitan of Kandanad Diocese in the presence of priests, faithful and invited guests.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese of Ahmedabad is presently functioning from the premises of St Mary's School, Naroda, provided by the St Mary's Orthodox Syrian Church, Ahmedabad.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Address:  St Mary's Higher Secondary School Campus,
Naroda, Ahmedabad, Gujarat
India 382 330
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Ph:  046922980253
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Email:  ahmedabaddiocese@gmail.com
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
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Delhi
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-ahmedabad" 
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default dioceseofahmedabadPage;