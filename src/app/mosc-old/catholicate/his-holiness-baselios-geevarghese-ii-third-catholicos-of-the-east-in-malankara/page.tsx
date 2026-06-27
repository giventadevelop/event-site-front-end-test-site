import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)',
  description: 'Biography of His Holiness Baselios Geevarghese II, the third Catholicos of the East in Malankara.',
};

const catholicosLinks = [
  { name: 'The Catholicate Overview', href: '/mosc-old/catholicate/catholicate' },
  { name: 'H.H. Baselios Paulos I', period: '1912–1913', description: 'The First Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese I', period: '1925–1928', description: 'The Second Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese II', period: '1929–1964', description: 'The Third Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Augen I', period: '1964–1975', description: 'The Fourth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews I', period: '1975–1991', description: 'The Fifth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews II', period: '1991–2005', description: 'The Sixth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Didymos I', period: '2005-2010', description: 'The Seventh Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Paulose II', period: '2010–2021', description: 'The Eighth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/h-h-baselios-marthoma-paulose-ii' },
];

const BaseliosGeevargheseIIPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Crown">👑</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              H.H. Baselios Geevarghese II
            </h1>
            <p className="font-body text-lg text-primary mb-2 font-medium">
              The Third Catholicos of the East in Malankara
            </p>
            <p className="font-body text-lg text-muted-foreground">
              1929–1964
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="mb-8">
                  <Image
                    src="/images/catholicate/geevar.jpg"
                    alt="H.H. Baselios Geevarghese II, The Third Catholicos of the East in Malankara"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow mb-6"
                    priority
                  />
                </div>
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <div className="space-y-6">
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Biography
                    </h2>
                    <p>
                      His Holiness was born to Ulahannan and Naithi of Kallaserri family in Kurichi, Kottayam on 16 June 1874. On 24 April 1892, Kadavil Paulose Mar Athanasios ordained him as deacon and on 24 November and 27 November 1898 he was ordained as priest and Ramban (Monk) respectively by St.Gregorios. As per the order of St. Gregorios, he resided in Kadambanad church and took charge of the southern dioceses. He also served as Manager and Malpan of Old Seminary. He published books like "Sahodaran- marude Charithram". "Rehasya Prarthanakal". "Parudaisa", and "Mar Yuhanon Mamdana". On 8 September 1912, His Holiness Patriarch Abdhedh Meshiah consecrated him as Metropolitan Geevarghese Mar Gregorios at Parumala Seminary. He was appointed as the Metropolitan of Thumpamon, Kollam and Niranam dioceses. On 15 February 1929. With the Malankara Metropolitan Vattaserril Geevarghese Mar Dionysios as the chief priest, he was installed as the Catholicos of the East. When the Association met on 24 December 1934 at M. D. Seminary, Kottayam, he was chosen as Malankara Metropolitan. It was a period when issues became very complex. Through prayer and fasting he received strength from God to lead his people for long years, courageously, inspiring his people to work for their church and for the glory of God. Following the peace pact of 1958, he had the good fortune to guide the destiny of the unified Malankara Church. Apart from consecrating twelve Meropolitans, and ordaining more than thousand priests and deacons, he founded and consecrated many churches. On 22 April 1932 and on 20 April 1951 he conducted the 'Mooron Koodasha' (Chrism Consecration) at the Old Seminary. On 2 November 1947 he declared Geevarghese Mar Gregorios and Yeldo Mar Baselios as Saints. From his time onwards the offices of Catholicos and Malankara Metropolitan came to repose in one and the same person. The deep spirituality and wisdom of this Catholicos earned him the title "Valiya Bava," or "The Great Catholicos." Shedding luster like a Beacon illuminating the history of the church, he led it from glory to glory. He entered the eternal realms on 3 January 1964 at Develokam Aramana He was laid to rest beside the Devalokam Aramana Chapel. His Anniversary is 3 January.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (same as holy-synod) - desktop only in column */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Catholicate History
                </h3>
                <div className="space-y-3">
                  {catholicosLinks.map((catholicos, index) => (
                    <Link
                      key={catholicos.name}
                      href={catholicos.href}
                      className={`block p-3 rounded-lg hover:bg-muted/50 reverent-transition group ${index === 3 ? 'bg-primary/5 border border-primary/20' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 reverent-transition">
                          <span className="text-sm text-primary" role="img" aria-label="Catholicos">👑</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-medium text-sm text-foreground group-hover:text-primary reverent-transition">
                            {catholicos.name}
                          </h4>
                          {catholicos.period && (
                            <p className="font-body text-xs text-primary font-medium">{catholicos.period}</p>
                          )}
                          {catholicos.description && (
                            <p className="font-body text-xs text-muted-foreground">{catholicos.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-foreground">Born:</span>
                    <p className="text-sm text-muted-foreground">16 June 1874</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Consecrated as Bishop:</span>
                    <p className="text-sm text-muted-foreground">8 September 1912</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Reign:</span>
                    <p className="text-sm text-muted-foreground">1929–1964</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Passed Away:</span>
                    <p className="text-sm text-muted-foreground">3 January 1964</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Resting Place:</span>
                    <p className="text-sm text-muted-foreground">Beside Devalokam Aramana Chapel</p>
                  </div>
                </div>
              </div>
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

export default BaseliosGeevargheseIIPage;
