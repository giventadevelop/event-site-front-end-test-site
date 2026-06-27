import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Calcutta',
  description: 'Learn about the Diocese of Calcutta of the Malankara Orthodox Syrian Church.',
};

const dioceseofcalcuttaPage = () => {
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
              Diocese of Calcutta
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
                    src="/images/dioceses/culcutta_diocese.jpg"
                    alt="Diocese of Calcutta"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of Calcutta
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Dioceses in the history of the Malankara Orthodox Syrian Church, were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H.Patriarch Mar Peter III divided the Malankara Church into seven Dioceses. In 1938, Diocese for outside Kerala (Bahya Kerala Bhadrasanam) was formed and in 1976 the outside Kerala Diocese was divided into three, namely Bombay, Madras and Delhi dioceses as per the Catholicos Order No.58/76. The present Calcutta Diocese was included in Madras Diocese and late lamented Dr. Stephanos Mar Theodosius was the first Diocesan Metropolitan.
The area of Madras Diocese jurisdiction were the states of Andra Pradesh, Assam, Bihar, Parts of M.P. (East of Rewa, Jabalpur, Trunk Road), Tamil Nadu(excluding Coimbatore, Cunnoor, Gudalloor, Sherwani, Vaalpara, Mettupalayam, Erode and Tirupattoor), West Bengal, Union Territory of Andaman and Nicobar Islands and outside India- Malasia and Singapore.
Re-Organisation in 1979
On 30th October 1978 the Managing Committee in its meeting decided to further reorganized the three outside Kerala Dioceses comprising Bombay, Delhi and Madras into Five in view of their big geographical structure. The Episcopal Synod also approved the proposed reorganisation. The newly formed dioceses are America, Calcutta and Trivandrum. These changes came into effect from 1stJanuary 1979 as per order dated 8th December 1978.
The area under the Juridiction of the Calcutta Diocese is as follows:-
In India:-States of Assam, Bihar, Madhya Pradesh, Manipur, Meghalaya, Nagaland, Orissa, Tripura, West Bengal, Mizoram, Arunachal Pradhesh and Nagpur in Maharashtra.
Outside India :-Ahamadi, Kuwait, Muscat and Salalah.
As a result of the re-organisation of the outside Kerala dioceses, when the Calcutta Diocese was formed on 1st January 1979 H.G.Dr. Stephanos Mar Theodosius was made its Shepherd and Tirumeni continud to lead it from Glory to Gloryuntil he wascalled to the heavenly abode on 5th Nov. 2007 and H.H. Catholicose took the charge of the diocese and nominated H.G.Geevarghese Mar Coorilos of Bombay diocese to assist Catholicose in the administration. H.G. Dr. Joseph Mar Dionysius took over the Metropolitan of Calcutta Diocese on March 2009.
Re-Organisation in 2009
In2009 it was decided to further reorganize the outside Kerala Dioceses into Nine. The newly formed dioceses were Bangalore , Ahmedabad, Brahmavar and North East America and South west America, UK- Europe & Africa . The parishes and Institutions in the Malwa region of Madhya Pradesh and the Parishes in Muscat , Sohar and Salala in the Gulf Region were taken away from Calcutta Diocese and added to the newly formed Ahmedabad Diocese.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      St.Thomas Asram, Kailash Nagar, Near Industrial Estate, Bhilai, Durg Dist.Chattisgarh-490001
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Phone No: 0788-2285309
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      E-mail : calcuttadiocese@gmail.com
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Website : www.calcuttadiocese.org
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
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default dioceseofcalcuttaPage;