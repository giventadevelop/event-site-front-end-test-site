import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)',
  description: 'Biography of His Holiness Baselios Marthoma Paulose II, the eighth Catholicos of the East in Malankara.',
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

const BaseliosMarthomaPauloseIIPage = () => {
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
              H.H. Baselios Marthoma Paulose II
            </h1>
            <p className="font-body text-lg text-primary mb-2 font-medium">
              The Eighth Catholicos of the East in Malankara
            </p>
            <p className="font-body text-lg text-muted-foreground">
              2010–2021
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
                    src="/images/catholicate/bava.jpg"
                    alt="H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara"
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
                    <p className="mb-6">
                      His Holiness Baselios MarthomaPaulose II was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Monday, 1st November 2010. His Holiness is the 91st Primate on the Apostolic Throne of St. Thomas. Born on 30th August 1946 in a village called Mangad near Kunnamkulam, Trissur District, Kerala as the son of the late Kollannur Iype and the late Pulikkottil Kunjeetty, the boy K.I.Paul had his early education in local schools. After graduating from St. Thomas College, Trichur, Paul joined the Orthodox Theological Seminary, Kottayam from where he obtained G.S.T and B.D. degrees of the Serampore University. After taking the holy orders, he joined C.M.S College, Kottayam and took his M.A in Sociology.
                    </p>
                    <p className="mb-6">
                      At the young age of 36, the church Parliament (Malankara Syrian Christian Association) elected Fr. K.I.Paul as Bishop. On 15th May 1985, he was consecrated as Episcopa ( bishop) with the new name Paulose Mar Milithios. Subsequently, His Grace was elevated as the first Metropolitan of the newly formed Kunnamkulam diocese on 1st August 1985. The Malankara Syrian Christian Association held at Parumala on 12th October 2006 unanimously elected Ills Grace Paulose Mar Milithios Metropolitan as the Catholicos Designate and the successor to the Malankara Metropolitan. On 1st November 2010, following the abdication of his predecessor, His lloliness Baselios Marthoma Didymus I. His Grace Paulose Mar Milithios Metropolitan was enthroned as the Catholicos of the East & Malankara Metropolitan with the new name His Holiness Baselios Marthoma Paulose II. Incidentally, Kunnamkulam which is a stronghold of the Orthodox Community in Kerala has given birth to three Malankara Metropolitans including the reigning Catholicos. His Holiness' illustrious Predecessors Pulikottil Joseph Mar Dionysius II and Pulikottil Joseph Mar Dionysius V were towering personalities who contributed much to making the Malankara Church what it is today.
                    </p>
                    <p className="mb-6">
                      It was His Holiness' keen interest that the Church should have effective and meaningful Inter-Church relations. It is with this emphasis that His Holiness has already finished journeying to all the Oriental Orthodox Churches. Once in this short span of time as Catholicos, he has already had meetings with all the present heads of the Oriental Orthodox Churches. The fraternal relations with the sister Churches too have been given prime importance. The meeting with the present Pope of the Catholic Church has enhanced the bilateral relations between the two Churches. His Holiness' unassuming character and his philanthropic interests, have given new dimensions to the life of the Church. He has authored a few devotional and contemplative books in Malayalam.
                    </p>
                    <p>
                      His Holiness had been called to the eternal abode on 12 July 2021. His mortal remains is interred in the Chapel at Catholicate Palace, Devalokam, Kottayam, India.
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
                      className={`block p-3 rounded-lg hover:bg-muted/50 reverent-transition group ${index === 8 ? 'bg-primary/5 border border-primary/20' : ''}`}
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
                    <p className="text-sm text-muted-foreground">30 August 1946</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Consecrated as Bishop:</span>
                    <p className="text-sm text-muted-foreground">15 May 1985 (Paulose Mar Milithios)</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Reign:</span>
                    <p className="text-sm text-muted-foreground">2010–2021</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Passed Away:</span>
                    <p className="text-sm text-muted-foreground">12 July 2021</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Resting Place:</span>
                    <p className="text-sm text-muted-foreground">Chapel at Catholicate Palace, Devalokam, Kottayam</p>
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

export default BaseliosMarthomaPauloseIIPage;
