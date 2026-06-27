import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of UK Europe and Africa',
  description: 'Learn about the Diocese of UK Europe and Africa of the Malankara Orthodox Syrian Church.',
};

const dioceseofukeuropeandafricaPage = () => {
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
              Diocese of UK Europe and Africa
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              International Diocese of the Malankara Orthodox Syrian Church
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
                    src="/images/dioceses/diocese-of-uk-europe-and-africa.jpg"
                    alt="Diocese of UK Europe and Africa"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of UK Europe and Africa
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Diocese of the Indian Orthodox Church, UK Europe and Africa is acting as the umbrella organisation for various Indian Orthodox parishes in the UK, Rest of Europe and African Continent.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Diocese of UK Europe and Africa
To cater the spiritual needs of the community, the Holy Episcopal Synod and Managing Committee of the church had recommended forming a Diocese for the geographical region of UK, Rest of Europe and African Continent. In May 2009, Cathlolicos and Malankara Metropoltan- Supreme head of the Church declared the new diocese – Diocese of UK Europe and Africa and appointed Dr.Mathews Mar Thimothios as the Diocesan Metropolitan.
Though vast majority of the members of the diocese is residing in the UK, by considering the geographical span of the diocese, for better functioning the Diocese has been divided into three regions, UK, Rest of Europe and Africa.
The UK region of the diocese has got its Diocesan centre and office at St.Gregorios Indian Orthodox Church, Canfields Road , Brockley, London SE4 1UF. Now there are 957 families' comprise of approximately 3775 individuals lives in the UK, registered as members of the Diocese. Now we have twenty one (21) registered parishes/ congregations in various places of the UK where regular worships are being taken place. Most of the parishes and congregations are registered with UK charity Commission. For details been shown Table 1 below
Diocesan Metropolitan (Bishop) is the head of the organisation. A high level Diocesan Council elected by the Diocesan general body is the policy making body. Diocesan General Body members are representatives of each parish elected by the Parish General Body.
There are number of social organisations working under the Diocese as shown on the organisation chart below.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Address :
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      St.Gregorios Indian Orthodox Church, Canfields Road , Brockley, London SE4 1UF
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Mob: (India) 9447718511, (UK) 00447541814466
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Email: abrahamstephanos@mosc.in
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
                    International Dioceses
                  </div>
                  <Link 
                      href="/mosc-old/dioceses/northeast-america" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Northeast America
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-south-west-america" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of South West America
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-uk-europe-and-africa" 
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of UK Europe and Africa
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

export default dioceseofukeuropeandafricaPage;