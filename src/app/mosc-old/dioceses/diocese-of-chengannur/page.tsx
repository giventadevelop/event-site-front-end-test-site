import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Chengannur',
  description: 'Learn about the Diocese of Chengannur of the Malankara Orthodox Syrian Church.',
};

const dioceseofchengannurPage = () => {
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
              Diocese of Chengannur
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kerala Diocese of the Malankara Orthodox Syrian Church
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
                    src="/images/dioceses/chengannur_diocese.jpg"
                    alt="Diocese of Chengannur"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of Chengannur
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese of Chengannur came into existence of 10th March 1985 vide Kalpana No. 52/85 dtd. 8.3.85 of H.H. Moran Mar Baselios Marthoma Mathews I Catholicose of the    East and Malankara    Metropolitan. This Diocese was established with 50 Churches from Thumpamon, Niranam and Kollam Dioceses. This newly constituted Diocese lies in an area comprising of Pazhakulam in the South, Kallunkal in the North, Kuttemperoor St. Mary's - Budhannoor in the West and Mezhuveli and Maramon in the East.H.G. Thomas Mar Athanasios, the celebrated educationalist and a pioneer priest in organising congregations in western India (Maharastra, Gujarat and Rajastan), became the first Metropolitan of the Diocese on 1st August 1985. His Grace is at present the president of Divyasandesam (Visual Media Department of our Church), Malankara Orthodox Church Publications and Akhila Malankara Gayaka Sangam of our church.  Eventhough he is very busy with various activities, he goes through effectively and punctually every minute details of the activities of the Diocese.The Diocesan Head Quarters is Bethel of which the founder is the late Puthencavu Geevarghese Mar Philoxenos of blessed memory. A multistoried Administative Block and a beautiful Church has come up in Bethel.Now there are 51 Churches, 10 Chapels and 55 Priests. There are 8851 families in the diocese.The Diocese gives maximum importance to spiritual organisations. Moreover the "Daivavili Sangam", a nursery for budding priests and nuns, is a unique activity of the Diocese.The Suvisesha Sangam - a fellowship of all the office bearers of the various spiritual organisations in the Diocese is the missionary wing of the Diocese.The Parish Council is yet another innovative idea of the Diocese. The Vicar, the Kaikaran, the Secretary and the office bearers (Vice-President, Secretary & Trustee) of various spiritual organisations in a Parish consitute the Parish Council. They meet every three months and review the functioning of the spiritual organisations in the Parishes.Assraya Social and Charitable Society,  "Mar Philoxenos Research & Guidence Centre, Vidya Jyothi, Philox School of  Liturgical Music, Baselios Counselling Centre" are four innovative ideas introduced recently.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The official organ of the Diocese is "Bethel Pathrika" a monthly, with an online editionwww.bethelpatrika.org
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Address:
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      BETHEL ARAMANA,
P.B NO 38,
CHENGANNUR
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      KERALA
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      689121
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      E-mail: bethelaramana@gmail.com
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Telephone:0479 2451331
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Fax:0479 2451331
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Website:http:// www.chengannur.mosc.in
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
                    Kerala Dioceses
                  </div>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-thiruvananthapuram-diocese" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Thiruvananthapuram
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kollam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kollam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kottarakara-punalur" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kottarakara – Punalur
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-adoor-kadampanadu" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Adoor – Kadampanadu
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-thumpamon" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Thumpamon
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-mavelikara" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Mavelikara
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-chengannur" 
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Chengannur
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-niranam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Niranam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-nilackal" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Nilackal
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kottayam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kottayam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kottayam-central" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kottayam Central
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-idukki" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Idukki
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kandanad-east" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kandanad East
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kandanad-west" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kandanad West
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-ankamaly" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Ankamaly
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kochi" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kochi
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-thrissur" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Thrissur
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kunnamkulam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kunnamkulam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-malabar" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Malabar
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-sulthan-bathery-diocese" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Sulthan Bathery
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-brahamavar" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Brahamavar
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

export default dioceseofchengannurPage;