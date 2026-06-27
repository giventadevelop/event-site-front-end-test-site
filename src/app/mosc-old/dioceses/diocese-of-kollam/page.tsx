import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Kollam',
  description: 'Learn about the Diocese of Kollam of the Malankara Orthodox Syrian Church.',
};

const dioceseofkollamPage = () => {
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
              Diocese of Kollam
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
                    src="/images/dioceses/kollam diocese.jpg"
                    alt="Diocese of Kollam"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese  of  Kollam
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      St Thomas, the Apostle of Jesus Christ , is the Father of Christianity in India , landed at Maliankara in Kerala founded seven churches at Maliankara, Palayur, Kottakavu, Niranam, Nilakkel, Chayal and Kollam.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      In AD 1876, Patriach Moran Mar Ignatius Pathros- III came here and a historical synod was convened at Mulanthuruthy. Later six new dioceses were formed in Malankara.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese of Kollam was one among the six new dioceses formed with a vast area from Thiruvithamcode to Mavelikara.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Dionysius-V , the then Malankara Metropolitan was the first Bishop of Kollam diocese and he headed the diocese from 1876 to (---?) Geevarghese Mar Gregorious of Parumala was the second Bishop of Kollam Diocese till 1902. Again from 1902 to 1909 , Dionysius -V became the Bishop of Kollam.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Vattasseril Geevarghese Mar Dionysius , the then Malankara Metropolitan became the third Bishop of Kollam diocese upto 1912. From 1912 onwards Geevarghese Mar Gregorious later known as Baselious Geevarghese II , the then Catholicos of Malankara adorned the position of Bishop of Kollam diocese till 1938. He adorned the position of the Catholicos of Malankara sabha and also the Bishop of Kollam from 1934 to 1938.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      From 1938 onwards , the diocese was under the leadership of Alexious Mar Thevedosius. From 1953 to 1966 Mathews Mar Coorilos served as the Assistant Bishop of Kollam along with Alexious Mar Thevedosius.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Mathews Mar Coorilos became the Bishop of Kollam in 1966 and served the diocese till he became the Catholicos of the East . In 1991 when Mathews Mar Coorilos became the Supreme Head of Malankara Sabha, Mathews Mar Epiphanios ,who was the Assistant Bishop of Kollam became the Bishop of Kollam and served the diocese till 2009.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      In 1979 , the diocese of Kollam was bifurcated to Trivandrum and Kollam Diocese (------?) churches went to Trivandrum diocese. Again in 1985 four churches detached from Kollam diocese and included in Chengannur diocese.   In 2002 , from Kollam diocese twenty seven churches detached and formed the new Mavelikara diocese. In 2010   a rearrangement of churches of Kollam and Trivandrum dioceses resulted in the formation of Adoor- Kadampanad and Kottarakara –Punalur dioceses .
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The first headquarters of   Kollam Diocese was Kottapuram Seminary during the reign of Geevarghese Mar Gregorious of Parumala and Kundara Seminary was the headquarters of Kollam Diocese during the reign of Geevarghese Mar Gregorious who later known as Baselious Geevarghese II .
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Mathews Mar Coorilous later known as Baselious Marthoma Mathews -II ,the Catholicos of the East,  established the present headquarters at Cross Junction, Kollam  .
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      From 2009 April 1st , onwards H.G. Zachariah Mar Anthonios became the Metropolitan of Kollam Diocese. At present sixty five churches under the Diocese of Kollam. H.G Zachariah Mar Anthonios renovated and dedicated the Kollam Aramana during 2013-15.The Kollam diocese has two diocesan centers - Mar Epiphnios Centre ,Kottarakara and Sooranad. The diocese also has St. Thomas Boys Home, Sasthamkotta and Mar Baselious Santhi Bhavan, Thalavoor as Charitable institutions.
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
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
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

export default dioceseofkollamPage;