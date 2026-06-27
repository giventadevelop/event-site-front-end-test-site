import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)',
  description: 'Biography of His Holiness Baselios Marthoma Mathews I, the fifth Catholicos of the East in Malankara.',
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

const BaseliosMarthomaMathewsIPage = () => {
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
              H.H. Baselios Marthoma Mathews I
            </h1>
            <p className="font-body text-lg text-primary mb-2 font-medium">
              The Fifth Catholicos of the East in Malankara
            </p>
            <p className="font-body text-lg text-muted-foreground">
              1975–1991
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
                    src="/images/catholicate/mathews-i.jpg"
                    alt="H.H. Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara"
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
                      His Holiness was born on 27th, March 1907 as the youngest son of Vattakunnel Kurien Kathanar and Olesha Pulickaparampil Mariamma in Kottayam. He took his B.A, B.D. degrees. Even as a layman he had achieved the unique distinction in studies and also in the Canonical Laws; he was selected as a member of the Managing committee in 1944. He received on 18 August 1945 at the Old Seminary the order of "Musmrono" and on 19 August at Mar Elia Chapel he became a full deacon; on 27 October 1946 he was ordained as priest by His Holess Baselios Geevarghese II, Catholicos of the East. Later, on 21 September 1951, he was elevated to the rank of Ramban (Monk). His Holiness Baselios Geevarghese II consecrated him as Episcopa under the name Mahews Mar Athanasios. He was further elevated to the office of Metropolitan on 12 July 1959. In 1960, he became Head of outside Kerala Diocese of the Malankara church. He was unanimously elected as the Supreme Head
                      of the church and successor to the Catholicate of the East/Malankara Metropolitanate by the Malankara Association, which met on 31 December 1970 at M.D.Seminary, Kottayam. On 24 September 1975, he became Malankara Metropolitan. On 27 October 1975, at the Old Seminary, he was installed as Catholicos of the East with the title His Holiness Baselios Marthoma Mathews I. He executed many administrative innovations and helped to strengthen the sovereignty of the Malankara Orthodox Church and its right to have its own sovereign Head. He was able to project the name and fame of the church on an international level. On 27 April 1991, due to failing health he relinquished his office. On 8 November 1996 he passed away, and was laid to rest in Devalokam Aramana.
                    </p>
                    <p>
                      Anniversary: 8 November
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
                      className={`block p-3 rounded-lg hover:bg-muted/50 reverent-transition group ${index === 5 ? 'bg-primary/5 border border-primary/20' : ''}`}
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
                    <p className="text-sm text-muted-foreground">27 March 1907</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Consecrated as Bishop:</span>
                    <p className="text-sm text-muted-foreground">21 September 1951 (Mathews Mar Athanasios)</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Reign:</span>
                    <p className="text-sm text-muted-foreground">1975–1991</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Passed Away:</span>
                    <p className="text-sm text-muted-foreground">8 November 1996</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Resting Place:</span>
                    <p className="text-sm text-muted-foreground">Devalokam Aramana</p>
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

export default BaseliosMarthomaMathewsIPage;
